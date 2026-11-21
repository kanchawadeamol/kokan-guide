import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../../i18n/context';
import { useTheme } from '../../theme/useTheme';
import { useReadiness } from './useReadiness';

export function ApiStatus() {
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { state, refresh } = useReadiness();
  const loading = state.kind === 'loading';

  // Status is conveyed by text (and an icon), never colour alone.
  const summary = {
    loading: { text: t.statusChecking, icon: '', style: styles.neutral },
    ready: { text: t.statusReady, icon: '✓', style: styles.ok },
    unavailable: { text: t.statusUnavailable, icon: '!', style: styles.fail },
    unreachable: { text: t.statusUnreachable, icon: '✕', style: styles.fail },
  }[state.kind];

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>
        {t.systemStatusTitle}
      </Text>
      {/* Live region: TalkBack announces status changes without moving focus. */}
      <Text
        accessibilityLiveRegion="polite"
        testID="api-status"
        style={[styles.summary, summary.style]}
      >
        {summary.icon ? <Text importantForAccessibility="no">{`${summary.icon} `}</Text> : null}
        {summary.text}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: loading }}
        onPress={() => {
          if (!loading) refresh();
        }}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        testID="api-status-retry"
      >
        <Text style={styles.buttonText}>{t.retry}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    card: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    title: { ...typography.heading, color: theme.text, marginBottom: spacing.sm },
    summary: { ...typography.body, fontWeight: '600' },
    neutral: { color: theme.textMuted },
    ok: { color: theme.success },
    fail: { color: theme.danger },
    button: {
      marginTop: spacing.lg,
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    },
    buttonPressed: { opacity: 0.85 },
    buttonText: { ...typography.label, color: theme.onPrimary },
  });
}
