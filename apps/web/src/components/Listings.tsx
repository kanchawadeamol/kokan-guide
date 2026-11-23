import { listingsByCategory } from '@konkan/sample-data';
import type { SampleCategory, SampleListing } from '@konkan/sample-data';
import { LOCALE_INFO } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import Link from 'next/link';

import { listingsLabel, messages } from '../i18n/messages';
import { categoryName, placeLine, routes, verificationLabel } from '../lib/listing';
import { OpenStatusBadge } from './OpenStatusBadge';
import styles from './ui.module.css';

const badgeClass = {
  verified: styles.badgeVerified,
  pending: styles.badgePending,
  unverified: styles.badgeUnverified,
} as const;

export function VerificationBadge({ listing, locale }: { listing: SampleListing; locale: Locale }) {
  const t = messages[locale];
  const icon =
    listing.verification === 'verified' ? '✓' : listing.verification === 'pending' ? '…' : '○';
  return (
    <span className={badgeClass[listing.verification]}>
      <span aria-hidden="true">{icon}</span>
      {t[verificationLabel[listing.verification]]}
    </span>
  );
}

export function CategoryGrid({
  categories,
  locale,
}: {
  categories: readonly SampleCategory[];
  locale: Locale;
}) {
  const t = messages[locale];
  return (
    <ul className={styles.categoryGrid}>
      {categories.map((category) => {
        const count = listingsByCategory(category.slug).length;
        return (
          <li key={category.slug}>
            <Link href={routes.category(locale, category.slug)} className={styles.categoryCard}>
              <span aria-hidden="true" className={styles.categoryEmoji}>
                {category.emoji}
              </span>
              <span>{category.name[locale]}</span>
              <span className={styles.muted}>
                {listingsLabel(t, LOCALE_INFO[locale].bcp47, count)}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Card for one listing. The heading link is the single focus stop (no nested links). */
export function ListingCard({
  listing,
  locale,
  headingLevel = 3,
}: {
  listing: SampleListing;
  locale: Locale;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className={styles.card}>
      <Heading className={styles.cardTitle}>
        <Link href={routes.listing(locale, listing.slug)}>{listing.name[locale]}</Link>
      </Heading>
      <p className={styles.cardMeta}>
        {categoryName(listing, locale)} · {placeLine(listing, locale)}
      </p>
      <p className={styles.cardMeta}>{listing.description[locale]}</p>
      <div className={styles.badges}>
        <VerificationBadge listing={listing} locale={locale} />
        <OpenStatusBadge hours={listing.hours} locale={locale} />
      </div>
    </article>
  );
}

export function ListingList({
  listings,
  locale,
  headingLevel,
}: {
  listings: readonly SampleListing[];
  locale: Locale;
  headingLevel?: 2 | 3;
}) {
  return (
    <ul className={styles.cardList}>
      {listings.map((listing) => (
        <li key={listing.slug}>
          <ListingCard
            listing={listing}
            locale={locale}
            {...(headingLevel ? { headingLevel } : {})}
          />
        </li>
      ))}
    </ul>
  );
}

export function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale;
  items: readonly { label: string; href?: string }[];
}) {
  const t = messages[locale];
  return (
    <nav aria-label={t.breadcrumbLabel} className={styles.breadcrumbs}>
      <ol>
        <li>
          <Link href={routes.home(locale)}>{t.home}</Link>
        </li>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
