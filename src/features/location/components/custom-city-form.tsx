import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button, Card, Input, Text } from '@/shared/ui';

import type { AppLocation } from '../model/types';
import { resolveCity, type ResolvedCity } from '../services/resolve-city';

/** Free-text city lookup via AlAdhan, with a confirmation step (AlAdhan always "finds" something). */
export function CustomCityForm({ onSelect }: { onSelect: (location: AppLocation) => void }) {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [result, setResult] = useState<ResolvedCity | null>(null);

  const find = async () => {
    setState('loading');
    setResult(null);
    try {
      setResult(await resolveCity(city, country));
      setState('idle');
    } catch {
      setState('error');
    }
  };

  return (
    <View className="gap-2.5">
      <Input placeholder={t('location.cityField')} value={city} onChangeText={setCity} accessibilityLabel={t('location.cityField')} />
      <Input
        placeholder={t('location.countryField')}
        value={country}
        onChangeText={setCountry}
        returnKeyType="search"
        onSubmitEditing={find}
        accessibilityLabel={t('location.countryField')}
      />
      <Button
        icon="search"
        variant="secondary"
        label={state === 'loading' ? t('location.finding') : t('location.find')}
        loading={state === 'loading'}
        disabled={!city.trim() || !country.trim()}
        onPress={find}
      />
      {state === 'error' ? <Text variant="caption" tone="none" style={{ color: '#DC2626' }}>{t('location.notFound')}</Text> : null}
      {result ? (
        <Card className="gap-2">
          <Text variant="small" weight="semibold">
            {t('location.found', {
              timezone: result.timezone,
              coords: `${result.location.latitude.toFixed(2)}, ${result.location.longitude.toFixed(2)}`,
            })}
          </Text>
          <Text variant="caption" tone="muted">{t('location.foundHint')}</Text>
          <Button label={t('location.useThis')} onPress={() => onSelect(result.location)} />
        </Card>
      ) : null}
    </View>
  );
}
