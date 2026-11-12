import type { ReactNode } from 'react';
import type { SemanticColor } from '../../tokens/tokens.generated';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'accent';

export interface BadgeBaseProps {
  tone?: BadgeTone;
  /** Decorative leading icon. Meaning must also be in the text: never rely on colour alone. */
  icon?: ReactNode;
  children: ReactNode;
}

/** Tone → semantic tokens. The web classes and native styles both follow this table. */
export const badgeTones: Record<BadgeTone, { bg: SemanticColor; fg: SemanticColor }> = {
  neutral: { bg: 'surface-sunken', fg: 'fg-muted' },
  brand: { bg: 'brand-subtle', fg: 'brand-fg' },
  success: { bg: 'success-subtle', fg: 'success-fg' },
  warning: { bg: 'warning-subtle', fg: 'warning-fg' },
  danger: { bg: 'danger-subtle', fg: 'danger-fg' },
  accent: { bg: 'accent-subtle', fg: 'accent-fg' },
};
