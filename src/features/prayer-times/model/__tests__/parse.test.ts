import { parseIsoTime } from '../parse';
import { cairoNovHead, cairoOctTail } from '../__fixtures__/cairo';

describe('parseIsoTime', () => {
  it('converts a wall time with offset to an absolute instant', () => {
    const t = parseIsoTime('2026-10-01T05:22:00+03:00');
    expect(t.at).toBe(Date.UTC(2026, 9, 1, 2, 22));
    expect(t.wall).toBe('05:22');
    expect(t.utcOffsetMin).toBe(180);
  });

  it('handles negative offsets and Z', () => {
    expect(parseIsoTime('2026-01-01T06:00:00-05:00').at).toBe(Date.UTC(2026, 0, 1, 11, 0));
    expect(parseIsoTime('2026-01-01T06:00:00Z').utcOffsetMin).toBe(0);
  });

  it('rejects the non-ISO format', () => {
    expect(() => parseIsoTime('05:22 (EEST)')).toThrow();
  });
});

describe('parseMonth', () => {
  it('parses dates, hijri and method meta', () => {
    const first = cairoOctTail.days[0]!;
    expect(first.date).toBe('2026-10-28');
    expect(first.times.fajr.wall).toBe('05:38');
    expect(first.hijri.year).toBe(1448);
    expect(first.hijri.monthName.ar.length).toBeGreaterThan(0);
    expect(cairoOctTail.timezone).toBe('Africa/Cairo');
    expect(cairoOctTail.method.id).toBe(5);
  });

  it('keeps each day’s own UTC offset across a DST change', () => {
    const byDate = Object.fromEntries(cairoOctTail.days.map((d) => [d.date, d.utcOffsetMin]));
    expect(byDate['2026-10-29']).toBe(180);
    expect(byDate['2026-10-30']).toBe(120);
    expect(cairoNovHead.days[0]!.utcOffsetMin).toBe(120);
  });
});
