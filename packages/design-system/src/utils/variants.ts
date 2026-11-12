import { cx } from './cx';

/**
 * A ~25-line, fully typed alternative to `class-variance-authority`.
 * Each component declares its variant → class map once; the resulting
 * function is the only place variant styling lives.
 */
type VariantConfig = Record<string, Record<string, string>>;

type VariantSelection<V extends VariantConfig> = { [K in keyof V]?: keyof V[K] };

export function variants<V extends VariantConfig>(config: {
  base: string;
  variants: V;
  defaults: { [K in keyof V]: keyof V[K] };
  compound?: Array<VariantSelection<V> & { className: string }>;
}) {
  return (selection: VariantSelection<V> = {}, className?: string): string => {
    const resolved = { ...config.defaults, ...stripUndefined(selection) } as { [K in keyof V]: keyof V[K] };
    const variantClasses = Object.keys(config.variants).map(
      (name) => config.variants[name]?.[resolved[name] as string],
    );
    const compoundClasses = (config.compound ?? [])
      .filter((rule) =>
        Object.entries(rule).every(([k, v]) => k === 'className' || resolved[k] === v),
      )
      .map((c) => c.className);
    return cx(config.base, ...variantClasses, ...compoundClasses, className);
  };
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
