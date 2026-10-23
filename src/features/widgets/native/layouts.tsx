/**
 * Home Screen / Lock Screen widgets and the Live Activity (iOS, expo-widgets).
 *
 * Each `'widget'` function is serialized and runs inside the widget extension: it can only use
 * @expo/ui SwiftUI components/modifiers and must not reference anything outside its own body
 * (helpers and colors are declared inside on purpose). Data comes in through props
 * (see ../logic/widget-data.ts). Only imported on iOS builds that include expo-widgets.
 */
import {
  AccessoryWidgetBackground,
  Button,
  Capsule,
  Circle,
  Gauge,
  HStack,
  Image,
  ProgressView,
  Rectangle,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  background,
  buttonStyle,
  clipShape,
  clipped,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  offset,
  opacity,
  padding,
  progressViewStyle,
  rotationEffect,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, createWidget, type LiveActivityEnvironment, type WidgetEnvironment } from 'expo-widgets';

import type { DayProps, QiblaProps, WeekProps } from '../logic/widget-data';
import type { LiveProps } from '../logic/live-activity';

// ───────────────────────── Next prayer (WS1 · WS7 · LS1) ─────────────────────────
const NextPrayer = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    acc: dark ? '#FB923C' : '#C2410C',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const next = p.next;
  const fam = env.widgetFamily;

  if (!next) {
    return <Text modifiers={[font({ size: 13 }), containerBackground(C.bg, 'widget')]}>{p.t.noTimes}</Text>;
  }
  const range = { lower: env.date, upper: new Date(next.at) };

  const short = next.time.replace(/\s?[AP]M$/i, '');
  const prev = p.prev;

  if (fam === 'accessoryInline') {
    return <Text modifiers={[containerBackground('#00000000', 'widget')]}>{`${next.name} ${next.time}`}</Text>;
  }
  if (fam === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        <AccessoryWidgetBackground />
        <VStack spacing={1}>
          <Image systemName={ICON[next.key] as never} size={13} />
          <Text modifiers={[font({ size: 15, weight: 'bold', design: 'rounded' }), monospacedDigit(), minimumScaleFactor(0.6), lineLimit(1)]}>{short}</Text>
          <Text modifiers={[font({ size: 9, weight: 'semibold' }), opacity(0.8), minimumScaleFactor(0.6), lineLimit(1)]}>{next.name}</Text>
        </VStack>
      </ZStack>
    );
  }
  if (fam === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        <HStack spacing={4}>
          <Image systemName={ICON[next.key] as never} size={12} />
          <Text modifiers={[font({ size: 14, weight: 'bold' }), lineLimit(1), minimumScaleFactor(0.8)]}>{`${next.name} · ${next.time}`}</Text>
        </HStack>
        <HStack spacing={3}>
          <Text modifiers={[font({ size: 13 }), opacity(0.75)]}>{p.t.in}</Text>
          <Text timerInterval={range} modifiers={[font({ size: 13, weight: 'semibold' }), monospacedDigit()]} />
        </HStack>
        {prev ? <Text modifiers={[font({ size: 12 }), opacity(0.6), lineLimit(1)]}>{`${p.t.prev}: ${prev.name} ${prev.time}`}</Text> : null}
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={0} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
      <HStack spacing={5}>
        <Image systemName={ICON[next.key] as never} size={15} color={C.acc} />
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(C.acc)]}>{next.name}</Text>
        <Spacer />
      </HStack>
      <Text
        timerInterval={range}
        modifiers={[font({ size: 36, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle(C.ink), minimumScaleFactor(0.5), lineLimit(1), padding({ top: 8 })]}
      />
      <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted)]}>{next.time}</Text>
      <Spacer />
      <HStack spacing={4}>
        {p.prayers.map((x) => (
          <Circle key={x.key} modifiers={[foregroundStyle(x.status ? ST[x.status]! : C.none), frame({ width: 7, height: 7 })]} />
        ))}
        <Spacer />
        <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(C.muted)]}>{`${p.done}/5`}</Text>
      </HStack>
    </VStack>
  );
};

