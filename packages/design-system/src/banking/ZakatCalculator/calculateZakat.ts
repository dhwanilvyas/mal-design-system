/**
 * Pure Zakat maths, kept separate from the UI so it can be unit-tested,
 * reviewed by the Sharia board in isolation, and reused server-side.
 *
 * All values are integers in minor units (fils).
 */

/** Zakat rate on zakatable wealth held for one lunar year (hawl): 2.5% = 1/40. */
export const ZAKAT_RATE_DENOMINATOR = 40;

export interface ZakatAssets {
  cash: number;
  goldSilver: number;
  investments: number;
  business: number;
  /** Debts due immediately; deducted from assets. */
  liabilities: number;
}

export interface ZakatResult {
  totalAssets: number;
  netWealth: number;
  nisab: number;
  isDue: boolean;
  zakat: number;
}

export function calculateZakat(assets: Partial<ZakatAssets>, nisab: number): ZakatResult {
  const { cash = 0, goldSilver = 0, investments = 0, business = 0, liabilities = 0 } = assets;
  const totalAssets = cash + goldSilver + investments + business;
  const netWealth = Math.max(0, totalAssets - liabilities);
  const isDue = netWealth > 0 && netWealth >= nisab;
  return {
    totalAssets,
    netWealth,
    nisab,
    isDue,
    zakat: isDue ? Math.round(netWealth / ZAKAT_RATE_DENOMINATOR) : 0,
  };
}
