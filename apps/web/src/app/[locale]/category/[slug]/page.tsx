import { getCategory, listCategories, listingsByCategory } from '@konkan/sample-data';
import { isLocale, LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs, ListingList } from '../../../../components/Listings';
import { SampleBanner } from '../../../../components/SampleBanner';
import styles from '../../../../components/ui.module.css';
import { listingsLabel, messages } from '../../../../i18n/messages';
import { SAMPLE_ROBOTS } from '../../../../lib/listing';
import { buildAlternates, getSiteUrl } from '../../../../lib/site';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    listCategories().map((category) => ({ locale, slug: category.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = getCategory(slug);
  if (!isLocale(locale) || !category) notFound();
  return {
    title: category.name[locale],
    description: category.description[locale],
    alternates: buildAlternates(getSiteUrl(), locale, `/category/${slug}`),
    robots: SAMPLE_ROBOTS,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  const category = getCategory(slug);
  if (!isLocale(locale) || !category) notFound();
  const t = messages[locale];
  const listings = listingsByCategory(slug);

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: category.name[locale] }]} />
      <h1>
        <span aria-hidden="true">{category.emoji} </span>
        {category.name[locale]}
      </h1>
      <p className={styles.muted}>{category.description[locale]}</p>
      <SampleBanner locale={locale} />
      {listings.length > 0 ? (
        <>
          <p className={styles.muted}>
            {listingsLabel(t, LOCALE_INFO[locale].bcp47, listings.length)}
          </p>
          <ListingList listings={listings} locale={locale} headingLevel={2} />
        </>
      ) : (
        <p>{t.emptyCategory}</p>
      )}
    </>
  );
}
