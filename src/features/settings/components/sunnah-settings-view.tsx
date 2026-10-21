import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SUNNAH_IDS } from '@/features/tracking/logic/sunnah';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Screen, Switch, Text } from '@/shared/ui';

import { useSettingsStore } from '../store/settings-store';

const BODY = { witr: 'sunnah.witrBody', duha: 'sunnah.duhaBody' } as const;

/** Which voluntary prayers to track (master switch + one per item). */
export function SunnahSettingsView() {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const enabled = useSettingsStore((s) => s.sunnahEnabled);
  const items = useSettingsStore((s) => s.sunnahItems);
  const setEnabled = useSettingsStore((s) => s.setSunnahEnabled);
  const setItem = useSettingsStore((s) => s.setSunnahItem);

  return (
    <Screen
      back
      title={t('sunnah.title')}
      headerRight={<Switch accessibilityLabel={t('sunnah.track')} value={enabled} onValueChange={setEnabled} />}>
      <Text variant="caption" tone="muted">{t('sunnah.trackBody')}</Text>
      <View style={{ opacity: enabled ? 1 : 0.4 }} pointerEvents={enabled ? 'auto' : 'none'} className="gap-1.5">
        <Text variant="tiny" weight="semibold" tone="faint" className="px-1" style={{ letterSpacing: 0.7 }}>{t('sunnah.itemsLabel')}</Text>
        <View className="rounded-[20px] bg-well px-4 dark:bg-well-dark">
          {SUNNAH_IDS.map((id, i) => (
            <View key={id} className={`min-h-[56px] flex-row items-center gap-3 py-2.5 ${i < SUNNAH_IDS.length - 1 ? 'border-b border-[#ECECE8] dark:border-line-dark' : ''}`}>
              <Icon name={id === 'witr' ? 'isha' : id === 'duha' ? 'sunrise' : 'crescent'} size={18} color={c.muted} />
              <View className="flex-1">
                <Text variant="label">{t(`sunnah.names.${id}`)}</Text>
                {id === 'witr' || id === 'duha' ? <Text variant="tiny" tone="muted">{t(BODY[id])}</Text> : null}
              </View>
              <Switch accessibilityLabel={t(`sunnah.names.${id}`)} value={items[id]} onValueChange={(on) => setItem(id, on)} />
            </View>
          ))}
        </View>
      </View>
      <Text variant="tiny" tone="faint">{t('sunnah.footnote')}</Text>
    </Screen>
  );
}
