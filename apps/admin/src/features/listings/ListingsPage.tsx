import { getCategory, getPlace, listCategories, places } from '@konkan/sample-data';
import type { VerificationStatus } from '@konkan/sample-data';
import { SUPPORTED_LOCALES } from '@konkan/shared-types';
import { useId, useMemo, useState } from 'react';

import { useI18n } from '../../i18n/context';
import { format } from '../../i18n/messages';
import { useSampleListings } from '../../sample/context';
import { SampleBanner, StatusBadge } from '../shared';
import styles from '../pages.module.css';

const STATUSES: readonly VerificationStatus[] = ['verified', 'pending', 'unverified'];

export function ListingsPage() {
  const { t, locale } = useI18n();
  const { listings } = useSampleListings();
  const ids = { q: useId(), category: useId(), status: useId(), district: useId() };
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');

  const districts = useMemo(
    () => [...new Map(places.map((p) => [p.district, p.districtName])).entries()],
    [],
  );

  const filtered = listings.filter((listing) => {
    const place = getPlace(listing.placeSlug);
    const q = query.trim().toLocaleLowerCase();
    const matchesQuery =
      !q || SUPPORTED_LOCALES.some((l) => listing.name[l].toLocaleLowerCase().includes(q));
    return (
      matchesQuery &&
      (!category || listing.categorySlug === category) &&
      (!status || listing.verification === status) &&
      (!district || place?.district === district)
    );
  });

  const statusLabel = (s: VerificationStatus) =>
    ({ verified: t.statVerified, pending: t.statPending, unverified: t.statUnverified })[s];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.listingsTitle}</h1>
      </div>
      <SampleBanner />

      <fieldset className={styles.filters}>
        <legend>{t.filtersHeading}</legend>
        <div className={styles.field}>
          <label htmlFor={ids.q}>{t.filterSearch}</label>
          <input
            id={ids.q}
            type="search"
            className={styles.control}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={ids.category}>{t.filterCategory}</label>
          <select
            id={ids.category}
            className={styles.control}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
          >
            <option value="">{t.allCategories}</option>
            {listCategories().map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name[locale]}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor={ids.status}>{t.filterStatus}</label>
          <select
            id={ids.status}
            className={styles.control}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
          >
            <option value="">{t.allStatuses}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor={ids.district}>{t.filterDistrict}</label>
          <select
            id={ids.district}
            className={styles.control}
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
            }}
          >
            <option value="">{t.allDistricts}</option>
            {districts.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name[locale]}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Polite live region: the count is announced as filters change. */}
      <p className={styles.summary} role="status">
        {format(t.resultsCount, { count: filtered.length, total: listings.length })}
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption>{t.listingsTableCaption}</caption>
          <thead>
            <tr>
              <th scope="col">{t.colName}</th>
              <th scope="col">{t.colCategory}</th>
              <th scope="col">{t.colPlace}</th>
              <th scope="col">{t.colType}</th>
              <th scope="col">{t.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((listing) => {
              const place = getPlace(listing.placeSlug);
              return (
                <tr key={listing.slug}>
                  <th scope="row">{listing.name[locale]}</th>
                  <td>{getCategory(listing.categorySlug)?.name[locale]}</td>
                  <td>{place && `${place.name[locale]}, ${place.districtName[locale]}`}</td>
                  <td>{listing.kind === 'public-landmark' ? t.typeLandmark : t.typeBusiness}</td>
                  <td>
                    <StatusBadge status={listing.verification} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
