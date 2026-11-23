import { searchListings } from '@konkan/sample-data';
import { isLocale } from '@konkan/shared-types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs, ListingList } from '../../../components/Listings';
import { SampleBanner } from '../../../components/SampleBanner';
import { SearchForm } from '../../../components/SearchForm';
import styles from '../../../components/ui.module.css';
import { format, messages } from '../../../i18n/messages';
import { SAMPLE_ROBOTS } from '../../../lib/listing';
import { buildAlternates, getSiteUrl } from '../../../lib/site';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    title: messages[locale].searchHeading,
    alternates: buildAlternates(getSiteUrl(), locale, '/search'),
    // Search result pages are never indexed (thin, query-dependent content).
    robots: SAMPLE_ROBOTS,
  };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];
  const raw = (await searchParams).q;
  const query = (Array.isArray(raw) ? raw[0] : raw)?.trim().slice(0, 100) ?? '';
  const results = query ? searchListings(query) : [];

  return (
    <>
      <Breadcrumbs locale={locale} items={[{ label: t.searchHeading }]} />
      <h1>{t.searchHeading}</h1>
      <SearchForm locale={locale} defaultValue={query} variant="inline" />
      <SampleBanner locale={locale} />
      <section className={styles.section} aria-labelledby="results-summary">
        {/* role=status: screen readers announce the result count after searching. */}
        <p id="results-summary" role="status">
          {!query
            ? t.searchPrompt
            : results.length === 0
              ? format(t.noResults, { query })
              : format(t.resultsFor, { count: results.length, query })}
        </p>
        {results.length > 0 && <ListingList listings={results} locale={locale} headingLevel={2} />}
      </section>
    </>
  );
}
