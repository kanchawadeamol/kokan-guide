import { AppShell } from './components/AppShell';
import { ApprovalsPage } from './features/approvals/ApprovalsPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ListingsPage } from './features/listings/ListingsPage';
import { useRoute } from './navigation/route';
import { SampleListingsProvider } from './sample/SampleListingsProvider';

export function App() {
  const route = useRoute();
  return (
    <SampleListingsProvider>
      <AppShell route={route}>
        {route === 'listings' ? (
          <ListingsPage />
        ) : route === 'approvals' ? (
          <ApprovalsPage />
        ) : (
          <DashboardPage />
        )}
      </AppShell>
    </SampleListingsProvider>
  );
}
