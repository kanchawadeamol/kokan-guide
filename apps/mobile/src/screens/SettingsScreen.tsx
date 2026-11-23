import Constants from 'expo-constants';
import { useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import { LanguagePicker } from '../components/LanguagePicker';
import { ApiStatus } from '../features/system-status/ApiStatus';
import { useI18n } from '../i18n/context';
import { useSharedStyles } from '../ui/styles';

export function SettingsScreen() {
  const { t } = useI18n();
  const { styles, theme } = useSharedStyles();
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        {t.settingsTitle}
      </Text>
      <LanguagePicker />
      <View style={[styles.card, styles.row]}>
        <View style={styles.grow}>
          <Text style={styles.label}>{t.notificationsLabel}</Text>
          <Text style={styles.caption}>{t.notificationsHint}</Text>
        </View>
        <Switch
          accessibilityLabel={t.notificationsLabel}
          accessibilityHint={t.notificationsHint}
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ true: theme.primary, false: theme.borderStrong }}
          testID="settings-notifications"
        />
      </View>
      <ApiStatus />
      <Text style={styles.caption}>
        {t.appVersion}: {Constants.expoConfig?.version ?? '-'}
      </Text>
    </ScrollView>
  );
}
