import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useSettingsStore } from '@/features/settings';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Card, Icon, type IconName, Screen, Switch, Text } from '@/shared/ui';

import { widgetsSupported } from '../native';

const LIST: { id: 'next' | 'today' | 'times' | 'mark' | 'streak' | 'arabic' | 'season' | 'month' | 'qibla'; icon: IconName }[] = [
  { id: 'next', icon: 'timer' },
  { id: 'today', icon: 'dhuhr' },
  { id: 'times', icon: 'list' },
  { id: 'mark', icon: 'check' },
  { id: 'streak', icon: 'flame' },
  { id: 'arabic', icon: 'globe' },
  { id: 'season', icon: 'crescent' },
  { id: 'month', icon: 'calendar' },
  { id: 'qibla', icon: 'compass' },
];

/** How to add the widgets, what each one is, and the Live Activity switch. */
export function WidgetsSettingsView() {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const supported = widgetsSupported();
  const liveOn = useSettingsStore((s) => s.liveActivity);
  const setLive = useSettingsStore((s) => s.setLiveActivity);

  return (
    <Screen back title={t('widgets.title')}>
      {!supported ? (
        <Card className="bg-accent-soft dark:bg-accent-soft-dark">
          <Text variant="caption" weight="semibold" tone="accent">{t('widgets.unsupported')}</Text>
        </Card>
      ) : null}

      <View className="flex-row items-center gap-3 rounded-[20px] bg-well p-4 dark:bg-well-dark" style={{ opacity: supported ? 1 : 0.4 }}>
        <Icon name="lock" size={20} color={c.ink} />
        <View className="flex-1">
          <Text variant="label">{t('widgets.live')}</Text>
          <Text variant="tiny" tone="muted">{t('widgets.liveBody')}</Text>
        </View>
        <Switch accessibilityLabel={t('widgets.live')} value={liveOn} disabled={!supported} onValueChange={setLive} />
      </View>

      <Steps title={t('widgets.homeTitle')} body={t('widgets.homeSteps')} />
      <Steps title={t('widgets.lockTitle')} body={t('widgets.lockSteps')} />

      <View className="gap-1.5">
        <Text variant="tiny" weight="semibold" tone="faint" className="px-1" style={{ letterSpacing: 0.7 }}>{t('widgets.listTitle')}</Text>
        <View className="rounded-[20px] bg-well px-4 dark:bg-well-dark">
          {LIST.map(({ id, icon }, i) => (
            <View key={id} className={`min-h-[52px] flex-row items-center gap-3 py-2 ${i < LIST.length - 1 ? 'border-b border-[#ECECE8] dark:border-line-dark' : ''}`}>
              <Icon name={icon} size={18} color={c.muted} />
              <View className="flex-1">
                <Text variant="label">{t(`widgets.names.${id}`)}</Text>
                <Text variant="tiny" tone="muted">{t(`widgets.sizes.${id}`)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <Text variant="tiny" tone="faint" className="px-1">{t('widgets.markNote')}</Text>
    </Screen>
  );
}

function Steps({ title, body }: { title: string; body: string }) {
  return (
    <View className="gap-1.5">
      <Text variant="tiny" weight="semibold" tone="faint" className="px-1" style={{ letterSpacing: 0.7 }}>{title}</Text>
      <Text variant="caption" tone="muted" className="px-1">{body}</Text>
    </View>
  );
}
