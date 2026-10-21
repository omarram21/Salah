import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { useLocationLabel, useLocationStore } from '@/features/location';
import { FONT_FAMILY } from '@/shared/theme/fonts';
import { palette } from '@/shared/theme/colors';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Card, Icon, Screen, Text } from '@/shared/ui';

import { useHeading } from '../hooks/use-heading';
import { compassPoint, distanceToKaabaKm, guidance, qiblaBearing } from '../logic/qibla';

const SIZE = 300;
const C = SIZE / 2;
const R = 132;

/** Qibla compass: the dial turns with the phone; the Kaaba marker shows where to face. */
export function QiblaView() {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const location = useLocationStore((s) => s.location);
  const label = useLocationLabel(location);
  const { heading, continuous, reference, accuracy, status } = useHeading();

  if (!location) {
    return (
      <Screen back title={t('qibla.title')}>
        <Text variant="body" tone="muted">{t('qibla.needLocation')}</Text>
      </Screen>
    );
  }

  const bearing = qiblaBearing(location.latitude, location.longitude);
  const km = Math.round(distanceToKaabaKm(location.latitude, location.longitude));
  const live = status === 'ok' && heading !== null;
  // Rotate the dial so north on it points to real north.
  const dialRotation = live ? -continuous : 0;
  const g = live ? guidance(heading, bearing) : null;
  const aligned = g?.kind === 'aligned';
  const markerColor = aligned ? palette.status.onTime : c.ink;

  return (
    <Screen back title={t('qibla.title')} subtitle={label ?? undefined}>
      <View className="items-center pt-2">
        <View accessible accessibilityRole="image" accessibilityLabel={t('qibla.dialLabel', { degrees: Math.round(bearing) })}>
          <Svg width={SIZE} height={SIZE + 16} viewBox={`0 -16 ${SIZE} ${SIZE + 16}`}>
            {/* Fixed pointer: where the top of the phone is facing. */}
            <Path d={`M${C - 9} -14 L${C + 9} -14 L${C} 2 Z`} fill={aligned ? palette.status.onTime : c.accent} />
            <G rotation={dialRotation} origin={`${C}, ${C}`}>
              <Circle cx={C} cy={C} r={R} fill="none" stroke={c.line} strokeWidth={2} />
              {Array.from({ length: 72 }, (_, i) => {
                const a = (i * 5 * Math.PI) / 180;
                const major = i % 18 === 0;
                const mid = i % 6 === 0;
                const len = major ? 16 : mid ? 10 : 5;
                return (
                  <Line
                    key={i}
                    x1={C + Math.sin(a) * R}
                    y1={C - Math.cos(a) * R}
                    x2={C + Math.sin(a) * (R - len)}
                    y2={C - Math.cos(a) * (R - len)}
                    stroke={major ? c.ink : c.faint}
                    strokeWidth={major ? 2.5 : 1.2}
                    strokeLinecap="round"
                  />
                );
              })}
              {(['N', 'E', 'S', 'W'] as const).map((p, i) => {
                const a = (i * 90 * Math.PI) / 180;
                return (
                  <SvgText
                    key={p}
                    x={C + Math.sin(a) * (R - 32)}
                    y={C - Math.cos(a) * (R - 32) + 6}
                    textAnchor="middle"
                    fontSize={16}
                    fontFamily={FONT_FAMILY.bold}
                    fill={p === 'N' ? c.accent : c.muted}>
                    {t(`qibla.${p}`)}
                  </SvgText>
                );
              })}
              {/* The Kaaba, on the ring at the Qibla bearing. */}
              <G rotation={bearing} origin={`${C}, ${C}`}>
                <Line x1={C} y1={C} x2={C} y2={C - R + 26} stroke={markerColor} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 7" />
                <Rect x={C - 15} y={C - R - 15} width={30} height={30} rx={5} fill={markerColor} />
                <Rect x={C - 15} y={C - R - 8} width={30} height={5} fill={palette.status.late} />
              </G>
            </G>
            <Circle cx={C} cy={C} r={6} fill={c.ink} />
          </Svg>
        </View>

        <View className="mt-4 min-h-[64px] items-center gap-1">
          {g === null ? (
            <Text variant="heading" align="center">{t('qibla.bearingOnly', { degrees: Math.round(bearing), point: compassPoint(bearing) })}</Text>
          ) : aligned ? (
            <View className="flex-row items-center gap-2" accessibilityLiveRegion="polite">
              <Icon name="check" size={26} color={palette.status.onTime} strokeWidth={2.6} />
              <Text variant="title" tone="none" style={{ color: palette.status.onTime }}>{t('qibla.aligned')}</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Icon name={g.kind === 'right' ? 'chevronRight' : 'chevronLeft'} size={26} color={c.ink} strokeWidth={2.4} />
              <Text variant="title">{t(g.kind === 'right' ? 'qibla.turnRight' : 'qibla.turnLeft', { degrees: g.degrees })}</Text>
            </View>
          )}
          {status === 'unavailable' ? <Text variant="caption" tone="muted" align="center">{t('qibla.noCompass')}</Text> : null}
          {status === 'starting' ? <Text variant="caption" tone="muted">{t('common.loading')}</Text> : null}
        </View>
      </View>

      <View className="flex-row gap-2.5">
        <Card className="flex-1 gap-0.5">
          <Text variant="tiny" weight="semibold" tone="faint">{t('qibla.direction')}</Text>
          <Text variant="heading" tabular>{`${Math.round(bearing)}° ${compassPoint(bearing)}`}</Text>
        </Card>
        <Card className="flex-1 gap-0.5">
          <Text variant="tiny" weight="semibold" tone="faint">{t('qibla.distance')}</Text>
          <Text variant="heading" tabular>{t('qibla.km', { n: km.toLocaleString('en-US') })}</Text>
        </Card>
      </View>

      {live && accuracy <= 1 ? (
        <Card className="flex-row items-center gap-3 bg-accent-soft dark:bg-accent-soft-dark">
          <Icon name="compass" size={20} color={c.accent} />
          <Text variant="caption" tone="accent" className="flex-1">{t('qibla.calibrate')}</Text>
        </Card>
      ) : null}
      {live && reference === 'magnetic' ? <Text variant="tiny" tone="faint" align="center">{t('qibla.magnetic')}</Text> : null}
      <Text variant="tiny" tone="faint" align="center">{t('qibla.tip')}</Text>
    </Screen>
  );
}
