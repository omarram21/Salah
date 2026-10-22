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
  Circle,
  Gauge,
  HStack,
  Image,
  ProgressView,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  background,
  buttonStyle,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  gaugeStyle,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  opacity,
  padding,
  progressViewStyle,
  rotationEffect,
  tint,
  widgetURL,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, createWidget, type LiveActivityEnvironment, type WidgetEnvironment } from 'expo-widgets';

import type { DayProps, MonthProps, QiblaProps, WeekProps } from '../logic/widget-data';
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

  if (fam === 'accessoryInline') {
    return <Text modifiers={[containerBackground('#00000000', 'widget')]}>{`${next.name} ${next.time}`}</Text>;
  }
  if (fam === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget')]}>
        <AccessoryWidgetBackground />
        <ProgressView
          timerInterval={{ lower: new Date(p.current ? p.current.start : env.date.getTime()), upper: new Date(next.at) }}
          countsDown={false}
          modifiers={[progressViewStyle('circular')]}>
          <VStack spacing={0}>
            <Image systemName={ICON[next.key] as never} size={14} />
            <Text modifiers={[font({ size: 12, weight: 'bold' }), minimumScaleFactor(0.6), lineLimit(1)]}>{next.time.replace(/\s?[AP]M$/i, '')}</Text>
          </VStack>
        </ProgressView>
      </ZStack>
    );
  }
  if (fam === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={2} modifiers={[containerBackground('#00000000', 'widget')]}>
        <HStack spacing={4}>
          <Image systemName={ICON[next.key] as never} size={13} />
          <Text modifiers={[font({ size: 15, weight: 'bold' })]}>{`${next.name} ${next.time}`}</Text>
        </HStack>
        <Text timerInterval={range} modifiers={[font({ size: 13 }), monospacedDigit(), opacity(0.75)]} />
        <ProgressView
          timerInterval={{ lower: new Date(p.current ? p.current.start : env.date.getTime()), upper: new Date(next.at) }}
          countsDown={false}
          modifiers={[progressViewStyle('linear')]}
        />
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
      <Gauge value={p.done} min={0} max={5} modifiers={[gaugeStyle('circularCapacity'), containerBackground('#00000000', 'widget')]} currentValueLabel={<Text>{`${p.done}/5`}</Text>}>
        <Text>{p.t.today}</Text>
      </Gauge>
    );
  }
  if (fam === 'accessoryRectangular') {
    return (
      <VStack alignment="leading" spacing={4} modifiers={[containerBackground('#00000000', 'widget')]}>
        <Text modifiers={[font({ size: 13, weight: 'semibold' })]}>{`${p.t.today} · ${p.done}/5`}</Text>
        <HStack spacing={5}>
          {p.prayers.map((x) =>
            x.status ? (
              <ZStack key={x.key}>
                <Circle modifiers={[frame({ width: 20, height: 20 })]} />
                <Image systemName={ST_ICON[x.status] as never} size={10} color="#000000" />
              </ZStack>
            ) : (
              <Circle key={x.key} modifiers={[frame({ width: 20, height: 20 }), opacity(0.3)]} />
            ),
          )}
        </HStack>
      </VStack>
    );
  }

  if (fam === 'systemSmall') {
    return (
      <VStack spacing={6} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://')]}>
        <Gauge value={p.done} min={0} max={5} modifiers={[gaugeStyle('circularCapacity'), tint(C.acc), frame({ width: 92, height: 92 })]} currentValueLabel={<Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle(C.ink)]}>{`${p.done}/5`}</Text>}>
          <Text>{p.t.today}</Text>
        </Gauge>
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
              modifiers={[frame({ maxWidth: 1000 }), padding({ vertical: 6 }), background(x.current ? C.soft : '#00000000'), containerBackground(C.bg, 'widget')]}>
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
          <Text modifiers={[font({ size: 34, weight: 'bold', design: 'rounded' }), foregroundStyle(C.ink)]}>{p.pct === null ? '—' : `${p.pct}%`}</Text>
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
        <ProgressView timerInterval={{ lower: new Date(s.start), upper: new Date(s.at) }} countsDown={false} modifiers={[progressViewStyle('circular'), containerBackground('#00000000', 'widget')]}>
          <VStack spacing={0}>
            <Image systemName="moon.fill" size={12} />
            <Text modifiers={[font({ size: 11, weight: 'bold' }), lineLimit(1), minimumScaleFactor(0.6)]}>{(s.phase === 'iftar' ? s.iftar : s.suhoor).replace(/\s?[AP]M$/i, '')}</Text>
          </VStack>
        </ProgressView>
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
        <ProgressView timerInterval={{ lower: new Date(s.start), upper: new Date(s.at) }} countsDown={false} modifiers={[progressViewStyle('linear'), tint('#F97316')]} />
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
        <VStack spacing={6} modifiers={[frame({ width: 118, maxHeight: 1000 }), background(C.chip)]}>
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

