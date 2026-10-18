import { formatCountdown, formatWallTime } from '../format';

const labels = { am: 'AM', pm: 'PM' };

describe('formatWallTime', () => {
  it.each([
    ['00:15', '12:15 AM'],
    ['05:22', '5:22 AM'],
    ['12:00', '12:00 PM'],
    ['19:58', '7:58 PM'],
  ])('%s → %s', (wall, expected) => {
    expect(formatWallTime(wall, labels)).toBe(expected);
  });
});

describe('formatCountdown', () => {
  it('formats hours, minutes and seconds', () => {
    expect(formatCountdown(3_909_000)).toBe('1:05:09');
    expect(formatCountdown(309_000)).toBe('05:09');
    expect(formatCountdown(-5)).toBe('00:00');
  });
});
