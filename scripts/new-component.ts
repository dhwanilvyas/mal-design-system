/**
 * Scaffolds a component that already follows the system's conventions.
 *   npm run new:component -- ShariaBadge
 */
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const name = process.argv[2];
if (!name || !/^[A-Z][A-Za-z0-9]+$/.test(name)) {
  console.error('Usage: npm run new:component -- PascalCaseName');
  process.exit(1);
}

const dir = fileURLToPath(new URL(`../src/components/${name}/`, import.meta.url));
if (existsSync(dir)) {
  console.error(`✖ src/components/${name} already exists`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const files: Record<string, string> = {
  [`${name}.tsx`]: `import type { ComponentPropsWithRef } from 'react';
import { variants } from '../../utils/variants';

const styles = variants({
  base: 'inline-flex items-center gap-2 rounded-md text-fg',
  variants: {
    // Name variants by intent (what it means), not appearance (what it looks like).
    variant: {
      default: 'bg-surface border border-border',
      emphasis: 'bg-brand-subtle text-brand-fg',
    },
    size: { md: 'px-3 py-2 text-sm', lg: 'px-4 py-3 text-md' },
  },
  defaults: { variant: 'default', size: 'md' },
});

export interface ${name}Props extends ComponentPropsWithRef<'div'> {
  /** Describe when to use each variant. */
  variant?: 'default' | 'emphasis';
  size?: 'md' | 'lg';
}

export function ${name}({ variant, size, className, ...rest }: ${name}Props) {
  return <div className={styles({ variant, size }, className)} {...rest} />;
}
`,
  'index.ts': `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`,
  [`${name}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}';

const meta = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  args: { children: '${name}' },
  parameters: { docs: { description: { component: 'TODO: what it is, when to use it, when not to.' } } },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Emphasis: Story = { args: { variant: 'emphasis' } };
`,
  [`${name}.test.tsx`]: `import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders', () => {
    render(<${name}>Hello</${name}>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<${name}>Hello</${name}>);
    await expectNoA11yViolations(container);
  });
});
`,
};

for (const [file, content] of Object.entries(files)) writeFileSync(dir + file, content);
appendFileSync(fileURLToPath(new URL('../src/index.ts', import.meta.url)), `export * from './components/${name}';\n`);

console.log(`✔ Created src/components/${name}/ and exported it from src/index.ts
Next: design the API with a product designer, fill in the stories, then run \`npm run verify\`.`);
