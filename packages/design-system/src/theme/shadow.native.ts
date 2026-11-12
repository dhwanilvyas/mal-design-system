import type { ViewStyle } from 'react-native';
import { shadow } from '../tokens/tokens.generated';

const elevation = { sm: 1, md: 3, lg: 8 } as const;

/** Maps a token shadow (CSS-style layers) to iOS shadow props + Android elevation. Uses the main layer. */
export function nativeShadow(level: keyof typeof shadow): ViewStyle {
  const layer = shadow[level][0];
  return {
    shadowColor: layer.color.slice(0, 7),
    shadowOpacity: parseInt(layer.color.slice(7, 9), 16) / 255,
    shadowOffset: { width: layer.offsetX, height: layer.offsetY },
    shadowRadius: layer.blur / 2,
    elevation: elevation[level],
  };
}
