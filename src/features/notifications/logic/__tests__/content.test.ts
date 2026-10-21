import { cairoIndex } from '@/features/prayer-times/model/__fixtures__/cairo';
import { i18n } from '@/shared/i18n';

import { notificationContent } from '../content';

const t = i18n.getFixedT('en');
const opts = { t, index: cairoIndex, reminderMinutes: 20, suhoorMinutes: 30 };

describe('notificationContent · Friday & Ramadan', () => {
  it("Dhuhr on Friday is Jumu'ah", () => {
    const c = notificationContent({ kind: 'start', date: '2026-10-30', prayer: 'dhuhr' }, { ...opts, isJumuah: () => true });
    expect(c.title).toBe('Jumu’ah');
  });

  it('Maghrib in Ramadan is Iftar time', () => {
    const c = notificationContent({ kind: 'start', date: '2026-10-31', prayer: 'maghrib' }, { ...opts, isRamadan: () => true });
    expect(c.title).toBe('Iftar time');
    expect(c.body).toMatch(/^Maghrib \(\d+:\d\d PM\)/);
  });

  it('Suhoor and Al-Kahf wording', () => {
    expect(notificationContent({ kind: 'suhoor', date: '2026-10-31', prayer: 'fajr' }, opts).title).toBe('Suhoor ends in 30 min');
    expect(notificationContent({ kind: 'kahf', date: '2026-10-30', prayer: 'dhuhr' }, opts).body).toBe('Read Surat al-Kahf today.');
  });
});