// ───────────────────────── Today (WS2 · WM1 · WL1 · LS2) ─────────────────────────
const Today = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    soft: dark ? '#2A1A0F' : '#FFF7ED',
    none: dark ? '#3A3A3E' : '#E4E4E0',
    line: dark ? '#26262A' : '#EFEFEC',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const ST_ICON: Record<string, string> = { mosque: 'building.columns.fill', onTime: 'checkmark', late: 'clock', missed: 'xmark' };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const fam = env.widgetFamily;
  const next = p.next;

  const statusDot = (status: string | null, size: number, key: string) =>
    status ? (
      <ZStack key={key}>
        <Circle modifiers={[foregroundStyle(ST[status]!), frame({ width: size, height: size })]} />
        <Image systemName={ST_ICON[status] as never} size={size * 0.5} color="#FFFFFF" />
      </ZStack>
    ) : (
      <Circle key={key} modifiers={[foregroundStyle(C.none), frame({ width: size, height: size })]} />
    );

  if (fam === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        <Gauge value={p.done} min={0} max={5} modifiers={[gaugeStyle('circularCapacity')]} />
        <VStack spacing={0}>
          <Text modifiers={[font({ size: 18, weight: 'bold', design: 'rounded' })]}>{String(p.done)}</Text>
          <Text modifiers={[font({ size: 9, weight: 'semibold' }), opacity(0.75), lineLimit(1), minimumScaleFactor(0.6)]}>{p.t.ofFive}</Text>
        </VStack>
      </ZStack>
    );
  }
  if (fam === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        <Text modifiers={[font({ size: 13, weight: 'bold' })]}>{`${p.t.today} · ${p.done}/5`}</Text>
        <HStack spacing={0}>
          {p.prayers.map((x) => (
            <VStack key={x.key} spacing={2} modifiers={[frame({ maxWidth: 1000 })]}>
              {x.status ? (
                <ZStack>
                  <Circle modifiers={[frame({ width: 18, height: 18 })]} />
                  <Image systemName={ST_ICON[x.status] as never} size={9} color="#000000" />
                </ZStack>
              ) : (
                <Circle modifiers={[frame({ width: 18, height: 18 }), opacity(x.upcoming ? 0.15 : 0.35)]} />
              )}
              <Text modifiers={[font({ size: 9, weight: x.current ? 'bold' : 'medium' }), opacity(x.current ? 1 : 0.75), lineLimit(1), minimumScaleFactor(0.6)]}>{x.name}</Text>
            </VStack>
          ))}
        </HStack>
      </VStack>
    );
  }

  if (fam === 'systemSmall') {
    return (
      <VStack spacing={6} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        <ZStack>
          <Gauge value={p.done} min={0} max={5} modifiers={[gaugeStyle('circularCapacity'), tint(C.acc), frame({ width: 92, height: 92 })]} />
          <Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle(C.ink)]}>{`${p.done}/5`}</Text>
        </ZStack>
        <HStack spacing={4}>
          {p.prayers.map((x) => statusDot(x.status, 9, x.key))}
        </HStack>
        {next ? (
          <HStack spacing={4}>
            <Image systemName={ICON[next.key] as never} size={12} color={C.acc} />
            <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(C.acc), lineLimit(1)]}>{`${next.name} ${next.time}`}</Text>
          </HStack>
        ) : null}
      </VStack>
    );
  }

  const header = next ? (
    <HStack alignment="firstTextBaseline" spacing={6}>
      <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(C.acc)]}>{`${next.name} ${p.t.in}`}</Text>
      <Text timerInterval={{ lower: env.date, upper: new Date(next.at) }} modifiers={[font({ size: fam === 'systemLarge' ? 15 : 20, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle(C.ink)]} />
      <Spacer />
      <Text modifiers={[font({ size: 11 }), foregroundStyle(C.faint)]}>{p.city}</Text>
    </HStack>
  ) : (
    <Text modifiers={[font({ size: 13 }), foregroundStyle(C.muted)]}>{p.t.noTimes}</Text>
  );

  if (fam === 'systemMedium') {
    return (
      <VStack alignment="leading" spacing={8} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        {header}
        <Spacer />
        <HStack spacing={2}>
          {p.prayers.map((x) => (
            <VStack
              key={x.key}
              spacing={4}
              modifiers={[frame({ maxWidth: 1000 }), padding({ vertical: 6 }), background(x.current ? C.soft : '#00000000')]}>
              <Image systemName={ICON[x.key] as never} size={15} color={x.current ? C.acc : C.muted} />
              <Text modifiers={[font({ size: 11, weight: x.current ? 'bold' : 'semibold' }), foregroundStyle(x.current ? C.acc : C.ink), lineLimit(1), minimumScaleFactor(0.7)]}>{x.name}</Text>
              <Text modifiers={[font({ size: 11 }), foregroundStyle(x.current ? C.acc : C.muted), monospacedDigit(), lineLimit(1), minimumScaleFactor(0.7)]}>{x.time}</Text>
              {statusDot(x.status, 15, `s-${x.key}`)}
            </VStack>
          ))}
        </HStack>
      </VStack>
    );
  }

  // systemLarge
  return (
    <VStack alignment="leading" spacing={0} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
      <HStack spacing={8}>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{p.dateLabel}</Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{p.hijriLabel}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{p.city}</Text>
      </HStack>
      {next ? (
        <VStack alignment="leading" spacing={0} modifiers={[padding({ top: 10 })]}>
          <HStack spacing={5}>
            <Image systemName={ICON[next.key] as never} size={15} color={C.acc} />
            <Text modifiers={[font({ size: 14, weight: 'semibold' }), foregroundStyle(C.acc)]}>{`${next.name} · ${next.time}`}</Text>
          </HStack>
          <Text timerInterval={{ lower: env.date, upper: new Date(next.at) }} modifiers={[font({ size: 40, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle(C.ink)]} />
        </VStack>
      ) : null}
      <Spacer />
      {p.prayers.map((x) => (
        <HStack key={x.key} spacing={10} modifiers={[frame({ height: 38 })]}>
          <Image systemName={ICON[x.key] as never} size={16} color={x.current ? C.acc : C.muted} />
          <Text modifiers={[font({ size: 14, weight: x.current ? 'bold' : 'semibold' }), foregroundStyle(x.current ? C.acc : C.ink)]}>{x.name}</Text>
          <Spacer />
          <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted), monospacedDigit()]}>{x.time}</Text>
          {statusDot(x.status, 22, `s-${x.key}`)}
        </HStack>
      ))}
    </VStack>
  );
};

