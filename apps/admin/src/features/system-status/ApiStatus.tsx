import type { Schema } from '@konkan/api-client';
import { useId } from 'react';

import { useI18n } from '../../i18n/context';
import styles from './ApiStatus.module.css';
import { useReadiness } from './useReadiness';

function CheckList({ checks }: { checks: Schema<'ReadinessChecks'> }) {
  const { t } = useI18n();
  const rows = [
    [t.checkDatabase, checks.database],
    [t.checkPostgis, checks.postgis],
    [t.checkMigrations, checks.migrations],
  ] as const;

  return (
    <dl className={styles.checks}>
      {rows.map(([label, status]) => (
        <div key={label} className={styles.checkRow}>
          <dt>{label}</dt>
          <dd className={status === 'ok' ? styles.ok : styles.fail}>
            <span aria-hidden="true">{status === 'ok' ? '✓ ' : '✕ '}</span>
            {status === 'ok' ? t.checkOk : t.checkFail}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ApiStatus() {
  const { t } = useI18n();
  const { state, refresh } = useReadiness();
  const titleId = useId();

  const summary = {
    loading: { text: t.statusChecking, className: '', icon: '' },
    ready: { text: t.statusReady, className: styles.ok, icon: '✓' },
    unavailable: { text: t.statusUnavailable, className: styles.fail, icon: '!' },
    unreachable: { text: t.statusUnreachable, className: styles.fail, icon: '✕' },
  }[state.kind];

  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {t.systemStatusTitle}
      </h2>
      {/* Polite live region: screen readers announce status changes without interrupting. */}
      <p role="status" className={`${styles.summary} ${summary.className}`}>
        {summary.icon && <span aria-hidden="true">{summary.icon}</span>}
        {summary.text}
      </p>
      {(state.kind === 'ready' || state.kind === 'unavailable') && (
        <CheckList checks={state.checks} />
      )}
      {/* aria-disabled (not disabled) keeps keyboard focus on the button while re-checking. */}
      <button
        type="button"
        className={styles.button}
        aria-disabled={state.kind === 'loading'}
        onClick={() => {
          if (state.kind !== 'loading') refresh();
        }}
      >
        {t.retry}
      </button>
    </section>
  );
}
