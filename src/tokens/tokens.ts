/**
 * Mal design tokens. Single source of truth.
 *
 * Tier 1, primitives: raw palette and scales. Components never use these directly.
 * Tier 2, semantic: what a value is *for* (surface, fg-muted, brand...). Themes
 *   (light/dark) remap semantic tokens to primitives.
 *
 * `npm run tokens` compiles this file to src/styles/tokens.css (Tailwind @theme +
 * CSS custom properties). The same object is exported for non-CSS consumers
 * (charts, email templates, React Native).
 */

/* -------------------------------------------------------------------------- */
/* Tier 1: primitives                                                          */
/* -------------------------------------------------------------------------- */

export const palette = {
  /** Brand. A deep, calm emerald: growth, trust, and a nod to Islamic visual heritage. */
  emerald: {
    50: '#ecf7f3',
    100: '#d2ede3',
    200: '#a6dac8',
    300: '#6fc0a6',
    400: '#3da283',
    500: '#1f8567',
    600: '#136b53',
    700: '#0f5644',
    800: '#0d4537',
    900: '#0b392e',
    950: '#05201a',
  },
  /** Accent. Restrained gold for highlights only (Zakat, premium, Sharia marks). */
  gold: {
    50: '#fbf7ec',
    100: '#f5ebcf',
    200: '#ebd59e',
    300: '#dfba66',
    400: '#d4a23e',
    500: '#b9862a',
    600: '#976a21',
    700: '#77521e',
    800: '#5f421d',
    900: '#4f381c',
  },
  /** Warm neutrals ("sand") so the UI feels less clinical than pure greys. */
  sand: {
    0: '#ffffff',
    25: '#fcfbf8',
    50: '#f7f5f0',
    100: '#efece4',
    200: '#e2ddd2',
    300: '#cbc4b6',
    400: '#a39b8b',
    500: '#7c7466',
    600: '#5e574b',
    700: '#463f35',
    800: '#2e2923',
    850: '#242019',
    900: '#1c1915',
    950: '#12100d',
  },
  red: {
    50: '#fdf0ee',
    100: '#fadbd6',
    300: '#f09a8c',
    400: '#e56a57',
    500: '#d14334',
    600: '#b3321f',
    700: '#8f2718',
    900: '#4a160e',
  },
  amber: {
    50: '#fef6e7',
    100: '#fde8c0',
    300: '#f5c26b',
    400: '#f0a63a',
    600: '#a15c07',
    700: '#7e4806',
    900: '#3f2604',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', 'IBM Plex Sans Arabic', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  /** [font-size, line-height]. Base 16px, roughly a 1.2 ratio, rounded to the 4px grid. */
  fontSize: {
    xs: ['0.75rem', '1rem'],
    sm: ['0.875rem', '1.25rem'],
    md: ['1rem', '1.5rem'],
    lg: ['1.125rem', '1.75rem'],
    xl: ['1.25rem', '1.75rem'],
    '2xl': ['1.5rem', '2rem'],
    '3xl': ['1.875rem', '2.25rem'],
    display: ['2.25rem', '2.75rem'],
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

/** 4px base grid. Keys follow Tailwind's convention (key × 4px). */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const;

export const radius = {
  none: '0',
  sm: '0.375rem',
  md: '0.625rem',
  lg: '0.875rem',
  xl: '1.25rem',
  full: '9999px',
} as const;

export const shadow = {
  sm: '0 1px 2px 0 rgb(18 16 13 / 0.06)',
  md: '0 2px 8px -2px rgb(18 16 13 / 0.08), 0 1px 2px 0 rgb(18 16 13 / 0.04)',
  lg: '0 12px 32px -8px rgb(18 16 13 / 0.14), 0 2px 6px 0 rgb(18 16 13 / 0.05)',
} as const;

export const motion = {
  duration: { fast: '120ms', normal: '200ms' },
  easing: { standard: 'cubic-bezier(0.2, 0, 0, 1)' },
} as const;

/* -------------------------------------------------------------------------- */
/* Tier 2: semantic colour tokens, per theme                                   */
/* -------------------------------------------------------------------------- */

const p = palette;

/**
 * Semantic names are what components use (`bg-surface`, `text-fg-muted`).
 * Adding a theme means providing every key below. TypeScript enforces this.
 */
const light = {
  // Surfaces
  canvas: p.sand[50],
  surface: p.sand[0],
  'surface-sunken': p.sand[100],
  'surface-hover': p.sand[100],
  // Text / icons
  fg: p.sand[900],
  'fg-muted': p.sand[600],
  'fg-subtle': p.sand[500],
  'fg-inverse': p.sand[0],
  'fg-on-brand': p.sand[0],
  // Borders
  border: p.sand[200],
  'border-strong': p.sand[500],
  'border-focus': p.emerald[600],
  // Brand (primary actions)
  brand: p.emerald[700],
  'brand-hover': p.emerald[800],
  'brand-active': p.emerald[900],
  'brand-subtle': p.emerald[50],
  'brand-fg': p.emerald[700],
  // Accent (gold), used sparingly
  accent: p.gold[400],
  'accent-subtle': p.gold[50],
  'accent-fg': p.gold[700],
  // Feedback
  success: p.emerald[600],
  'success-subtle': p.emerald[50],
  'success-fg': p.emerald[700],
  danger: p.red[600],
  'danger-hover': p.red[700],
  'danger-subtle': p.red[50],
  'danger-fg': p.red[700],
  warning: p.amber[400],
  'warning-subtle': p.amber[50],
  'warning-fg': p.amber[700],
} as const;

export type SemanticColor = keyof typeof light;

const dark: Record<SemanticColor, string> = {
  canvas: p.sand[950],
  surface: p.sand[900],
  'surface-sunken': p.sand[950],
  'surface-hover': p.sand[850],
  fg: p.sand[50],
  'fg-muted': p.sand[300],
  'fg-subtle': p.sand[400],
  'fg-inverse': p.sand[950],
  'fg-on-brand': p.emerald[950],
  border: p.sand[800],
  'border-strong': p.sand[500],
  'border-focus': p.emerald[300],
  brand: p.emerald[300],
  'brand-hover': p.emerald[200],
  'brand-active': p.emerald[100],
  'brand-subtle': p.emerald[950],
  'brand-fg': p.emerald[300],
  accent: p.gold[300],
  'accent-subtle': p.gold[900],
  'accent-fg': p.gold[200],
  success: p.emerald[400],
  'success-subtle': p.emerald[950],
  'success-fg': p.emerald[300],
  danger: p.red[400],
  'danger-hover': p.red[300],
  'danger-subtle': p.red[900],
  'danger-fg': p.red[300],
  warning: p.amber[300],
  'warning-subtle': p.amber[900],
  'warning-fg': p.amber[300],
};

export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;

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
