/**
 * @mal/design-system, web entry. Web bundlers get this (via dist/) automatically;
 * React Native's Metro gets index.native.ts instead. Both export the same component
 * names, so app code reads the same on every platform (index.parity.test.ts checks it).
 */

// Core: generic controls with no banking knowledge
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './core/Button/Button.web';
export { InputField, type InputFieldProps, type InputFieldSize, type InputFieldVariant } from './core/InputField/InputField.web';
export { Badge, type BadgeProps, type BadgeTone } from './core/Badge/Badge.web';
export { Icon, type IconName, type IconProps } from './core/Icon/Icon.web';

// Banking: domain components composed from core
export {
  TransactionCard,
  type TransactionCardProps,
  type TransactionCategory,
  type TransactionDirection,
  type TransactionStatus,
} from './banking/TransactionCard/TransactionCard.web';
export { ZakatCalculator, type ZakatCalculatorProps, type ZakatCalculatorVariant } from './banking/ZakatCalculator/ZakatCalculator.web';

// Theme
export { ThemeProvider, useTheme, type ThemeProviderProps } from './theme/ThemeProvider.web';

// Platform-neutral logic and values (identical on both platforms)
export * from './shared';

// Web only: the styling helpers components are built with, for product teams building
// local components the same way before promoting them into the system.
export { buttonStyles } from './core/Button/Button.web';
export { badgeStyles } from './core/Badge/Badge.web';
export { variants } from './utils/variants';
export { cx } from './utils/cx';
