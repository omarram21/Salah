/**
 * Runs every widget layout the way the widget extension does: as a serialized function string
 * with only the SwiftUI components/modifiers as globals. Catches references to outside code,
 * bad data access and broken buttons without an iOS build.
 */
import { cairo, cairoIndex } from '@/features/prayer-times/model/__fixtures__/cairo';
import { isFriday } from '@/features/occasions';

import { liveProps } from '../logic/live-activity';
import { collectTaps, dayProps, dayTimeline, monthProps, plistSafe, weekProps, type WidgetInput, type WidgetLabels, type WidgetTap } from '../logic/widget-data';

type Node = { type: string; props: Record<string, unknown> };
const mockCaptured: Record<string, string> = {};

jest.mock('expo-widgets', () => ({
  createWidget: (name: string, layout: string) => {
    mockCaptured[name] = layout;
    return { name };
  },
  createLiveActivity: (name: string, layout: string) => {
    mockCaptured[name] = layout;
    return { name };
  },
}));
jest.mock('@expo/ui/swift-ui', () => ({}), { virtual: true });
jest.mock('@expo/ui/swift-ui/modifiers', () => ({}), { virtual: true });

// What the widget runtime provides as globals (see expo-widgets/bundle/index.ts).
const COMPONENTS = ['AccessoryWidgetBackground', 'Button', 'Circle', 'Gauge', 'HStack', 'Image', 'ProgressView', 'RoundedRectangle', 'Spacer', 'Text', 'VStack', 'ZStack'];
const MODIFIERS = ['background', 'buttonStyle', 'containerBackground', 'font', 'foregroundStyle', 'frame', 'gaugeStyle', 'lineLimit', 'minimumScaleFactor', 'monospacedDigit', 'opacity', 'padding', 'progressViewStyle', 'rotationEffect', 'tint', 'widgetURL'];

function load(name: string): (props: unknown, env: unknown) => unknown {
  const code = mockCaptured[name];
  if (typeof code !== 'string') throw new Error(`${name} was not serialized (missing 'widget' directive?)`);
  const jsx = (type: unknown, props: Record<string, unknown>) => {
    if (typeof type !== 'string') throw new Error(`Unknown component in ${name}`);
    return { type, props };
  };
  const scope: Record<string, unknown> = { _jsx: jsx, _jsxs: jsx, _jsxDEV: jsx, Fragment: 'Fragment' };
  for (const c of COMPONENTS) scope[c] = c;
  for (const m of MODIFIERS) scope[m] = (...args: unknown[]) => ({ modifier: m, args });
  // Unknown identifiers fall through to the real global scope and throw ReferenceError.
  const proxy = new Proxy(scope, { has: (t, k) => k in t });
  return new Function('scope', `with (scope) { return (${code}); }`)(proxy) as (props: unknown, env: unknown) => unknown;
}

function walk(node: unknown, visit: (n: Node) => void) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, visit));
  if (!node || typeof node !== 'object' || !('type' in node)) return;
  const n = node as Node;
  visit(n);
  for (const v of Object.values(n.props)) walk(v, visit);
}

const labels = new Proxy({}, { get: (_, k) => String(k) }) as WidgetLabels;
// What the widget reads back from UserDefaults (the Proxy labels have no keys to copy, so keep them).
const stored = <P extends { t: WidgetLabels }>(props: P): P => ({ ...plistSafe(props), t: props.t });
const input = (now: number, over: Partial<WidgetInput> = {}): WidgetInput => ({
  index: cairoIndex,
  records: { '2026-10-31': { fajr: { status: 'late', updatedAt: 0 }, dhuhr: { status: 'mosque', updatedAt: 0 } } },
  extras: {},
  now,
  deviceOffsetMin: 120,
  rtl: false,
  city: 'Cairo',
  trackingSince: '2026-10-28',
  firstWeekday: 7,
  isFriday,
  isRamadan: () => false,
  fmt: {
    prayerName: (p) => p,
    wallTime: (w) => w,
    dateLabel: (d) => d,
    weekdayShort: (d) => d.slice(8),
    monthTitle: () => 'October',
  },
  t: labels,
  ...over,
});

