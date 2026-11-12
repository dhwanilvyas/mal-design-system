import { useContext, type ReactNode } from 'react';
import { themes, type ThemeName } from '../tokens/tokens.generated';
import { ThemeContext, type ThemeProviderBaseProps } from './context';

export interface ThemeProviderProps extends ThemeProviderBaseProps {
  children: ReactNode;
}

/**
 * Re-themes everything inside it. On web this is just the `data-theme` attribute, so CSS
 * variables do the work with no re-render. Setting data-theme on <html> yourself works too.
 */
export function ThemeProvider({ theme = 'light', children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <div data-theme={theme} className="contents">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

/** Current theme name and resolved colours, for code that can't use CSS (charts, canvas). */
export function useTheme() {
  const name: ThemeName = useContext(ThemeContext) ?? 'light';
  return { name, colors: themes[name] };
}
