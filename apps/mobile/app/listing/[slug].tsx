import { useLocalSearchParams } from 'expo-router';

import { ListingScreen } from '../../src/screens/ListingScreen';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ListingScreen slug={slug} />;
}
