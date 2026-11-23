import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Feature } from '../features/catalogue';
import { useI18n } from '../i18n/context';
import { useSession } from '../session/context';
import { useRequireLogin } from '../session/useRequireLogin';
import { useTheme } from '../theme/useTheme';
import { Icon } from '../ui/Icon';

/**
 * One dashboard entry: icon, title, one-line description and badges ("Login required",
 * "Coming soon"). Login-only features send guests to login and back afterwards.
 */
export function FeatureCard({ feature }: { feature: Feature }) {
  const { t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { user } = useSession();
  const requireLogin = useRequireLogin();

  const needsLogin = feature.access === 'login' && !user;
  const soon = feature.availability === 'coming-soon';
  const badges = [needsLogin ? t.badgeLogin : null, soon ? t.badgeSoon : null].filter(
    (b): b is string => b !== null,
  );

  const open = () => {
    const go = () => {
      router.push(feature.href);
    };
    if (feature.access === 'login') requireLogin(go, feature.href);
    else go();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[t[feature.title], ...badges].join(', ')}
      accessibilityHint={t[feature.description]}
      onPress={open}
      style={styles.card}
      android_ripple={{ color: theme.surfaceMuted }}
      testID={`feature-${feature.id}`}
    >
      <View style={styles.icon}>
        <Icon name={feature.icon} color={theme.primary} size={24} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{t[feature.title]}</Text>
        <Text style={styles.description}>{t[feature.description]}</Text>
        {badges.length > 0 ? (
          <View style={styles.badges}>
            {needsLogin ? (
              <View style={styles.badge}>
                <Icon name="lock-closed" color={theme.textMuted} size={12} />
                <Text style={styles.badgeText}>{t.badgeLogin}</Text>
              </View>
            ) : null}
            {soon ? (
              <View style={styles.badge}>
                <Icon name="hourglass-outline" color={theme.info} size={12} />
                <Text style={[styles.badgeText, { color: theme.info }]}>{t.badgeSoon}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      <Icon name="chevron-forward" color={theme.textMuted} size={18} />
    </Pressable>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    card: {
      minHeight: minTouchTarget + 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    icon: {
      width: minTouchTarget,
      height: minTouchTarget,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, gap: spacing.xxs },
    title: { ...typography.bodyLarge, fontWeight: '600', color: theme.text },
    description: { ...typography.caption, color: theme.textMuted },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.pill,
      backgroundColor: theme.surfaceMuted,
    },
    badgeText: { ...typography.caption, fontWeight: '600', color: theme.textMuted },
  });
}