// ───────────────────────── All five times (WS3) ─────────────────────────
const Times = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const nextKey = p.next ? p.next.key : '';
  return (
    <VStack alignment="leading" spacing={3} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(C.faint), lineLimit(1)]}>{`${p.dateLabel} · ${p.city}`.toUpperCase()}</Text>
      <Spacer />
      {p.prayers.map((x) => {
        const hot = x.current || (!p.current && x.key === nextKey);
        return (
          <HStack key={x.key} spacing={6}>
            <Image systemName={ICON[x.key] as never} size={12} color={hot ? C.acc : C.muted} />
            <Text modifiers={[font({ size: 12.5, weight: hot ? 'bold' : 'semibold' }), foregroundStyle(hot ? C.acc : C.ink), lineLimit(1)]}>{x.name}</Text>
            <Spacer />
            <Text modifiers={[font({ size: 12 }), foregroundStyle(hot ? C.acc : C.muted), monospacedDigit()]}>{x.time.replace(/\s?[AP]M$/i, '')}</Text>
            <Circle modifiers={[foregroundStyle(x.status ? ST[x.status]! : C.none), frame({ width: 9, height: 9 })]} />
          </HStack>
        );
      })}
    </VStack>
  );
};

// ───────────────────────── Mark from the widget (WS4 · WM2) ─────────────────────────
const Mark = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    acc: dark ? '#FB923C' : '#C2410C',
    chip: dark ? '#26262A' : '#F5F5F3',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const ST_ICON: Record<string, string> = { mosque: 'building.columns.fill', onTime: 'checkmark', late: 'clock', missed: 'xmark' };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const cur = p.current;
  const tapped = cur && p.tap && p.tap.date === cur.date && p.tap.prayer === cur.key ? p.tap.status : null;
  const status = cur ? cur.status || tapped : null;
  const medium = env.widgetFamily === 'systemMedium';

  const dots = (
    <HStack spacing={5}>
      {p.prayers.map((x) => {
        const s = x.current && tapped && !x.status ? tapped : x.status;
        return s ? (
          <ZStack key={x.key}>
            <Circle modifiers={[foregroundStyle(ST[s]!), frame({ width: 16, height: 16 })]} />
            <Image systemName={ST_ICON[s] as never} size={8} color="#FFFFFF" />
          </ZStack>
        ) : (
          <Circle key={x.key} modifiers={[foregroundStyle(C.none), frame({ width: 16, height: 16 })]} />
        );
      })}
    </HStack>
  );

  if (!cur) {
    const next = p.next;
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted)]}>{p.t.today}</Text>
        <Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle(C.ink)]}>{`${p.done}/5`}</Text>
        <Spacer />
        {next ? (
          <HStack spacing={4}>
            <Image systemName={ICON[next.key] as never} size={12} color={C.acc} />
            <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(C.acc)]}>{`${next.name} ${next.time}`}</Text>
          </HStack>
        ) : null}
        {dots}
      </VStack>
    );
  }

  const markButton = (kind: 'onTime' | 'mosque', label: string) => (
    <Button
      key={kind}
      target={kind}
      onPress={() => ({ tap: { date: cur.date, prayer: cur.key, status: kind, at: Date.now() } })}
      modifiers={[buttonStyle('plain')]}>
      <VStack spacing={2} modifiers={[frame({ maxWidth: 1000, maxHeight: 1000 }), background(C.chip, { ignoresSafeAreaEdges: 'all' })]}>
        <Image systemName={kind === 'mosque' ? 'building.columns.fill' : 'checkmark'} size={18} color={ST[kind]} />
        <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(C.ink), lineLimit(1)]}>{label}</Text>
      </VStack>
    </Button>
  );

  const head = (
    <VStack alignment="leading" spacing={2}>
      <HStack spacing={5}>
        <Image systemName={ICON[cur.key] as never} size={15} color={C.acc} />
        <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(C.acc)]}>{`${cur.name} · ${p.t.now}`}</Text>
      </HStack>
      {status ? (
        <HStack spacing={4}>
          <Image systemName={ST_ICON[status] as never} size={12} color={ST[status]} />
          <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(ST[status]!)]}>{status === 'mosque' ? p.t.mosque : status === 'late' ? p.t.late : p.t.onTime}</Text>
        </HStack>
      ) : (
        <HStack spacing={3}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted)]}>{p.t.endsIn}</Text>
          <Text timerInterval={{ lower: env.date, upper: new Date(cur.end) }} modifiers={[font({ size: 12 }), monospacedDigit(), foregroundStyle(C.muted)]} />
        </HStack>
      )}
    </VStack>
  );

  if (!medium) {
    return (
      <VStack alignment="leading" spacing={6} modifiers={[containerBackground(C.bg, 'widget')]}>
        {head}
        <Spacer />
        {status ? dots : <HStack spacing={8} modifiers={[frame({ height: 52 })]}>{[markButton('onTime', p.t.prayed), markButton('mosque', p.t.mosque)]}</HStack>}
      </VStack>
    );
  }
  return (
    <HStack spacing={14} modifiers={[containerBackground(C.bg, 'widget')]}>
      <VStack alignment="leading" spacing={6}>
        {head}
        <Spacer />
        {dots}
      </VStack>
      <Spacer />
      {status ? null : (
        <VStack spacing={8} modifiers={[frame({ width: 132 })]}>
          {[markButton('mosque', p.t.mosque), markButton('onTime', p.t.onTime)]}
        </VStack>
      )}
    </HStack>
  );
};

