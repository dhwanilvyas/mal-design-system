/**
 * @mal/design-system, React Native entry. Metro picks this file automatically (the
 * "react-native" export condition, and the .native.ts platform extension). Same names
 * as the web entry, so app code reads the same on every platform.
 */

// Core: generic controls with no banking knowledge
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './core/Button/Button.native';
export { InputField, type InputFieldProps, type InputFieldSize, type InputFieldVariant } from './core/InputField/InputField.native';
export { Badge, type BadgeProps, type BadgeTone } from './core/Badge/Badge.native';
export { Icon, type IconName, type IconProps } from './core/Icon/Icon.native';

// Banking: domain components composed from core
export {
  TransactionCard,
  type TransactionCardProps,
  type TransactionCategory,
  type TransactionDirection,
  type TransactionStatus,
} from './banking/TransactionCard/TransactionCard.native';
export { ZakatCalculator, type ZakatCalculatorProps, type ZakatCalculatorVariant } from './banking/ZakatCalculator/ZakatCalculator.native';

// Theme
export { ThemeProvider, useTheme, type ThemeProviderProps } from './theme/ThemeProvider.native';

// Platform-neutral logic and values (identical on both platforms)
export * from './shared';
