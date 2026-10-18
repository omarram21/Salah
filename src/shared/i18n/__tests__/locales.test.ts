import { ar } from '../locales/ar';
import { en } from '../locales/en';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('locales', () => {
  it('Arabic has exactly the same keys as English', () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });
});