// ───────────────────────── Streak & week (WS5 · WM3 · LS4 flame) ─────────────────────────
const Streak = (p: WeekProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const fam = env.widgetFamily;

  if (fam === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget')]}>
        <AccessoryWidgetBackground />
        <VStack spacing={0}>
          <Image systemName="flame.fill" size={16} />
          <Text modifiers={[font({ size: 16, weight: 'bold' })]}>{String(p.streak)}</Text>
        </VStack>
      </ZStack>
    );
  }
  const dot = fam === 'systemMedium' ? 11 : 8;
  const grid = (
    <HStack spacing={fam === 'systemMedium' ? 6 : 3}>
      {p.days.map((d, i) => (
        <VStack key={String(i)} spacing={3} modifiers={[frame({ maxWidth: 1000 })]}>
          {d.statuses.map((s, j) => (
            <Circle key={String(j)} modifiers={[foregroundStyle(s ? ST[s]! : C.none), frame({ width: dot, height: dot })]} />
          ))}
          <Text modifiers={[font({ size: 9, weight: d.today ? 'bold' : 'regular' }), foregroundStyle(d.today ? C.ink : C.faint), lineLimit(1)]}>{d.label.slice(0, fam === 'systemMedium' ? 3 : 1)}</Text>
        </VStack>
      ))}
    </HStack>
  );
  const flame = (
    <HStack spacing={5}>
      <Image systemName="flame.fill" size={fam === 'systemMedium' ? 13 : 18} color={C.acc} />
      <Text modifiers={[font({ size: fam === 'systemMedium' ? 12 : 26, weight: 'bold' }), foregroundStyle(C.acc)]}>{String(p.streak)}</Text>
      <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(C.acc)]}>{p.t.days}</Text>
    </HStack>
  );
  if (fam === 'systemMedium') {
    return (
      <HStack spacing={16} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://stats')]}>
        <VStack alignment="leading" spacing={2} modifiers={[frame({ width: 96 })]}>
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(C.faint)]}>{p.t.thisWeek.toUpperCase()}</Text>
          <Text modifiers={[font({ size: 34, weight: 'bold', design: 'rounded' }), foregroundStyle(C.ink)]}>{p.pct == null ? '—' : `${p.pct}%`}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{p.t.onTimePct}</Text>
          <Spacer />
          {flame}
        </VStack>
        {grid}
      </HStack>
    );
  }
  return (
    <VStack alignment="leading" spacing={8} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://stats')]}>
      {flame}
      <Spacer />
      {grid}
    </VStack>
  );
};

// ───────────────────────── Arabic (WS6 · LS4 logo) ─────────────────────────
const Arabic = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const AR: Record<string, string> = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        <AccessoryWidgetBackground />
        <Text modifiers={[font({ size: 24, weight: 'bold' })]}>حيّ</Text>
      </ZStack>
    );
  }
  const next = p.next;
  const friday = p.season.kind === 'friday';
  return (
    <VStack alignment="trailing" spacing={2} modifiers={[containerBackground('#111111', 'widget'), widgetURL('salah://')]}>
      <HStack>
        <Circle modifiers={[foregroundStyle('#F97316'), frame({ width: 9, height: 9 })]} />
        <Spacer />
        <Text modifiers={[font({ size: 13 }), foregroundStyle('#FFFFFFB3')]}>حيّ على الصلاة</Text>
      </HStack>
      <Spacer />
      {next ? (
        <VStack alignment="trailing" spacing={2}>
          <Text modifiers={[font({ size: 30, weight: 'bold' }), foregroundStyle('#FFFFFF')]}>{friday && next.key === 'dhuhr' ? 'الجمعة' : AR[next.key]}</Text>
          <HStack spacing={4}>
            <Text timerInterval={{ lower: env.date, upper: new Date(next.at) }} modifiers={[font({ size: 15, weight: 'medium' }), monospacedDigit(), foregroundStyle('#F97316')]} />
            <Text modifiers={[font({ size: 15, weight: 'medium' }), foregroundStyle('#F97316')]}>بعد</Text>
          </HStack>
          <Text date={new Date(next.at)} dateStyle="time" modifiers={[font({ size: 12 }), foregroundStyle('#FFFFFF99')]} />
        </VStack>
      ) : null}
    </VStack>
  );
};

