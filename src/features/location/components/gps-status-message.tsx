import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui';

import type { GpsStatus } from '../hooks/use-gps-location';

export function GpsStatusMessage({ status }: { status: GpsStatus }) {
  const { t } = useTranslation();
  if (status !== 'denied' && status !== 'unavailable') return null;
  return <Text className="text-sm text-amber-700 dark:text-amber-400">{t(`location.${status}`)}</Text>;
}
