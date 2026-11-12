/**
 * Icon geometry, shared by Icon.web.tsx (DOM <svg>) and Icon.native.tsx (react-native-svg).
 * Minimal in-house stroke set: 24px grid, 1.75 stroke, round caps.
 */
export type IconShape =
  | ['path', { d: string }]
  | ['circle', { cx: number; cy: number; r: number }]
  | ['rect', { x: number; y: number; width: number; height: number; rx?: number }]
  | ['ellipse', { cx: number; cy: number; rx: number; ry: number }];

export const icons = {
  'arrow-up-right': [['path', { d: 'M7 17 17 7M8 7h9v9' }]],
  'arrow-down-left': [['path', { d: 'M17 7 7 17M16 17H7V8' }]],
  'shopping-bag': [['path', { d: 'M5 8h14l-1 12H6L5 8Z' }], ['path', { d: 'M9 8V6a3 3 0 0 1 6 0v2' }]],
  food: [['path', { d: 'M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10' }], ['path', { d: 'M17 21V3c-2 1.5-3 4-3 7v3h3' }]],
  bills: [['path', { d: 'M13 3 5 13h6l-1 8 8-10h-6l1-8Z' }]],
  transfer: [['path', { d: 'M4 8h14m-4-4 4 4-4 4' }], ['path', { d: 'M20 16H6m4-4-4 4 4 4' }]],
  salary: [['rect', { x: 3, y: 7, width: 18, height: 13, rx: 2 }], ['path', { d: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18' }]],
  coins: [['ellipse', { cx: 9, cy: 7, rx: 6, ry: 3 }], ['path', { d: 'M3 7v4c0 1.66 2.69 3 6 3s6-1.34 6-3V7' }], ['path', { d: 'M9 17c-3.31 0-6-1.34-6-3v-3M15 11.5c3.1.2 6 1.4 6 3s-2.69 3-6 3-6-1.34-6-3' }], ['path', { d: 'M21 14.5v3c0 1.66-2.69 3-6 3s-6-1.34-6-3v-3' }]],
  heart: [['path', { d: 'M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z' }]],
  plane: [['path', { d: 'm3 13 4 1 3 6 2-1-1-5 5-3 4 2 1-2-4-3 1-5-2-1-3 5-5 1-4-3-1 1 3 4-3 3Z' }]],
  dots: [['circle', { cx: 6, cy: 12, r: 1 }], ['circle', { cx: 12, cy: 12, r: 1 }], ['circle', { cx: 18, cy: 12, r: 1 }]],
  check: [['path', { d: 'm5 12 4.5 4.5L19 7' }]],
  clock: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 7v5l3 2' }]],
  alert: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 7.5v5.5M12 16.5v.01' }]],
  x: [['path', { d: 'M6 6l12 12M18 6 6 18' }]],
  info: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 11v5.5M12 7.5v.01' }]],
} satisfies Record<string, IconShape[]>;

export type IconName = keyof typeof icons;

/** Shared props. Each platform adds its own (className on web, color on native). */
export interface IconBaseProps {
  name: IconName;
  /** Size in px. Defaults to 20. */
  size?: number;
  /** Accessible name. Omit for decorative icons (the common case). */
  title?: string;
}

export const ICON_STROKE_WIDTH = 1.75;