// ───────────────────────── Friday & Ramadan (WM4 · WM5 · LS3) ─────────────────────────
const Season = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const fam = env.widgetFamily;
  const s = p.season;
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    acc: dark ? '#FB923C' : '#C2410C',
    chip: dark ? '#26262A' : '#F5F5F3',
  };

  if (s.kind === 'ramadan') {
    const range = { lower: env.date, upper: new Date(s.at) };
    const lead = s.phase === 'iftar' ? p.t.iftarIn : p.t.suhoorEndsIn;
    if (fam === 'accessoryCircular') {
      return (
        <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
          <AccessoryWidgetBackground />
          <VStack spacing={1}>
            <Image systemName="moon.fill" size={12} />
            <Text modifiers={[font({ size: 14, weight: 'bold', design: 'rounded' }), monospacedDigit(), lineLimit(1), minimumScaleFactor(0.6)]}>{(s.phase === 'iftar' ? s.iftar : s.suhoor).replace(/\s?[AP]M$/i, '')}</Text>
            <Text modifiers={[font({ size: 9, weight: 'semibold' }), opacity(0.8), lineLimit(1), minimumScaleFactor(0.6)]}>{s.phase === 'iftar' ? p.t.iftar : p.t.suhoor}</Text>
          </VStack>
        </ZStack>
      );
    }
    if (fam === 'accessoryRectangular') {
      return (
        <VStack alignment="leading" spacing={2} modifiers={[containerBackground('#00000000', 'widget')]}>
          <HStack spacing={4}>
            <Image systemName="moon.fill" size={12} />
            <Text modifiers={[font({ size: 14, weight: 'bold' })]}>{`${s.phase === 'iftar' ? p.t.iftar : p.t.suhoor} ${s.phase === 'iftar' ? s.iftar : s.suhoor}`}</Text>
          </HStack>
          <Text timerInterval={range} modifiers={[font({ size: 13 }), monospacedDigit(), opacity(0.75)]} />
          <Text modifiers={[font({ size: 12 }), opacity(0.75)]}>{`${p.t.ramadanDay} ${s.day}`}</Text>
        </VStack>
      );
    }
    return (
      <VStack alignment="leading" spacing={6} modifiers={[containerBackground('#111111', 'widget'), widgetURL('salah://')]}>
        <HStack spacing={5}>
          <Image systemName="moon.fill" size={13} color="#F97316" />
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle('#FFFFFFB3')]}>{`${p.t.ramadanDay} ${s.day}`.toUpperCase()}</Text>
          <Spacer />
          {s.fasted ? <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle('#FFFFFF')]}>{`✓ ${p.t.fasted}`}</Text> : null}
        </HStack>
        <VStack alignment="leading" spacing={0}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#FFFFFFB3')]}>{lead}</Text>
          <Text timerInterval={range} modifiers={[font({ size: 32, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle('#FFFFFF')]} />
        </VStack>
        <Spacer />
        <ProgressView timerInterval={{ lower: new Date(s.start), upper: new Date(s.at) }} countsDown={false} modifiers={[progressViewStyle('linear'), tint('#F97316'), frame({ height: 4, alignment: 'top' }), clipped()]} />
        <HStack>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(s.phase === 'suhoor' ? '#F97316' : '#FFFFFFB3')]}>{`${p.t.suhoor} ${s.suhoor}`}</Text>
          <Spacer />
          <Text modifiers={[font({ size: 11 }), foregroundStyle(s.phase === 'iftar' ? '#F97316' : '#FFFFFFB3')]}>{`${p.t.iftar} ${s.iftar}`}</Text>
        </HStack>
      </VStack>
    );
  }

  if (s.kind === 'friday') {
    const before = env.date.getTime() < s.jumuahAt;
    if (fam === 'accessoryCircular' || fam === 'accessoryRectangular') {
      return (
        <VStack alignment={fam === 'accessoryCircular' ? 'center' : 'leading'} spacing={1} modifiers={[containerBackground('#00000000', 'widget')]}>
          <Image systemName={s.kahfDone ? 'checkmark' : 'book'} size={14} />
          <Text modifiers={[font({ size: 13, weight: 'bold' }), lineLimit(1), minimumScaleFactor(0.6)]}>{fam === 'accessoryCircular' ? p.t.jumuah : `${p.t.jumuah} ${s.jumuahTime}`}</Text>
          {fam === 'accessoryRectangular' ? <Text modifiers={[font({ size: 12 }), opacity(0.75)]}>{s.kahfDone ? p.t.kahfDone : p.t.kahf}</Text> : null}
        </VStack>
      );
    }
    return (
      <HStack spacing={14} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        <VStack alignment="leading" spacing={4}>
          <HStack spacing={5}>
            <Image systemName="building.columns.fill" size={14} color={C.acc} />
            <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(C.acc)]}>{p.t.jumuah}</Text>
          </HStack>
          <Text modifiers={[font({ size: 28, weight: 'bold', design: 'rounded' }), foregroundStyle(C.ink)]}>{s.jumuahTime}</Text>
          {before ? (
            <HStack spacing={3}>
              <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{p.t.in}</Text>
              <Text timerInterval={{ lower: env.date, upper: new Date(s.jumuahAt) }} modifiers={[font({ size: 11 }), monospacedDigit(), foregroundStyle(C.muted)]} />
            </HStack>
          ) : null}
        </VStack>
        <Spacer />
        <VStack spacing={6} modifiers={[frame({ width: 118 }), frame({ maxHeight: 1000 }), background(C.chip)]}>
          <Image systemName={s.kahfDone ? 'checkmark.circle.fill' : 'book'} size={24} color={s.kahfDone ? '#16A34A' : C.ink} />
          <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(C.ink)]}>{s.kahfDone ? p.t.kahfDone : p.t.kahf}</Text>
        </VStack>
      </HStack>
    );
  }

  // Not Friday or Ramadan: Hijri date and the next prayer.
  const next = p.next;
  if (fam === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget')]}>
        <AccessoryWidgetBackground />
        <Image systemName="moon.stars" size={20} />
      </ZStack>
    );
  }
  return (
    <VStack alignment="leading" spacing={4} modifiers={[containerBackground(fam === 'systemMedium' ? C.bg : '#00000000', 'widget'), widgetURL('salah://')]}>
      <HStack spacing={5}>
        <Image systemName="moon.stars" size={13} color={fam === 'systemMedium' ? C.acc : undefined} />
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(fam === 'systemMedium' ? C.acc : '#FFFFFF')]}>{s.hijri}</Text>
      </HStack>
      {next ? <Text modifiers={[font({ size: fam === 'systemMedium' ? 22 : 13, weight: 'bold' }), foregroundStyle(fam === 'systemMedium' ? C.ink : '#FFFFFF')]}>{`${next.name} ${next.time}`}</Text> : null}
    </VStack>
  );
};

