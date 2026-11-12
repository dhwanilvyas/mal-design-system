/**
 * Money is always carried as an integer number of minor units (fils for AED)
 * to avoid floating-point drift. Formatting happens only at the edge.
 */
export interface Money {
  /** Integer amount in minor units, e.g. 12050 = AED 120.50. */
  minor: number;
  /** ISO 4217 code. */
  currency: string;
}

export const DEFAULT_LOCALE = 'en-AE';

const fractionDigits = (currency: string) =>
  new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;

export function toMajor({ minor, currency }: Money): number {
  return minor / 10 ** fractionDigits(currency);
}

export function formatMoney(money: Money, locale: string = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    currencyDisplay: 'code',
  }).format(toMajor(money));
}

/**
 * Parses user input like "12,500.5" into minor units.
 * Returns null for anything that isn't a non-negative amount with at most 2 decimals.
 */
export function parseAmount(input: string): number | null {
  const cleaned = input.replace(/[\s,]/g, '');
  if (cleaned === '') return 0;
  if (!/^\d+(\.\d{0,2})?$|^\.\d{1,2}$/.test(cleaned)) return null;
  const [whole = '0', frac = ''] = cleaned.split('.');
  return Number(whole || '0') * 100 + Number(frac.padEnd(2, '0'));
}

/** Formats with an explicit locale-aware sign: "+AED 1,200.00" / "-AED 120.50". */
export function formatSignedMoney(money: Money, sign: 'positive' | 'negative', locale: string = DEFAULT_LOCALE): string {
  const major = toMajor(money);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    currencyDisplay: 'code',
    signDisplay: 'always',
  }).format(sign === 'negative' ? -major : major);
}
