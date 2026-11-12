import type { SemanticColor } from './tokens.generated';

/** WCAG 2.x relative luminance and contrast ratio for #rrggbb colours. */
function channel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}


/**
 * Text/background pairs that must meet WCAG 2.2 contrast. Checked in
 * tokens.test.ts for every theme, so a palette change can't silently break a11y.
 * min: 4.5 for body text, 3 for large text / UI component boundaries.
 */
export const contrastPairs: ReadonlyArray<{ fg: SemanticColor; bg: SemanticColor; min: number }> = [
  { fg: 'fg', bg: 'canvas', min: 4.5 },
  { fg: 'fg', bg: 'surface', min: 4.5 },
  { fg: 'fg-muted', bg: 'surface', min: 4.5 },
  { fg: 'fg-muted', bg: 'canvas', min: 4.5 },
  { fg: 'fg-subtle', bg: 'surface', min: 4.5 },
  { fg: 'fg-on-brand', bg: 'brand', min: 4.5 },
  { fg: 'fg-on-brand', bg: 'brand-hover', min: 4.5 },
  { fg: 'fg-on-brand', bg: 'brand-active', min: 4.5 },
  { fg: 'fg', bg: 'surface-active', min: 4.5 },
  { fg: 'fg-inverse', bg: 'danger', min: 4.5 },
  { fg: 'brand-fg', bg: 'surface', min: 4.5 },
  { fg: 'brand-fg', bg: 'brand-subtle', min: 4.5 },
  { fg: 'success-fg', bg: 'surface', min: 4.5 },
  { fg: 'success-fg', bg: 'success-subtle', min: 4.5 },
  { fg: 'danger-fg', bg: 'surface', min: 4.5 },
  { fg: 'danger-fg', bg: 'danger-subtle', min: 4.5 },
  { fg: 'warning-fg', bg: 'warning-subtle', min: 4.5 },
  { fg: 'accent-fg', bg: 'accent-subtle', min: 4.5 },
  { fg: 'border-strong', bg: 'surface', min: 3 },
  { fg: 'border-focus', bg: 'surface', min: 3 },
  { fg: 'border-focus', bg: 'canvas', min: 3 },
];