// ───────────────────────── Month (WL2) ─────────────────────────
const Month = (p: MonthProps, env: WidgetEnvironment) => {
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
    inv: dark ? '#111111' : '#FFFFFF',
    muted: dark ? '#9A9A94' : '#6E6E69',
    faint: dark ? '#85857F' : '#71716B',
    acc: dark ? '#FB923C' : '#C2410C',
    none: dark ? '#3A3A3E' : '#E4E4E0',
  };
  const ST: Record<string, string> = { mosque: '#2563EB', onTime: '#16A34A', late: '#D97706', missed: '#DC2626' };
  const cells: ({ d: number; statuses: (string | null)[]; today: boolean; perfect: boolean; tracked: boolean } | null)[] = [];
  for (let i = 0; i < p.offset; i++) cells.push(null);
  for (const d of p.days) cells.push(d);
  while (cells.length % 7) cells.push(null);
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <VStack alignment="leading" spacing={4} modifiers={[containerBackground(C.bg, 'widget'), widgetURL('salah://history')]}>
      <HStack alignment="firstTextBaseline" spacing={8}>
        <Text modifiers={[font({ size: 17, weight: 'bold' }), foregroundStyle(C.ink)]}>{p.title}</Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted), lineLimit(1)]}>{p.subtitle}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 18, weight: 'bold' }), foregroundStyle(C.ink)]}>{p.pct === null ? '—' : `${p.pct}%`}</Text>
      </HStack>
      <HStack spacing={0}>
        {p.weekdays.map((w, i) => (
          <Text key={String(i)} modifiers={[font({ size: 9 }), foregroundStyle(C.faint), frame({ maxWidth: 1000 })]}>{w.slice(0, 2)}</Text>
        ))}
      </HStack>
      {weeks.map((week, wi) => (
        <HStack key={String(wi)} spacing={0}>
          {week.map((c, ci) =>
            c ? (
              <VStack key={String(ci)} spacing={2} modifiers={[frame({ maxWidth: 1000, height: 36 })]}>
                <ZStack>
                  {c.today ? <Circle modifiers={[foregroundStyle(C.ink), frame({ width: 20, height: 20 })]} /> : null}
                  <Text modifiers={[font({ size: 11, weight: c.today || c.perfect ? 'bold' : 'medium' }), foregroundStyle(c.today ? C.inv : c.perfect ? C.acc : c.tracked ? C.ink : C.faint)]}>{String(c.d)}</Text>
                </ZStack>
                {c.tracked ? (
                  <HStack spacing={1}>
                    {c.statuses.map((s, si) => (
                      <Circle key={String(si)} modifiers={[foregroundStyle(s ? ST[s]! : C.none), frame({ width: 4, height: 4 })]} />
                    ))}
                  </HStack>
                ) : null}
              </VStack>
            ) : (
              <Spacer key={String(ci)} modifiers={[frame({ maxWidth: 1000, height: 36 })]} />
            ),
          )}
        </HStack>
      ))}
      <Spacer />
      <HStack spacing={12}>
        <HStack spacing={3}>
          <Image systemName="flame.fill" size={11} color={C.acc} />
          <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(C.acc)]}>{`${p.streak} ${p.t.days}`}</Text>
        </HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{`${p.perfect} ${p.t.perfect}`}</Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(C.muted)]}>{`${p.missed} ${p.t.missed}`}</Text>
      </HStack>
    </VStack>
  );
};

// ───────────────────────── Qibla (LS4 · small) ─────────────────────────
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
  const deg = `${Math.round(p.bearing)}°`;
  if (env.widgetFamily === 'accessoryCircular') {
    return (
      <ZStack modifiers={[containerBackground('#00000000', 'widget'), widgetURL('salah://qibla')]}>
        <AccessoryWidgetBackground />
        <VStack spacing={0}>
          <Image systemName="location.north.fill" size={16} modifiers={[rotationEffect(p.bearing)]} />
          <Text modifiers={[font({ size: 10, weight: 'semibold' })]}>{deg}</Text>
        </VStack>
      </ZStack>
    );
  }
  return (
    <VStack spacing={6} modifiers={[containerBackground(dark ? '#161618' : '#FFFFFF', 'widget'), widgetURL('salah://qibla')]}>
      <HStack>
        <Text modifiers={[font({ size: 13, weight: 'semibold' }), foregroundStyle(dark ? '#FB923C' : '#C2410C')]}>{p.t.qibla}</Text>
        <Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(dark ? '#9A9A94' : '#6E6E69')]}>{p.city}</Text>
      </HStack>
      <ZStack>
        <Circle modifiers={[foregroundStyle(dark ? '#26262A' : '#F5F5F3'), frame({ width: 76, height: 76 })]} />
        <Text modifiers={[font({ size: 9, weight: 'bold' }), foregroundStyle(dark ? '#9A9A94' : '#6E6E69'), padding({ bottom: 58 })]}>N</Text>
        <Image systemName="location.north.fill" size={30} color={dark ? '#FB923C' : '#C2410C'} modifiers={[rotationEffect(p.bearing)]} />
      </ZStack>
      <Text modifiers={[font({ size: 15, weight: 'bold' }), foregroundStyle(dark ? '#F2F2EF' : '#111111')]}>{deg}</Text>
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
  const bar = <ProgressView timerInterval={range} countsDown={false} modifiers={[progressViewStyle('linear'), tint(acc)]} />;

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
  streak: createWidget('HayyaStreak', Streak),
  arabic: createWidget('HayyaArabic', Arabic),
  season: createWidget('HayyaSeason', Season),
  month: createWidget('HayyaMonth', Month),
  qibla: createWidget('HayyaQibla', Qibla),
};

export const countdownActivity = createLiveActivity('HayyaCountdown', Countdown);
