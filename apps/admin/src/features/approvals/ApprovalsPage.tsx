import { getCategory, getPlace } from '@konkan/sample-data';
import { useState } from 'react';

import { useI18n } from '../../i18n/context';
import { format } from '../../i18n/messages';
import { useSampleListings } from '../../sample/context';
import { SampleBanner } from '../shared';
import styles from '../pages.module.css';

/**
 * Approval queue preview. Decisions change sample data in memory only and are announced as
 * "not saved"; the real workflow (with audit log and role scoping) arrives in Sprint 6.
 */
export function ApprovalsPage() {
  const { t, locale } = useI18n();
  const { listings, setStatus } = useSampleListings();
  const [announcement, setAnnouncement] = useState('');
  const pending = listings.filter((l) => l.verification === 'pending');

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.approvalsTitle}</h1>
        <p className={styles.intro}>{t.approvalsIntro}</p>
      </div>
      <SampleBanner />

      {/* Announces each decision; keeps context after the item leaves the list. */}
      <p className={styles.announcement} role="status">
        {announcement}
      </p>

      {pending.length === 0 ? (
        <p>{t.noPending}</p>
      ) : (
        <ul className={styles.queue}>
          {pending.map((listing) => {
            const name = listing.name[locale];
            const place = getPlace(listing.placeSlug);
            return (
              <li key={listing.slug} className={styles.queueItem}>
                <div>
                  <h2 className={styles.queueTitle}>{name}</h2>
                  <p className={styles.queueMeta}>
                    {getCategory(listing.categorySlug)?.name[locale]} ·{' '}
                    {place && `${place.name[locale]}, ${place.districtName[locale]}`}
                  </p>
                  {listing.phone && (
                    <p className={styles.queueMeta}>
                      {t.phoneLabel}: {listing.phone}
                    </p>
                  )}
                </div>
                <div className={styles.buttons}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    aria-label={`${t.approve}: ${name}`}
                    onClick={() => {
                      setStatus(listing.slug, 'verified');
                      setAnnouncement(format(t.approvedMessage, { name }));
                    }}
                  >
                    {t.approve}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    aria-label={`${t.reject}: ${name}`}
                    onClick={() => {
                      setStatus(listing.slug, 'unverified');
                      setAnnouncement(format(t.rejectedMessage, { name }));
                    }}
                  >
                    {t.reject}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
