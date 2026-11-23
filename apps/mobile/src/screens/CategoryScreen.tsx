import { getCategory, listingsByCategory } from '@konkan/sample-data';
import { LOCALE_INFO } from '@konkan/shared-types';
import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ListingCard } from '../components/listing';
import { useI18n } from '../i18n/context';
import { listingsLabel } from '../i18n/messages';
import { SampleBanner } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

export function CategoryScreen({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const category = getCategory(slug);
  const listings = listingsByCategory(slug);

  if (!category) return null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: category.name[locale] }} />
      <Text accessibilityRole="header" style={styles.title}>
        {category.name[locale]}
      </Text>
      <Text style={styles.muted}>{category.description[locale]}</Text>
      <SampleBanner />
      {listings.length > 0 ? (
        <View style={styles.list}>
          <Text style={styles.caption}>
            {listingsLabel(t, LOCALE_INFO[locale].bcp47, listings.length)}
          </Text>
          {listings.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </View>
      ) : (
        <Text style={styles.body}>{t.emptyCategory}</Text>
      )}
    </ScrollView>
  );
}
