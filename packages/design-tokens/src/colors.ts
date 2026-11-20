/**
 * Colour tokens.
 *
 * `palette` holds raw brand colours, inspired by the Konkan coast: sea teal, laterite stone,
 * coconut-palm green and sand neutrals. UI code must use the semantic `themes` tokens, never
 * the palette directly, so light/dark mode and contrast guarantees hold everywhere.
 *
 * Every text/background pairing below is verified against WCAG 2.2 AA in `colors.test.ts`.
 */

export const palette = {
  teal900: '#063f3f',
  teal700: '#0b6e6e',
  teal300: '#4fc1be',
  laterite700: '#a8401f',
  laterite300: '#f08a63',
  palm700: '#1e6b34',
  palm300: '#6dd58c',
  sand50: '#fbfaf7',
  sand100: '#f2efe8',
  sand300: '#d5d0c5',
  stone600: '#5a6169',
  stone500: '#767069',
  ink900: '#1b1f23',
  night900: '#111416',
  night800: '#1a1e21',
  night700: '#23282c',
  night600: '#343a40',
  white: '#ffffff',
} as const;

export interface ColorTheme {
  /** App/page background. */
  background: string;
  /** Cards, sheets, inputs. */
  surface: string;
  /** Subtle grouped areas (chips, list headers). */
  surfaceMuted: string;

  text: string;
  /** Secondary text. Still meets 4.5:1 on every surface. */
  textMuted: string;
  /** Text on `text`-coloured backgrounds (e.g. tooltips). */
  textInverse: string;

  /** Primary actions and links. */
  primary: string;
  onPrimary: string;
  /** Secondary emphasis (e.g. tourist-place highlights). */
  accent: string;
  onAccent: string;

  /** Decorative dividers only: NOT for input or control boundaries. */
  border: string;
  /** Input/control boundaries: meets 3:1 non-text contrast. */
  borderStrong: string;
  /** Keyboard focus indicator: meets 3:1 against all surfaces. */
  focusRing: string;

  success: string;
  warning: string;
  danger: string;
  info: string;
  /** "Verified listing" badge text/icon. */
  verified: string;
}

export type ColorToken = keyof ColorTheme;
export type ColorScheme = 'light' | 'dark';

const light: ColorTheme = {
  background: palette.sand50,
  surface: palette.white,
  surfaceMuted: palette.sand100,
  text: palette.ink900,
  textMuted: palette.stone600,
  textInverse: palette.white,
  primary: palette.teal700,
  onPrimary: palette.white,
  accent: palette.laterite700,
  onAccent: palette.white,
  border: palette.sand300,
  borderStrong: palette.stone500,
  focusRing: '#1a5fb4',
  success: palette.palm700,
  warning: '#8a5300',
  danger: '#b3261e',
  info: '#1a5fb4',
  verified: palette.palm700,
};

const dark: ColorTheme = {
  background: palette.night900,
  surface: palette.night800,
  surfaceMuted: palette.night700,
  text: '#eceef0',
  textMuted: '#a9b0b7',
  textInverse: palette.night900,
  primary: palette.teal300,
  onPrimary: palette.teal900,
  accent: palette.laterite300,
  onAccent: '#2a0c02',
  border: palette.night600,
  borderStrong: '#7d858d',
  focusRing: '#8ab4f8',
  success: palette.palm300,
  warning: '#f3b95f',
  danger: '#f2b8b5',
  info: '#8ab4f8',
  verified: palette.palm300,
};

export const themes: Readonly<Record<ColorScheme, Readonly<ColorTheme>>> = Object.freeze({
  light: Object.freeze(light),
  dark: Object.freeze(dark),
});