const FAMILIES: Record<string, string[]> = {
  HayyaNext: ['systemSmall', 'accessoryCircular', 'accessoryRectangular', 'accessoryInline'],
  HayyaToday: ['systemSmall', 'systemMedium', 'systemLarge', 'accessoryCircular', 'accessoryRectangular'],
  HayyaTimes: ['systemSmall'],
  HayyaMark: ['systemSmall', 'systemMedium'],
  HayyaArabic: ['systemSmall', 'accessoryCircular'],
  HayyaSeason: ['systemMedium', 'accessoryCircular', 'accessoryRectangular'],
};

beforeAll(() => {
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../native/layouts');
  });
});

describe('widget layouts', () => {
  it('the harness itself catches code that reaches outside the widget', () => {
    mockCaptured.Bad = 'function(p){ return _jsx(Text, { children: OUTSIDE_CONSTANT }); }';
    expect(() => load('Bad')({}, {})).toThrow(ReferenceError);
    mockCaptured.Bad2 = 'function(p){ return _jsx(Text, { children: p.missing.deep }); }';
    expect(() => load('Bad2')({}, {})).toThrow(TypeError);
  });

  const moments = {
    'during Asr': input(cairo('2026-10-31T15:30', 2)),
    'after midnight (Isha running)': input(cairo('2026-11-01T01:00', 2)),
    'Friday morning': input(cairo('2026-10-30T09:00', 3)),
    'Ramadan, daytime': input(cairo('2026-10-31T12:00', 2), { isRamadan: () => true }),
    'Ramadan, night': input(cairo('2026-10-31T21:00', 2), { isRamadan: () => true }),
    'no data': input(cairo('2026-10-31T15:30', 2), { index: new Map() }),
  };

  for (const [moment, inp] of Object.entries(moments)) {
    for (const [name, families] of Object.entries(FAMILIES)) {
      it.each(families.flatMap((f) => ['light', 'dark'].map((scheme) => [f, scheme])))(`${name} · %s · %s · ${moment}`, (family, colorScheme) => {
        const props = stored(dayProps(inp, inp.now));
        const tree = load(name)(props, { widgetFamily: family, colorScheme, date: new Date(inp.now) });
        let count = 0;
        walk(tree, () => (count += 1));
        expect(count).toBeGreaterThan(0);
      });
    }
  }

  it.each(['systemSmall', 'systemMedium', 'accessoryCircular'])('HayyaStreak · %s', (family) => {
    const inp = moments['during Asr'];
    expect(load('HayyaStreak')(stored(weekProps(inp, inp.now)), { widgetFamily: family, colorScheme: 'light', date: new Date() })).toBeTruthy();
  });

  it('HayyaMonth · large, light and dark', () => {
    const inp = moments['during Asr'];
    for (const colorScheme of ['light', 'dark']) {
      const tree = load('HayyaMonth')(stored(monthProps(inp, inp.now)), { widgetFamily: 'systemLarge', colorScheme, date: new Date() });
      const days: string[] = [];
      walk(tree, (n) => n.type === 'Text' && typeof n.props.children === 'string' && /^\d+$/.test(n.props.children) && days.push(n.props.children));
      expect(days).toContain('31');
    }
  });

  it.each(['systemSmall', 'accessoryCircular'])('HayyaQibla · %s', (family) => {
    expect(load('HayyaQibla')({ rtl: false, bearing: 136.4, city: 'Cairo', t: labels }, { widgetFamily: family, colorScheme: 'dark', date: new Date() })).toBeTruthy();
  });

  // iOS asks for a placeholder with no props; a throw here becomes "Please adopt containerBackground API".
  it.each(['HayyaNext', 'HayyaToday', 'HayyaTimes', 'HayyaMark', 'HayyaStreak', 'HayyaArabic', 'HayyaSeason', 'HayyaMonth', 'HayyaQibla'])('%s · empty placeholder props', (name) => {
    for (const widgetFamily of ['systemSmall', 'accessoryCircular']) {
      const tree = load(name)({}, { widgetFamily, colorScheme: 'light', date: new Date() }) as Node;
      expect(JSON.stringify(tree.props.modifiers)).toContain('containerBackground');
    }
  });

  it('Mark: buttons return a tap for the current prayer, and the app can read it back', () => {
    const inp = moments['during Asr'];
    const props = dayProps(inp, inp.now);
    const buttons: Node[] = [];
    walk(load('HayyaMark')(props, { widgetFamily: 'systemSmall', colorScheme: 'light', date: new Date(inp.now) }), (n) => n.type === 'Button' && buttons.push(n));
    expect(buttons.map((b) => b.props.target)).toEqual(['onTime', 'mosque']);
    const result = (buttons[1]!.props.onPress as () => { tap: WidgetTap })();
    expect(result.tap).toMatchObject({ date: '2026-10-31', prayer: 'asr', status: 'mosque' });

    // After the tap the widget shows the mark instead of buttons.
    const after = { ...props, ...result };
    const left: Node[] = [];
    walk(load('HayyaMark')(after, { widgetFamily: 'systemSmall', colorScheme: 'light', date: new Date(inp.now) }), (n) => n.type === 'Button' && left.push(n));
    expect(left).toHaveLength(0);
    expect(collectTaps([{ props: after }, { props: { ...props, tap: null } }])).toEqual([result.tap]);
  });

  it('Live Activity: banner, compact, minimal and expanded regions', () => {
    for (const inp of [moments['during Asr'], moments['Ramadan, daytime']]) {
      const live = liveProps(dayProps(inp, inp.now), inp.now)!;
      const layout = load('HayyaCountdown')(live, { colorScheme: 'dark' }) as Record<string, unknown>;
      expect(Object.keys(layout).sort()).toEqual(['banner', 'compactLeading', 'compactTrailing', 'expandedBottom', 'expandedLeading', 'expandedTrailing', 'minimal']);
    }
  });
});

