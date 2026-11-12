import type { ComponentPropsWithRef, MouseEvent, ReactNode } from 'react';
import { variants } from '../../utils/variants';
import { Spinner } from './Spinner';

export const buttonStyles = variants({
  base: [
    'relative inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap select-none',
    'transition-colors duration-(--duration-fast) ease-standard',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'aria-busy:cursor-progress',
  ].join(' '),
  variants: {
    variant: {
      /** The single most important action in a view. Use at most one per screen region. */
      primary: 'bg-brand text-fg-on-brand enabled:hover:bg-brand-hover enabled:active:bg-brand-active',
      /** Alternative actions that sit next to a primary. */
      secondary:
        'border border-border-strong bg-surface text-fg enabled:hover:bg-surface-hover enabled:active:bg-surface-sunken',
      /** Low-emphasis actions: "View all", "Cancel" in dense layouts. */
      tertiary: 'bg-transparent text-brand-fg enabled:hover:bg-brand-subtle',
      /** Destructive or irreversible actions (cancel card, delete payee). */
      danger: 'bg-danger text-fg-inverse enabled:hover:bg-danger-hover',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-5 text-md',
    },
    fullWidth: {
      true: 'w-full',
      false: '',
    },
  },
  defaults: { variant: 'primary', size: 'md', fullWidth: 'false' },
});

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Visual emphasis. Defaults to `primary`. */
  variant?: ButtonVariant;
  /** Height and type scale. `md` (40px) is the default; `lg` (48px) suits mobile primary CTAs. */
  size?: ButtonSize;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  /**
   * Shows a spinner and blocks activation while keeping the button focusable
   * (uses `aria-disabled` rather than `disabled`, so keyboard focus isn't lost mid-submit).
   */
  loading?: boolean;
  /** Icon rendered before the label (mirrors automatically in RTL via flex order). */
  leadingIcon?: ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = 'button',
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      // Default to "button": an un-typed button inside a form submits it, a classic footgun.
      type={type}
      className={buttonStyles({ variant, size, fullWidth: fullWidth ? 'true' : 'false' }, className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <Spinner /> : leadingIcon}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
}
