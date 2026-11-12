/**
 * Adoption probe: measures, in a running app, how much of the UI comes from the design system.
 *
 * Every web component stamps its root with `data-mal="Name"`. The probe counts those, and
 * counts interactive elements that have no system component above them (a hand-written
 * `<button>`, a raw `<input>`). Coverage = managed / (managed + unmanaged).
 *
 *   import { installMalProbe } from '@mal/design-system/probe';
 *   installMalProbe({ app: 'onboarding', report: (r) => analytics.track('ds.coverage', r) });
 *
 * It never blocks rendering: it runs in idle time, re-scans after DOM changes with a debounce,
 * and sends nothing while the tab is hidden. It is a metric, not a gate; lint and CI are the gates.
 */

export interface ProbeReport {
  app: string;
  /** `location.pathname` at scan time. */
  route: string;
  /** System components on the page, by name. */
  components: Record<string, number>;
  /** Interactive elements with no system component above them, by tag or role. */
  unmanaged: Record<string, number>;
  /** 0–1. `null` when the page has no interactive elements at all. */
  coverage: number | null;
  scannedAt: number;
}

export interface ProbeOptions {
  /** Name of the consuming app, so reports from different products can be compared. */
  app: string;
  /** Where the report goes: your analytics SDK, or a `sendBeacon` to an endpoint. */
  report: (report: ProbeReport) => void;
  /** Root to scan. Defaults to `document.body`. */
  root?: Element;
  /** Share of page loads that report, 0–1. Defaults to 1 (use e.g. 0.05 in production). */
  sampleRate?: number;
  /** Quiet period after the last DOM change before re-scanning, in ms. */
  debounceMs?: number;
}

const INTERACTIVE = 'button, input, select, textarea, a[href], [role="button"], [role="textbox"], [role="link"]';

/** One synchronous scan. Exported for tests and for ad-hoc use in the console. */
export function scan(root: Element, app = 'unknown'): ProbeReport {
  const components: Record<string, number> = {};
  for (const el of root.querySelectorAll<HTMLElement>('[data-mal]')) {
    const name = el.dataset.mal!;
    components[name] = (components[name] ?? 0) + 1;
  }

  const unmanaged: Record<string, number> = {};
  for (const el of root.querySelectorAll<HTMLElement>(INTERACTIVE)) {
    if (el.closest('[data-mal]')) continue;
    const key = el.getAttribute('role') ?? el.tagName.toLowerCase();
    unmanaged[key] = (unmanaged[key] ?? 0) + 1;
  }

  const managed = Object.values(components).reduce((a, b) => a + b, 0);
  const loose = Object.values(unmanaged).reduce((a, b) => a + b, 0);

  return {
    app,
    route: typeof location === 'undefined' ? '' : location.pathname,
    components,
    unmanaged,
    coverage: managed + loose === 0 ? null : managed / (managed + loose),
    scannedAt: Date.now(),
  };
}

/** Starts observing the page. Returns a function that stops it. */
export function installMalProbe({ app, report, root, sampleRate = 1, debounceMs = 1000 }: ProbeOptions): () => void {
  if (typeof document === 'undefined' || Math.random() >= sampleRate) return () => {};

  const target = root ?? document.body;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let idle: number | undefined;
  const lastSent = new Map<string, string>();

  const run = () => {
    if (document.visibilityState === 'hidden') return;
    const result = scan(target, app);
    // One report per route unless the counts changed, so SPA navigation is covered without spam.
    const signature = JSON.stringify([result.components, result.unmanaged]);
    if (lastSent.get(result.route) === signature) return;
    lastSent.set(result.route, signature);
    report(result);
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof requestIdleCallback === 'function') idle = requestIdleCallback(run, { timeout: 2000 });
      else run();
    }, debounceMs);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(target, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-mal', 'role'] });
  schedule();

  return () => {
    observer.disconnect();
    clearTimeout(timer);
    if (idle !== undefined && typeof cancelIdleCallback === 'function') cancelIdleCallback(idle);
  };
}
