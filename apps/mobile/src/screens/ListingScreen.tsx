import { getCategory, getListing } from '@konkan/sample-data';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { HoursTable, OpenBadge, placeLine } from '../components/listing';
import { useI18n } from '../i18n/context';
import { useSession } from '../session/context';
import { useRequireLogin } from '../session/useRequireLogin';
import { Button, SampleBanner, StatusBadge } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

export function ListingScreen({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const { isSaved, toggleSaved, addRecent } = useSession();
  const requireLogin = useRequireLogin();
  const listing = getListing(slug);

  useEffect(() => {
    if (listing) addRecent(listing.slug);
  }, [listing, addRecent]);

  if (!listing) return null;
  const category = getCategory(listing.categorySlug);
  const saved = isSaved(listing.slug);
  const here = `/listing/${listing.slug}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: category?.name[locale] ?? '' }} />
      <View style={styles.stack}>
        <Text accessibilityRole="header" style={styles.title}>
          {listing.name[locale]}
        </Text>
        <Text style={styles.muted}>
          {category?.name[locale]} · {placeLine(listing, locale)}
        </Text>
        <View style={styles.wrap}>
          <StatusBadge status={listing.verification} />
          <OpenBadge hours={listing.hours} />
        </View>
      </View>

      <Button
        label={saved ? t.savedListing : t.saveListing}
        icon={saved ? 'heart' : 'heart-outline'}
        variant="secondary"
        onPress={() => {
          requireLogin(() => {
            toggleSaved(listing.slug);
          }, here);
        }}
        testID="save-button"
      />

      <SampleBanner />

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>
          {t.aboutHeading}
        </Text>
        <Text style={styles.body}>{listing.description[locale]}</Text>
        {listing.kind === 'public-landmark' ? (
          <Text style={styles.muted}>{t.landmarkNote}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>
          {t.addressHeading}
        </Text>
        {listing.addressLine ? (
          <Text style={styles.body}>{listing.addressLine[locale]}</Text>
        ) : null}
        <Text style={styles.body}>{placeLine(listing, locale)}</Text>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>
          {t.hoursHeading}
        </Text>
        {listing.hours ? (
          <HoursTable hours={listing.hours} />
        ) : (
          <Text style={styles.muted}>{t.hoursUnknown}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>
          {t.contactHeading}
        </Text>
        {listing.phone ? (
          <Text style={styles.heading}>{listing.phone}</Text>
        ) : (
          <Text style={styles.muted}>{t.noContact}</Text>
        )}
        {listing.phone ? (
          <Button label={t.call} icon="call" disabled hint={t.disabledInPreview} />
        ) : null}
        {listing.hasWhatsApp ? (
          <Button label={t.whatsapp} icon="logo-whatsapp" disabled hint={t.disabledInPreview} />
        ) : null}
        <Button label={t.directions} icon="navigate" disabled hint={t.disabledInPreview} />
      </View>

      <Button
        label={t.writeReview}
        icon="star-outline"
        variant="secondary"
        onPress={() => {
          requireLogin(() => {
            router.push(`/review/${listing.slug}`);
          }, `/review/${listing.slug}`);
        }}
        testID="review-button"
      />
      <Button
        label={t.reportIncorrect}
        icon="flag-outline"
        variant="ghost"
        onPress={() => {
          requireLogin(() => {
            router.push(`/report/${listing.slug}`);
          }, `/report/${listing.slug}`);
        }}
        testID="report-button"
      />
    </ScrollView>
  );
}
