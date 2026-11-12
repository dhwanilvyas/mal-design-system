import { useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type ThemeName } from '../tokens/tokens.generated';
import { ThemeContext, type ThemeProviderBaseProps } from './context';

export interface ThemeProviderProps extends ThemeProviderBaseProps {
  children: ReactNode;
}

/** Re-themes every Mal component below it. Without `theme`, follows the device's light/dark setting. */
export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const system = useColorScheme();
  return <ThemeContext.Provider value={theme ?? (system === 'dark' ? 'dark' : 'light')}>{children}</ThemeContext.Provider>;
}

/** Current theme name and resolved colours. Works without a provider (follows the system). */
export function useTheme() {
  const system = useColorScheme();
  const name: ThemeName = useContext(ThemeContext) ?? (system === 'dark' ? 'dark' : 'light');
  return { name, colors: themes[name] };
}
