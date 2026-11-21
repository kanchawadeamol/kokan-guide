import { describe, expect, it } from 'vitest';

import { cssVariableName, toCssVariables, toThemeStylesheet } from './css';
import { themes } from './colors';
import { minTouchTarget, motion, spacing, typography } from './scales';

function isStrictlyIncreasing(values: readonly number[]): boolean {
  return values.every((value, i) => i === 0 || value > (values[i - 1] ?? -Infinity));
}

describe('spacing', () => {
  it('is strictly increasing and on a 2px grid', () => {
    const values = Object.values(spacing);
    expect(isStrictlyIncreasing(values)).toBe(true);
    for (const value of values) expect(value % 2).toBe(0);
  });
});

describe('typography', () => {
  it.each(Object.entries(typography))(
    '%s line height is at least 1.35x font size (Devanagari)',
    (_name, style) => {
      expect(style.lineHeight / style.fontSize).toBeGreaterThanOrEqual(1.35);
    },
  );

  it('body text is at least 16px', () => {
    expect(typography.body.fontSize).toBeGreaterThanOrEqual(16);
  });
});

describe('accessibility constants', () => {
  it('touch targets meet platform guidance (>= 48) and WCAG 2.5.8 (>= 24)', () => {
    expect(minTouchTarget).toBeGreaterThanOrEqual(48);
  });

  it('reduced motion disables animation', () => {
    expect(motion.reduced).toBe(0);
  });
});

describe('toCssVariables', () => {
  it('emits one kebab-case custom property per token', () => {
    const css = toCssVariables(themes.light);

    expect(css.split('\n')).toHaveLength(Object.keys(themes.light).length);
    expect(css).toContain(`--color-surface-muted: ${themes.light.surfaceMuted};`);
    expect(css).toContain(`--color-on-primary: ${themes.light.onPrimary};`);
  });

  it('names variables consistently', () => {
    expect(cssVariableName('focusRing')).toBe('--color-focus-ring');
  });
});

describe('toThemeStylesheet', () => {
  it('puts light at :root and dark under prefers-color-scheme', () => {
    const css = toThemeStylesheet();
    const [lightPart, darkPart] = css.split('@media (prefers-color-scheme: dark)');

    expect(lightPart).toMatch(/^:root \{/);
    expect(lightPart).toContain(`--color-background: ${themes.light.background};`);
    expect(darkPart).toContain(`--color-background: ${themes.dark.background};`);
  });
});
