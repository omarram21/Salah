import fs from 'fs';
import path from 'path';

import { ALARM_SOUNDS } from '@/features/settings';

import { channelFor, contentSound, REMINDER_FILE, SOUND_FILE } from '../sounds';

const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../../app.json'), 'utf8'));
const plugin = appJson.expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-notifications');

describe('notification sounds', () => {
  it('start alarms use the chosen file; reminders always use the soft reminder', () => {
    expect(contentSound('start', 'oud')).toBe('oud.wav');
    expect(contentSound('start', 'default')).toBe(true);
    expect(contentSound('reminder', 'bell')).toBe(REMINDER_FILE);
  });

  it('each sound has its own Android channel (sounds are fixed per channel)', () => {
    const ids = ALARM_SOUNDS.map((s) => channelFor('start', s));
    expect(new Set(ids).size).toBe(ALARM_SOUNDS.length);
    expect(channelFor('reminder', 'oud')).toBe('prayer-reminder');
  });

  it('every sound file is bundled through the expo-notifications plugin and exists on disk', () => {
    const bundled: string[] = plugin[1].sounds.map((p: string) => path.basename(p));
    for (const file of [...Object.values(SOUND_FILE), REMINDER_FILE]) {
      expect(bundled).toContain(file);
      expect(fs.existsSync(path.join(__dirname, '../../../../assets/sounds', file))).toBe(true);
    }
  });
});
