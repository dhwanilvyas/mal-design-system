import type { ComponentPropsWithRef, ReactNode } from 'react';
import { variants } from '../../utils/variants';

export const badgeStyles = variants({
  base: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  variants: {
    tone: {
      neutral: 'bg-surface-sunken text-fg-muted',
      brand: 'bg-brand-subtle text-brand-fg',
      success: 'bg-success-subtle text-success-fg',
      warning: 'bg-warning-subtle text-warning-fg',
      danger: 'bg-danger-subtle text-danger-fg',
      accent: 'bg-accent-subtle text-accent-fg',
    },
  },
  defaults: { tone: 'neutral' },
});

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';

export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  tone?: BadgeTone;
  /** Decorative leading icon. Meaning must also be in the text: never rely on colour alone. */
  icon?: ReactNode;
}

/** Small status label. Internal primitive used by other components; exported for product use. */
export function Badge({ tone, icon, className, children, ...rest }: BadgeProps) {
  return (
    <span className={badgeStyles({ tone }, className)} {...rest}>
      {icon}
      {children}
    </span>
  );
}
