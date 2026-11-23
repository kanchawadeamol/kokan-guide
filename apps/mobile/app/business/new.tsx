import { BusinessFormScreen } from '../../src/screens/BusinessFormScreen';
import { LoginGate } from '../../src/session/LoginGate';

export default function Route() {
  return (
    <LoginGate>
      <BusinessFormScreen />
    </LoginGate>
  );
}
