import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * The app's stroke icon set (24×24 grid, round caps), matching the "E" design.
 * Prayer icons follow the sun: dawn rising, high sun, lower sun, setting, moon.
 */
const ICONS = {
  fajr: <Path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 4v6M9 7l3-3 3 3" />,
  sunrise: <Path d="M3 18h18M7 18a5 5 0 0 1 10 0" />,
  dhuhr: (
    <>
      <Circle cx={12} cy={12} r={4} />
      <Path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  asr: (
    <>
      <Circle cx={14} cy={10} r={3.5} />
      <Path d="M14 3v1.5M20.5 10H22M18.6 5.4l1-1M3 20h18M6 16h12" />
    </>
  ),
  maghrib: <Path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 3v6M9 6l3 3 3-3" />,
  isha: <Path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5zM17.5 3v3M16 4.5h3" />,
  mosque: <Path d="M3 21h18M5 21V10M19 21V10M8 21v-7h8v7M8 14a4 4 0 0 1 8 0M12 7.5V10" />,
  check: <Path d="M5 12.5l4.5 4.5L19 7.5" />,
  late: (
    <>
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 7.5V12l3 2" />
    </>
  ),
  close: <Path d="M7 7l10 10M17 7L7 17" />,
  help: <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01" />,
  bell: <Path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" />,
  bellOff: <Path d="M8.5 5.2A6 6 0 0 1 18 11v4M6 11v5l-1.5 2H17M10 20.5a2 2 0 0 0 4 0M3 3l18 18" />,
  bellRing: <Path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0M3 7a9 9 0 0 1 2.5-4M21 7a9 9 0 0 0-2.5-4" />,
  pin: (
    <>
      <Path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <Circle cx={12} cy={10} r={2.3} />
    </>
  ),
  calendar: (
    <>
      <Rect x={3.5} y={5} width={17} height={15.5} rx={2.5} />
      <Path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  crescent: <Path d="M15.5 4.5A8 8 0 1 0 19.5 16 6.5 6.5 0 0 1 15.5 4.5z" />,
  flame: <Path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.8 2.5-5 .3 1.8 1 2.8 2 3.3C11.5 8.8 11.2 5.8 12 3z" />,
  trophy: <Path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />,
  chevronLeft: <Path d="M15 6l-6 6 6 6" />,
  chevronRight: <Path d="M9 6l6 6-6 6" />,
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="M20 20l-3.5-3.5" />
    </>
  ),
  locate: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Circle cx={12} cy={12} r={7.5} />
      <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  globe: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  theme: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
    </>
  ),
  compass: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  flask: <Path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9" />,
  info: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 11v5M12 8h.01" />
    </>
  ),
  list: <Path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  lock: (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  timer: (
    <>
      <Circle cx={12} cy={13} r={8} />
      <Path d="M12 9v4l2.5 1.5M9.5 2.5h5" />
    </>
  ),
  stats: <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  trash: <Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  cloudOff: <Path d="M3 3l18 18M17.5 17.5H7a4.5 4.5 0 0 1-1.2-8.8M9.5 5.6A6 6 0 0 1 18 10a4 4 0 0 1 2.5 6.6" />,
  unmarked: <Circle cx={12} cy={12} r={8} strokeDasharray="3 3" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  /** Mirror horizontally (directional icons in RTL). */
  flip?: boolean;
};

export function Icon({ name, size = 22, color, strokeWidth = 1.8, flip }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      color={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
      {ICONS[name]}
    </Svg>
  );
}
