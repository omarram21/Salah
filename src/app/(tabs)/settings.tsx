import { useTranslation } from 'react-i18next';

import { SettingsView } from '@/features/settings/ui';
import { Screen, Text } from '@/shared/ui';

export default function SettingsScreen() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="title">{t('tabs.settings')}</Text>
      <SettingsView />
    </Screen>
  );
}
