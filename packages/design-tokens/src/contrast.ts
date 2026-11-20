/**
 * WCAG 2.x contrast utilities.
 * @see https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio
 */

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Minimum ratios for WCAG 2.2 level AA. */
export const WCAG_AA = {
  /** 1.4.3 Contrast (Minimum): normal-size text. */
  text: 4.5,
  /** 1.4.3: large text (>= 24px regular or >= 18.66px bold). */
  largeText: 3,
  /** 1.4.11 Non-text Contrast: UI component boundaries, focus indicators, icons. */
  nonText: 3,
} as const;

export function isHexColor(value: string): boolean {
  return HEX_COLOR.test(value);
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a `#rrggbb` colour, in [0, 1]. */
export function relativeLuminance(hex: string): number {
  if (!isHexColor(hex)) {
    throw new TypeError(`Expected a #rrggbb colour, got ${JSON.stringify(hex)}`);
  }
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** Contrast ratio between two colours, in [1, 21]. Order does not matter. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}
