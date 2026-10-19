import {
  migrateTrackingState,
  selectActive,
  selectIsDemo,
  selectRecords,
  useTrackingStore,
} from '../tracking-store';

const s = () => useTrackingStore.getState();
const records = () => selectRecords(s());

beforeEach(() =>
  useTrackingStore.setState({ datasets: { real: { records: {}, trackingSince: null }, demo: null }, active: 'real' }),
);

describe('tracking store', () => {
  it('sets, changes and clears a status', () => {
    s().setStatus('2026-10-18', 'fajr', 'onTime', 1);
    expect(records()['2026-10-18']?.fajr).toEqual({ status: 'onTime', updatedAt: 1 });

    s().setStatus('2026-10-18', 'fajr', 'mosque', 2);
    expect(records()['2026-10-18']?.fajr?.status).toBe('mosque');

    s().clearStatus('2026-10-18', 'fajr');
    expect(records()['2026-10-18']).toBeUndefined();
  });

  it('edits past days and moves trackingSince back', () => {
    s().ensureStarted('2026-10-18');
    s().setStatus('2026-10-01', 'isha', 'missed');
    expect(selectActive(s()).trackingSince).toBe('2026-10-01');
    s().ensureStarted('2026-10-20');
    expect(selectActive(s()).trackingSince).toBe('2026-10-01');
  });

  it('marks several prayers at once without touching others', () => {
    s().setStatus('2026-10-18', 'fajr', 'onTime');
    s().setStatuses('2026-10-18', ['dhuhr', 'asr'], 'missed');
    const day = records()['2026-10-18']!;
    expect(day.fajr?.status).toBe('onTime');
    expect(day.dhuhr?.status).toBe('missed');
    expect(day.isha).toBeUndefined();
  });
});

describe('demo mode', () => {
  it('never touches real records, and real data comes back when turned off', () => {
    s().setStatus('2026-10-18', 'fajr', 'onTime');
    s().enableDemo('2026-10-19');

    expect(selectIsDemo(s())).toBe(true);
    expect(Object.keys(records()).length).toBeGreaterThan(60);

    s().setStatus('2026-10-18', 'fajr', 'missed'); // edit while in demo
    expect(s().datasets.real.records['2026-10-18']?.fajr?.status).toBe('onTime');

    s().disableDemo();
    expect(selectIsDemo(s())).toBe(false);
    expect(records()).toEqual({ '2026-10-18': { fajr: expect.objectContaining({ status: 'onTime' }) } });
  });

  it('keeps demo edits between sessions until reset', () => {
    s().enableDemo('2026-10-19');
    s().setStatus('2026-10-19', 'fajr', 'mosque');
    s().disableDemo();
    s().enableDemo('2026-10-19');
    expect(records()['2026-10-19']?.fajr?.status).toBe('mosque');

    s().resetDemo('2026-10-19');
    expect(records()['2026-10-19']).toBeUndefined();
  });

  it('ensureStarted only affects real data', () => {
    s().enableDemo('2026-10-19');
    s().ensureStarted('2026-10-19');
    expect(s().datasets.real.trackingSince).toBe('2026-10-19');
    expect(selectActive(s()).trackingSince).toBe('2026-07-21');
  });
});

describe('migrateTrackingState', () => {
  it('moves v1 records into the real dataset unchanged', () => {
    const v1 = {
      records: { '2026-10-18': { fajr: { status: 'late', updatedAt: 5 } } },
      trackingSince: '2026-10-18',
    };
    expect(migrateTrackingState(v1, 1)).toEqual({
      datasets: { real: v1, demo: null },
      active: 'real',
    });
  });

  it('handles missing v1 data', () => {
    expect(migrateTrackingState(undefined, 0)).toEqual({
      datasets: { real: { records: {}, trackingSince: null }, demo: null },
      active: 'real',
    });
  });
});
