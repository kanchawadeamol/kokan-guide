import { themes, toCssVariables } from '@konkan/design-tokens';

/**
 * CSS custom properties for both colour schemes. Light is the default; dark applies when the
 * OS prefers it. Components reference `var(--color-*)` only, never raw colours.
 */
export function buildThemeCss(): string {
  return [
    `:root {\n${toCssVariables(themes.light)}\n}`,
    `@media (prefers-color-scheme: dark) {\n:root {\n${toCssVariables(themes.dark)}\n}\n}`,
  ].join('\n');
}

/** Inject the theme once, before first render. */
export function installTheme(doc: Document = document): void {
  const id = 'konkan-theme';
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = buildThemeCss();
  doc.head.append(style);
}
