import { districts, getDistrict } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { consent, personName, required, validate } from '../../forms/validation';
import type { ValidationError } from '../../forms/validation';
import { useI18n } from '../../i18n/context';
import { useSession } from '../../session/context';
import { Button, Checkbox, Notice, PickerField, TextField } from '../../ui/controls';
import { useSharedStyles } from '../../ui/styles';

interface Fields {
  name: string;
  district: string;
  taluka: string;
  terms: boolean;
}

export function RegisterScreen({ phone, next }: { phone: string; next?: string | undefined }) {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const { signIn } = useSession();
  const [form, setForm] = useState<Fields>({ name: '', district: '', taluka: '', terms: false });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, ValidationError>>>({});

  const district = getDistrict(form.district);
  const message = (key: keyof Fields) => (errors[key] ? t[errors[key]] : undefined);

  const submit = () => {
    const found = validate<Fields>({
      name: () => personName(form.name),
      district: () => required(form.district),
      taluka: () => required(form.taluka),
      terms: () => consent(form.terms),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    signIn({ name: form.name.trim(), phone, district: form.district, taluka: form.taluka });
    // Return to where the guest started (e.g. the listing they tried to save): pops back to it
    // if it is in the stack, otherwise navigates there.
    router.dismissTo(next ?? '/');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.registerTitle}
      </Text>
      {Object.keys(errors).length > 0 ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {t.formErrorSummary}
        </Text>
      ) : null}
      <TextField
        label={t.nameLabel}
        value={form.name}
        onChangeText={(name) => {
          setForm((f) => ({ ...f, name }));
        }}
        autoComplete="name"
        textContentType="name"
        maxLength={80}
        error={message('name')}
        testID="register-name"
      />
      <PickerField
        label={t.districtLabel}
        value={form.district}
        options={districts.map((d) => ({ value: d.slug, label: d.name[locale] }))}
        onChange={(value) => {
          setForm((f) => ({ ...f, district: value, taluka: '' }));
        }}
        error={message('district')}
        testID="register-district"
      />
      <PickerField
        label={t.talukaLabel}
        value={form.taluka}
        options={(district?.talukas ?? []).map((tk) => ({
          value: tk.slug,
          label: tk.name[locale],
        }))}
        onChange={(value) => {
          setForm((f) => ({ ...f, taluka: value }));
        }}
        error={message('taluka')}
        testID="register-taluka"
      />
      <Checkbox
        label={t.termsLabel}
        checked={form.terms}
        onChange={(terms) => {
          setForm((f) => ({ ...f, terms }));
        }}
        error={message('terms')}
        testID="register-terms"
      />
      <Button label={t.createAccount} onPress={submit} testID="register-submit" />
      <Notice>{t.previewAuthNotice}</Notice>
    </ScrollView>
  );
}
