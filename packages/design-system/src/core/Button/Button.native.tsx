import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { ForegroundContext } from '../../theme/foreground.native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { fontSize, fontWeight, radius, spacing, type SemanticColor } from '../../tokens/tokens.generated';
import { buttonHeights, type ButtonBaseProps, type ButtonSize, type ButtonVariant } from './Button.types';

export type { ButtonSize, ButtonVariant } from './Button.types';

export interface ButtonProps extends ButtonBaseProps, Omit<PressableProps, 'children' | 'style'> {
  /** Outer layout only (margins, alignment). Visual changes go through variants. */
  style?: StyleProp<ViewStyle>;
}

/** Same intent → token mapping as Button.web.tsx's variant classes. */
const variantColors: Record<ButtonVariant, { bg: SemanticColor | 'transparent'; pressed: SemanticColor; fg: SemanticColor; border?: SemanticColor }> = {
  primary: { bg: 'brand', pressed: 'brand-active', fg: 'fg-on-brand' },
  secondary: { bg: 'surface', pressed: 'surface-active', fg: 'fg', border: 'border-strong' },
  tertiary: { bg: 'transparent', pressed: 'brand-subtle', fg: 'brand-fg' },
  danger: { bg: 'danger', pressed: 'danger-hover', fg: 'fg-inverse' },
};

const sizeStyles = StyleSheet.create<Record<ButtonSize, ViewStyle>>({
  sm: { height: buttonHeights.sm, paddingHorizontal: spacing[3] },
  md: { height: buttonHeights.md, paddingHorizontal: spacing[4] },
  lg: { height: buttonHeights.lg, paddingHorizontal: spacing[5] },
});

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  children,
  disabled,
  onPress,
  style,
  accessibilityState,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const v = variantColors[variant];
  const fg = colors[v.fg];
  const text = fontSize[size === 'lg' ? 'md' : 'sm'];

  return (
    <Pressable
      accessibilityRole="button"
      // While loading the button stays focusable (not `disabled`) but ignores presses.
      accessibilityState={{ disabled: Boolean(disabled) || loading, busy: loading, ...accessibilityState }}
      disabled={disabled}
      onPress={loading ? undefined : onPress}
      // Small buttons still get a 44pt touch target (Apple HIG / WCAG 2.5.8).
      hitSlop={size === 'sm' ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: pressed ? colors[v.pressed] : v.bg === 'transparent' ? 'transparent' : colors[v.bg],
          borderColor: v.border ? colors[v.border] : 'transparent',
        },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <ForegroundContext.Provider value={fg}>
        {loading ? <ActivityIndicator size="small" color={fg} /> : leadingIcon}
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text numberOfLines={1} style={[styles.label, text, { color: fg }]}>
            {children}
          </Text>
        ) : (
          <View>{children}</View>
        )}
        {!loading && trailingIcon}
      </ForegroundContext.Provider>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: spacing[2],
    borderRadius: radius.md,
    borderWidth: 1,
  },
  fullWidth: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  label: { fontWeight: fontWeight.semibold },
});