describe('widget data', () => {
  it('one entry per change point; each shows the right next prayer', () => {
    const inp = input(cairo('2026-10-31T15:30', 2));
    const entries = dayTimeline(inp);
    const day = cairoIndex.get('2026-10-31')!;
    expect(entries[0]!.props.next?.key).toBe('maghrib');
    const atMaghrib = entries.find((e) => e.date.getTime() === day.times.maghrib.at)!;
    expect(atMaghrib.props.next?.key).toBe('isha');
    expect(atMaghrib.props.current?.key).toBe('maghrib');
    // After midnight the day resets: no marks, Isha of last night still current.
    const midnight = entries.find((e) => e.props.dateLabel === '2026-11-01')!;
    expect(midnight.props.done).toBe(0);
    expect(midnight.props.current).toMatchObject({ key: 'isha', date: '2026-10-31' });
  });

  it('Ramadan: Iftar during the day, Suhoor at night', () => {
    const r = { isRamadan: () => true };
    expect(dayProps(input(cairo('2026-10-31T12:00', 2), r), cairo('2026-10-31T12:00', 2)).season).toMatchObject({ kind: 'ramadan', phase: 'iftar' });
    expect(dayProps(input(cairo('2026-10-31T21:00', 2), r), cairo('2026-10-31T21:00', 2)).season).toMatchObject({ kind: 'ramadan', phase: 'suhoor' });
  });

  it('week: 7 days ending today, on-time % over what was due', () => {
    const w = weekProps(input(cairo('2026-10-31T15:30', 2)), cairo('2026-10-31T15:30', 2));
    expect(w.days).toHaveLength(7);
    expect(w.days[6]!.today).toBe(true);
    // Due since tracking began (28th): 3 full days × 5 + Fajr..Asr today = 18; on time: Dhuhr (mosque).
    expect(w.pct).toBe(Math.round((1 / 18) * 100));
  });

  it('plistSafe: no nulls left (UserDefaults rejects NSNull), dates kept', () => {
    const inp = input(cairo('2026-10-31T15:30', 2));
    const day = plistSafe(dayTimeline(inp));
    expect(JSON.stringify([day, plistSafe(weekProps(inp, inp.now)), plistSafe(monthProps(inp, inp.now))])).not.toContain('null');
    expect(day[0]!.date).toBeInstanceOf(Date);
  });

  it('month: offset follows the first weekday (Saturday start → 1 Oct is Thursday → 5 blanks)', () => {
    const m = monthProps(input(cairo('2026-10-31T15:30', 2)), cairo('2026-10-31T15:30', 2));
    expect(m.offset).toBe(5);
    expect(m.days).toHaveLength(31);
    expect(m.weekdays[0]).toBe('10'); // 10 Oct 2026 is a Saturday
  });
});
