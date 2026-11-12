import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Both entries must export the same components, so `import { Button } from '@mal/design-system'`
 * works on every platform. Parsed from source because the native entry can't load under jsdom.
 */
const WEB_ONLY = ['buttonStyles', 'badgeStyles', 'variants', 'cx'];
const web = readFileSync(resolve(import.meta.dirname, 'index.ts'), 'utf8');
const native = readFileSync(resolve(import.meta.dirname, 'index.native.ts'), 'utf8');

function exportedNames(src: string): string[] {
  const names = [...src.matchAll(/export\s*\{([^}]*)\}/g)].flatMap((m) =>
    m[1]!
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.startsWith('type ')),
  );
  return names.filter((n) => !WEB_ONLY.includes(n)).sort();
}

describe('platform entries', () => {
  it('web and native export the same components', () => {
    expect(exportedNames(native)).toEqual(exportedNames(web));
  });

  it('every component has both a .web.tsx and a .native.tsx implementation', () => {
    for (const name of ['Button', 'InputField', 'Badge', 'Icon', 'TransactionCard', 'ZakatCalculator']) {
      expect(web, name).toMatch(new RegExp(`/${name}\\.web'`));
      expect(native, name).toMatch(new RegExp(`/${name}\\.native'`));
    }
  });
});
