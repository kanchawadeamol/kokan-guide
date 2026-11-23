import { useLocalSearchParams } from 'expo-router';

import { LoginScreen } from '../../src/screens/auth/LoginScreen';

export default function Route() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  return <LoginScreen next={next} />;
}
