import type { ReactNode } from 'react';

/** The contract both platforms implement. Docs, stories and the native file all follow these names. */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonBaseProps {
  /**
   * Visual emphasis. `primary`: the single most important action in a view.
   * `secondary`: alternatives next to a primary. `tertiary`: low-emphasis ("View all").
   * `danger`: destructive or irreversible (cancel card, delete payee).
   */
  variant?: ButtonVariant;
  /** Height and type scale: sm 32, md 40 (default), lg 48. `lg` suits mobile primary CTAs. */
  size?: ButtonSize;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /**
   * Shows a spinner and blocks activation while staying focusable, so keyboard and
   * screen-reader focus isn't lost mid-payment.
   */
  loading?: boolean;
  /** Icon before the label (mirrors in RTL). */
  leadingIcon?: ReactNode;
  /** Icon after the label. */
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export const buttonHeights: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
