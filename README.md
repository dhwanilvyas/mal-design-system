# Mal Design System

A focused, production-minded foundation for Mal's products, on **web and React Native**: JSON design tokens, accessible components, a Storybook playground, and an Expo demo app. It is trustworthy, modern and minimal. Deep emerald is the brand colour, gold is a sparing accent, and warm "sand" neutrals keep it from feeling clinical. Light/dark themes and Arabic RTL work out of the box.

- **Live playground, web and native:** [mal-design-system.vercel.app](https://mal-design-system.vercel.app). Every story shows the web components; the **Native app** page runs the React Native components in a phone frame in the browser, plus real iOS screenshots
- **Native app on a device:** run it locally with Expo, see [below](#run-the-native-app-on-a-phone)
- **Architecture & trade-offs:** [below](#architecture--trade-offs): decisions, rollout, governance and measuring impact

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
- **Without installing anything:** the [Native app page](https://mal-design-system.vercel.app/?path=/docs/native-app-react-native--docs) of the playground runs the same native components in the browser.

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

Outputs are committed and checked for drift in CI (`npm run tokens:check`). Why Tailwind on web and `StyleSheet` on native is covered in [Architecture & trade-offs](#architecture--trade-offs).

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
| `npm run publish:mobile` | Publish the demo app to the `preview` EAS Update channel (opens in Expo Go for signed-in Expo project members) |
| `npm run tokens` | Regenerate `theme.css` and `tokens.generated.ts` from `tokens.json` |
| `npm run verify` | Token drift check, `tsc` for web **and** native, ESLint, Vitest (unit + axe + contrast + platform parity) |
| `npm run build` | Storybook + the native app's browser build (copied to `/native`) in `packages/design-system/storybook-static/` (what Vercel deploys) |
| `npm run build:lib` | Web bundle + `.d.ts` in `packages/design-system/dist/` |
| `npm run new:component -- Name [--group core\|banking]` | Scaffold a cross-platform component |

## Known limitations (deliberately out of scope)

- Component copy is English. Strings should move to props or an i18n layer before Arabic launch (layouts are already RTL-ready).
- Native components are verified by typecheck, a Metro bundle in CI and the demo app, not by automated tests yet. `jest-expo` with React Native Testing Library would be next.
- No visual regression testing yet (Chromatic for web would be the next CI step).
- Not published to a registry yet. `npm run build:lib` produces the web output; versioning is described [below](#3-scale--governance-10-components-5-product-teams).
- Web consumers need Tailwind v4. Custom fonts (Inter, IBM Plex Sans Arabic) aren't bundled into the native app, which uses the system font.

## Architecture & trade-offs

> **In one paragraph.** I built a small system that treats *constraints as the product*: tokens are the only values that compile, accessibility is enforced by tests rather than reviews, and the Mal-specific component (ZakatCalculator) is composed purely from system parts to prove the primitives hold up. The rollout plan makes the system speed up features already in flight rather than competing with them, and governance pushes policing into automation so the core team never becomes the bottleneck.

### 1. Decisions & trade-offs

#### Styling (web): Tailwind v4 over CSS-in-JS

| Criterion | Why it decided the choice |
| --- | --- |
| Runtime cost | Zero runtime. Runtime CSS-in-JS (Emotion, styled-components) serialises and injects styles during render. A banking app is used daily on mid-range phones, and we shouldn't spend that budget on styling. |
| Server components | No provider or context needed, so components work unchanged in Next.js App Router / RSC. Runtime CSS-in-JS needs client boundaries. |
| Theming | Tokens compile to CSS variables. Dark mode, a future Mal Premium/Business theme, or a light "island" inside a dark page is an attribute swap (`data-theme`) with no re-render, and it's readable by non-React code. |
| Governance | The decisive one. The token build **removes Tailwind's default palette and spacing scale**, so `bg-emerald-600` or `p-7` simply don't exist. "Use the tokens" goes from a review comment to a compile-time fact. |

**Costs I accepted:** long class strings (contained in one typed `variants()` map per component); no type-checking of class names; and class-conflict ambiguity on overrides. I chose *not* to ship `tailwind-merge`: `className` is for layout only and visual changes go through variants, which keeps the API narrow and makes "why does it look different?" answerable. **Runner-up:** vanilla-extract (zero-runtime and typed). I'd revisit it if typed style APIs became a priority, but it adds a build plugin to every consuming app.

**Native:** React Native's own `StyleSheet`, fed by the same generated tokens, with no extra dependencies or Babel plugins. Both platforms share the token values and the component contracts, not the styling syntax.

#### Token architecture

Authored once in **JSON (W3C DTCG format)**, the format Figma Variables export, so design and code can share one file and no platform owns the source. Two tiers: **primitives** (raw palette) → **semantic** (`brand`, `fg-muted`, `danger-subtle`) as aliases per theme. A ~200-line script compiles it to a Tailwind theme for web and typed TS values for native, fails if any theme misses a key, and has a `--check` mode in CI. Text/background pairs are asserted against WCAG 2.2 for *every* theme. That test caught input borders at 2.8:1 (below the 3:1 non-text minimum) during the build. I wrote the script instead of adopting Style Dictionary because it's one less tool at this size. I'd switch once there are more targets (Android XML, iOS Swift).

#### Cross-platform: one package, the right file per platform

Product apps may live in this repo or their own, on web or React Native, so the system is one npm package with two entries chosen by the bundler (see [One import, the right file for each platform](#one-import-the-right-file-for-each-platform)). Logic is written once in shared files: Zakat maths, validation, money formatting and screen-reader text. Lint blocks cross-platform imports, and a parity test fails if the two entries export different names. **Why not one universal implementation** (react-native-web, NativeWind)? Web would ship a native abstraction layer and lose semantic HTML, and NativeWind's Tailwind v4 support is young. Sharing tokens, contracts and logic gets most of the reuse with none of that risk. **Cost:** two render files per component.

#### Component API principles

- **Accessible by construction:** `InputField` can't be created without a `label`. Status is never colour-only. Transactions are announced as "Spent/Received AED 120.50", not "minus". The Zakat result uses a *debounced* polite live region so screen readers aren't spammed per keystroke. `<bdi>` isolates merchant names, a real RTL bug I found ("e&" reordering).
- **Banking correctness:** money is `{ minor, currency }` integers, never floats. Zakat maths is a pure, unit-tested function the Sharia team can review in isolation. Nisab is a prop, because it moves with the gold price and belongs to the backend.
- **Least surprise:** native props pass through, and buttons default to `type="button"`. `loading` uses `aria-disabled` so keyboard focus isn't lost mid-payment.

#### What I cut, and what I'd build next

**Cut to stay in scope**

- Translated component copy (layouts are RTL-ready; strings are English)
- Overlay components (Dialog, Select, Toast). Focus management is where DIY systems fail, so they deserve dedicated time.
- Visual regression, registry publishing, automated native component tests (native is covered by types, a CI bundle and the demo app)
- Arabic type ramp (Arabic needs more line height than Latin)

**With more time, in order**

1. Chromatic visual tests + Storybook test runner in CI
2. i18n of component strings + Arabic typography tokens, reviewed with a native-speaking designer
3. Figma Variables ↔ tokens.json sync (already DTCG, so it's an import/export job)
4. Dialog / Select / Toast on a shared focus and overlay layer
5. `jest-expo` tests for native components; Changesets + canary releases; adoption-tracking script (see §4)

### 2. Cross-functional rollout: 3 designers, 6 engineers, no feature freeze

The principle: **adoption has to make this sprint's feature faster, or it won't happen.** Nobody stops shipping to migrate. The system rides along with work already planned, and "done" means used in production, not merged into the library.

| When | Design | Engineering |
| --- | --- | --- |
| **Week 0** · Prepare | With the design lead: screenshot audit of live product (count of button styles, greys, radii). Agree token names; publish the Figma library with *identical* names to code. | Same audit in code (unique hex values, local Button copies). This gives us the **baseline for §4**. Pick a pilot: one squad, one in-flight UI feature (e.g. transaction history). |
| **Week 1** · Pilot | 45-min demo for all 9 people, framed around their pain points from the audit. The pilot designer hands off using library components and tokens. | I pair with the pilot engineers on their real ticket. Open `#design-system` channel; office hours twice a week. API pain gets fixed within 48h. Responsiveness is what earns trust. |
| **Week 2** · Ship & learn | Pilot ships. 30-min retro with design + eng. Designers start annotating handoffs with component names. | "New code uses the system" norm, enforced as an ESLint *warning* on new files only. Escape hatch: build locally with a `// ds-gap` comment we track, so the system never blocks a release. |
| **Weeks 3–4** · Spread | Second squad onboards. First design-led contribution (e.g. a Sharia-compliance badge) through the contribution process in §3. | One **champion engineer per squad** owns local questions. Day-30 review of metrics against the baseline, top `ds-gap` items become next month's roadmap. |

**What adoption looks like at day 30:** two features in production built on the system; all six engineers have merged at least one PR using it; 100% of new screens are designed from the Figma library; at least one contribution from outside the core; the lint rule moves from warn to error for new files, by agreement in the retro, not by decree. For product managers, the pitch is fewer design-QA rounds and faster UI tickets, measured as in §4. I'd ask for one squad's pilot time, not a roadmap slot.

**Risks:** "the system slows me down" (mitigated by the escape hatch plus the 48h fix SLA); designers diverging in Figma (mitigated by a weekly 30-min crit with a system lens); me as single point of failure (mitigated by champions plus documented contribution tiers from week 3).

### 3. Scale & governance: 10× components, 5 product teams

| What breaks | Response |
| --- | --- |
| Core team becomes the bottleneck | Federated contribution (below). The core team's job shifts from building everything to *platform*: tooling, review, docs. |
| One change ripples into 5 apps | Semver with Changesets; deprecate before removing (JSDoc `@deprecated` + dev-only console warning + codemod); at most one major per quarter, N-1 supported for 3 months. |
| Near-duplicate components | Status labels in Storybook (`alpha` · `beta` · `stable`), searchable RFCs, and the "two-team rule": incubate in the product, promote when a second team needs it. |
| Token sprawl | Add a component tier (`button-bg` → `brand`) only where themes diverge. Token changes require a design + eng approver. DTCG JSON synced with Figma Variables. |
| CI and review cost | Visual tests on changed stories only (TurboSnap), per-component bundle-size budgets, CODEOWNERS per component folder. |

**Versioning:** one package for web and native (simpler for consumers than 50 micro-packages, and one version can never mismatch across platforms). Tree-shakeable ESM, a changeset required on every PR, weekly release train, and canary builds from every PR so teams can test before merge.

**Documentation:** Storybook is the single source. Each component page has purpose, when *not* to use it, do/don't examples, keyboard and screen-reader behaviour, status and owner. Decisions are recorded as short ADRs in the repo. The changelog is generated from changesets.

**Contribution without bottlenecks** works through three tiers with clear service levels, so nobody waits on a meeting:

- **Tier 1, fixes / docs / variants within an existing API:** any engineer, one CODEOWNER review, 2-business-day SLA.
- **Tier 2, new component:** RFC issue (purpose, variants named by intent, states, keyboard, RTL). Async review for 3 days, then design + eng sign-off. Built with the scaffolder, which already includes stories, tests and an axe check.
- **Tier 3, tokens or breaking changes:** a design-system council (one designer + one engineer per team, rotating, 30 min every two weeks).

Automation does the policing: the default palette is removed, lint bans hex values, contrast and axe tests run, and visual diffs are checked. Human review can then focus on API and intent.

### 4. Measuring impact

| Metric | How it's measured | Signal and target |
| --- | --- | --- |
| **1. Adoption coverage** | Weekly CI job using `react-scanner` across product repos: share of rendered UI components imported from the system vs local. A companion count of hard-coded colours and arbitrary values in product CSS. | Leading indicator that the system is *chosen*. Target about 60% of components in new surfaces at 3 months and 85% at 6; hard-coded colours trending toward zero. |
| **2. UI delivery speed** | Cycle time (first commit to production) for UI-labelled tickets from Linear/Jira + GitHub, comparing system-built vs not on similar-sized tickets. Plus design-QA rounds per feature. | The business outcome. Hypothesis: a meaningful drop in cycle time and QA rounds within two quarters. Reviewed as a trend against the week-0 baseline, not a single number. |
| **3. Consistency & quality** | (a) Unique colour / font-size / radius values in shipped CSS, from a CSS-stats job on each production build. (b) axe violations on the top 10 flows via a nightly Playwright crawl. (c) Design-QA bugs tagged "inconsistency" or "a11y". | Unique values converge on the token count. Zero critical a11y violations on payment and onboarding flows. Inconsistency bugs per release trend down. |

**Guardrail:** median time-to-merge for outside contributions. If it rises, the system is becoming the bottleneck, and that triggers a governance review before adoption suffers. A short quarterly survey of the 9 users covers what numbers can't.
