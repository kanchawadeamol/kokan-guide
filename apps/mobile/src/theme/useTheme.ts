import { themes } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { useColorScheme } from 'react-native';

/** Semantic colour tokens for the current OS appearance (light/dark). */
export function useTheme(): Readonly<ColorTheme> {
  const scheme = useColorScheme();
  return scheme === 'dark' ? themes.dark : themes.light;
}
