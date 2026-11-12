/**
 * Scaffolds a cross-platform component that already follows the system's conventions.
 *
 *   npm run new:component -- ShariaBadge --group banking
 *   npm run new:component -- Switch                        (defaults to core)
 *
 * --group core     generic controls with no banking knowledge
 * --group banking  anything that knows about money, transactions or Islamic finance
 *
 * Creates Name.types.ts (shared contract), Name.web.tsx, Name.native.tsx, a story and a
 * test, and exports the component from both entries (index.ts and index.native.ts).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { group: { type: 'string', default: 'core' } },
});
const name = positionals[0];
const group = values.group;
if (!name || !/^[A-Z][A-Za-z0-9]+$/.test(name) || (group !== 'core' && group !== 'banking')) {
  console.error('Usage: npm run new:component -- PascalCaseName [--group core|banking]');
  process.exit(1);
}

const src = (rel: string) => fileURLToPath(new URL(`../src/${rel}`, import.meta.url));
const relDir = `${group}/${name}`;
const dir = src(`${relDir}/`);
if (existsSync(dir)) {
  console.error(`✖ src/${relDir} already exists`);
  process.exit(1);
}
mkdirSync(dir, { recursive: true });

const files: Record<string, string> = {
  [`${name}.types.ts`]: `import type { ReactNode } from 'react';
import type { SemanticColor } from '../../tokens/tokens.generated';

/** The contract both platforms implement. Name variants by intent (what it means), not appearance. */
export type ${name}Variant = 'default' | 'emphasis';

export interface ${name}BaseProps {
  /** Describe when to use each variant. */
  variant?: ${name}Variant;
  children: ReactNode;
}

/** Variant → semantic tokens. The web classes and native styles both follow this table. */
export const ${lower(name)}Variants: Record<${name}Variant, { bg: SemanticColor; fg: SemanticColor }> = {
  default: { bg: 'surface', fg: 'fg' },
  emphasis: { bg: 'brand-subtle', fg: 'brand-fg' },
};
`,
  [`${name}.web.tsx`]: `import type { ComponentPropsWithRef } from 'react';
import { variants } from '../../utils/variants';
import type { ${name}BaseProps } from './${name}.types';

const styles = variants({
  base: 'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm',
  variants: {
    variant: {
      default: 'bg-surface text-fg border border-border',
      emphasis: 'bg-brand-subtle text-brand-fg',
    },
  },
  defaults: { variant: 'default' },
});

export type { ${name}Variant } from './${name}.types';

export interface ${name}Props extends ${name}BaseProps, Omit<ComponentPropsWithRef<'div'>, keyof ${name}BaseProps> {}

export function ${name}({ variant, className, ...rest }: ${name}Props) {
  return <div className={styles({ variant }, className)} {...rest} />;
}
`,
  [`${name}.native.tsx`]: `import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider.native';
import { fontSize, radius, spacing } from '../../tokens/tokens.generated';
import { ${lower(name)}Variants, type ${name}BaseProps } from './${name}.types';

export type { ${name}Variant } from './${name}.types';

export interface ${name}Props extends ${name}BaseProps {
  style?: StyleProp<ViewStyle>;
}

export function ${name}({ variant = 'default', children, style }: ${name}Props) {
  const { colors } = useTheme();
  const v = ${lower(name)}Variants[variant];
  return (
    <View style={[styles.root, { backgroundColor: colors[v.bg] }, style]}>
      <Text style={[fontSize.sm, { color: colors[v.fg] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignSelf: 'flex-start', borderRadius: radius.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2] },
});
`,
  [`${name}.stories.tsx`]: `import type { Meta, StoryObj } from '@storybook/react-vite';
import { ${name} } from './${name}.web';

const meta = {
  title: '${group === 'core' ? 'Core' : 'Banking'}/${name}',
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
import { ${name} } from './${name}.web';

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

// Export from both entries, just above the "// Theme" section.
for (const [entry, platform] of [['index.ts', 'web'], ['index.native.ts', 'native']] as const) {
  const file = src(entry);
  const line = `export { ${name}, type ${name}Props, type ${name}Variant } from './${relDir}/${name}.${platform}';\n`;
  writeFileSync(file, readFileSync(file, 'utf8').replace('\n// Theme', `${line}\n// Theme`));
}

console.log(`✔ Created src/${relDir}/ (types, web, native, story, test) and exported it from both entries.
Next: agree the API with a product designer, build both implementations, then run \`npm run verify\`.`);

function lower(s: string) {
  return s[0]!.toLowerCase() + s.slice(1);
}
