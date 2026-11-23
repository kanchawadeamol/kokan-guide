'use client';

import { openStatus } from '@konkan/sample-data';
import type { OpenStatus, OpeningPeriod } from '@konkan/sample-data';
import type { Locale } from '@konkan/shared-types';
import { useEffect, useState } from 'react';

import { messages } from '../i18n/messages';
import styles from './ui.module.css';

/**
 * "Open now" / "Closed now", computed in the browser. Pages are pre-rendered at build time, so
 * computing this on the server would freeze the status at build time. Renders nothing until
 * mounted (no hydration mismatch) and nothing when hours are unknown.
 */
export function OpenStatusBadge({
  hours,
  locale,
}: {
  hours: readonly OpeningPeriod[] | null;
  locale: Locale;
}) {
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => {
      setStatus(openStatus(hours, new Date()));
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => {
      window.clearInterval(timer);
    };
  }, [hours]);

  if (status === null || status === 'unknown') return null;
  const t = messages[locale];
  return status === 'open' ? (
    <span className={styles.badgeOpen}>
      <span aria-hidden="true">●</span>
      {t.openNow}
    </span>
  ) : (
    <span className={styles.badgeClosed}>
      <span aria-hidden="true">●</span>
      {t.closedNow}
    </span>
  );
}
