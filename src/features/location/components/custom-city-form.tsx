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
    <Card className="gap-3">
      <Text variant="heading">{t('location.otherCity')}</Text>
      <Input placeholder={t('location.cityField')} value={city} onChangeText={setCity} />
      <Input
        placeholder={t('location.countryField')}
        value={country}
        onChangeText={setCountry}
        returnKeyType="search"
        onSubmitEditing={find}
      />
      <Button
        label={state === 'loading' ? t('location.finding') : t('location.find')}
        variant="secondary"
        loading={state === 'loading'}
        disabled={!city.trim() || !country.trim()}
        onPress={find}
      />
      {state === 'error' ? (
        <Text className="text-sm text-red-600 dark:text-red-400">{t('location.notFound')}</Text>
      ) : null}
      {result ? (
        <View className="gap-2 rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
          <Text>
            {t('location.found', {
              timezone: result.timezone,
              coords: `${result.location.latitude.toFixed(2)}, ${result.location.longitude.toFixed(2)}`,
            })}
          </Text>
          <Text variant="muted">{t('location.foundHint')}</Text>
          <Button label={t('location.useThis')} onPress={() => onSelect(result.location)} />
        </View>
      ) : null}
    </Card>
  );
}
