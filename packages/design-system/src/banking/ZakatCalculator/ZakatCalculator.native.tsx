import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { Button } from '../../core/Button/Button.native';
import { Icon } from '../../core/Icon/Icon.native';
import { InputField } from '../../core/InputField/InputField.native';
import { nativeShadow } from '../../theme/shadow.native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { fontSize, fontWeight, radius, spacing } from '../../tokens/tokens.generated';
import { useZakatCalculator, ZAKAT_DISCLAIMER, type ZakatCalculatorBaseProps } from './ZakatCalculator.shared';

export type { ZakatCalculatorVariant } from './ZakatCalculator.shared';

export interface ZakatCalculatorProps extends ZakatCalculatorBaseProps {
  style?: StyleProp<ViewStyle>;
}

export function ZakatCalculator({ title = 'Zakat calculator', onPay, style, ...props }: ZakatCalculatorProps) {
  const { colors } = useTheme();
  const z = useZakatCalculator(props);
  useAnnounce(z.announcement);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, nativeShadow('md'), style]}>
      <View style={[styles.header, { backgroundColor: colors['accent-subtle'], borderColor: colors.border }]}>
        <GeometricStar color={colors['accent-fg']} />
        <View style={styles.headerText}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.fg }]}>
            {title}
          </Text>
          <Text style={[fontSize.sm, { color: colors['fg-muted'] }]}>
            Nisab today: <Text style={[styles.figure, { color: colors.fg }]}>{z.fmt(props.nisab.minor)}</Text> (85g of gold)
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.fields}>
          {z.fields.map((f) => (
            <InputField
              key={f.field}
              label={f.label}
              hint={f.hint}
              variant={f.variant}
              keyboardType="decimal-pad"
              currency={z.currency}
              placeholder="0.00"
              value={f.value}
              error={f.error}
              onChangeText={f.setValue}
            />
          ))}
        </View>

        <View
          // Android announces changes to a polite live region itself; iOS uses useAnnounce below.
          accessibilityLiveRegion="polite"
          style={[styles.result, { backgroundColor: z.isDue ? colors['brand-subtle'] : colors['surface-sunken'] }]}
        >
          <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
            <Text style={[fontSize.sm, { color: colors['fg-muted'] }]}>{z.isDue ? 'Zakat due' : 'Estimated Zakat'}</Text>
            <Text style={[styles.zakat, { color: colors.fg }]}>{z.displayZakat}</Text>
            {z.hasInput && !z.hasErrors && (
              <Text style={[fontSize.sm, { color: colors['fg-muted'] }]}>
                Net wealth <Text style={[styles.figure, { color: colors.fg }]}>{z.fmt(z.result.netWealth)}</Text>
              </Text>
            )}
          </View>
          {/* One readable sentence for VoiceOver/TalkBack instead of the separate visual figures. */}
          <Text style={styles.srOnly}>{z.announcement}</Text>

          {z.hasInput && !z.hasErrors && !z.result.isDue && (
            // Hidden from AT: it updates per keystroke inside the live region, and the
            // debounced summary above already says how far below nisab the total is.
            <View style={styles.progressWrap} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <View style={[styles.track, { backgroundColor: colors.border }]}>
                <View style={[styles.bar, { width: `${z.progress}%`, backgroundColor: colors.accent }]} />
              </View>
              <Text style={[fontSize.sm, { color: colors['fg-muted'] }]}>
                Below nisab by <Text style={[styles.figure, { color: colors.fg }]}>{z.fmt(z.result.nisab - z.result.netWealth)}</Text>. No Zakat is due.
              </Text>
            </View>
          )}

          {onPay && z.isDue && (
            <Button size="lg" fullWidth onPress={() => onPay(z.payload)}>
              {`Pay ${z.fmt(z.result.zakat)} Zakat`}
            </Button>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Icon name="info" size={16} color={colors['fg-muted']} />
          <Text style={[fontSize.xs, styles.disclaimerText, { color: colors['fg-muted'] }]}>{ZAKAT_DISCLAIMER}</Text>
        </View>
      </View>
    </View>
  );
}

/** iOS has no live regions: announce the debounced summary when it changes (not on first render). */
function useAnnounce(message: string) {
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [message]);
}

/** Eight-point star (two overlapping squares), a classic Islamic geometric motif. Decorative. */
function GeometricStar({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" importantForAccessibility="no-hide-descendants">
      <Rect x={5} y={5} width={14} height={14} stroke={color} strokeWidth={1.5} />
      <Rect x={5} y={5} width={14} height={14} stroke={color} strokeWidth={1.5} rotation={45} origin="12, 12" />
      <Circle cx={12} cy={12} r={2.25} fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.xl, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
  },
  headerText: { flex: 1, gap: spacing['0.5'] },
  title: { ...fontSize.lg, fontWeight: fontWeight.semibold },
  figure: { fontWeight: fontWeight.medium, fontVariant: ['tabular-nums'] },
  body: { padding: spacing[5], gap: spacing[5] },
  fields: { gap: spacing[4] },
  result: { borderRadius: radius.lg, padding: spacing[4], gap: spacing[3] },
  zakat: { ...fontSize['3xl'], fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  srOnly: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  progressWrap: { gap: spacing['1.5'] },
  track: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: radius.full },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  disclaimerText: { flex: 1 },
});
