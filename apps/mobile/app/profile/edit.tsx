import { EditProfileScreen } from '../../src/screens/EditProfileScreen';
import { LoginGate } from '../../src/session/LoginGate';

export default function Route() {
  return (
    <LoginGate>
      <EditProfileScreen />
    </LoginGate>
  );
}
