import { useTranslation } from 'react-i18next';

import { useToday } from '@/features/prayer-times';
import { StatsView } from '@/features/stats';
import { Screen, Text } from '@/shared/ui';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { index, now, today } = useToday(60_000);
  return (
    <Screen>
      <Text variant="title">{t('tabs.stats')}</Text>
      <StatsView index={index} now={now} today={today} />
    </Screen>
  );
}
