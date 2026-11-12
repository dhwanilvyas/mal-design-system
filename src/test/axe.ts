import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe against a rendered container. Colour contrast is disabled because
 * jsdom has no layout/paint; contrast is enforced at the token level instead
 * (tokens.test.ts) and visually by the Storybook a11y addon.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`);
  expect(summary).toEqual([]);
}
