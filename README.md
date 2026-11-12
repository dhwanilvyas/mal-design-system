# Mal Design System

A focused, production-minded foundation for Mal's web products: **design tokens, accessible React components, and a Storybook playground**. It is trustworthy, modern and minimal. Deep emerald is the brand colour, gold is a sparing accent, and warm "sand" neutrals keep it from feeling clinical. Light/dark themes and Arabic RTL work out of the box.

- **Live playground:** _STORYBOOK_URL_
- **Architecture & trade-offs:** [`docs/architecture-and-tradeoffs.pdf`](docs/architecture-and-tradeoffs.pdf)

| Component | Variants | Notes |
| --- | --- | --- |
| `Button` | primary · secondary · tertiary · danger, sizes sm/md/lg | `type="button"` by default; `loading` keeps focus (uses `aria-disabled`) |
| `InputField` | default · amount, md/lg | Label is required; hint/error wired to `aria-describedby`; amount mode = decimal keypad + tabular figures |
| `TransactionCard` | default · compact, static or interactive | `Money` in minor units; sign/colour visual only, AT hears "Spent/Received"; `<bdi>` for merchant names |
| `ZakatCalculator` | quick · detailed | Composed only from system parts; pure `calculateZakat()`; debounced polite live region |
| `Badge`, `Icon` | 6 tones · 16 icons | Internal primitives, exported |

## Quick start

```bash
npm install
npm run dev        # Storybook on http://localhost:6006
npm run verify     # tokens in sync + typecheck + lint + unit/a11y tests (what CI runs)
```

Requires Node 22.18+ (scripts are TypeScript run natively by Node).

## How it fits together

```
src/tokens/tokens.ts ──npm run tokens──▶ src/styles/tokens.css ──▶ Tailwind utilities ──▶ components
  primitives (palette)                   @theme { --color-brand … }     bg-brand, p-4,        Button, InputField…
  semantic (light/dark)                  [data-theme='dark'] { … }      rounded-md …
  contrast pairs ──▶ tokens.test.ts (WCAG check for every theme, in CI)
```

1. **Primitives** (`palette.emerald[700]`) are raw values. Components never use them.
2. **Semantic tokens** (`brand`, `fg-muted`, `danger-subtle`) say what a colour is *for*. Each theme maps every semantic token to a primitive, and TypeScript enforces that no theme misses a key.
3. **Generated CSS** registers semantic tokens as Tailwind's theme *and removes Tailwind's defaults*. `bg-emerald-600`, `text-gray-500` and `p-7` don't compile. Only the Mal scale exists.
4. **Theming is runtime.** Set `data-theme="dark"` on any element (usually `<html>`); everything below it re-themes without a re-render. Set `dir="rtl"` for Arabic; components use logical properties (`ms-*`, `text-start`) so they mirror automatically.

### Why Tailwind (v4) over CSS-in-JS

Zero runtime cost (important for banking performance on mid-range Android). It works with React Server Components with no provider. Tokens become CSS variables that any stack can read. And removing the default theme turns "use the tokens" from a code-review comment into a compile-time constraint. The trade-off is long class strings; variant maps (`src/utils/variants.ts`) keep them in one place per component. Full reasoning is in the architecture doc.

## Using it in an app

```tsx
import '@mal/design-system/styles.css';
import { Button, TransactionCard } from '@mal/design-system';

<html data-theme="light" dir="ltr">…
<Button variant="primary" onClick={send}>Send money</Button>
<TransactionCard merchant="Talabat" amount={{ minor: 6450, currency: 'AED' }} direction="debit" date={tx.bookedAt} />
```

Non-CSS consumers (charts, emails, React Native) can import raw values: `import { themes, palette } from '@mal/design-system/tokens'`.

## Adding a new component

The goal is that a new engineer can ship a correct component in an afternoon without asking anyone where things go.

**0. Check you need one.** Can it be composed from existing components (see `ZakatCalculator`)? Is it needed by **two or more product surfaces**? If it's only used once, build it in the product repo first and promote it later.

