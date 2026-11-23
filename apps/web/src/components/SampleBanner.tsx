import { SAMPLE_NOTICE } from '@konkan/sample-data';
import type { Locale } from '@konkan/shared-types';

import styles from './ui.module.css';

/** Shown on every page that displays sample data, so nobody mistakes it for real listings. */
export function SampleBanner({ locale }: { locale: Locale }) {
  return (
    <p className={styles.sampleBanner} role="note">
      <span aria-hidden="true">ⓘ </span>
      {SAMPLE_NOTICE[locale]}
    </p>
  );
}
