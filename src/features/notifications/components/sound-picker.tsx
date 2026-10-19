import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ALARM_SOUNDS, useSettingsStore, type AlarmSound } from '@/features/settings';
import { useThemeColors } from '@/shared/theme/use-theme-colors';
import { Icon, Screen, Text } from '@/shared/ui';

import { SOUND_ASSET } from '../sounds';

type Previewable = Exclude<AlarmSound, 'default'> | 'reminder';

/** Choose the prayer alarm sound, with a ▶ preview for each (and the reminder sound). */
export function SoundPicker({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { c } = useThemeColors();
  const value = useSettingsStore((s) => s.alarms.sound);
  const update = useSettingsStore((s) => s.updateAlarms);
  const player = useRef<AudioPlayer | null>(null);
  const [playing, setPlaying] = useState<Previewable | null>(null);

  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
    return () => player.current?.remove();
  }, []);

  const preview = (sound: Previewable) => {
    player.current?.remove();
    if (playing === sound) {
      player.current = null;
      setPlaying(null);
      return;
    }
    const p = createAudioPlayer(SOUND_ASSET[sound]);
    p.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) setPlaying((cur) => (cur === sound ? null : cur));
    });
    p.play();
    player.current = p;
    setPlaying(sound);
  };

  return (
    <Screen back={onDone} title={t('sounds.title')} subtitle={t('sounds.subtitle')}>
      <View accessibilityRole="radiogroup" className="gap-2">
        {ALARM_SOUNDS.map((sound) => {
          const selected = value === sound;
          return (
            <View
              key={sound}
              className={`min-h-[64px] flex-row items-center gap-2 rounded-[18px] ps-4 pe-2 ${
                selected ? 'border-2 border-ink bg-paper dark:border-ink-dark dark:bg-paper-dark' : 'bg-chip dark:bg-chip-dark'
              }`}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={t(`sounds.${sound}`)}
                onPress={() => update({ sound })}
                className="flex-1 flex-row items-center gap-3 py-3 active:opacity-70">
                <View className="flex-1 gap-0.5">
                  <Text variant="label" weight={selected ? 'bold' : 'semibold'}>{t(`sounds.${sound}`)}</Text>
                  <Text variant="caption" tone="muted">{t(`sounds.${sound}Body`)}</Text>
                </View>
                {selected ? <Icon name="check" size={20} color={c.ink} strokeWidth={2.4} /> : null}
              </Pressable>
              {sound !== 'default' ? (
                <PlayButton playing={playing === sound} label={t('sounds.preview', { sound: t(`sounds.${sound}`) })} onPress={() => preview(sound)} />
              ) : (
                <View className="size-11" />
              )}
            </View>
          );
        })}
      </View>

      <View className="flex-row items-center gap-3 rounded-[18px] bg-well px-4 py-3 dark:bg-well-dark">
        <Icon name="late" size={20} color={c.muted} />
        <View className="flex-1">
          <Text variant="label">{t('sounds.reminder')}</Text>
          <Text variant="caption" tone="muted">{t('sounds.reminderBody')}</Text>
        </View>
        <PlayButton playing={playing === 'reminder'} label={t('sounds.preview', { sound: t('sounds.reminder') })} onPress={() => preview('reminder')} />
      </View>

      <Text variant="tiny" tone="faint" align="center">{t('sounds.expoGoNote')}</Text>
    </Screen>
  );
}

function PlayButton({ playing, label, onPress }: { playing: boolean; label: string; onPress: () => void }) {
  const { c, isDark } = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: playing }}
      onPress={onPress}
      className={`size-11 items-center justify-center rounded-full ${playing ? 'bg-ink dark:bg-ink-dark' : 'bg-paper dark:bg-paper-dark'}`}>
      <Icon name={playing ? 'stop' : 'play'} size={18} color={playing ? (isDark ? c.paper : '#FFFFFF') : c.ink} strokeWidth={2} />
    </Pressable>
  );
}