**1. Agree the API with design before writing code.** Open an issue using the "Component proposal" format: purpose, variants (named by *intent*, e.g. `danger`, not `red`), states, content rules, keyboard behaviour, RTL notes. A product designer and one DS maintainer approve it.

**2. Scaffold.**

```bash
npm run new:component -- ShariaBadge
```

This creates `src/components/ShariaBadge/` with a component, story, test (including an axe check) and barrel export, all following the conventions below.

**3. Build it with tokens only.** Use semantic utilities (`bg-surface`, `text-fg-muted`, `border-border`). If a value you need doesn't exist, **don't hard-code it**. Add it to `src/tokens/tokens.ts` (semantic tier, both themes), run `npm run tokens`, and add a contrast pair if it's a text/background combo. Lint fails on hex literals in components.

**4. Meet the accessibility bar.**

- [ ] Native element first (`<button>`, `<input>`, `<a>`); ARIA only to fill gaps.
- [ ] Fully keyboard operable, with a visible `focus-visible` ring (`outline-border-focus`).
- [ ] Every input has a label; errors use `aria-invalid` and `aria-describedby`.
- [ ] Meaning is never colour-only (icons + text for status, words for credit/debit).
- [ ] Works in `dir="rtl"` (logical properties; `<bdi>` around user-supplied text).
- [ ] Dynamic results use a *polite*, debounced live region.
- [ ] Respects `prefers-reduced-motion` (global in `index.css`).

**5. Document and test.**

- Stories: a `Playground` (controls), one story per variant/state, and an RTL example if layout is directional. Write the component's docs description: what it's for, when *not* to use it.
- Tests: behaviour (keyboard, callbacks), ARIA wiring, and `expectNoA11yViolations`. Put any domain maths in a pure function with its own tests (see `calculateZakat.ts`).

**6. Verify and open a PR.** `npm run verify && npm run build`. Use the Storybook a11y panel to check contrast in both themes. Request review from a DS maintainer and the designer who approved the API.

## Conventions

| Topic | Rule |
| --- | --- |
| Props | Extend the native element's props (`ComponentPropsWithRef<'button'>`) so `ref`, `aria-*` and `data-*` pass through. React 19 ref-as-prop, no `forwardRef`. |
| Variants | Declared once with `variants()`. Name by intent. Default every variant. |
| `className` | Applied to the root for **layout only** (margins, width). Visual changes go through variants. We deliberately don't ship `tailwind-merge`. |
| Money | Always `{ minor: number; currency: string }`. Never floats. Format with `formatMoney()` (Intl) at render. |
| Copy | Sentence case. Domain terms (Zakat, nisab, hawl, Sadaqah) are capitalised consistently. |
| Icons | Decorative by default (`aria-hidden`). Pass `title` only for standalone meaningful icons. |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Storybook with hot reload |
| `npm run tokens` | Regenerate `src/styles/tokens.css` from `tokens.ts` |
| `npm run verify` | Token drift check, `tsc`, ESLint (incl. jsx-a11y strict), Vitest (unit + axe + contrast) |
| `npm run build` | Static Storybook in `storybook-static/` (what Vercel deploys) |
| `npm run build:lib` | ESM library + `.d.ts` + CSS in `dist/` |
| `npm run new:component -- Name` | Scaffold a component with story, test and export |

## Project structure

```
src/
  tokens/tokens.ts         ← the source of truth (edit here)
  styles/tokens.css        ← generated, committed, checked in CI
  styles/index.css         ← Tailwind entry + base styles
  components/<Name>/       ← Name.tsx, Name.stories.tsx, Name.test.tsx, index.ts
  icons/Icon.tsx           ← in-house icon set
  utils/                   ← variants(), cx(), money, contrast
  docs/                    ← Storybook MDX pages and the composed "Home screen" pattern
scripts/                   ← build-tokens.ts, new-component.ts
```

## Known limitations (deliberately out of scope)

- Component copy is English. Strings should move to props or an i18n layer before Arabic launch (the layouts are already RTL-ready).
- No visual regression testing yet. Chromatic would be the next CI step.
- Not published to a registry. `build:lib` produces the package; versioning via Changesets is described in the architecture doc.
