import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '../theme/useTheme';

/** Shared styles built from design tokens for the current colour scheme. */
export function createSharedStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
    title: { ...typography.title, color: theme.text },
    heading: { ...typography.heading, color: theme.text },
    body: { ...typography.body, color: theme.text },
    muted: { ...typography.body, color: theme.textMuted },
    label: { ...typography.label, color: theme.text },
    caption: { ...typography.caption, color: theme.textMuted },
    card: {
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      gap: spacing.sm,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    list: { gap: spacing.md },
    grow: { flex: 1 },
    stack: { gap: spacing.sm },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    banner: {
      padding: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: theme.info,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceMuted,
    },
    touchable: { minHeight: minTouchTarget, justifyContent: 'center' },
    error: { ...typography.label, color: theme.danger },
  });
}

export type SharedStyles = ReturnType<typeof createSharedStyles>;

export function useSharedStyles(): { styles: SharedStyles; theme: Readonly<ColorTheme> } {
  const theme = useTheme();
  const styles = useMemo(() => createSharedStyles(theme), [theme]);
  return { styles, theme };
}
