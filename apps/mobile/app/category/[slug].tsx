import { useLocalSearchParams } from 'expo-router';

import { CategoryScreen } from '../../src/screens/CategoryScreen';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <CategoryScreen slug={slug} />;
}
