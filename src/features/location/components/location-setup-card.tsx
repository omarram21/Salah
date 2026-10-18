import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Text } from '@/shared/ui';

import { useGpsLocation } from '../hooks/use-gps-location';
import { GpsStatusMessage } from './gps-status-message';

/** First-run card shown on Today when no location is set. */
export function LocationSetupCard({ onChooseCity }: { onChooseCity: () => void }) {
  const { t } = useTranslation();
  const { status, locate } = useGpsLocation();

  return (
    <Card className="gap-4">
      <View className="items-center gap-2">
        <Ionicons name="location-outline" size={40} color="#0F766E" />
        <Text variant="heading">{t('location.setupTitle')}</Text>
        <Text variant="muted" align="center">
          {t('location.setupBody')}
        </Text>
      </View>
      <GpsStatusMessage status={status} />
      <Button
        label={status === 'locating' ? t('location.locating') : t('location.useMyLocation')}
        loading={status === 'locating'}
        onPress={locate}
      />
      <Button label={t('location.chooseCity')} variant="secondary" onPress={onChooseCity} />
    </Card>
  );
}
