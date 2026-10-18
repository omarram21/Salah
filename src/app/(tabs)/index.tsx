import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { LocationSetupCard, useLocationLabel, useLocationStore } from '@/features/location';
import {
  DateHeader,
  getPrayerWindow,
  NextPrayerCard,
  PrayerList,
  usePrayerTimesStore,
  useToday,
} from '@/features/prayer-times';
import { getTiming, PrayerStatusControl, YesterdayCard } from '@/features/tracking';
import { ErrorView, LoadingView, Screen, Text } from '@/shared/ui';

export default function TodayScreen() {
  const { t } = useTranslation();
  const location = useLocationStore((s) => s.location);
  const locationLabel = useLocationLabel(location);
  const { syncing, error, sync } = usePrayerTimesStore();
  const { params, index, method, now, today, day, current, next } = useToday();
  const openPicker = () => router.push('/location');

  if (!location || !params) {
    return (
      <Screen>
        <DateHeader date={today} hijri={null} />
        <LocationSetupCard onChooseCity={openPicker} />
      </Screen>
    );
  }

  return (
    <Screen>
      <DateHeader date={today} hijri={day?.hijri ?? null} />

      <Pressable onPress={openPicker} className="flex-row items-center gap-1 self-start active:opacity-60">
        <Ionicons name="location-outline" size={16} color="#0F766E" />
        <Text className="text-sm font-medium text-primary dark:text-primary-light">{locationLabel}</Text>
        <Text variant="muted"> · {t('location.change')}</Text>
      </Pressable>

      {day ? (
        <>
          <NextPrayerCard now={now} today={today} index={index} next={next} current={current} />
          <YesterdayCard index={index} now={now} today={today} />
          <PrayerList
            day={day}
            current={current}
            renderAccessory={(prayer) => (
              <PrayerStatusControl
                date={day.date}
                prayer={prayer}
                timing={getTiming(getPrayerWindow(index, day.date, prayer), now, day.date, today)}
              />
            )}
          />
          {method ? (
            <View className="px-1">
              <Text variant="muted">{method.name}</Text>
            </View>
          ) : null}
        </>
      ) : error && !syncing ? (
        <ErrorView
          title={t('errors.loadTitle')}
          message={t(`errors.${error}`)}
          retryLabel={t('common.retry')}
          onRetry={() => void sync(params)}
        />
      ) : (
        <LoadingView label={t('common.loading')} />
      )}
    </Screen>
  );
}
