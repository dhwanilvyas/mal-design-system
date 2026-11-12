# Mal Design System

A focused, production-minded foundation for Mal's products, on **web and React Native**: JSON design tokens, accessible components, a Storybook playground, and an Expo demo app. It is trustworthy, modern and minimal. Deep emerald is the brand colour, gold is a sparing accent, and warm "sand" neutrals keep it from feeling clinical. Light/dark themes and Arabic RTL work out of the box.

- **Live playground, web and native:** _STORYBOOK_URL_. Every story shows the web components; the **Native app** page runs the React Native components in a phone frame in the browser, plus real iOS screenshots
- **Native app on a device:** `npm run ios` / `npm run android` locally, or the Expo Go QR below for project members
- **Architecture & trade-offs:** [`docs/architecture-and-tradeoffs.pdf`](docs/architecture-and-tradeoffs.pdf)

| Component | Variants | Notes |
| --- | --- | --- |
| `Button` | primary · secondary · tertiary · danger, sizes sm/md/lg | `loading` keeps focus; web defaults to `type="button"`; native `sm` gets a 44pt touch target |
| `InputField` | default · amount, md/lg | Label required; error and hint are announced with the field; amount = decimal keypad + tabular figures |
| `TransactionCard` | default · compact, static or pressable | `Money` in minor units; screen readers hear "Spent/Received", never "minus" |
| `ZakatCalculator` | quick · detailed | Built only from the parts above; shared `useZakatCalculator()` hook; pure, tested `calculateZakat()` |
| `Badge`, `Icon` | 6 tones · 16 icons | Building blocks, also exported |

## Run the native app on a phone

[`apps/mobile`](apps/mobile) is the same components as the web playground, running natively (`.native.tsx`). Toggle dark mode from the header, or let it follow the device.

- **Anyone, from a clone:** `npm install && npm run mobile`, then scan the terminal's QR code with [Expo Go](https://expo.dev/go) (phone on the same Wi-Fi). No account needed on Android; on a physical iPhone, Expo requires Expo Go and the CLI (`npx expo login`) to be signed in to the same free Expo account. `npm run ios` / `npm run android` open a simulator or emulator instead, with no account.
- **Project members, no clone needed:** sign in to Expo Go with an account that's a member of `@dhwanilvyas/mal-design-system-demo`, then scan the QR code. Expo only serves EAS Updates in Expo Go to signed-in project members, so this isn't a public link. Republish after changes with `npm run publish:mobile`.

<img src="packages/design-system/public/expo-go-qr.png" alt="QR code that opens the published demo in Expo Go, for signed-in project members" width="160" />

## One import, the right file for each platform

```tsx
import { Button } from '@mal/design-system';
```

The same line works in a web app and in a React Native app, and each gets its own implementation with no configuration:

| Consumer | Resolves to | How |
| --- | --- | --- |
| React Native (Metro / Expo) | `src/index.native.ts` → `Button.native.tsx` | The `react-native` condition in `package.json` `exports`. Metro compiles the TypeScript source directly. |
| Web (Vite, Next.js, webpack…) | `dist/index.js`, built from `Button.web.tsx` | The default export: a prebuilt ESM bundle with `.d.ts` types, marked `'use client'` |

Each component folder holds the contract once and the rendering twice:

```
src/core/Button/
  Button.types.ts     shared props + variant names; both platforms implement exactly this
  Button.web.tsx      <button> + Tailwind classes
  Button.native.tsx   <Pressable> + StyleSheet from the same tokens
  Button.stories.tsx  web playground
  Button.test.tsx     behaviour + axe accessibility check (web)
```

Logic that isn't pixels lives in shared files and is written once: money formatting, `calculateZakat()`, the `useZakatCalculator()` hook (validation, maths, the screen-reader summary), transaction labels, and icon geometry. A Sharia-board wording change lands on both platforms in one edit.

## Tokens: authored once in JSON

