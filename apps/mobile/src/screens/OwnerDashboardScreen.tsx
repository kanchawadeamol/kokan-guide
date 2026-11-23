import { radius, spacing, typography } from '@konkan/design-tokens';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/context';
import { Button, Notice } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

/** Clearly-labelled sample analytics; real counts come from ListingAnalytics (Sprint 8). */
const SAMPLE_STATS = { views: 128, calls: 23, whatsapp: 17 } as const;

/**
 * Business owner dashboard. Login only: the route wraps it in `LoginGate`.
 * Preview with sample numbers until Sprint 8.
 */
export function OwnerDashboardScreen() {
  const { t } = useI18n();
  const { styles, theme } = useSharedStyles();
  const router = useRouter();
  const stats = [
    { label: t.statViews, value: SAMPLE_STATS.views },
    { label: t.statCalls, value: SAMPLE_STATS.calls },
    { label: t.statWhatsapp, value: SAMPLE_STATS.whatsapp },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        {t.ownerTitle}
      </Text>
      <Text style={styles.muted}>{t.ownerIntro}</Text>

      <Text accessibilityRole="header" style={styles.heading}>
        {t.statPeriod}
      </Text>
      <View style={local.stats}>
        {stats.map((stat) => (
          <View
            key={stat.label}
            style={[local.stat, { backgroundColor: theme.surface, borderColor: theme.border }]}
            accessible
            accessibilityLabel={`${stat.label}: ${stat.value}`}
          >
            <Text style={[local.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={styles.caption}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <Notice>{t.sampleStatsNote}</Notice>

      <Text accessibilityRole="header" style={styles.heading}>
        {t.myListings}
      </Text>
      <Text style={styles.muted}>{t.noListingsYet}</Text>
      <Button
        label={t.featureRegister}
        icon="storefront-outline"
        onPress={() => {
          router.push('/business/new');
        }}
        testID="owner-register"
      />
    </ScrollView>
  );
}

const local = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    flexGrow: 1,
    flexBasis: '30%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.xxs,
  },
  statValue: { ...typography.title },
});
