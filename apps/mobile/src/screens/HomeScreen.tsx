import { radius, spacing } from '@konkan/design-tokens';
import { listCategories, popularListings } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FeatureCard } from '../components/FeatureCard';
import { CategoryTile, ListingCard } from '../components/listing';
import { FEATURES } from '../features/catalogue';
import { useI18n } from '../i18n/context';
import { SampleBanner } from '../ui/controls';
import { Icon } from '../ui/Icon';
import { useSharedStyles } from '../ui/styles';

export function HomeScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { styles, theme } = useSharedStyles();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={[local.hero, { backgroundColor: theme.primary }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: theme.onPrimary }]}>
          {t.homeHeading}
        </Text>
        <Text style={[styles.body, { color: theme.onPrimary }]}>{t.homeIntro}</Text>
        <Pressable
          accessibilityRole="search"
          accessibilityLabel={t.searchLabel}
          accessibilityHint={t.searchPlaceholder}
          onPress={() => {
            router.push('/search');
          }}
          style={[
            local.searchBox,
            { backgroundColor: theme.surface, borderColor: theme.borderStrong },
          ]}
          testID="home-search"
        >
          <Icon name="search" color={theme.textMuted} />
          <Text style={styles.muted}>{t.searchPlaceholder}</Text>
        </Pressable>
      </View>

      <SampleBanner />

      {/* Dashboard: every feature with a short description and its access badge. */}
      <Text accessibilityRole="header" style={styles.heading}>
        {t.exploreHeading}
      </Text>
      <View style={local.list}>
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.heading}>
        {t.categoriesHeading}
      </Text>
      <View style={local.grid}>
        {listCategories().map((category) => (
          <CategoryTile key={category.slug} category={category} />
        ))}
      </View>

      <Text accessibilityRole="header" style={styles.heading}>
        {t.popularHeading}
      </Text>
      <View style={local.list}>
        {popularListings().map((listing) => (
          <ListingCard key={listing.slug} listing={listing} />
        ))}
      </View>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  searchBox: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  list: { gap: spacing.md },
});
