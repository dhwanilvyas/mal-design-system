import { createElement, type SVGProps } from 'react';
import { ICON_STROKE_WIDTH, icons, type IconBaseProps } from './icons';

export type { IconName } from './icons';

export interface IconProps extends IconBaseProps, Omit<SVGProps<SVGSVGElement>, 'children' | 'name'> {}

/**
 * Stroke icon in currentColor. Decorative by default (aria-hidden). Pass `title` for a
 * standalone meaningful icon and it becomes role="img" with an accessible name.
 */
export function Icon({ name, size = 20, title, ...rest }: IconProps) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };
  return (
    <svg
      data-mal="Icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...a11y}
      {...rest}
    >
      {icons[name].map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
