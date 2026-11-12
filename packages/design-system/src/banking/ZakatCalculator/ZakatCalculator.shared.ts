import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, formatMoney, parseAmount, type Money } from '../money';
import { calculateZakat, type ZakatAssets, type ZakatResult } from './calculateZakat';

/**
 * Everything about the Zakat calculator except pixels: copy, validation, maths and the
 * screen-reader summary. Web and native only render what this hook returns, so a
 * Sharia-board change to the rules or wording lands on both platforms at once.
 */

export type ZakatField = keyof ZakatAssets;
export type ZakatCalculatorVariant = 'quick' | 'detailed';

const FIELDS: Record<ZakatField, { label: string; hint?: string }> = {
  cash: { label: 'Cash & bank balances', hint: 'Current, savings and Mudarabah deposit accounts.' },
  goldSilver: { label: 'Gold & silver', hint: 'Current market value, not purchase price.' },
  investments: { label: 'Investments & shares', hint: 'Zakatable portion of funds, sukuk and equities.' },
  business: { label: 'Business assets', hint: 'Inventory for sale and money owed to you.' },
  liabilities: { label: 'Debts due now', hint: 'Deducted from your total. Only include what is payable now.' },
};

const QUICK_FIELD = {
  label: 'Total zakatable wealth',
  hint: 'Savings, gold, investments and business assets, minus debts due now.',
};

export const ZAKAT_DISCLAIMER =
  'An estimate only, for wealth held for one full lunar year (hawl). Rulings vary between schools of thought; please consult a qualified scholar for your situation.';

const INVALID_AMOUNT = 'Enter a positive amount with up to 2 decimals, e.g. 12,500.50';

export type ZakatChange = ZakatResult & { currency: string };

export interface ZakatCalculatorBaseProps {
  /**
   * Current nisab threshold (value of 85g of gold). Supplied by the backend from a
   * live gold price; never hard-coded in the client.
   */
  nisab: Money;
  /** `quick` = one total field; `detailed` = itemised assets minus liabilities. */
  variant?: ZakatCalculatorVariant;
  /** Initial values as user-entered strings, e.g. `{ cash: '45000' }`. */
  defaultValues?: Partial<Record<ZakatField, string>>;
  /** When provided, a "Pay Zakat" action appears once Zakat is due. */
  onPay?: (result: ZakatChange) => void;
  /** Called on every valid recalculation (analytics, persistence). */
  onChange?: (result: ZakatChange) => void;
  title?: string;
  locale?: string;
}

export function useZakatCalculator({
  nisab,
  variant = 'detailed',
  defaultValues = {},
  onChange,
  locale = DEFAULT_LOCALE,
}: ZakatCalculatorBaseProps) {
  const { currency } = nisab;
  const [values, setValues] = useState<Partial<Record<ZakatField, string>>>(defaultValues);
  const isQuick = variant === 'quick';
  // Quick mode collapses everything into one "cash" bucket.
  const visible: ZakatField[] = isQuick ? ['cash'] : ['cash', 'goldSilver', 'investments', 'business', 'liabilities'];

  const parsed = useMemo(() => {
    const amounts: Partial<ZakatAssets> = {};
    const errors: Partial<Record<ZakatField, string>> = {};
    for (const field of visible) {
      const minor = parseAmount(values[field] ?? '');
      if (minor === null) errors[field] = INVALID_AMOUNT;
      else amounts[field] = minor;
    }
    return { amounts, errors, hasErrors: Object.keys(errors).length > 0 };
    // visible is derived from variant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, variant]);

  const result = useMemo(() => calculateZakat(parsed.amounts, nisab.minor), [parsed.amounts, nisab.minor]);
  const fmt = (minor: number) => formatMoney({ minor, currency }, locale);
  const hasInput = result.totalAssets > 0 || result.netWealth > 0;
  const isDue = result.isDue && !parsed.hasErrors;

  useEffect(() => {
    if (!parsed.hasErrors) onChange?.({ ...result, currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, parsed.hasErrors]);

  const summary = parsed.hasErrors
    ? 'Check the highlighted amounts.'
    : !hasInput
      ? 'Enter your wealth to estimate your Zakat.'
      : result.isDue
        ? `Zakat due: ${fmt(result.zakat)}. That is 2.5% of ${fmt(result.netWealth)}.`
        : `No Zakat due. ${fmt(result.netWealth)} is below the nisab of ${fmt(result.nisab)}.`;

  const announcement = useDebounced(summary, 700);

  return {
    currency,
    fmt,
    fields: visible.map((field) => ({
      field,
      ...(isQuick ? QUICK_FIELD : FIELDS[field]),
      /** Quick mode's single field is a big amount input; detailed fields are regular inputs. */
      variant: isQuick ? ('amount' as const) : ('default' as const),
      /** Full-width in a two-column layout. */
      wide: isQuick || field === 'liabilities',
      value: values[field] ?? '',
      error: parsed.errors[field],
      setValue: (value: string) => setValues((v) => ({ ...v, [field]: value })),
    })),
    result,
    hasErrors: parsed.hasErrors,
    hasInput,
    isDue,
    /** The amount to show: zero while any field is invalid. */
    displayZakat: fmt(parsed.hasErrors ? 0 : result.zakat),
    /** Progress towards nisab, 0–100, for the "below nisab" bar. */
    progress: Math.min(100, result.nisab > 0 ? (result.netWealth / result.nisab) * 100 : 0),
    /**
     * Debounced summary for a polite live region. Announcing on every keystroke is
     * noise for screen-reader users, so it only updates after typing pauses.
     */
    announcement,
    payload: { ...result, currency } satisfies ZakatChange,
  };
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
