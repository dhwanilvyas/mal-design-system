import type { ComponentType } from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { useForeground } from '../../theme/foreground.native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { ICON_STROKE_WIDTH, icons, type IconBaseProps, type IconShape } from './icons';

export type { IconName } from './icons';

export interface IconProps extends IconBaseProps {
  /** Stroke colour. Defaults to the enclosing component's text colour (like currentColor), else `fg`. */
  color?: string;
}

const shapes = { path: Path, circle: Circle, rect: Rect, ellipse: Ellipse } as const;

/** Stroke icon. Decorative by default (hidden from VoiceOver/TalkBack); pass `title` to make it meaningful. */
export function Icon({ name, size = 20, title, color }: IconProps) {
  const { colors } = useTheme();
  const inherited = useForeground();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? inherited ?? colors.fg}
      strokeWidth={ICON_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={Boolean(title)}
      accessibilityLabel={title}
      accessibilityRole={title ? 'image' : undefined}
      importantForAccessibility={title ? 'yes' : 'no-hide-descendants'}
    >
      {icons[name].map(([tag, attrs]: IconShape, i) => {
        const Shape = shapes[tag] as ComponentType<Record<string, unknown>>;
        return <Shape key={i} {...attrs} />;
      })}
    </Svg>
  );
}
