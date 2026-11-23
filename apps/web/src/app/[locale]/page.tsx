import { listCategories, popularListings } from '@konkan/sample-data';
import { isLocale } from '@konkan/shared-types';
import { notFound } from 'next/navigation';

import { CategoryGrid, ListingList } from '../../components/Listings';
import { SampleBanner } from '../../components/SampleBanner';
import { SearchForm } from '../../components/SearchForm';
import styles from '../../components/ui.module.css';
import { messages } from '../../i18n/messages';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = messages[locale];

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={styles.heroInner}>
          <h1 id="home-heading" className={styles.heroTitle}>
            {t.homeHeading}
          </h1>
          <p className={styles.heroIntro}>{t.homeIntro}</p>
          <SearchForm locale={locale} />
        </div>
      </section>

      <SampleBanner locale={locale} />

      <section className={styles.section} aria-labelledby="categories-heading">
        <h2 id="categories-heading" className={styles.sectionHeading}>
          {t.categoriesHeading}
        </h2>
        <CategoryGrid categories={listCategories()} locale={locale} />
      </section>

      <section className={styles.section} aria-labelledby="popular-heading">
        <h2 id="popular-heading" className={styles.sectionHeading}>
          {t.popularHeading}
        </h2>
        <ListingList listings={popularListings()} locale={locale} />
      </section>
    </>
  );
}
