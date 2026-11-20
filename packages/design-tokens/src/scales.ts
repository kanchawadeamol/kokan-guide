/**
 * Spacing, radius, typography, layout and motion tokens.
 * Numeric values are density-independent pixels (React Native) / CSS px (web).
 */

/** 4-point spacing scale. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 9999,
} as const;

/**
 * Font stacks. Noto Sans has matching Devanagari coverage, so Marathi and Hindi render with
 * consistent metrics next to English. Apps must load both families.
 */
export const fontFamily = {
  sans: ['Noto Sans', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
  mono: ['Noto Sans Mono', 'ui-monospace', 'monospace'],
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/**
 * Type scale. Line heights are generous (>= 1.5x for body) because Devanagari has tall
 * ascenders, matras and conjuncts that clip with Latin-tuned line heights. Text must still
 * scale with the user's OS font size; these are base sizes, never fixed caps.
 */
export const typography = {
  display: { fontSize: 32, lineHeight: 44, fontWeight: fontWeight.bold },
  title: { fontSize: 24, lineHeight: 34, fontWeight: fontWeight.semibold },
  heading: { fontSize: 20, lineHeight: 30, fontWeight: fontWeight.semibold },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: fontWeight.regular },
  body: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular },
  label: { fontSize: 14, lineHeight: 22, fontWeight: fontWeight.medium },
  caption: { fontSize: 13, lineHeight: 20, fontWeight: fontWeight.regular },
} as const;

export type TypographyVariant = keyof typeof typography;

/**
 * Minimum touch/pointer target. WCAG 2.2 SC 2.5.8 requires 24px; Android and Apple guidance
 * recommend 48dp / 44pt. We use 48 everywhere.
 */
export const minTouchTarget = 48;

/** Focus indicator geometry (WCAG 2.2 SC 2.4.7 / 2.4.13). */
export const focusRing = {
  width: 2,
  offset: 2,
} as const;

/** Web/admin layout breakpoints (min-width, px). */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Motion durations (ms). When the user prefers reduced motion, use `motion.reduced` (0):
 * no animated transitions, only instant state changes.
 */
export const motion = {
  fast: 120,
  normal: 200,
  slow: 320,
  reduced: 0,
} as const;
