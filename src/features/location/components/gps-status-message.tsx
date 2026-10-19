import { useTranslation } from 'react-i18next';

import { Text } from '@/shared/ui';

import type { GpsStatus } from '../hooks/use-gps-location';

export function GpsStatusMessage({ status }: { status: GpsStatus }) {
  const { t } = useTranslation();
  if (status !== 'denied' && status !== 'unavailable') return null;
  return (
    <Text variant="caption" tone="accent" accessibilityLiveRegion="polite">
      {t(`location.${status}`)}
    </Text>
  );
}
