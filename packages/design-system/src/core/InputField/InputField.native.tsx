import { useId, useState, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { fontSize, fontWeight, radius, spacing } from '../../tokens/tokens.generated';
import { Icon } from '../Icon/Icon.native';
import { accessibleLabel, inputHeights, type InputFieldBaseProps } from './InputField.types';

export type { InputFieldSize, InputFieldVariant } from './InputField.types';

export interface InputFieldProps extends InputFieldBaseProps, Omit<TextInputProps, 'style' | 'editable'> {
  /** Outer wrapper layout only. */
  style?: StyleProp<ViewStyle>;
}

const asText = (node: ReactNode) => (typeof node === 'string' ? node : undefined);

export function InputField({
  label,
  hideLabel = false,
  hint,
  error,
  variant = 'default',
  size = 'md',
  currency,
  required,
  disabled,
  prefix,
  suffix,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: InputFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const labelId = useId();
  const isAmount = variant === 'amount';
  const leading = prefix ?? currency ?? null;
  // Screen readers hear: label, then error, then hint (same order as aria-describedby on web).
  const a11yHint = [asText(error), asText(hint)].filter(Boolean).join('. ') || undefined;

  return (
    <View style={[styles.wrapper, style]}>
      {!hideLabel && (
        <Text nativeID={labelId} style={[styles.label, { color: colors.fg }]}>
          {label}
          {required && <Text style={{ color: colors['danger-fg'] }}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.field,
          { height: isAmount ? inputHeights.amount : inputHeights[size], backgroundColor: colors.surface },
          { borderColor: error ? colors.danger : focused ? colors['border-focus'] : colors['border-strong'] },
          focused && styles.focused,
          disabled && { backgroundColor: colors['surface-sunken'], opacity: 0.6 },
        ]}
      >
        {leading != null && (
          <Text
            importantForAccessibility="no"
            accessibilityElementsHidden
            style={[isAmount ? fontSize.lg : fontSize.sm, { color: colors['fg-muted'] }, isAmount && styles.medium]}
          >
            {leading}
          </Text>
        )}
        <TextInput
          accessibilityLabel={accessibleLabel(label, currency)}
          accessibilityLabelledBy={hideLabel ? undefined : labelId}
          accessibilityHint={a11yHint}
          accessibilityState={{ disabled: Boolean(disabled) }}
          editable={!disabled}
          placeholderTextColor={colors['fg-subtle']}
          {...(isAmount && { keyboardType: 'decimal-pad' as const, autoComplete: 'off' as const })}
          {...inputProps}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.fg }, isAmount ? styles.amountText : fontSize.md]}
        />
        {suffix != null && (
          <Text importantForAccessibility="no" accessibilityElementsHidden style={[fontSize.sm, { color: colors['fg-muted'] }]}>
            {suffix}
          </Text>
        )}
      </View>

      {error != null && (
        <View style={styles.message}>
          <Icon name="alert" size={16} color={colors['danger-fg']} />
          <Text style={[styles.messageText, { color: colors['danger-fg'] }]}>{error}</Text>
        </View>
      )}
      {hint != null && <Text style={[styles.messageText, { color: colors['fg-muted'] }]}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing['1.5'] },
  label: { ...fontSize.sm, fontWeight: fontWeight.medium },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
  },
  focused: { borderWidth: 2, paddingHorizontal: spacing[3] - 1 },
  input: { flex: 1, height: '100%', padding: 0 },
  amountText: { ...fontSize['2xl'], fontWeight: fontWeight.semibold, fontVariant: ['tabular-nums'] },
  medium: { fontWeight: fontWeight.medium },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing['1.5'] },
  messageText: { ...fontSize.sm, flexShrink: 1 },
});
