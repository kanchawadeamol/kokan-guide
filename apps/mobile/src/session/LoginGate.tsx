import { usePathname, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { useI18n } from '../i18n/context';
import { Button } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';
import { useSession } from './context';

/**
 * Route-level guard for login-only screens (favourites, register business, owner dashboard,
 * reviews, reports, profile). Buttons already send guests to login via `useRequireLogin`;
 * this also covers deep links and the back stack. Guests see a login prompt that returns
 * them to the same screen afterwards. The backend enforces the same rules (never trust UI).
 */
export function LoginGate({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const { t } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const pathname = usePathname();

  if (user) return <>{children}</>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card} testID="login-gate">
        <Text accessibilityRole="header" style={styles.heading}>
          {t.loginRequiredTitle}
        </Text>
        <Text style={styles.body}>{t.loginRequiredBody}</Text>
        <Button
          label={t.loginButton}
          icon="log-in-outline"
          onPress={() => {
            router.push({ pathname: '/auth/login', params: { next: pathname } });
          }}
          testID="login-gate-login"
        />
      </View>
    </ScrollView>
  );
}
