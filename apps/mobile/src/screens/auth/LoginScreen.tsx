import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { normalizeIndianMobile, phone } from '../../forms/validation';
import type { ValidationError } from '../../forms/validation';
import { useI18n } from '../../i18n/context';
import { Button, Notice, TextField } from '../../ui/controls';
import { useSharedStyles } from '../../ui/styles';

export function LoginScreen({ next }: { next?: string | undefined }) {
  const { t } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<ValidationError | null>(null);

  const sendCode = () => {
    const problem = phone(mobile);
    setError(problem);
    if (problem) return;
    router.push({
      pathname: '/auth/otp',
      params: { phone: normalizeIndianMobile(mobile) ?? '', ...(next ? { next } : {}) },
    });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.loginTitle}
      </Text>
      <Text style={styles.muted}>{t.loginIntro}</Text>
      <TextField
        label={t.phoneLabel}
        hint={t.phoneHint}
        value={mobile}
        onChangeText={(value) => {
          setMobile(value);
          if (error) setError(null);
        }}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        maxLength={16}
        error={error ? t[error] : undefined}
        testID="login-phone"
      />
      <Button label={t.sendOtp} onPress={sendCode} testID="login-send" />

      <View style={styles.row}>
        <Text style={styles.muted}>{t.orDivider}</Text>
      </View>
      <Button
        label={t.continueWithGoogle}
        icon="logo-google"
        variant="secondary"
        disabled
        hint={t.googleUnavailable}

        testID="login-google"
      />
      <Button
        label={t.continueAsGuest}
        variant="ghost"
        onPress={() => {
          router.back();
        }}
        testID="login-guest"
      />
      <Notice>{t.previewAuthNotice}</Notice>
    </ScrollView>
  );
}
