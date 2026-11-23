import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { otp } from '../../forms/validation';
import { useI18n } from '../../i18n/context';
import { format } from '../../i18n/messages';
import { PREVIEW_OTP } from '../../session/context';
import { Button, Notice, TextField } from '../../ui/controls';
import { useSharedStyles } from '../../ui/styles';

export const RESEND_SECONDS = 30;

export function OtpScreen({ phone, next }: { phone: string; next?: string | undefined }) {
  const { t } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  const verify = () => {
    const problem = otp(code);
    if (problem) {
      setError(t[problem]);
      return;
    }
    // Preview only: the real code is checked by the backend in Sprint 2.
    if (code.trim() !== PREVIEW_OTP) {
      setError(t.otpWrong);
      return;
    }
    router.replace({ pathname: '/auth/register', params: { phone, ...(next ? { next } : {}) } });
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.otpTitle}
      </Text>
      <Text style={styles.body}>{format(t.otpIntro, { phone })}</Text>
      <TextField
        label={t.otpLabel}
        value={code}
        onChangeText={(value) => {
          setCode(value.replace(/\D/g, '').slice(0, 6));
          setError(undefined);
        }}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        maxLength={6}
        error={error}
        testID="otp-code"
      />
      <Notice>{t.otpPreviewHint}</Notice>
      <Button label={t.verify} onPress={verify} testID="otp-verify" />
      <Button
        label={secondsLeft > 0 ? format(t.resendIn, { seconds: secondsLeft }) : t.resend}
        variant="secondary"
        disabled={secondsLeft > 0}
        onPress={() => {
          setSecondsLeft(RESEND_SECONDS);
        }}
        testID="otp-resend"
      />
      <Button
        label={t.changeNumber}
        variant="ghost"
        onPress={() => {
          router.back();
        }}
      />
    </ScrollView>
  );
}
