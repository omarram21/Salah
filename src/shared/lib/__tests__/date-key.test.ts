import { addDays, addMonths, dateKeyAt, daysInMonth, weekdayOf } from '../date-key';

describe('date-key', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('adds months', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('knows month lengths and weekdays', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2028-02')).toBe(29);
    expect(weekdayOf('2026-10-18')).toBe(0); // Sunday
  });

  it('computes the date at a UTC offset', () => {
    expect(dateKeyAt(Date.UTC(2026, 9, 31, 23, 30), 120)).toBe('2026-11-01');
    expect(dateKeyAt(Date.UTC(2026, 9, 31, 23, 30), -300)).toBe('2026-10-31');
  });
});