// ───────────────────────── Qibla (LS4 · small) ─────────────────────────
// A widget can't read the compass, so this is a map-style dial: north is up, the needle points to Makkah.
const Qibla = (p: QiblaProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    acc: dark ? '#FB923C' : '#C2410C',
    dial: dark ? '#26262A' : '#F5F5F3',
  };
  const deg = `${Math.round(p.bearing)}°`;
  // No array destructuring: Babel turns it into a helper outside this function.
  const cards = p.cardinals || ['N', 'E', 'S', 'W'];
  const n = cards[0];
  const e = cards[1];
  const so = cards[2];
  const w = cards[3];

  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://qibla')]}>
        <AccessoryWidgetBackground />
        <Text modifiers={[font({ size: 8, weight: 'bold' }), offset({ y: -24 })]}>{n}</Text>
        <VStack spacing={0} modifiers={[frame({ width: 12, height: 44 }), rotationEffect(p.bearing)]}>
          <Image systemName="arrowtriangle.up.fill" size={9} />
          <Capsule modifiers={[frame({ width: 2.5, height: 12 })]} />
          <Spacer />
        </VStack>
        <Text modifiers={[font({ size: 9, weight: 'bold' }), offset({ y: 19 })]}>{deg}</Text>
      </ZStack>
    );
  }

  const R = 46;
  return (
    <VStack spacing={4} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://qibla')]}>
      <HStack>
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(C.acc)]}>{p.t.qibla}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted), lineLimit(1)]}>{p.city}</Text>
      </HStack>
      <ZStack modifiers={[frame({ width: R * 2 + 8, height: R * 2 + 8 })]}>
        <Circle modifiers={[foregroundStyle(C.dial), frame({ width: R * 2, height: R * 2 })]} />
        <Text modifiers={[font({ size: 10, weight: 'bold' }), foregroundStyle(C.acc), offset({ y: -(R - 9) })]}>{n}</Text>
        <Text modifiers={[font({ size: 9, weight: 'semibold' }), foregroundStyle(C.muted), offset({ x: R - 9 })]}>{e}</Text>
        <Text modifiers={[font({ size: 9, weight: 'semibold' }), foregroundStyle(C.muted), offset({ y: R - 9 })]}>{so}</Text>
        <Text modifiers={[font({ size: 9, weight: 'semibold' }), foregroundStyle(C.muted), offset({ x: -(R - 9) })]}>{w}</Text>
        <VStack spacing={0} modifiers={[frame({ width: 16, height: (R - 14) * 2 }), rotationEffect(p.bearing)]}>
          <Image systemName="arrowtriangle.up.fill" size={13} color={C.acc} />
          <Capsule modifiers={[foregroundStyle(C.acc), frame({ width: 3, height: R - 27 })]} />
          <Spacer />
        </VStack>
        <Circle modifiers={[foregroundStyle(C.ink), frame({ width: 7, height: 7 })]} />
      </ZStack>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(C.ink), lineLimit(1), minimumScaleFactor(0.7)]}>{p.label || deg}</Text>
    </VStack>
  );
};

// ───────────────────────── Edit prayers (WM6 · WL3, iOS 17+) ─────────────────────────
const Edit = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    chip: dark ? '#26262A' : '#F5F5F3',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const ST_ICON: Record<string, string> = { mosque: 'building.columns.fill', onTime: 'checkmark', late: 'clock', missed: 'xmark' };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const LABEL: Record<string, string> = { mosque: p.t.mosque, onTime: p.t.onTime, late: p.t.late, missed: p.t.missed };
  // A tap moves to the next status; after "missed" it clears.
  const CYCLE = ['', 'onTime', 'mosque', 'late', 'missed'];
  const edits = p.edits || {};
  const statusOf = (key: string, saved: string | null) => {
    const e = edits[`${p.date}:${key}`];
    return e ? e.status : saved || '';
  };
  const change = (key: string, status: string) => () => ({
    edits: { ...edits, [`${p.date}:${key}`]: { date: p.date, prayer: key, status, at: Date.now() } },
  });
  const done = p.prayers.filter((x) => {
    const st = statusOf(x.key, x.status);
    return st && st !== 'missed';
  }).length;
  const badge = (st: string, size: number) =>
    st ? (
      <ZStack>
        <Circle modifiers={[foregroundStyle(ST[st]!), frame({ width: size, height: size })]} />
        <Image systemName={ST_ICON[st] as never} size={size * 0.48} color="#FFFFFF" />
      </ZStack>
    ) : (
      <Circle modifiers={[foregroundStyle(C.none), frame({ width: size, height: size })]} />
    );
  const header = (
    <HStack spacing={6}>
      <Text modifiers={[font({ size: 13, weight: 'bold' }), foregroundStyle(C.ink)]}>{`${p.t.today} · ${done}/5`}</Text>
      <Spacer />
      <Text modifiers={[font({ size: 10 }), foregroundStyle(C.faint), lineLimit(1)]}>{p.t.tapToChange}</Text>
    </HStack>
  );

  if (env.widgetFamily === 'systemLarge') {
    return (
      <VStack alignment="leading" spacing={0} modifiers={[containerBackground(C.bg, 'widget')]}>
        {header}
        <Spacer />
        {p.prayers.map((x) => {
          const st = statusOf(x.key, x.status);
          return (
            <HStack key={x.key} spacing={8} modifiers={[frame({ height: 54 }), opacity(x.upcoming ? 0.45 : 1)]}>
              <Image systemName={ICON[x.key] as never} size={16} color={x.current ? C.acc : C.muted} />
              <VStack alignment="leading" spacing={0}>
                <Text modifiers={[font({ size: 14, weight: 'semibold' }), foregroundStyle(x.current ? C.acc : C.ink), lineLimit(1)]}>{x.name}</Text>
                <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted), monospacedDigit()]}>{x.time}</Text>
              </VStack>
              <Spacer />
              {x.upcoming
                ? null
                : ['mosque', 'onTime', 'late', 'missed'].map((k) => (
                    <Button key={k} target={`${x.key}-${k}`} onPress={change(x.key, st === k ? '' : k)} modifiers={[buttonStyle('plain')]}>
                      <ZStack>
                        <Circle modifiers={[foregroundStyle(st === k ? ST[k]! : C.chip), frame({ width: 36, height: 36 })]} />
                        <Image systemName={ST_ICON[k] as never} size={15} color={st === k ? '#FFFFFF' : ST[k]} />
                      </ZStack>
                    </Button>
                  ))}
            </HStack>
          );
        })}
      </VStack>
    );
  }

  return (
    <VStack alignment="leading" spacing={8} modifiers={[containerBackground(C.bg, 'widget')]}>
      {header}
      <HStack spacing={6}>
        {p.prayers.map((x) => {
          const st = statusOf(x.key, x.status);
          const tile = (
            <VStack spacing={3} modifiers={[frame({ maxWidth: 1000, maxHeight: 1000 }), background(x.current ? (dark ? '#2A1A0F' : '#FFF7ED') : C.chip), clipShape('roundedRectangle', 12)]}>
              <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(x.current ? C.acc : C.ink), lineLimit(1), minimumScaleFactor(0.7)]}>{x.name}</Text>
              <Text modifiers={[font({ size: 10 }), foregroundStyle(C.muted), monospacedDigit(), lineLimit(1), minimumScaleFactor(0.7)]}>{x.time.replace(/\s?[AP]M$/i, '')}</Text>
              {badge(st, 24)}
              <Text modifiers={[font({ size: 9, weight: 'semibold' }), foregroundStyle(st ? ST[st]! : C.faint), lineLimit(1), minimumScaleFactor(0.6)]}>{st ? LABEL[st] : '—'}</Text>
            </VStack>
          );
          return x.upcoming ? (
            <VStack key={x.key} spacing={0} modifiers={[frame({ maxWidth: 1000, maxHeight: 1000 }), opacity(0.45)]}>
              {tile}
            </VStack>
          ) : (
            <Button key={x.key} target={x.key} onPress={change(x.key, CYCLE[(CYCLE.indexOf(st) + 1) % CYCLE.length]!)} modifiers={[buttonStyle('plain')]}>
              {tile}
            </Button>
          );
        })}
      </HStack>
    </VStack>
  );
};

