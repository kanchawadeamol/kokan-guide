import { useLocalSearchParams } from 'expo-router';

import { RegisterScreen } from '../../src/screens/auth/RegisterScreen';

export default function Route() {
  const { phone, next } = useLocalSearchParams<{ phone: string; next?: string }>();
  return <RegisterScreen phone={phone} next={next} />;
}
