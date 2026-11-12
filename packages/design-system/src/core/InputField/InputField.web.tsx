import { useId, type ComponentPropsWithRef } from 'react';
import { Icon } from '../Icon/Icon.web';
import { cx } from '../../utils/cx';
import { variants } from '../../utils/variants';
import type { InputFieldBaseProps } from './InputField.types';

const fieldStyles = variants({
  base: [
    'flex items-center gap-2 rounded-md border bg-surface px-3 text-fg',
    'transition-colors duration-(--duration-fast) ease-standard',
    'focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-border-focus',
    'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:bg-surface-sunken has-[input:disabled]:opacity-60',
  ].join(' '),
  variants: {
    variant: {
      default: 'text-md',
      /** Money entry: large tabular figures, currency adornment, decimal keypad on mobile. */
      amount: 'text-2xl font-semibold tabular',
    },
    // Height comes from the compound rules below: `amount` has its own fixed height,
    // so exactly one height class is ever applied.
    size: { md: '', lg: '' },
    invalid: {
      true: 'border-danger',
      false: 'border-border-strong hover:has-[input:enabled]:border-fg-muted',
    },
  },
  defaults: { variant: 'default', size: 'md', invalid: 'false' },
  compound: [
    { variant: 'default', size: 'md', className: 'h-10' },
    { variant: 'default', size: 'lg', className: 'h-12' },
    { variant: 'amount', className: 'h-16' },
  ],
});

export type { InputFieldSize, InputFieldVariant } from './InputField.types';

export interface InputFieldProps
  extends InputFieldBaseProps,
    Omit<ComponentPropsWithRef<'input'>, keyof InputFieldBaseProps | 'size'> {
  /** Class for the outer wrapper (layout). Style the field via variants, not overrides. */
  className?: string;
}

export function InputField({
  label,
  hideLabel = false,
  hint,
  error,
  variant = 'default',
  size,
  currency,
  prefix,
  suffix,
  className,
  id: idProp,
  required,
  disabled,
  'aria-describedby': describedByProp,
  ...inputProps
}: InputFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId, describedByProp].filter(Boolean).join(' ') || undefined;
  const isAmount = variant === 'amount';
  const leading = prefix ?? (currency ? currency : null);

  return (
    <div data-mal="InputField" className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cx('text-sm font-medium text-fg', hideLabel && 'sr-only')}>
        {label}
        {currency && (
          <>
            {' '}
            <span className="sr-only">({currency})</span>
          </>
        )}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-danger-fg">
            *
          </span>
        )}
      </label>

      <div className={fieldStyles({ variant, size, invalid: error ? 'true' : 'false' })}>
        {leading && (
          <span
            aria-hidden="true"
            className={cx('shrink-0 text-fg-muted pointer-events-none', isAmount ? 'text-lg font-medium' : 'text-sm')}
          >
            {leading}
          </span>
        )}
        <input
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
          {...(isAmount && { inputMode: 'decimal' as const, autoComplete: 'off' })}
          {...inputProps}
        />
        {suffix && (
          <span aria-hidden="true" className="shrink-0 text-sm text-fg-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger-fg">
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
