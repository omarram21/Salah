import { useTranslation } from 'react-i18next';

import { SettingsView } from '@/features/settings/ui';
import { DemoBanner } from '@/features/tracking';
import { Screen, Text } from '@/shared/ui';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <DemoBanner />
      <Text variant="title">{t('tabs.settings')}</Text>
      <SettingsView />
    </Screen>
  );
}
