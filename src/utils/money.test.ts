import { describe, expect, it } from 'vitest';
import { formatMoney, parseAmount } from './money';

describe('parseAmount', () => {
  it.each([
    ['', 0],
    ['0', 0],
    ['120', 12000],
    ['120.5', 12050],
    ['120.55', 12055],
    ['12,500.50', 1250050],
    ['.5', 50],
    [' 1 000 ', 100000],
  ])('%j → %d', (input, expected) => expect(parseAmount(input)).toBe(expected));

  it.each(['-5', 'abc', '1.234', '1.2.3', '1e5'])('rejects %j', (input) => {
    expect(parseAmount(input)).toBeNull();
  });

  it('avoids float drift (0.1 + 0.2 style bugs)', () => {
    expect(parseAmount('0.29')).toBe(29);
    expect(parseAmount('1.15')).toBe(115);
  });
});

describe('formatMoney', () => {
  it('formats AED in minor units', () => {
    expect(formatMoney({ minor: 1250050, currency: 'AED' }, 'en-AE')).toMatch(/AED\s?12,500\.50/);
  });
});
