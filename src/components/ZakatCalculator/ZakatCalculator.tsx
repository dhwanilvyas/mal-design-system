import { useEffect, useId, useMemo, useState, type ElementType } from 'react';
import { Icon } from '../../icons/Icon';
import { cx } from '../../utils/cx';
import { DEFAULT_LOCALE, formatMoney, parseAmount, type Money } from '../../utils/money';
import { Button } from '../Button/Button';
import { InputField } from '../InputField/InputField';
import { calculateZakat, type ZakatAssets, type ZakatResult } from './calculateZakat';

type Field = keyof ZakatAssets;

const FIELDS: Record<Field, { label: string; hint?: string }> = {
  cash: { label: 'Cash & bank balances', hint: 'Current, savings and Mudarabah deposit accounts.' },
  goldSilver: { label: 'Gold & silver', hint: 'Current market value, not purchase price.' },
  investments: { label: 'Investments & shares', hint: 'Zakatable portion of funds, sukuk and equities.' },
  business: { label: 'Business assets', hint: 'Inventory for sale and money owed to you.' },
  liabilities: { label: 'Debts due now', hint: 'Deducted from your total. Only include what is payable now.' },
};

const DETAILED_ASSETS: Field[] = ['cash', 'goldSilver', 'investments', 'business'];

export type ZakatCalculatorVariant = 'quick' | 'detailed';

export interface ZakatCalculatorProps {
  /**
   * Current nisab threshold (value of 85g of gold). Supplied by the backend from a
   * live gold price; never hard-coded in the client.
   */
  nisab: Money;
  /** `quick` = one total field; `detailed` = itemised assets minus liabilities. */
  variant?: ZakatCalculatorVariant;
  /** Initial values as user-entered strings, e.g. `{ cash: '45000' }`. */
  defaultValues?: Partial<Record<Field, string>>;
  /** When provided, a "Pay Zakat" action appears once Zakat is due. */
  onPay?: (result: ZakatResult & { currency: string }) => void;
  /** Called on every valid recalculation (analytics, persistence). */
  onChange?: (result: ZakatResult & { currency: string }) => void;
  title?: string;
  /** Heading level for `title`, so the widget fits any page outline. */
  headingLevel?: 2 | 3 | 4;
  locale?: string;
  className?: string;
}

export function ZakatCalculator({
  nisab,
  variant = 'detailed',
  defaultValues = {},
  onPay,
  onChange,
  title = 'Zakat calculator',
  headingLevel = 2,
  locale = DEFAULT_LOCALE,
  className,
}: ZakatCalculatorProps) {
  const headingId = useId();
  const { currency } = nisab;
  const [values, setValues] = useState<Partial<Record<Field, string>>>(defaultValues);

  // Quick mode collapses everything into one "cash" bucket.
  const visibleFields: Field[] = variant === 'quick' ? ['cash'] : [...DETAILED_ASSETS, 'liabilities'];

  const parsed = useMemo(() => {
    const amounts: Partial<ZakatAssets> = {};
    const errors: Partial<Record<Field, string>> = {};
    for (const field of visibleFields) {
      const minor = parseAmount(values[field] ?? '');
      if (minor === null) errors[field] = 'Enter a positive amount with up to 2 decimals, e.g. 12,500.50';
      else amounts[field] = minor;
    }
    return { amounts, errors, hasErrors: Object.keys(errors).length > 0 };
    // visibleFields is derived from variant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, variant]);

  const result = useMemo(() => calculateZakat(parsed.amounts, nisab.minor), [parsed.amounts, nisab.minor]);
  const fmt = (minor: number) => formatMoney({ minor, currency }, locale);
  const hasInput = result.totalAssets > 0 || result.netWealth > 0;

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

  // Announce the result politely, after typing pauses. A live region that fires on
  // every keystroke is noise for screen-reader users.
  const announcement = useDebounced(summary, 700);

  const Heading = `h${headingLevel}` as ElementType;
  const progress = Math.min(100, result.nisab > 0 ? (result.netWealth / result.nisab) * 100 : 0);

  return (
    <section
      aria-labelledby={headingId}
      className={cx('overflow-hidden rounded-xl border border-border bg-surface text-fg shadow-md', className)}
    >
      <header className="flex items-start gap-3 border-b border-border bg-accent-subtle px-6 py-5">
        <GeometricStar className="mt-0.5 shrink-0 text-accent-fg" />
        <div className="flex flex-col gap-0.5">
          <Heading id={headingId} className="text-lg font-semibold text-fg">
            {title}
          </Heading>
          <p className="text-sm text-fg-muted">
            Nisab today: <span className="tabular font-medium text-fg">{fmt(nisab.minor)}</span>
            <span className="text-fg-muted"> (85g of gold)</span>
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Your zakatable wealth</legend>
          {visibleFields.map((field) => {
            const isQuick = variant === 'quick';
            const meta = isQuick
              ? { label: 'Total zakatable wealth', hint: 'Savings, gold, investments and business assets, minus debts due now.' }
              : FIELDS[field];
            return (
              <InputField
                key={field}
                className={cx((isQuick || field === 'liabilities') && 'sm:col-span-2')}
                label={meta.label}
                hint={meta.hint}
                variant={isQuick ? 'amount' : 'default'}
                inputMode="decimal"
                currency={currency}
                placeholder="0.00"
                value={values[field] ?? ''}
                error={parsed.errors[field]}
                onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              />
            );
          })}
        </fieldset>

        <div
          className={cx(
            'flex flex-col gap-3 rounded-lg p-4',
            result.isDue && !parsed.hasErrors ? 'bg-brand-subtle' : 'bg-surface-sunken',
          )}
        >
          {/* Visual result updates instantly; the sr-only live region below announces it calmly. */}
          <div aria-hidden="true" className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm text-fg-muted">
                {result.isDue && !parsed.hasErrors ? 'Zakat due' : 'Estimated Zakat'}
              </span>
              <span className="tabular text-3xl font-bold text-fg" dir="ltr">
                {fmt(parsed.hasErrors ? 0 : result.zakat)}
              </span>
            </div>
            {hasInput && !parsed.hasErrors && (
              <span className="text-sm text-fg-muted">
                Net wealth <span className="tabular font-medium text-fg">{fmt(result.netWealth)}</span>
              </span>
            )}
          </div>

          {hasInput && !parsed.hasErrors && !result.isDue && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-fg-muted">
                Below nisab by <span className="tabular font-medium text-fg">{fmt(result.nisab - result.netWealth)}</span>.
                No Zakat is due.
              </p>
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {announcement}
          </p>

          {onPay && result.isDue && !parsed.hasErrors && (
            <Button size="lg" fullWidth onClick={() => onPay({ ...result, currency })}>
              Pay {fmt(result.zakat)} Zakat
            </Button>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs text-fg-muted">
          <Icon name="info" size={16} className="shrink-0" />
          <span>
            An estimate only, for wealth held for one full lunar year (hawl). Rulings vary between
            schools of thought; please consult a qualified scholar for your situation.
          </span>
        </p>
      </div>
    </section>
  );
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Eight-point star (two overlapping squares), a classic Islamic geometric motif. Decorative. */
function GeometricStar({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="2.25" fill="currentColor" />
    </svg>
  );
}
