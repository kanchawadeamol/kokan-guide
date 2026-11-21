import { Stack } from 'expo-router';

import { useI18n } from '../src/i18n/context';
import { HomeScreen } from '../src/screens/HomeScreen';

export default function Index() {
  const { t } = useI18n();
  return (
    <>
      <Stack.Screen options={{ title: t.appName }} />
      <HomeScreen />
    </>
  );
}
