import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isLanguage, useDirection } from '@/shared/i18n';
import { Button, Input, Text } from '@/shared/ui';

import { searchCities, type City } from '../data/cities';
import { useGpsLocation } from '../hooks/use-gps-location';
import type { AppLocation } from '../model/types';
import { useLocationStore } from '../store/location-store';
import { CustomCityForm } from './custom-city-form';
import { GpsStatusMessage } from './gps-status-message';

/** Full location chooser: GPS, built-in city list, or free-text city. */
export function LocationPicker({ onDone }: { onDone: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = isLanguage(i18n.language) ? i18n.language : 'en';
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();
  const [query, setQuery] = useState('');
  const current = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const gps = useGpsLocation(onDone);

  const select = (location: AppLocation) => {
    setLocation(location);
    onDone();
  };
  const selectCity = (c: City) =>
    select({
      source: 'city',
      cityId: c.id,
      latitude: c.latitude,
      longitude: c.longitude,
      countryCode: c.countryCode,
      label: `${c.name.en}, ${c.country.en}`,
    });

  const cities = searchCities(query);

  return (
    <FlatList
      className="flex-1 bg-slate-50 dark:bg-slate-950"
      style={{ direction }}
      contentContainerClassName="gap-2 p-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      data={cities}
      keyExtractor={(c) => c.id}
      ListHeaderComponent={
        <View className="mb-2 gap-3">
          <Button
            label={gps.status === 'locating' ? t('location.locating') : t('location.useMyLocation')}
            loading={gps.status === 'locating'}
            onPress={gps.locate}
          />
          <GpsStatusMessage status={gps.status} />
          <View className="min-h-12 flex-row items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-900">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <Input
              bare
              className="flex-1 py-3"
              placeholder={t('location.searchPlaceholder')}
              value={query}
              onChangeText={setQuery}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const selected = current?.cityId === item.id;
        return (
          <Pressable
            onPress={() => selectCity(item)}
            className={`flex-row items-center justify-between rounded-xl border px-4 py-3 active:opacity-70 ${
              selected
                ? 'border-primary bg-teal-50 dark:bg-teal-950'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
            }`}>
            <View>
              <Text className="font-medium">{item.name[lang]}</Text>
              <Text variant="muted">{item.country[lang]}</Text>
            </View>
            {selected ? <Ionicons name="checkmark" size={20} color="#0F766E" /> : null}
          </Pressable>
        );
      }}
      ListEmptyComponent={<Text variant="muted">{t('location.noResults')}</Text>}
      ListFooterComponent={
        <View className="mt-4">
          <CustomCityForm onSelect={select} />
        </View>
      }
    />
  );
}
