import { describe, expect, it } from 'vitest';
import { contrastPairs, themes } from './tokens';
import { contrastRatio } from '../utils/contrast';

describe.each(Object.entries(themes))('%s theme', (_name, colors) => {
  it.each(contrastPairs.map((p) => [p.fg, p.bg, p.min] as const))(
    '%s on %s meets %d:1',
    (fg, bg, min) => {
      const ratio = contrastRatio(colors[fg], colors[bg]);
      expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
    },
  );
});