[`tokens/tokens.json`](packages/design-system/tokens/tokens.json) uses the [W3C DTCG format](https://tr.designtokens.org/format/), the same format Figma Variables export, so design and code can share one source. `npm run tokens` compiles it for each platform:

```
tokens/tokens.json ──npm run tokens──▶ src/styles/theme.css          web: Tailwind @theme + [data-theme] scopes
  palette (primitives)              └─▶ src/tokens/tokens.generated.ts native: typed values, px numbers
  color.light / color.dark (semantic, aliases like "{palette.sand.50}")
```

1. **Primitives** (`palette.emerald.700`) are raw values. Components never use them.
2. **Semantic tokens** (`brand`, `fg-muted`, `danger-subtle`) say what a colour is *for*. Each theme maps every one to a primitive; the build fails if a theme is missing a key.
3. **The web theme removes Tailwind's defaults**, so `bg-emerald-600` or `p-7` don't compile. Only the Mal scale exists.
4. **WCAG contrast** is tested for every text/background pair in every theme, in CI.

Outputs are committed and checked for drift in CI (`npm run tokens:check`).

### Why Tailwind (v4) on web, StyleSheet on native

Web: zero runtime cost (banking on mid-range Android), works in React Server Components with no provider, and theming is a `data-theme` attribute swap with no re-render. Removing the default theme makes "use the tokens" a compile-time rule. Native: React Native's own `StyleSheet`, fed by the same generated tokens, with no extra dependencies or Babel plugins. Both platforms share the token values and the component contracts, not the styling syntax. The full reasoning, including why not NativeWind, is in the architecture doc.

## Using it in an app

Product apps can live in this repo (like `apps/mobile`) or in their own repos. Either way they install one package: `npm install @mal/design-system`.

**Web (Tailwind v4):** add two lines to the app's stylesheet. The app's own code then uses the same Mal-only utilities (`bg-surface`, `p-4`).

```css
@import 'tailwindcss';
@import '@mal/design-system/tailwind.css';
```

```tsx
<html data-theme="light" dir="ltr">…
<Button variant="primary" onClick={send}>Send money</Button>
<TransactionCard merchant="Talabat" amount={{ minor: 6450, currency: 'AED' }} direction="debit" date={tx.bookedAt} />
```

**React Native (Expo):** also install the peer `react-native-svg` (`npx expo install react-native-svg`). No Metro, Babel or TypeScript configuration is needed. Wrap the app once to choose a theme, or leave it out to follow the device setting:

```tsx
import { Button, ThemeProvider, TransactionCard } from '@mal/design-system';

<ThemeProvider>
  <Button variant="primary" onPress={send}>Send money</Button>
  <TransactionCard merchant="Talabat" amount={{ minor: 6450, currency: 'AED' }} direction="debit" date={tx.bookedAt} onPress={open} />
</ThemeProvider>
```

Event props follow each platform's convention (`onClick` on web, `onPress` on native). Everything else is identical. App code can read tokens directly too: `const { colors } = useTheme()`, or `import { spacing, radius } from '@mal/design-system'`.

## Working in this repo

```bash
npm install
npm run dev        # Storybook (web) on http://localhost:6006
npm run ios        # the Expo demo app on the iOS simulator (or: npm run android, npm run mobile)
npm run verify     # tokens in sync + typecheck (web and native) + lint + tests (what CI runs)
```

Requires Node 22.18+. The repo is an npm workspace with one package and one app. React is pinned to a single version (root `overrides`), because React Native requires an exact match.

```
packages/design-system/
  tokens/tokens.json       ← the source of truth for values (edit here)
  src/core/                ← Button, InputField, Badge, Icon: generic, no banking knowledge
  src/banking/             ← TransactionCard, ZakatCalculator, money: built only from core/
  src/theme/               ← ThemeProvider / useTheme (web + native)
  src/index.ts             ← web entry          src/index.native.ts ← native entry
  src/docs/                ← Storybook pages and the composed "Home screen" pattern
  scripts/                 ← build-tokens.ts, new-component.ts
apps/mobile/               ← Expo app consuming the package exactly as an external app would
```

## Adding a new component

The goal is that a new engineer can ship a correct component in an afternoon without asking anyone where things go.

**0. Check you need one, and where it goes.** Can it be composed from existing components (see `ZakatCalculator`)? Is it needed by **two or more product surfaces**? If it's only used once, build it in the product app first and promote it later. Then pick the folder: `core` for a generic control (Switch, Tabs), `banking` if it knows about money, accounts or Islamic finance (ShariaBadge).

**1. Agree the API with design before writing code.** Open an issue using the "Component proposal" format: purpose, variants (named by *intent*, e.g. `danger`, not `red`), states, content rules, keyboard and screen-reader behaviour, RTL notes. A product designer and one DS maintainer approve it. That API becomes `Name.types.ts`.

**2. Scaffold.**

```bash
npm run new:component -- ShariaBadge --group banking   # or --group core (the default)
```

This creates `Name.types.ts`, `Name.web.tsx`, `Name.native.tsx`, a story and a test (with an axe check), and exports the component from both entries. A parity test fails if the web and native entries ever export different names.

**3. Build both implementations with tokens only.** Web uses semantic utilities (`bg-surface`, `text-fg-muted`); native uses `useTheme().colors['surface']` and the generated `spacing`/`radius`/`fontSize`. Put shared behaviour in `Name.types.ts` or a `Name.shared.ts` hook, not in either platform file. If a value doesn't exist, **don't hard-code it**: add it to `tokens/tokens.json` (both themes), run `npm run tokens`, and add a contrast pair if it's a text/background combo. Lint fails on hex literals, on web files importing React Native (and vice versa), and on `core/` importing `banking/`.

**4. Meet the accessibility bar.**

- [ ] Native elements first: `<button>`/`<input>` on web, `Pressable` with `accessibilityRole` on native.
- [ ] Keyboard operable with a visible `focus-visible` ring on web; one sensible focus stop per item on native.
- [ ] Every input has a label; errors are exposed (`aria-invalid` + `aria-describedby` on web, `accessibilityHint` on native).
- [ ] Meaning is never colour-only (icons + text for status, words for credit/debit).
- [ ] Works in RTL (`dir="rtl"` on web, `I18nManager` on native): logical properties, no hard-coded left/right.
- [ ] Dynamic results use a *polite*, debounced announcement (live region on web and Android, `announceForAccessibility` on iOS).
- [ ] Touch targets are at least 44pt on native.

**5. Document and test.** Stories: a `Playground`, one story per variant/state, an RTL example if layout is directional, and a description of when *not* to use it. Tests: behaviour, ARIA wiring and `expectNoA11yViolations`. Put domain maths in a pure function with its own tests (see `calculateZakat.ts`). Check the native side in `apps/mobile` (`npm run ios`).

**6. Verify and open a PR.** `npm run verify && npm run build`. Request review from a DS maintainer and the designer who approved the API.

## Conventions

| Topic | Rule |
| --- | --- |
| Props | `Name.types.ts` is the contract. Web extends the native DOM element's props (`ref`, `aria-*`, `data-*` pass through); native extends the RN primitive's props. |
| Variants | Named by intent, defaulted, and declared once per platform (`variants()` on web, a token map on native). |
| Layout overrides | `className` (web) / `style` (native) on the root for **layout only**. Visual changes go through variants. |
| Money | Always `{ minor: number; currency: string }`. Never floats. Format with `formatMoney()` (Intl) at render. |
| Copy | Sentence case. Domain terms (Zakat, nisab, hawl, Sadaqah) are capitalised consistently. Shared copy lives in shared files. |
| Icons | Decorative by default. Pass `title` only for standalone meaningful icons. On native, icons inherit the enclosing component's text colour. |

## Scripts (run from the repo root)

| Script | What it does |
| --- | --- |
| `npm run dev` | Storybook with hot reload |
| `npm run ios` / `npm run android` / `npm run mobile` | Start the Expo demo app locally |
| `npm run publish:mobile` | Publish the demo app to the `preview` EAS Update channel (what the QR code opens) |
| `npm run tokens` | Regenerate `theme.css` and `tokens.generated.ts` from `tokens.json` |
| `npm run verify` | Token drift check, `tsc` for web **and** native, ESLint, Vitest (unit + axe + contrast + platform parity) |
| `npm run build` | Storybook + the native app's browser build (copied to `/native`) in `packages/design-system/storybook-static/` (what Vercel deploys) |
| `npm run build:lib` | Web bundle + `.d.ts` in `packages/design-system/dist/` |
| `npm run new:component -- Name [--group core\|banking]` | Scaffold a cross-platform component |

## Known limitations (deliberately out of scope)

- Component copy is English. Strings should move to props or an i18n layer before Arabic launch (layouts are already RTL-ready).
- Native components are verified by typecheck, a Metro bundle in CI and the demo app, not by automated tests yet. `jest-expo` with React Native Testing Library would be next.
- No visual regression testing yet (Chromatic for web would be the next CI step).
- Not published to a registry yet. `npm run build:lib` produces the web output; versioning is described in the architecture doc.
- Web consumers need Tailwind v4. Custom fonts (Inter, IBM Plex Sans Arabic) aren't bundled into the native app, which uses the system font.
