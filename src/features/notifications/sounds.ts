import type { AlarmSound } from '@/features/settings';

import type { NotificationKind } from './logic/build-schedule';

/** Soft knock for nudges; the chosen alarm sound for things that need you now. */
const isSoft = (kind: NotificationKind) => kind === 'reminder' || kind === 'kahf';

/** Bundled sound files (see app.json → expo-notifications "sounds"). Referenced by base filename. */
export const SOUND_FILE: Record<Exclude<AlarmSound, 'default'>, string> = {
  oud: 'oud.wav',
  bell: 'bell.wav',
  chime: 'chime.wav',
  dawn: 'dawn.wav',
};
export const REMINDER_FILE = 'reminder.wav';

/** Same files as modules, for in-app previews. */
export const SOUND_ASSET: Record<Exclude<AlarmSound, 'default'> | 'reminder', number> = {
  oud: require('../../../assets/sounds/oud.wav'),
  bell: require('../../../assets/sounds/bell.wav'),
  chime: require('../../../assets/sounds/chime.wav'),
  dawn: require('../../../assets/sounds/dawn.wav'),
  reminder: require('../../../assets/sounds/reminder.wav'),
};

/**
 * Android binds a sound to a channel forever, so each sound gets its own channel.
 * iOS ignores channels and uses `content.sound`.
 */
export const channelFor = (kind: NotificationKind, sound: AlarmSound) =>
  isSoft(kind) ? 'prayer-reminder' : `prayer-${sound}`;

/** `content.sound` for a notification: a bundled file, or `true` for the system default. */
export const contentSound = (kind: NotificationKind, sound: AlarmSound): string | true =>
  isSoft(kind) ? REMINDER_FILE : sound === 'default' ? true : SOUND_FILE[sound];
