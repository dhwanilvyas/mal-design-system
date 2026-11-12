import type { ReactNode } from 'react';

export type InputFieldVariant = 'default' | 'amount';
export type InputFieldSize = 'md' | 'lg';

export interface InputFieldBaseProps {
  /** Visible label. Required: every field needs an accessible name. */
  label: string;
  /** Visually hide the label (it stays available to screen readers). Use sparingly. */
  hideLabel?: boolean;
  /** Helper text shown below the field and announced with it. */
  hint?: ReactNode;
  /** Error message. Marks the field invalid and is announced before the hint. */
  error?: ReactNode;
  /** `default` for text; `amount` for money entry (large tabular figures, decimal keypad). */
  variant?: InputFieldVariant;
  size?: InputFieldSize;
  /** ISO currency code. Shown as a prefix and appended to the accessible label. */
  currency?: string;
  required?: boolean;
  disabled?: boolean;
  /** Decorative content before the input (icon, "+971"). Hidden from AT; put meaning in the label. */
  prefix?: ReactNode;
  /** Decorative content after the input. */
  suffix?: ReactNode;
}

export const inputHeights = { md: 40, lg: 48, amount: 64 } as const;

/** The accessible name, e.g. "Amount (AED)". */
export const accessibleLabel = (label: string, currency?: string) => (currency ? `${label} (${currency})` : label);
