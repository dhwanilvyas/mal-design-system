import { createContext } from 'react';
import type { ThemeName } from '../tokens/tokens.generated';

/** Shared by both platforms. `null` means "no provider above me". */
export const ThemeContext = createContext<ThemeName | null>(null);

export interface ThemeProviderBaseProps {
  /** Force a theme. Omit to follow the system (native) or the nearest data-theme (web, default light). */
  theme?: ThemeName;
}
