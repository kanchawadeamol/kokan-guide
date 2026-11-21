import { toThemeStylesheet } from '@konkan/design-tokens';

/**
 * Inject the shared design-token stylesheet (light + dark CSS variables) once, before first
 * render. Components reference `var(--color-*)` only, never raw colours.
 */
export function installTheme(doc: Document = document): void {
  const id = 'konkan-theme';
  if (doc.getElementById(id)) return;
  const style = doc.createElement('style');
  style.id = id;
  style.textContent = toThemeStylesheet();
  doc.head.append(style);
}
