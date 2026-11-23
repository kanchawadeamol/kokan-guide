import { SAMPLE_NOTICE } from '@konkan/sample-data';
import type { VerificationStatus } from '@konkan/sample-data';

import { useI18n } from '../i18n/context';
import styles from './pages.module.css';

const STATUS_ICON: Readonly<Record<VerificationStatus, string>> = {
  verified: '✓',
  pending: '…',
  unverified: '○',
};

/** Status shown as icon + text, never colour alone (WCAG 1.4.1). */
export function StatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useI18n();
  const label = {
    verified: t.statVerified,
    pending: t.statPending,
    unverified: t.statUnverified,
  }[status];
  return (
    <span className={styles[status]}>
      <span aria-hidden="true">{STATUS_ICON[status]}</span>
      {label}
    </span>
  );
}

export function SampleBanner() {
  const { locale } = useI18n();
  return (
    <p className={styles.sampleBanner} role="note">
      <span aria-hidden="true">ⓘ </span>
      {SAMPLE_NOTICE[locale]}
    </p>
  );
}
