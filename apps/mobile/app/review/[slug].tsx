import { useLocalSearchParams } from 'expo-router';

import { ReviewScreen } from '../../src/screens/ReviewScreen';
import { LoginGate } from '../../src/session/LoginGate';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return (
    <LoginGate>
      <ReviewScreen slug={slug} />
    </LoginGate>
  );
}
