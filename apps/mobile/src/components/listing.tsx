import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import {
  getCategory,
  getPlace,
  isAllDay,
  listingsByCategory,
  openStatus,
} from '@konkan/sample-data';
import type { OpeningPeriod, SampleCategory, SampleListing } from '@konkan/sample-data';
import { LOCALE_INFO } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/context';
import { listingsLabel } from '../i18n/messages';
import { useTheme } from '../theme/useTheme';
import { StatusBadge } from '../ui/controls';
import { Icon } from '../ui/Icon';

export function placeLine(listing: SampleListing, locale: Locale): string {
  const place = getPlace(listing.placeSlug);
  return place ? `${place.name[locale]}, ${place.districtName[locale]}` : '';
}

function useStyles() {
  const theme = useTheme();
  return useMemo(() => ({ theme, styles: createStyles(theme) }), [theme]);
}

export function CategoryTile({ category }: { category: SampleCategory }) {
  const { locale, t } = useI18n();
  const { theme, styles } = useStyles();
  const count = listingsByCategory(category.slug).length;
  return (
    <Link href={`/category/${category.slug}`} asChild>
      <Pressable
        accessibilityLabel={`${category.name[locale]}, ${listingsLabel(t, LOCALE_INFO[locale].bcp47, count)}`}
        // Static style: Link asChild does not forward Pressable style functions.
        style={styles.tile}
        android_ripple={{ color: theme.surfaceMuted }}
        testID={`category-${category.slug}`}
      >
        <View style={styles.tileIcon}>
          <Icon name={category.icon} color={theme.primary} size={26} />
        </View>
        <Text style={styles.tileLabel} numberOfLines={2}>
          {category.name[locale]}
        </Text>
      </Pressable>
    </Link>
  );
}

/** Live "Open now" / "Closed now"; nothing when hours are unknown (never guessed). */
export function OpenBadge({ hours }: { hours: readonly OpeningPeriod[] | null }) {
  const { t } = useI18n();
  const { theme, styles } = useStyles();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const status = openStatus(hours, now);
  if (status === 'unknown') return null;
  const color = status === 'open' ? theme.success : theme.danger;
  return (
    <View style={styles.badge}>
      <Icon name="ellipse" color={color} size={10} />
      <Text style={[styles.badgeText, { color }]}>
        {status === 'open' ? t.openNow : t.closedNow}
      </Text>
    </View>
  );
}

export function ListingCard({ listing }: { listing: SampleListing }) {
  const { locale } = useI18n();
  const { theme, styles } = useStyles();
  const category = getCategory(listing.categorySlug);
  return (
    <Link href={`/listing/${listing.slug}`} asChild>
      <Pressable
        accessibilityLabel={`${listing.name[locale]}, ${category?.name[locale] ?? ''}, ${placeLine(listing, locale)}`}
        style={styles.card}
        android_ripple={{ color: theme.surfaceMuted }}
        testID={`listing-${listing.slug}`}
      >
        <View style={styles.cardIcon}>
          <Icon name={category?.icon ?? 'business'} color={theme.primary} size={24} />
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{listing.name[locale]}</Text>
          <Text style={styles.cardMeta}>
            {category?.name[locale]} · {placeLine(listing, locale)}
          </Text>
          <View style={styles.badges}>
            <StatusBadge status={listing.verification} />
            <OpenBadge hours={listing.hours} />
          </View>
        </View>
        <Icon name="chevron-forward" color={theme.textMuted} size={20} />
      </Pressable>
    </Link>
  );
}

const WEEK: readonly OpeningPeriod['day'][] = [1, 2, 3, 4, 5, 6, 0];

export function weekdayName(day: number, locale: Locale): string {
  const date = new Date(Date.UTC(2026, 10, 22 + day, 12)); // 2026-11-22 is a Sunday
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].bcp47, {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
}

export function HoursTable({ hours }: { hours: readonly OpeningPeriod[] }) {
  const { locale, t } = useI18n();
  const { styles } = useStyles();
  return (
    <View>
      {WEEK.map((day) => {
        const periods = hours.filter((p) => p.day === day);
        const text =
          periods.length === 0
            ? t.closed
            : periods.map((p) => (isAllDay(p) ? t.open24h : `${p.open}–${p.close}`)).join(', ');
        return (
          <View
            key={day}
            style={styles.hoursRow}
            accessible
            accessibilityLabel={`${weekdayName(day, locale)}: ${text}`}
          >
            <Text style={styles.hoursDay}>{weekdayName(day, locale)}</Text>
            <Text style={styles.hoursTime}>{text}</Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    tile: {
      flexBasis: '30%',
      flexGrow: 1,
      minHeight: 104,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    tileIcon: {
      width: minTouchTarget,
      height: minTouchTarget,
      borderRadius: radius.pill,
      backgroundColor: theme.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileLabel: { ...typography.label, color: theme.text, textAlign: 'center' },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    cardIcon: {
      width: minTouchTarget,
      height: minTouchTarget,
      borderRadius: radius.md,
      backgroundColor: theme.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: { flex: 1, gap: spacing.xs },
    cardTitle: { ...typography.bodyLarge, fontWeight: '600', color: theme.text },
    cardMeta: { ...typography.caption, color: theme.textMuted },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: theme.surfaceMuted,
    },
    badgeText: { ...typography.caption, fontWeight: '600' },
    hoursRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    hoursDay: { ...typography.body, color: theme.text },
    hoursTime: { ...typography.body, color: theme.text, fontWeight: '600' },
  });
}
