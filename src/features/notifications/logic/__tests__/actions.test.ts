import { isNotificationAction, parsePrayerData, statusForAction } from '../actions';

const valid = { date: '2026-10-31', prayer: 'asr', kind: 'start', at: 1000, end: 5000 };

describe('parsePrayerData', () => {
  it('accepts well-formed prayer data', () => {
    expect(parsePrayerData(valid)).toEqual(valid);
  });

  it('rejects test alarms and malformed data', () => {
    expect(parsePrayerData({ test: true, at: 1 })).toBeNull();
    expect(parsePrayerData({ ...valid, prayer: 'tahajjud' })).toBeNull();
    expect(parsePrayerData({ ...valid, date: '31/10/2026' })).toBeNull();
    expect(parsePrayerData({ ...valid, end: '5000' })).toBeNull();
    expect(parsePrayerData(null)).toBeNull();
  });
});

describe('statusForAction', () => {
  it('"Prayed" is on time inside the window and late after it', () => {
    expect(statusForAction('prayed', 5000, 4999)).toBe('onTime');
    expect(statusForAction('prayed', 5000, 5000)).toBe('late');
  });

  it('"In mosque" is always mosque', () => {
    expect(statusForAction('mosque', 5000, 9999)).toBe('mosque');
  });
});

describe('isNotificationAction', () => {
  it('ignores a plain tap on the notification', () => {
    expect(isNotificationAction('expo.modules.notifications.actions.DEFAULT')).toBe(false);
    expect(isNotificationAction('prayed')).toBe(true);
  });
});
