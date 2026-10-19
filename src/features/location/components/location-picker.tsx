import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isLanguage, useDirection } from '@/shared/i18n';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Button, Icon, Input, Text } from '@/shared/ui';

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
  const { direction } = useDirection();
  const { c } = useThemeColors();
  const [query, setQuery] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const current = useLocationStore((s) => s.location);
  const setLocation = useLocationStore((s) => s.setLocation);
  const gps = useGpsLocation(onDone);

  const select = (location: AppLocation) => {
    setLocation(location);
    onDone();
  };
  const selectCity = (city: City) =>
    select({
      source: 'city',
      cityId: city.id,
      latitude: city.latitude,
      longitude: city.longitude,
      countryCode: city.countryCode,
      label: `${city.name.en}, ${city.country.en}`,
    });

  return (
    <SafeAreaView className="flex-1 bg-paper dark:bg-paper-dark" style={{ direction }}>
      <View className="flex-row items-center pe-4 ps-6 pt-2">
        <Text variant="title" className="flex-1" accessibilityRole="header">
          {t('location.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onDone}
          className="size-11 items-center justify-center rounded-full bg-chip dark:bg-chip-dark">
          <Icon name="close" size={20} color={c.ink} strokeWidth={2} />
        </Pressable>
      </View>
      <FlatList
        contentContainerClassName="px-6 pb-10"
        keyboardShouldPersistTaps="handled"
        data={searchCities(query)}
        keyExtractor={(city) => city.id}
        ListHeaderComponent={
          <View className="gap-3 pb-2 pt-5">
            <Button
              icon="locate"
              label={gps.status === 'locating' ? t('location.locating') : t('location.useMyLocation')}
              loading={gps.status === 'locating'}
              onPress={gps.locate}
            />
            <GpsStatusMessage status={gps.status} />
            <View className="min-h-[52px] flex-row items-center gap-2.5 rounded-full bg-chip px-4 dark:bg-chip-dark">
              <Icon name="search" size={18} color={c.muted} strokeWidth={2} />
              <Input
                bare
                className="flex-1 py-3"
                placeholder={t('location.searchPlaceholder')}
                accessibilityLabel={t('location.searchPlaceholder')}
                value={query}
                onChangeText={setQuery}
                clearButtonMode="while-editing"
              />
            </View>
            <Text variant="tiny" weight="semibold" tone="faint" className="pt-2" style={{ letterSpacing: 0.7 }}>
              {t('location.citiesLabel')}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = current?.cityId === item.id;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectCity(item)}
              className="min-h-[58px] flex-row items-center gap-3.5 border-b border-line active:opacity-70 dark:border-line-dark">
              <Icon name="pin" size={20} color={selected ? c.accent : c.faint} />
              <View className="flex-1">
                <Text variant="body" weight={selected ? 'bold' : 'semibold'}>{item.name[lang]}</Text>
                <Text variant="caption" tone="muted">{item.country[lang]}</Text>
              </View>
              {selected ? <Icon name="check" size={20} color={c.accent} strokeWidth={2.4} /> : null}
            </Pressable>
          );
        }}
        ListEmptyComponent={<Text variant="caption" tone="muted" className="py-4">{t('location.noResults')}</Text>}
        ListFooterComponent={
          <View className="mt-5 gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: showCustom }}
              onPress={() => setShowCustom((v) => !v)}
              className="flex-row items-center gap-3 rounded-[20px] bg-well p-4 active:opacity-70 dark:bg-well-dark">
              <View className="size-10 items-center justify-center rounded-full bg-paper dark:bg-paper-dark">
                <Icon name="globe" size={20} color={c.ink} />
              </View>
              <View className="flex-1">
                <Text variant="label">{t('location.otherCity')}</Text>
                <Text variant="caption" tone="muted">{t('location.otherCityBody')}</Text>
              </View>
              <Icon name={showCustom ? 'close' : 'chevronRight'} size={18} color={c.faint} strokeWidth={2} />
            </Pressable>
            {showCustom ? <CustomCityForm onSelect={select} /> : null}
          </View>
        }
      />
    </SafeAreaView>
  );
}
