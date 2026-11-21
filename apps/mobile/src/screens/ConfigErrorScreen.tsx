import { spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { resolveLocale } from '@konkan/shared-types';
import { getLocales } from 'expo-localization';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { messages } from '../i18n/messages';
import { useTheme } from '../theme/useTheme';

/**
 * Shown instead of crashing when the build has no valid API URL. Technical details go to the
 * developer console only; users get a localized, actionable message.
 */
export function ConfigErrorScreen({ reason }: { reason: string }) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const t = messages[resolveLocale(getLocales().map((l) => l.languageTag))];
  if (__DEV__) console.error(`Configuration error: ${reason}`);

  return (
    <View style={styles.screen}>
      <Text accessibilityRole="alert" style={styles.text}>
        {t.configError}
      </Text>
    </View>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      backgroundColor: theme.background,
    },
    text: { ...typography.bodyLarge, textAlign: 'center', color: theme.danger },
  });
}
