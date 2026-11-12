import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Badge } from '../../core/Badge/Badge.native';
import { Icon } from '../../core/Icon/Icon.native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { nativeShadow } from '../../theme/shadow.native';
import { fontSize, fontWeight, radius, spacing } from '../../tokens/tokens.generated';
import { describeTransaction, type TransactionCardBaseProps } from './TransactionCard.shared';

export type { TransactionCategory, TransactionDirection, TransactionStatus } from './TransactionCard.shared';

export interface TransactionCardProps extends TransactionCardBaseProps {
  /** Makes the whole card pressable (e.g. open transaction details). */
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export function TransactionCard({ onPress, style, ...props }: TransactionCardProps) {
  const { colors } = useTheme();
  const { merchant, description } = props;
  const { meta, isCompact, isCredit, status, dateLabel, visualAmount, spokenAmount, statusLabel } = describeTransaction(props);

  // One focus stop with one sentence, like the web card's reading order:
  // "Talabat, Food & dining, 11 Nov, Spent AED 64.50, Pending"
  const a11yLabel = [merchant, meta.label, dateLabel, !isCompact && description, spokenAmount, statusLabel]
    .filter(Boolean)
    .join(', ');

  const content = (
    <>
      <View
        style={[
          styles.tile,
          isCompact ? styles.tileCompact : styles.tileDefault,
          { backgroundColor: isCredit ? colors['success-subtle'] : colors['surface-sunken'] },
        ]}
      >
        <Icon name={meta.icon} size={isCompact ? 16 : 20} color={isCredit ? colors['success-fg'] : colors['fg-muted']} />
      </View>

      <View style={styles.body}>
        <Text numberOfLines={1} style={[styles.merchant, { color: colors.fg }]}>
          {merchant}
        </Text>
        <Text numberOfLines={1} style={[fontSize.sm, { color: colors['fg-muted'] }]}>
          {meta.label} · {dateLabel}
          {!isCompact && description ? ` · ${description}` : ''}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text
          style={[
            styles.amount,
            isCompact ? fontSize.sm : fontSize.md,
            status === 'failed'
              ? { color: colors['fg-subtle'], textDecorationLine: 'line-through' }
              : { color: isCredit ? colors['success-fg'] : colors.fg },
          ]}
        >
          {visualAmount}
        </Text>
        {statusLabel && (
          <Badge tone={status === 'failed' ? 'danger' : 'warning'} icon={<Icon name={status === 'failed' ? 'x' : 'clock'} size={12} />}>
            {statusLabel}
          </Badge>
        )}
      </View>
    </>
  );

  const cardStyle = [
    styles.card,
    isCompact ? styles.compact : [styles.default, { borderColor: colors.border }, cardShadow],
    { backgroundColor: colors.surface },
    style,
  ];

  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      onPress={onPress}
      style={({ pressed }) => [cardStyle, pressed && { backgroundColor: colors['surface-hover'] }]}
    >
      {content}
    </Pressable>
  ) : (
    <View accessible accessibilityLabel={a11yLabel} style={cardStyle}>
      {content}
    </View>
  );
}

const cardShadow = nativeShadow('sm');

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  default: { borderWidth: 1, borderRadius: radius.lg, padding: spacing[4] },
  compact: { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  tile: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  tileDefault: { width: 40, height: 40 },
  tileCompact: { width: 32, height: 32 },
  body: { flex: 1, minWidth: 0 },
  merchant: { ...fontSize.md, fontWeight: fontWeight.medium },
  trailing: { alignItems: 'flex-end', gap: spacing[1] },
  amount: { fontWeight: fontWeight.semibold, fontVariant: ['tabular-nums'], writingDirection: 'ltr' },
});