// ───────────────────────── Previous & next (WS8 · WM7 · LS5) ─────────────────────────
const PrevNext = (p: DayProps, env: WidgetEnvironment) => {
  'widget';
  // Placeholders (widget gallery, before the app's first sync) arrive with empty props.
  if (!p?.t) {
    const glance = env.widgetFamily.startsWith('accessory');
    return (
      <VStack spacing={4} modifiers={[containerBackground(glance ? '#00000000' : env.colorScheme === 'dark' ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://')]}>
        <Image systemName="moon.stars" size={glance ? 14 : 22} color={glance ? undefined : env.colorScheme === 'dark' ? '#FB923C' : '#C2410C'} />
        <Text modifiers={[font({ size: glance ? 12 : 14, weight: 'semibold' })]}>Hayya</Text>
      </VStack>
    );
  }
  const dark = env.colorScheme === 'dark';
  const C = {
    bg: dark ? '#161618' : '#FFFFFF',
    ink: dark ? '#F2F2EF' : '#111111',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    line: dark ? '#26262A' : '#EFEFEC',
  };
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const fam = env.widgetFamily;
  const next = p.next;
  const prev = p.prev;
  const glance = fam.startsWith('accessory');
  if (!next) {
    return <Text modifiers={[font({ size: 13 }), containerBackground(glance ? '#00000000' : C.bg, 'widget')]}>{p.t.noTimes}</Text>;
  }
  const range = { lower: env.date, upper: new Date(next.at) };

  if (fam === 'accessoryInline') {
    return <Text modifiers={[containerBackground('#00000000', 'widget')]}>{prev ? `${prev.name} ${prev.time} → ${next.name} ${next.time}` : `${next.name} ${next.time}`}</Text>;
  }
  if (fam === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={1} modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://')]}>
        {prev ? <Text modifiers={[font({ size: 12 }), opacity(0.65), lineLimit(1)]}>{`${p.t.prev}: ${prev.name} ${prev.time}`}</Text> : null}
        <Text modifiers={[font({ size: 14, weight: 'bold' }), lineLimit(1), minimumScaleFactor(0.8)]}>{`${p.t.next}: ${next.name} ${next.time}`}</Text>
        <HStack spacing={3}>
          <Text modifiers={[font({ size: 13 }), opacity(0.75)]}>{p.t.in}</Text>
          <Text timerInterval={range} modifiers={[font({ size: 13, weight: 'semibold' }), monospacedDigit()]} />
        </HStack>
      </VStack>
    );
  }

  const prevBlock = prev ? (
    <VStack alignment="leading" spacing={1}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(C.faint)]}>{p.t.prev.toUpperCase()}</Text>
      <HStack spacing={4}>
        <Image systemName={ICON[prev.key] as never} size={11} color={C.muted} />
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(C.muted), lineLimit(1)]}>{prev.name}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted), monospacedDigit(), lineLimit(1)]}>{prev.time}</Text>
      </HStack>
    </VStack>
  ) : null;
  const nextBlock = (
    <VStack alignment="leading" spacing={1}>
      <Text modifiers={[font({ size: 10, weight: 'semibold' }), foregroundStyle(C.acc)]}>{p.t.next.toUpperCase()}</Text>
      <HStack spacing={4}>
        <Image systemName={ICON[next.key] as never} size={13} color={C.acc} />
        <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(C.ink), lineLimit(1)]}>{next.name}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(C.ink), monospacedDigit(), lineLimit(1)]}>{next.time}</Text>
      </HStack>
    </VStack>
  );
  const countdown = (size: number) => (
    <HStack alignment="firstTextBaseline" spacing={4}>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(C.muted)]}>{p.t.in}</Text>
      <Text timerInterval={range} modifiers={[font({ size, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle(C.acc), lineLimit(1), minimumScaleFactor(0.6)]} />
    </HStack>
  );

  if (fam === 'systemMedium') {
    return (
      <HStack spacing={14} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        <VStack alignment="leading" spacing={8} modifiers={[frame({ maxWidth: 1000 })]}>
          {prevBlock}
          <Rectangle modifiers={[foregroundStyle(C.line), frame({ height: 1 })]} />
          {nextBlock}
        </VStack>
        <VStack alignment="leading" spacing={2} modifiers={[frame({ width: 128 })]}>
          {countdown(30)}
          <Text modifiers={[font({ size: 11 }), foregroundStyle(C.faint), lineLimit(1)]}>{p.city}</Text>
        </VStack>
      </HStack>
    );
  }
  return (
    <VStack alignment="leading" spacing={6} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
      {prevBlock}
      <Spacer />
      {nextBlock}
      {countdown(24)}
    </VStack>
  );
};

