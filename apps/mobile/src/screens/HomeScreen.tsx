import { spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { LanguagePicker } from '../components/LanguagePicker';
import { ApiStatus } from '../features/system-status/ApiStatus';
import { useI18n } from '../i18n/context';
import { useTheme } from '../theme/useTheme';

export function HomeScreen() {
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text accessibilityRole="header" style={styles.heading}>
        {t.homeHeading}
      </Text>
      <Text style={styles.intro}>{t.homeIntro}</Text>
      <LanguagePicker />
      <ApiStatus />
    </ScrollView>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    heading: { ...typography.title, color: theme.text, marginBottom: spacing.sm },
    intro: { ...typography.body, color: theme.textMuted, marginBottom: spacing.xl },
  });
}
