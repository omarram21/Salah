import { useTrackingStore } from '../tracking-store';

beforeEach(() => useTrackingStore.setState({ records: {}, trackingSince: null }));

describe('tracking store', () => {
  it('sets, changes and clears a status', () => {
    const s = () => useTrackingStore.getState();
    s().setStatus('2026-10-18', 'fajr', 'onTime', 1);
    expect(s().records['2026-10-18']?.fajr).toEqual({ status: 'onTime', updatedAt: 1 });

    s().setStatus('2026-10-18', 'fajr', 'late', 2);
    expect(s().records['2026-10-18']?.fajr?.status).toBe('late');

    s().clearStatus('2026-10-18', 'fajr');
    expect(s().records['2026-10-18']).toBeUndefined();
  });

  it('edits past days and moves trackingSince back', () => {
    const s = () => useTrackingStore.getState();
    s().ensureStarted('2026-10-18');
    s().setStatus('2026-10-01', 'isha', 'missed');
    expect(s().trackingSince).toBe('2026-10-01');
    s().ensureStarted('2026-10-20');
    expect(s().trackingSince).toBe('2026-10-01');
  });

  it('marks several prayers at once without touching others', () => {
    const s = () => useTrackingStore.getState();
    s().setStatus('2026-10-18', 'fajr', 'onTime');
    s().setStatuses('2026-10-18', ['dhuhr', 'asr'], 'missed');
    const day = s().records['2026-10-18']!;
    expect(day.fajr?.status).toBe('onTime');
    expect(day.dhuhr?.status).toBe('missed');
    expect(day.asr?.status).toBe('missed');
    expect(day.isha).toBeUndefined();
  });
});
