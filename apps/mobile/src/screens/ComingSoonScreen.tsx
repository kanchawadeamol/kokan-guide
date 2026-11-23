import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { COMING_SOON_DETAIL, getFeature } from '../features/catalogue';
import { useI18n } from '../i18n/context';
import { Button, Notice } from '../ui/controls';
import { Icon } from '../ui/Icon';
import { useSharedStyles } from '../ui/styles';

/** Explains a planned feature (map, AI assistant, trip planner) until it is built. */
export function ComingSoonScreen({ id }: { id: string }) {
  const { t } = useI18n();
  const { styles, theme } = useSharedStyles();
  const router = useRouter();
  const feature = getFeature(id);
  const detail = COMING_SOON_DETAIL[id];

  if (!feature || !detail) return null;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t[feature.title] }} />
      <View style={styles.row}>
        <Icon name={feature.icon} color={theme.primary} size={40} />
        <Text accessibilityRole="header" style={[styles.title, styles.grow]}>
          {t[feature.title]}
        </Text>
      </View>
      <Text style={styles.body}>{t[feature.description]}</Text>
      <View style={styles.card}>
        <Text style={styles.body}>{t[detail]}</Text>
      </View>
      <Notice>{t.comingSoonBody}</Notice>
      <Button
        label={t.backToHome}
        variant="secondary"
        onPress={() => {
          router.dismissTo('/');
        }}
        testID="coming-soon-back"
      />
    </ScrollView>
  );
}
