import { districts, getDistrict } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { personName, required, validate } from '../forms/validation';
import type { ValidationError } from '../forms/validation';
import { useI18n } from '../i18n/context';
import { useSession } from '../session/context';
import { Button, PickerField, TextField } from '../ui/controls';
import { useSharedStyles } from '../ui/styles';

interface Fields {
  name: string;
  district: string;
  taluka: string;
}

export function EditProfileScreen() {
  const { t, locale } = useI18n();
  const { styles } = useSharedStyles();
  const router = useRouter();
  const { user, updateUser } = useSession();
  const [form, setForm] = useState<Fields>({
    name: user?.name ?? '',
    district: user?.district ?? '',
    taluka: user?.taluka ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, ValidationError>>>({});
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  const district = getDistrict(form.district);
  const message = (key: keyof Fields) => (errors[key] ? t[errors[key]] : undefined);

  const save = () => {
    const found = validate<Fields>({
      name: () => personName(form.name),
      district: () => required(form.district),
      taluka: () => required(form.taluka),
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    updateUser({ name: form.name.trim(), district: form.district, taluka: form.taluka });
    setSaved(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.editProfile}
      </Text>
      <TextField
        label={t.nameLabel}
        value={form.name}
        onChangeText={(name) => {
          setForm((f) => ({ ...f, name }));
          setSaved(false);
        }}
        autoComplete="name"
        maxLength={80}
        error={message('name')}
        testID="edit-name"
      />
      {/* Changing the phone number needs a new OTP, so it is shown read-only here. */}
      <Text style={styles.label}>{t.phoneLabel}</Text>
      <Text style={styles.body}>{user.phone}</Text>
      <PickerField
        label={t.districtLabel}
        value={form.district}
        options={districts.map((d) => ({ value: d.slug, label: d.name[locale] }))}
        onChange={(value) => {
          setForm((f) => ({ ...f, district: value, taluka: '' }));
          setSaved(false);
        }}
        error={message('district')}
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
          setSaved(false);
        }}
        error={message('taluka')}
      />
      <Button label={t.saveChanges} onPress={save} testID="edit-save" />
      {saved ? (
        <Text accessibilityRole="alert" style={styles.body}>
          {t.changesSaved}
        </Text>
      ) : null}
      <Button
        label={t.back}
        variant="ghost"
        onPress={() => {
          router.back();
        }}
      />
    </ScrollView>
  );
}
