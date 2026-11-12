import { createContext, useContext } from 'react';

/**
 * Native has no CSS `currentColor`. Components that set a text colour (Button, Badge…)
 * provide it here so an <Icon> placed inside them picks it up automatically.
 */
export const ForegroundContext = createContext<string | null>(null);

export const useForeground = () => useContext(ForegroundContext);
