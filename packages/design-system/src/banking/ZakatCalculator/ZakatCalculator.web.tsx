import { useId, type ElementType } from 'react';
import { Button } from '../../core/Button/Button.web';
import { Icon } from '../../core/Icon/Icon.web';
import { InputField } from '../../core/InputField/InputField.web';
import { cx } from '../../utils/cx';
import { useZakatCalculator, ZAKAT_DISCLAIMER, type ZakatCalculatorBaseProps } from './ZakatCalculator.shared';

export type { ZakatCalculatorVariant } from './ZakatCalculator.shared';

export interface ZakatCalculatorProps extends ZakatCalculatorBaseProps {
  /** Heading level for `title`, so the widget fits any page outline. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

export function ZakatCalculator({ title = 'Zakat calculator', headingLevel = 2, className, onPay, ...props }: ZakatCalculatorProps) {
  const headingId = useId();
  const z = useZakatCalculator(props);
  const Heading = `h${headingLevel}` as ElementType;

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
            Nisab today: <span className="tabular font-medium text-fg">{z.fmt(props.nisab.minor)}</span>
            <span className="text-fg-muted"> (85g of gold)</span>
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6 p-6">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Your zakatable wealth</legend>
          {z.fields.map((f) => (
            <InputField
              key={f.field}
              className={cx(f.wide && 'sm:col-span-2')}
              label={f.label}
              hint={f.hint}
              variant={f.variant}
              inputMode="decimal"
              currency={z.currency}
              placeholder="0.00"
              value={f.value}
              error={f.error}
              onChange={(e) => f.setValue(e.target.value)}
            />
          ))}
        </fieldset>

        <div className={cx('flex flex-col gap-3 rounded-lg p-4', z.isDue ? 'bg-brand-subtle' : 'bg-surface-sunken')}>
          {/* Visual result updates instantly; the sr-only live region below announces it calmly. */}
          <div aria-hidden="true" className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm text-fg-muted">{z.isDue ? 'Zakat due' : 'Estimated Zakat'}</span>
              <span className="tabular text-3xl font-bold text-fg" dir="ltr">
                {z.displayZakat}
              </span>
            </div>
            {z.hasInput && !z.hasErrors && (
              <span className="text-sm text-fg-muted">
                Net wealth <span className="tabular font-medium text-fg">{z.fmt(z.result.netWealth)}</span>
              </span>
            )}
          </div>

          {z.hasInput && !z.hasErrors && !z.result.isDue && (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${z.progress}%` }} />
              </div>
              <p className="text-sm text-fg-muted">
                Below nisab by{' '}
                <span className="tabular font-medium text-fg">{z.fmt(z.result.nisab - z.result.netWealth)}</span>. No
                Zakat is due.
              </p>
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {z.announcement}
          </p>

          {onPay && z.isDue && (
            <Button size="lg" fullWidth onClick={() => onPay(z.payload)}>
              Pay {z.fmt(z.result.zakat)} Zakat
            </Button>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs text-fg-muted">
          <Icon name="info" size={16} className="shrink-0" />
          <span>{ZAKAT_DISCLAIMER}</span>
        </p>
      </div>
    </section>
  );
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
