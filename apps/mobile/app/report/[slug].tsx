import { useLocalSearchParams } from 'expo-router';

import { ReportScreen } from '../../src/screens/ReportScreen';

export default function Route() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <ReportScreen slug={slug} />;
}
