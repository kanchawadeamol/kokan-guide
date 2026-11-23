import { useLocalSearchParams } from 'expo-router';

import { ReportScreen } from '../../src/screens/ReportScreen';
import { LoginGate } from '../../src/session/LoginGate';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <LoginGate>
      <ReportScreen slug={slug} />
    </LoginGate>
  );
}
