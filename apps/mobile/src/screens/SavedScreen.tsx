import { getListing } from '@konkan/sample-data';
import type { SampleListing } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ListingCard } from '../components/listing';
import { useI18n } from '../i18n/context';
import { useSession } from '../session/context';
import { Button } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

function resolve(slugs: readonly string[]): SampleListing[] {
  return slugs.flatMap((slug) => {
    const listing = getListing(slug);
    return listing ? [listing] : [];
  });
}

export function SavedScreen() {
  const { t } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const { user, saved, recent } = useSession();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t.savedTitle}
      </Text>
      {!user ? (
        <View style={styles.card}>
          <Text style={styles.body}>{t.loginRequiredBody}</Text>
          <Button
            label={t.loginButton}
            onPress={() => {
              router.push({ pathname: '/auth/login', params: { next: '/saved' } });
            }}
          />
        </View>
      ) : saved.length === 0 ? (
        <Text style={styles.muted}>{t.savedEmpty}</Text>
      ) : (
        <View style={styles.list}>
          {resolve(saved).map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </View>
      )}

      <Text accessibilityRole="header" style={styles.heading}>
        {t.recentTitle}
      </Text>
      {recent.length === 0 ? (
        <Text style={styles.muted}>{t.recentEmpty}</Text>
      ) : (
        <View style={styles.list}>
          {resolve(recent).map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
