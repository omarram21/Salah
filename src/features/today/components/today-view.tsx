import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { getPrayerWindow, PRAYERS, usePrayerTimesStore, useToday } from '@/features/prayer-times';
import { currentStreak } from '@/features/stats';
import { DemoBanner, getTiming, selectRecords, SunnahChips, useTrackingStore, YesterdayCard } from '@/features/tracking';
import { Card, ErrorView, LoadingView, Screen, Text } from '@/shared/ui';

import { TodayHeader } from './today-header';
import { TodayHero } from './today-hero';
import { DuhaRow } from './duha-row';
import { TodayPrayerRow } from './today-prayer-row';

/** The Today tab (design E). Assumes a location is set. */
export function TodayView() {
  const { t } = useTranslation();
  const { syncing, error, sync } = usePrayerTimesStore();
  const { params, index, method, now, today, day, next, current } = useToday();
  // After midnight, last night's Isha (and its sunnah / Witr) is still running.
  const lastNight = current?.prayer === 'isha' && current.date < today ? current.date : null;
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
          {lastNight ? (
            <Card className="gap-2.5">
              <Text variant="label">{t('today.lastNight')}</Text>
              <SunnahChips date={lastNight} prayer="isha" size="large" />
            </Card>
          ) : null}
          <View className="pt-4">
            {PRAYERS.map((prayer, i) => {
              const window = getPrayerWindow(index, day.date, prayer);
              const row = (
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
              return prayer === 'dhuhr' ? (
                <View key={prayer}>
                  <DuhaRow day={day} now={now} />
                  {row}
                </View>
              ) : (
                row
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
