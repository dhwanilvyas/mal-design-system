import { StyleSheet, Text, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { ForegroundContext } from '../../theme/foreground.native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { fontSize, fontWeight, radius, spacing } from '../../tokens/tokens.generated';
import { badgeTones, type BadgeBaseProps } from './Badge.types';

export type { BadgeTone } from './Badge.types';

export interface BadgeProps extends BadgeBaseProps, Omit<ViewProps, 'children' | 'style'> {
  style?: StyleProp<ViewStyle>;
}

/** Small status label. View props (testID, accessibility*) pass through, as on web. */
export function Badge({ tone = 'neutral', icon, children, style, ...rest }: BadgeProps) {
  const { colors } = useTheme();
  const t = badgeTones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors[t.bg] }, style]} {...rest}>
      <ForegroundContext.Provider value={colors[t.fg]}>{icon}</ForegroundContext.Provider>
      <Text style={[styles.label, { color: colors[t.fg] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing[1],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing['0.5'],
  },
  label: { ...fontSize.xs, fontWeight: fontWeight.medium },
});
