import { OwnerDashboardScreen } from '../src/screens/OwnerDashboardScreen';
import { LoginGate } from '../src/session/LoginGate';

export default function Route() {
  return (
    <LoginGate>
      <OwnerDashboardScreen />
    </LoginGate>
  );
}
