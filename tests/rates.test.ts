import { describe, expect, it } from 'vitest';
import { cacheKey, convert, market, parseAmount, parseRates, series } from '../src/lib/api';

describe('Currency math', () => {
  it('inverts rates into the display currency and calculates change in that direction', () => {
    const rows = parseRates([
      { base: 'KGS', quote: 'USD', date: '2026-11-13', rate: 1 / 88 },
      { base: 'KGS', quote: 'USD', date: '2026-11-12', rate: 1 / 80 },
    ]);
    const result = market(rows, 'KGS')[0];
    expect(result.value).toBeCloseTo(88);
    expect(result.change).toBeCloseTo(10);
    expect(result.previousDate).toBe('2026-11-12');
  });
  it('converts via a common base in both directions, including zero', () => {
    expect(convert(100, 88, 96)).toBeCloseTo(91.6666667);
    expect(convert(100, 96, 88)).toBeCloseTo(109.090909);
    expect(convert(0, 88, 96)).toBe(0);
    expect(convert(100, 1, 88)).toBeCloseTo(1.1363636);
  });
  it('accepts comma decimals but rejects negatives, overflow and malformed numbers', () => {
    expect(parseAmount('12,50')).toBe(12.5);
    expect(parseAmount('0')).toBe(0);
    expect(parseAmount('123.')).toBe(123);
    for (const value of ['', '-1', '1e9', '1.2.3', 'NaN', '1234567890123', '1.1234567']) expect(parseAmount(value)).toBeNull();
  });
  it('rejects invalid API rates and never manufactures missing currencies or changes', () => {
    expect(() => parseRates({ rates: {} })).toThrow();
    expect(() => parseRates([{ base: 'USD', quote: 'EUR', date: '2026-11-13', rate: 0 }])).toThrow();
    expect(() => parseRates([{ base: 'USD', quote: 'EUR', date: '2026-11-13', rate: Infinity }])).toThrow();
    const rows = parseRates([{ base: 'USD', quote: 'EUR', date: '2026-11-13', rate: .9 }]);
    expect(market(rows, 'USD')).toHaveLength(1);
    expect(market(rows, 'USD')[0].change).toBeNull();
    expect(series(rows, 'USD', 'GBP')).toEqual([]);
  });
  it('keeps cache available across midnight while separating pairs and periods', () => {
    expect(cacheKey('base=USD&quotes=KGS&from=2026-10-13&to=2026-11-12')).toBe(cacheKey('base=USD&quotes=KGS&from=2026-10-14&to=2026-11-13'));
    expect(cacheKey('base=USD&quotes=KGS&from=2026-11-06&to=2026-11-13')).not.toBe(cacheKey('base=USD&quotes=EUR&from=2026-11-06&to=2026-11-13'));
  });
});
