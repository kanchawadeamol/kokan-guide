import { getDistrict } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { useI18n } from '../i18n/context';
import { useSession } from '../session/context';
import { useRequireLogin } from '../session/useRequireLogin';
import { Button } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

export function ProfileScreen() {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const { user, signOut } = useSession();
  const requireLogin = useRequireLogin();

  const district = user ? getDistrict(user.district) : undefined;
  const taluka = district?.talukas.find((tk) => tk.slug === user?.taluka);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {user ? (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.title}>
            {user.name}
          </Text>
          <Text style={styles.body}>{user.phone}</Text>
          <Text style={styles.muted}>
            {[taluka?.name[locale], district?.name[locale]].filter(Boolean).join(', ')}
          </Text>
          <Button
            label={t.editProfile}
            icon="create-outline"
            variant="secondary"
            onPress={() => {
              router.push('/profile/edit');
            }}
            testID="profile-edit"
          />
        </View>
      ) : (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>
            {t.guestTitle}
          </Text>
          <Text style={styles.body}>{t.guestBody}</Text>
          <Button
            label={t.loginButton}
            onPress={() => {
              router.push({ pathname: '/auth/login', params: { next: '/profile' } });
            }}
            testID="profile-login"
          />
        </View>
      )}

      <Button
        label={t.addBusiness}
        icon="storefront-outline"
        variant="secondary"
        onPress={() => {
          requireLogin(() => {
            router.push('/business/new');
          }, '/business/new');
        }}
        testID="profile-add-business"
      />
      <Button
        label={t.settingsTitle}
        icon="settings-outline"
        variant="secondary"
        onPress={() => {
          router.push('/settings');
        }}
        testID="profile-settings"
      />
      {user ? (
        <Button
          label={t.logout}
          icon="log-out-outline"
          variant="ghost"
          onPress={signOut}
          testID="profile-logout"
        />
      ) : null}
    </ScrollView>
  );
}
