import { useLocalSearchParams } from 'expo-router';

import { OtpScreen } from '../../src/screens/auth/OtpScreen';

export default function Route() {
  const { phone, next } = useLocalSearchParams<{ phone: string; next?: string }>();
  return <OtpScreen phone={phone} next={next} />;
}
