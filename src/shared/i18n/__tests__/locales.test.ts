import { i18n } from '..';
import { ar } from '../locales/ar';
import { en } from '../locales/en';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

const PLURAL = /_(zero|one|two|few|many|other)$/;
const base = (list: string[]) => [...new Set(list.map((k) => k.replace(PLURAL, '')))].sort();

describe('locales', () => {
  it('Arabic has exactly the same keys as English', () => {
    expect(base(keys(ar))).toEqual(base(keys(en)));
  });

  it('Arabic plurals have all six forms', () => {
    const plurals = keys(en).filter((k) => k.endsWith('_other')).map((k) => k.replace(PLURAL, ''));
    for (const k of plurals) {
      for (const form of ['zero', 'one', 'two', 'few', 'many', 'other']) expect(keys(ar)).toContain(`${k}_${form}`);
    }
  });

  it('picks the right Arabic and English plural form', () => {
    const ar = i18n.getFixedT('ar');
    const en = i18n.getFixedT('en');
    expect([1, 2, 5, 15, 100].map((count) => ar('settings.minutesBefore', { count }))).toEqual([
      'قبل دقيقة واحدة',
      'قبل دقيقتين',
      'قبل 5 دقائق',
      'قبل 15 دقيقة',
      'قبل 100 دقيقة',
    ]);
    expect(en('stats.days', { count: 1 })).toBe('1 day');
    expect(en('stats.days', { count: 3 })).toBe('3 days');
  });
});
