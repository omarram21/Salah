import { compassPoint, distanceToKaabaKm, guidance, normalize, qiblaBearing, turnBy, unwrap } from '../qibla';

describe('qiblaBearing (reference values ±1°)', () => {
  it.each([
    ['Cairo', 30.0444, 31.2357, 136],
    ['London', 51.5074, -0.1278, 119],
    ['New York', 40.7128, -74.006, 58],
    ['Jakarta', -6.2088, 106.8456, 295],
    ['Istanbul', 41.0082, 28.9784, 152],
  ])('%s', (_, lat, lng, expected) => {
    expect(Math.abs(qiblaBearing(lat, lng) - expected)).toBeLessThanOrEqual(1);
  });
});

describe('distanceToKaabaKm', () => {
  it('Cairo is about 1,280 km from Makkah', () => {
    expect(Math.round(distanceToKaabaKm(30.0444, 31.2357) / 10) * 10).toBeCloseTo(1280, -2);
  });
  it('is ~0 at the Kaaba', () => {
    expect(distanceToKaabaKm(21.422487, 39.826206)).toBeLessThan(0.01);
  });
});

describe('turning guidance', () => {
  it('turns the short way round', () => {
    expect(turnBy(10, 350)).toBe(-20);
    expect(turnBy(350, 10)).toBe(20);
    expect(turnBy(0, 180)).toBe(180);
  });

  it('says aligned within 5°, otherwise left/right with degrees', () => {
    expect(guidance(133, 136)).toEqual({ kind: 'aligned' });
    expect(guidance(100, 136)).toEqual({ kind: 'right', degrees: 36 });
    expect(guidance(170, 136)).toEqual({ kind: 'left', degrees: 34 });
  });

  it('names compass points', () => {
    expect(compassPoint(136)).toBe('SE');
    expect(compassPoint(359)).toBe('N');
    expect(compassPoint(58)).toBe('ENE');
  });

  it('unwraps angles so the dial never spins the long way', () => {
    expect(unwrap(359, 1)).toBe(361);
    expect(unwrap(720, 10)).toBe(730);
    expect(normalize(-30)).toBe(330);
  });
});
