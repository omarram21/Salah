import { historySections } from '../history-range';

describe('historySections', () => {
  it('lists days newest first, grouped by month, from first use to today', () => {
    const sections = historySections({}, '2026-09-29', '2026-10-02');
    expect(sections).toEqual([
      { month: '2026-10', data: ['2026-10-02', '2026-10-01'] },
      { month: '2026-09', data: ['2026-09-30', '2026-09-29'] },
    ]);
  });

  it('starts at an older record when the user back-filled', () => {
    const records = { '2026-10-15': { fajr: { status: 'late' as const, updatedAt: 0 } } };
    const sections = historySections(records, '2026-10-17', '2026-10-18');
    expect(sections[0]!.data.at(-1)).toBe('2026-10-15');
  });

  it('shows only today on first use and ignores future records', () => {
    expect(historySections({}, null, '2026-10-18')).toEqual([{ month: '2026-10', data: ['2026-10-18'] }]);
    const future = { '2026-12-01': { fajr: { status: 'onTime' as const, updatedAt: 0 } } };
    expect(historySections(future, '2026-10-18', '2026-10-18')[0]!.data).toEqual(['2026-10-18']);
  });
});
