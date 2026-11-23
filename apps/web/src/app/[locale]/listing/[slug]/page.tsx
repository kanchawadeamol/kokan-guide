import { getCategory, getListing, getPlace, isAllDay, listListings } from '@konkan/sample-data';
import type { OpeningPeriod } from '@konkan/sample-data';
import { isLocale, LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import type { Locale } from '@konkan/shared-types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Breadcrumbs, VerificationBadge } from '../../../../components/Listings';
import { OpenStatusBadge } from '../../../../components/OpenStatusBadge';
import { SampleBanner } from '../../../../components/SampleBanner';
import styles from '../../../../components/ui.module.css';
import { messages } from '../../../../i18n/messages';
import { routes, SAMPLE_ROBOTS } from '../../../../lib/listing';
import { buildAlternates, getSiteUrl } from '../../../../lib/site';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    listListings().map((listing) => ({ locale, slug: listing.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const listing = getListing(slug);
  if (!isLocale(locale) || !listing) notFound();
  return {
    title: listing.name[locale],
    description: listing.description[locale],
    alternates: buildAlternates(getSiteUrl(), locale, `/listing/${slug}`),
    robots: SAMPLE_ROBOTS,
  };
}

/** Monday-first week, weekday names from the locale (e.g. "सोमवार"). */
const WEEK: readonly OpeningPeriod['day'][] = [1, 2, 3, 4, 5, 6, 0];

function weekdayName(day: number, locale: Locale): string {
  // 2026-11-22 is a Sunday; add `day` days to get the requested weekday.
  const date = new Date(Date.UTC(2026, 10, 22 + day, 12));
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].bcp47, {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(date);
}

function HoursTable({ hours, locale }: { hours: readonly OpeningPeriod[]; locale: Locale }) {
  const t = messages[locale];
  return (
    <table className={styles.hoursTable}>
      <caption className="visually-hidden">{t.hoursHeading}</caption>
      <tbody>
        {WEEK.map((day) => {
          const periods = hours.filter((p) => p.day === day);
          const text =
            periods.length === 0
              ? t.closed
              : periods.map((p) => (isAllDay(p) ? t.open24h : `${p.open}–${p.close}`)).join(', ');
          return (
            <tr key={day}>
              <th scope="row">{weekdayName(day, locale)}</th>
              <td>{text}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const DISABLED_HINT_ID = 'preview-disabled-hint';

function DisabledAction({ label }: { label: string }) {
  // aria-disabled keeps the control focusable; the shared hint is its accessible description,
  // so screen readers announce e.g. "Call, dimmed, Disabled for sample data".
  return (
    <button
      type="button"
      className={styles.actionButton}
      aria-disabled="true"
      aria-describedby={DISABLED_HINT_ID}
    >
      {label}
    </button>
  );
}

export default async function ListingPage({ params }: Props) {
  const { locale, slug } = await params;
  const listing = getListing(slug);
  if (!isLocale(locale) || !listing) notFound();
  const t = messages[locale];
  const category = getCategory(listing.categorySlug);
  const place = getPlace(listing.placeSlug);

  return (
    <>
      <Breadcrumbs
        locale={locale}
        items={[
          ...(category
            ? [{ label: category.name[locale], href: routes.category(locale, category.slug) }]
            : []),
          { label: listing.name[locale] },
        ]}
      />
      <h1>{listing.name[locale]}</h1>
      <div className={styles.badges}>
        <VerificationBadge listing={listing} locale={locale} />
        <OpenStatusBadge hours={listing.hours} locale={locale} />
      </div>
      <SampleBanner locale={locale} />

      <div className={styles.detailLayout}>
        <div>
          <section className={styles.panel} aria-labelledby="about-heading">
            <h2 id="about-heading">{t.aboutHeading}</h2>
            <p>{listing.description[locale]}</p>
            {listing.kind === 'public-landmark' && <p className={styles.muted}>{t.landmarkNote}</p>}
          </section>
          <section className={styles.panel} aria-labelledby="hours-heading">
            <h2 id="hours-heading">{t.hoursHeading}</h2>
            {listing.hours ? (
              <HoursTable hours={listing.hours} locale={locale} />
            ) : (
              <p className={styles.muted}>{t.hoursUnknown}</p>
            )}
          </section>
        </div>

        <aside>
          <section className={styles.panel} aria-labelledby="address-heading">
            <h2 id="address-heading">{t.addressHeading}</h2>
            <address>
              {listing.addressLine && (
                <>
                  {listing.addressLine[locale]}
                  <br />
                </>
              )}
              {place && `${place.name[locale]}, ${place.districtName[locale]}`}
            </address>
          </section>
          <section className={styles.panel} aria-labelledby="contact-heading">
            <h2 id="contact-heading">{t.contactHeading}</h2>
            {listing.phone ? (
              <p className={styles.phone}>{listing.phone}</p>
            ) : (
              <p className={styles.muted}>{t.noContact}</p>
            )}
            <p id={DISABLED_HINT_ID} className={styles.muted}>
              {t.disabledInPreview}
            </p>
            <div className={styles.actions}>
              {listing.phone && <DisabledAction label={t.call} />}
              {listing.hasWhatsApp && <DisabledAction label={t.whatsapp} />}
              <DisabledAction label={t.directions} />
              <DisabledAction label={t.reportIncorrect} />
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
