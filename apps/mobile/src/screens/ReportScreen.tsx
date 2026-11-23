import { getListing } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { maxLength, required } from '../forms/validation';
import type { ValidationError } from '../forms/validation';
import { useI18n } from '../i18n/context';
import { Button, RadioGroup, TextField } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

export const REPORT_REASONS = ['phone', 'address', 'hours', 'closed', 'other'] as const;

export function ReportScreen({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const listing = getListing(slug);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [errors, setErrors] = useState<{ reason?: ValidationError; details?: ValidationError }>({});
  const [sent, setSent] = useState(false);

  if (!listing) return null;
  const labels: Record<(typeof REPORT_REASONS)[number], string> = {
    phone: t.reasonPhone,
    address: t.reasonAddress,
    hours: t.reasonHours,
    closed: t.reasonClosed,
    other: t.reasonOther,
  };

  const submit = () => {
    const reasonError = required(reason);
    const detailsError = maxLength(500)(details);
    setErrors({
      ...(reasonError ? { reason: reasonError } : {}),
      ...(detailsError ? { details: detailsError } : {}),
    });
    if (reasonError || detailsError) return;
    setSent(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.reportTitle}
      </Text>
      <Text style={styles.muted}>{listing.name[locale]}</Text>
      {sent ? (
        <>
          <Text accessibilityRole="alert" style={styles.body}>
            {t.reportThanks}
          </Text>
          <Button
            label={t.done}
            onPress={() => {
              router.back();
            }}
            testID="report-done"
          />
        </>
      ) : (
        <>
          <RadioGroup
            label={t.reportReasonLabel}
            options={REPORT_REASONS.map((value) => ({ value, label: labels[value] }))}
            value={reason}
            onChange={setReason}
            error={errors.reason ? t[errors.reason] : undefined}
          />
          <TextField
            label={t.reportDetailsLabel}
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={500}
            error={errors.details ? t[errors.details] : undefined}
            testID="report-details"
          />
          <Button label={t.reportSubmit} onPress={submit} testID="report-submit" />
        </>
      )}
    </ScrollView>
  );
}
