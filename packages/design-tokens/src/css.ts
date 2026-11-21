import { themes } from './colors';
import type { ColorTheme } from './colors';

/** `surfaceMuted` -> `surface-muted` */
function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

/** CSS custom-property name for a colour token, e.g. `--color-surface-muted`. */
export function cssVariableName(token: keyof ColorTheme): `--color-${string}` {
  return `--color-${toKebabCase(token)}`;
}

/**
 * Render a theme as CSS custom-property declarations for the web and admin apps, e.g.
 * `:root { ${toCssVariables(themes.light)} }`.
 */
export function toCssVariables(theme: Readonly<ColorTheme>): string {
  return (Object.keys(theme) as (keyof ColorTheme)[])
    .map((token) => `${cssVariableName(token)}: ${theme[token]};`)
    .join('\n');
}

/**
 * Complete stylesheet for both colour schemes: light at `:root`, dark under
 * `prefers-color-scheme: dark`. Shared by the web and admin apps so themes cannot drift.
 */
export function toThemeStylesheet(
  light: Readonly<ColorTheme> = themes.light,
  dark: Readonly<ColorTheme> = themes.dark,
): string {
  return [
    `:root {\n${toCssVariables(light)}\n}`,
    `@media (prefers-color-scheme: dark) {\n:root {\n${toCssVariables(dark)}\n}\n}`,
  ].join('\n');
}
