import { useLocalSearchParams } from 'expo-router';

import { ComingSoonScreen } from '../../src/screens/ComingSoonScreen';

export default function Route() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ComingSoonScreen id={id} />;
}
