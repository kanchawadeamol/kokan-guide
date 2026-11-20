import { AppShell } from './components/AppShell';
import { ApiStatus } from './features/system-status/ApiStatus';
import { useI18n } from './i18n/context';

export function App() {
  const { t } = useI18n();
  return (
    <AppShell>
      <h1>{t.dashboardTitle}</h1>
      <ApiStatus />
    </AppShell>
  );
}