// ───────────────────────── Live Activity (LA1 · LA2 · LA3) ─────────────────────────
const Countdown = (p: LiveProps, env: LiveActivityEnvironment) => {
  'widget';
  const acc = env.isLuminanceReduced ? '#FFFFFF' : '#F97316';
  const ICON: Record<string, string> = { fajr: 'sunrise', dhuhr: 'sun.max', asr: 'sun.min', maghrib: 'sunset', isha: 'moon.stars' };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const icon = p.ramadan ? 'moon.fill' : ICON[p.key]!;
  const range = { lower: new Date(p.start), upper: new Date(p.at) };
  const timer = (size: number) => (
    <Text timerInterval={range} modifiers={[font({ size, weight: 'bold', design: 'rounded' }), monospacedDigit(), foregroundStyle('#FFFFFF')]} />
  );
  // ProgressView prints the elapsed time under the bar; clip to the bar itself.
  const bar = <ProgressView timerInterval={range} countsDown={false} modifiers={[progressViewStyle('linear'), tint(acc), frame({ height: 4, alignment: 'top' }), clipped()]} />;

  return {
    banner: (
      <VStack alignment="leading" spacing={8} modifiers={[padding({ all: 16 })]}>
        <HStack spacing={6}>
          <Image systemName={icon as never} size={16} color={acc} />
          <Text modifiers={[font({ size: 14, weight: 'semibold' }), foregroundStyle(acc)]}>{p.title}</Text>
          <Spacer />
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#FFFFFF99')]}>{p.subtitle}</Text>
        </HStack>
        {timer(40)}
        {bar}
        {p.statuses.length ? (
          <HStack spacing={4}>
            {p.statuses.map((s, i) => (
              <RoundedRectangle key={String(i)} cornerRadius={3} modifiers={[foregroundStyle(s ? ST[s]! : '#FFFFFF33'), frame({ maxWidth: 1000, height: 5 })]} />
            ))}
          </HStack>
        ) : null}
      </VStack>
    ),
    compactLeading: <Image systemName={icon as never} color={acc} />,
    compactTrailing: (
      <Text timerInterval={range} modifiers={[font({ size: 14, weight: 'semibold' }), monospacedDigit(), foregroundStyle(acc), frame({ maxWidth: 56 })]} />
    ),
    minimal: <Image systemName={icon as never} color={acc} />,
    expandedLeading: (
      <HStack spacing={6} modifiers={[padding({ leading: 6 })]}>
        <Image systemName={icon as never} color={acc} />
        <Text modifiers={[font({ size: 14, weight: 'semibold' }), foregroundStyle(acc)]}>{p.name}</Text>
      </HStack>
    ),
    expandedTrailing: <Text modifiers={[font({ size: 13 }), foregroundStyle('#FFFFFF99'), padding({ trailing: 6 })]}>{p.time}</Text>,
    expandedBottom: (
      <VStack alignment="leading" spacing={8} modifiers={[padding({ horizontal: 8 })]}>
        {timer(34)}
        {bar}
      </VStack>
    ),
  };
};

export const widgets = {
  next: createWidget('HayyaNext', NextPrayer),
  today: createWidget('HayyaToday', Today),
  times: createWidget('HayyaTimes', Times),
  mark: createWidget('HayyaMark', Mark),
  edit: createWidget('HayyaEdit', Edit),
  prevNext: createWidget('HayyaPrevNext', PrevNext),
  streak: createWidget('HayyaStreak', Streak),
  arabic: createWidget('HayyaArabic', Arabic),
  season: createWidget('HayyaSeason', Season),
  qibla: createWidget('HayyaQibla', Qibla),
};

export const countdownActivity = createLiveActivity('HayyaCountdown', Countdown);
