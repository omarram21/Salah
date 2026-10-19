import { monthBounds, monthGrid, weekdayOrder } from '../month-grid';

describe('weekdayOrder', () => {
  it('starts on the locale’s first weekday', () => {
    expect(weekdayOrder(1)).toEqual([0, 1, 2, 3, 4, 5, 6]); // Sunday
    expect(weekdayOrder(2)).toEqual([1, 2, 3, 4, 5, 6, 0]); // Monday
    expect(weekdayOrder(7)).toEqual([6, 0, 1, 2, 3, 4, 5]); // Saturday
  });
});

describe('monthGrid', () => {
  it('pads October 2026 (starts Thursday) for a Saturday-first week', () => {
    const cells = monthGrid('2026-10', 7);
    expect(cells.slice(0, 6)).toEqual([null, null, null, null, null, '2026-10-01']);
    expect(cells.length % 7).toBe(0);
    expect(cells.filter(Boolean)).toHaveLength(31);
    expect(cells.length).toBe(42);
  });

  it('needs no padding when the month starts on the first weekday', () => {
    const cells = monthGrid('2026-02', 1); // 1 Feb 2026 is a Sunday
    expect(cells[0]).toBe('2026-02-01');
    expect(cells).toHaveLength(28);
  });
});

describe('monthBounds', () => {
  it('browses from the first tracked month to now', () => {
    const b = monthBounds('2026-08-12', '2026-10-31');
    expect(b.first).toBe('2026-08');
    expect(b.canGoBack('2026-09')).toBe(true);
    expect(b.canGoBack('2026-08')).toBe(false);
    expect(b.canGoForward('2026-10')).toBe(false);
    expect(b.clamp('2026-12')).toBe('2026-10');
  });

  it('only the current month on first use', () => {
    const b = monthBounds(null, '2026-10-31');
    expect(b.canGoBack('2026-10')).toBe(false);
  });
});
