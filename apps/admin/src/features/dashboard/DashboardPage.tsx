import { listCategories, places } from '@konkan/sample-data';

import { useI18n } from '../../i18n/context';
import { format } from '../../i18n/messages';
import { ROUTE_HREF } from '../../navigation/route';
import { useSampleListings } from '../../sample/context';
import { SampleBanner } from '../shared';
import { ApiStatus } from '../system-status/ApiStatus';
import styles from '../pages.module.css';

export function DashboardPage() {
  const { t, locale } = useI18n();
  const { listings } = useSampleListings();

  const count = (status: string) => listings.filter((l) => l.verification === status).length;
  const districts = [...new Map(places.map((p) => [p.district, p.districtName])).entries()];
  const pending = count('pending');

  const stats = [
    { label: t.statTotal, value: listings.length },
    { label: t.statVerified, value: count('verified') },
    { label: t.statPending, value: pending },
    { label: t.statUnverified, value: count('unverified') },
    { label: t.statCategories, value: listCategories().length },
    { label: t.statDistricts, value: districts.length },
  ];

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t.dashboardTitle}</h1>
      </div>
      <SampleBanner />

      <section className={styles.section} aria-labelledby="overview-heading">
        <h2 id="overview-heading" className={styles.sectionTitle}>
          {t.overviewHeading}
        </h2>
        <ul className={styles.stats}>
          {stats.map((stat) => (
            <li key={stat.label} className={styles.statCard}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </li>
          ))}
        </ul>
        {pending > 0 && (
          <p>
            <a className={styles.link} href={ROUTE_HREF.approvals}>
              {t.viewPending} ({format(t.pendingCount, { count: pending })})
            </a>
          </p>
        )}
      </section>

      <section className={styles.section} aria-labelledby="district-heading">
        <h2 id="district-heading" className={styles.sectionTitle}>
          {t.byDistrictHeading}
        </h2>
        {/* Focusable so keyboard users can scroll the table when it overflows (WCAG 2.1.1). */}
        <div
          className={styles.tableWrap}
          role="region"
          aria-labelledby="district-heading"
          tabIndex={0}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{t.colDistrict}</th>
                <th scope="col" className={styles.numeric}>
                  {t.statVerified}
                </th>
                <th scope="col" className={styles.numeric}>
                  {t.statPending}
                </th>
                <th scope="col" className={styles.numeric}>
                  {t.colTotal}
                </th>
              </tr>
            </thead>
            <tbody>
              {districts.map(([slug, name]) => {
                const inDistrict = listings.filter(
                  (l) => places.find((p) => p.slug === l.placeSlug)?.district === slug,
                );
                return (
                  <tr key={slug}>
                    <th scope="row">{name[locale]}</th>
                    <td className={styles.numeric}>
                      {inDistrict.filter((l) => l.verification === 'verified').length}
                    </td>
                    <td className={styles.numeric}>
                      {inDistrict.filter((l) => l.verification === 'pending').length}
                    </td>
                    <td className={styles.numeric}>{inDistrict.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <ApiStatus />
    </>
  );
}
