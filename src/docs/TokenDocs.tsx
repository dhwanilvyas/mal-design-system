import { contrastPairs, radius, shadow, spacing, themes, typography, type SemanticColor } from '../tokens/tokens';
import { contrastRatio } from '../utils/contrast';

const groups: Record<string, SemanticColor[]> = {
  Surfaces: ['canvas', 'surface', 'surface-sunken', 'surface-hover'],
  Text: ['fg', 'fg-muted', 'fg-subtle', 'fg-inverse', 'fg-on-brand'],
  Borders: ['border', 'border-strong', 'border-focus'],
  Brand: ['brand', 'brand-hover', 'brand-active', 'brand-subtle', 'brand-fg'],
  Accent: ['accent', 'accent-subtle', 'accent-fg'],
  Feedback: ['success', 'success-subtle', 'success-fg', 'danger', 'danger-hover', 'danger-subtle', 'danger-fg', 'warning', 'warning-subtle', 'warning-fg'],
};

const mono = { fontFamily: typography.fontFamily.mono, fontSize: 12 };

export function ColorTokens() {
  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {Object.entries(groups).map(([group, names]) => (
        <section key={group}>
          <h3 style={{ margin: '0 0 8px' }}>{group}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'start' }}>
                <th style={{ textAlign: 'start' }}>Token</th>
                <th style={{ textAlign: 'start' }}>Tailwind</th>
                <th style={{ textAlign: 'start' }}>Light</th>
                <th style={{ textAlign: 'start' }}>Dark</th>
              </tr>
            </thead>
            <tbody>
              {names.map((n) => (
                <tr key={n}>
                  <td style={mono}>--color-{n}</td>
                  <td style={mono}>bg-{n} / text-{n}</td>
                  {(['light', 'dark'] as const).map((t) => (
                    <td key={t}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 28, height: 28, borderRadius: 6, background: themes[t][n], border: '1px solid rgb(0 0 0 / .12)' }} />
                        <code style={mono}>{themes[t][n]}</code>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

export function ContrastTable() {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'start' }}>Foreground / background</th>
          <th style={{ textAlign: 'start' }}>Required</th>
          <th style={{ textAlign: 'start' }}>Light</th>
          <th style={{ textAlign: 'start' }}>Dark</th>
        </tr>
      </thead>
      <tbody>
        {contrastPairs.map(({ fg, bg, min }) => (
          <tr key={`${fg}/${bg}`}>
            <td style={mono}>{fg} on {bg}</td>
            <td>{min}:1</td>
            {(['light', 'dark'] as const).map((t) => {
              const r = contrastRatio(themes[t][fg], themes[t][bg]);
              return (
                <td key={t}>
                  <span style={{ background: themes[t][bg], color: themes[t][fg], padding: '2px 8px', borderRadius: 4, marginInlineEnd: 8 }}>Aa</span>
                  {r.toFixed(2)}:1 {r >= min ? '✓' : '✗'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ScaleTokens() {
  return (
    <div style={{ display: 'grid', gap: 32 }}>
      <section>
        <h3>Type scale</h3>
        {Object.entries(typography.fontSize).map(([name, [size, lh]]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'baseline', gap: 16, margin: '8px 0' }}>
            <code style={{ ...mono, width: 120 }}>text-{name}</code>
            <span style={{ fontSize: size, lineHeight: lh, fontFamily: typography.fontFamily.sans }}>Zakat due · الزكاة المستحقة</span>
          </div>
        ))}
      </section>
      <section>
        <h3>Spacing (4px grid)</h3>
        {Object.entries(spacing).filter(([k]) => k !== 'px' && k !== '0').map(([name, value]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '4px 0' }}>
            <code style={{ ...mono, width: 120 }}>{name} · {value}</code>
            <span style={{ height: 12, width: value, background: themes.light.brand, borderRadius: 2 }} />
          </div>
        ))}
      </section>
      <section>
        <h3>Radius &amp; elevation</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {Object.entries(radius).map(([name, value]) => (
            <div key={name} style={{ width: 88, height: 64, borderRadius: value, background: themes.light['brand-subtle'], border: `1px solid ${themes.light.border}`, display: 'grid', placeItems: 'center', ...mono }}>
              {name}
            </div>
          ))}
          {Object.entries(shadow).map(([name, value]) => (
            <div key={name} style={{ width: 88, height: 64, borderRadius: 10, background: '#fff', boxShadow: value, display: 'grid', placeItems: 'center', ...mono }}>
              shadow-{name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
