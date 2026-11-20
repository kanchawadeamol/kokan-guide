import { describe, expect, it } from 'vitest';

import { palette, themes } from './colors';
import type { ColorScheme, ColorTheme, ColorToken } from './colors';
import { contrastRatio, isHexColor, WCAG_AA } from './contrast';

const schemes = Object.keys(themes) as ColorScheme[];

type Pair = readonly [foreground: ColorToken, background: ColorToken];

const SURFACES: readonly ColorToken[] = ['background', 'surface', 'surfaceMuted'];

/** Tokens used as normal-size text on any surface: must meet 4.5:1. */
const TEXT_ON_SURFACES: readonly ColorToken[] = [
  'text',
  'textMuted',
  'primary', // links
  'success',
  'warning',
  'danger',
  'info',
  'verified',
];

const TEXT_PAIRS: readonly Pair[] = [
  ...TEXT_ON_SURFACES.flatMap((fg) => SURFACES.map((bg) => [fg, bg] as const)),
  ['onPrimary', 'primary'],
  ['onAccent', 'accent'],
  ['textInverse', 'text'],
];

/** Non-text UI (control boundaries, focus indicator, filled buttons): must meet 3:1. */
const NON_TEXT_PAIRS: readonly Pair[] = [
  ...SURFACES.map((bg) => ['borderStrong', bg] as const),
  ...SURFACES.map((bg) => ['focusRing', bg] as const),
  ...SURFACES.map((bg) => ['primary', bg] as const),
  ...SURFACES.map((bg) => ['accent', bg] as const),
];

function ratio(theme: Readonly<ColorTheme>, [fg, bg]: Pair): number {
  return contrastRatio(theme[fg], theme[bg]);
}

describe.each(schemes)('%s theme', (scheme) => {
  const theme = themes[scheme];

  it('contains only valid #rrggbb colours', () => {
    for (const value of Object.values(theme)) {
      expect(isHexColor(value), value).toBe(true);
    }
  });

  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA text contrast (4.5:1)', (fg, bg) => {
    expect(ratio(theme, [fg, bg])).toBeGreaterThanOrEqual(WCAG_AA.text);
  });

  it.each(NON_TEXT_PAIRS)('%s against %s meets WCAG non-text contrast (3:1)', (fg, bg) => {
    expect(ratio(theme, [fg, bg])).toBeGreaterThanOrEqual(WCAG_AA.nonText);
  });
});

describe('themes', () => {
  it('light and dark define exactly the same tokens', () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort());
  });

  it('are frozen so apps cannot mutate shared tokens at runtime', () => {
    expect(Object.isFrozen(themes)).toBe(true);
    expect(Object.isFrozen(themes.light)).toBe(true);
    expect(Object.isFrozen(themes.dark)).toBe(true);
  });

  it('palette contains only valid colours', () => {
    for (const value of Object.values(palette)) {
      expect(isHexColor(value), value).toBe(true);
    }
  });
});
