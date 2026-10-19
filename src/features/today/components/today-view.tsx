import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { getPrayerWindow, PRAYERS, usePrayerTimesStore, useToday } from '@/features/prayer-times';
import { currentStreak } from '@/features/stats';
import { DemoBanner, getTiming, selectRecords, useTrackingStore, YesterdayCard } from '@/features/tracking';
import { ErrorView, LoadingView, Screen, Text } from '@/shared/ui';

import { TodayHeader } from './today-header';
import { TodayHero } from './today-hero';
import { TodayPrayerRow } from './today-prayer-row';

/** The Today tab (design E). Assumes a location is set. */
export function TodayView() {
  const { t } = useTranslation();
  const { syncing, error, sync } = usePrayerTimesStore();
  const { params, index, method, now, today, day, next } = useToday();
  const records = useTrackingStore(selectRecords);
  const todayRecord = records[today];
  const done = PRAYERS.filter((p) => {
    const s = todayRecord?.[p]?.status;
    return s === 'mosque' || s === 'onTime' || s === 'late';
  }).length;

  return (
    <Screen>
      <DemoBanner />
      <TodayHeader date={today} hijri={day?.hijri ?? null} />
      {day ? (
        <>
          <TodayHero now={now} index={index} next={next} done={done} streak={currentStreak(records, today)} />
          <YesterdayCard index={index} now={now} today={today} />
          <View className="pt-4">
            {PRAYERS.map((prayer, i) => {
              const window = getPrayerWindow(index, day.date, prayer);
              return (
                <TodayPrayerRow
                  key={prayer}
                  day={day}
                  prayer={prayer}
                  timing={getTiming(window, now, day.date, today)}
                  endsAt={window?.end ?? null}
                  now={now}
                  last={i === PRAYERS.length - 1}
                />
              );
            })}
          </View>
          {method ? (
            <Text variant="tiny" tone="faint" align="center">
              {method.name}
            </Text>
          ) : null}
        </>
      ) : error && !syncing && params ? (
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
