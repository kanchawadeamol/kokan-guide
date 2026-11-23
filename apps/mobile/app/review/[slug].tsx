import { useLocalSearchParams } from 'expo-router';

import { ReviewScreen } from '../../src/screens/ReviewScreen';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ReviewScreen slug={slug} />;
}
