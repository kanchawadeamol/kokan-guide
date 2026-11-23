import { minTouchTarget, radius, spacing } from '@konkan/design-tokens';
import { districts, getDistrict, listCategories } from '@konkan/sample-data';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { weekdayName } from '../components/listing';
import {
  BUSINESS_STEPS,
  copyMondayToAll,
  DAYS,
  emptyBusinessForm,
  MAX_PHOTOS,
  validateStep,
} from '../forms/business';
import type { BusinessErrors, BusinessForm, Day, DayHours } from '../forms/business';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/messages';
import { Button, Checkbox, Notice, PickerField, TextField } from '../ui/controls';
import { Icon } from '../ui/Icon';
import { useSharedStyles } from '../ui/styles';

export function BusinessFormScreen() {
  const { t, locale } = useI18n();
  const { styles, theme } = useSharedStyles();
  const router = useRouter();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [form, setForm] = useState<BusinessForm>(emptyBusinessForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<BusinessErrors>({});
  const [locationMessage, setLocationMessage] = useState('');

  const step = BUSINESS_STEPS[stepIndex] ?? 'details';
  const stepTitles = {
    details: t.stepDetails,
    address: t.stepAddress,
    contacts: t.stepContacts,
    hours: t.stepHours,
    photos: t.stepPhotos,
  };
  const set = <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };
  const err = (key: string) => {
    const e = errors[key];
    return e ? t[e] : undefined;
  };
  const district = getDistrict(form.district);
  const category = listCategories().find((c) => c.slug === form.category);

  const goNext = () => {
    const found = validateStep(step, form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (stepIndex < BUSINESS_STEPS.length - 1) setStepIndex(stepIndex + 1);
    else setReviewing(true);
    scroll.current?.scrollTo({ y: 0, animated: false });
  };

  const goBack = () => {
    setErrors({});
    if (reviewing) setReviewing(false);
    else if (stepIndex > 0) setStepIndex(stepIndex - 1);
    else router.back();
  };

  const setDay = (day: Day, changes: Partial<DayHours>) => {
    setForm((f) => ({ ...f, hours: { ...f.hours, [day]: { ...f.hours[day], ...changes } } }));
  };

  const addPhotos = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - form.photos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      set('photos', [...form.photos, ...result.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
    }
  };

  const locateMe = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      setLocationMessage(t.locationDenied);
      return;
    }
    const position = await Location.getCurrentPositionAsync({});
    set('location', { latitude: position.coords.latitude, longitude: position.coords.longitude });
    setLocationMessage(t.locationSet);
  };

  if (submitted) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Icon name="checkmark-circle" color={theme.success} size={56} />
        <Text accessibilityRole="header" style={styles.title}>
          {t.submittedTitle}
        </Text>
        <Text style={styles.body}>{t.submittedBody}</Text>
        <Button
          label={t.done}
          onPress={() => {
            router.back();
          }}
          testID="business-done"
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scroll}
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.bizTitle}
      </Text>
      {/* Progress: announced as text, and drawn as a 5-segment bar. */}
      <Text style={styles.label} testID="business-step">
        {reviewing
          ? t.reviewDetailsHeading
          : `${format(t.stepOf, { current: stepIndex + 1, total: BUSINESS_STEPS.length })}: ${stepTitles[step]}`}
      </Text>
      <View
        style={local.progress}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {BUSINESS_STEPS.map((s, i) => (
          <View
            key={s}
            style={[
              local.progressSegment,
              { backgroundColor: i <= stepIndex || reviewing ? theme.primary : theme.border },
            ]}
          />
        ))}
      </View>
      {Object.keys(errors).length > 0 ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {t.formErrorSummary}
        </Text>
      ) : null}

      {reviewing ? (
        <View style={styles.card}>
          {[
            [t.bizNameLabel, form.name],
            [t.categoryLabel, category?.name[locale] ?? ''],
            [
              t.villageLabel,
              [
                form.village,
                district?.talukas.find((x) => x.slug === form.taluka)?.name[locale],
                district?.name[locale],
              ]
                .filter(Boolean)
                .join(', '),
            ],
            [t.contactPhoneLabel, form.phone],
            [t.addPhotos, String(form.photos.length)],
          ].map(([label, value]) => (
            <View key={label} style={styles.stack}>
              <Text style={styles.caption}>{label}</Text>
              <Text style={styles.body}>{value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!reviewing && step === 'details' ? (
        <>
          <TextField
            label={t.bizNameLabel}
            hint={t.bizNameHint}
            value={form.name}
            onChangeText={(v) => {
              set('name', v);
            }}
            maxLength={120}
            error={err('name')}
            testID="biz-name"
          />
          <PickerField
            label={t.categoryLabel}
            value={form.category}
            options={listCategories()
              .filter((c) => c.group !== 'emergency')
              .map((c) => ({ value: c.slug, label: c.name[locale] }))}
            onChange={(v) => {
              set('category', v);
            }}
            error={err('category')}
            testID="biz-category"
          />
          <TextField
            label={t.descriptionLabel}
            hint={t.descriptionHint}
            value={form.description}
            onChangeText={(v) => {
              set('description', v);
            }}
            multiline
            maxLength={500}
            error={err('description')}
            testID="biz-description"
          />
        </>
      ) : null}

      {!reviewing && step === 'address' ? (
        <>
          <PickerField
            label={t.districtLabel}
            value={form.district}
            options={districts.map((d) => ({ value: d.slug, label: d.name[locale] }))}
            onChange={(v) => {
              setForm((f) => ({ ...f, district: v, taluka: '' }));
            }}
            error={err('district')}
            testID="biz-district"
          />
          <PickerField
            label={t.talukaLabel}
            value={form.taluka}
            options={(district?.talukas ?? []).map((tk) => ({
              value: tk.slug,
              label: tk.name[locale],
            }))}
            onChange={(v) => {
              set('taluka', v);
            }}
            error={err('taluka')}
            testID="biz-taluka"
          />
          <TextField
            label={t.villageLabel}
            value={form.village}
            onChangeText={(v) => {
              set('village', v);
            }}
            maxLength={100}
            error={err('village')}
            testID="biz-village"
          />
          <TextField
            label={t.streetLabel}
            value={form.street}
            onChangeText={(v) => {
              set('street', v);
            }}
            maxLength={200}
            error={err('street')}
            autoComplete="street-address"
          />
          <TextField
            label={t.pincodeLabel}
            value={form.pincode}
            onChangeText={(v) => {
              set('pincode', v.replace(/\D/g, ''));
            }}
            keyboardType="number-pad"
            maxLength={6}
            error={err('pincode')}
            autoComplete="postal-code"
          />
        </>
      ) : null}

      {!reviewing && step === 'contacts' ? (
        <>
          <TextField
            label={t.contactPhoneLabel}
            hint={t.phoneHint}
            value={form.phone}
            onChangeText={(v) => {
              set('phone', v);
            }}
            keyboardType="phone-pad"
            maxLength={16}
            error={err('phone')}
            testID="biz-phone"
          />
          <Checkbox
            label={t.sameAsPhone}
            checked={form.whatsappSameAsPhone}
            onChange={(v) => {
              set('whatsappSameAsPhone', v);
            }}
            testID="biz-same-whatsapp"
          />
          {!form.whatsappSameAsPhone ? (
            <TextField
              label={t.whatsappLabel}
              value={form.whatsapp}
              onChangeText={(v) => {
                set('whatsapp', v);
              }}
              keyboardType="phone-pad"
              maxLength={16}
              error={err('whatsapp')}
              testID="biz-whatsapp"
            />
          ) : null}
        </>
      ) : null}

      {!reviewing && step === 'hours' ? (
        <>
          <Button
            label={t.copyToAll}
            icon="copy-outline"
            variant="secondary"
            onPress={() => {
              set('hours', copyMondayToAll(form.hours));
            }}
          />
          {DAYS.map((day) => {
            const h = form.hours[day];
            const dayName = weekdayName(day, locale);
            return (
              <View key={day} style={styles.card}>
                <View style={styles.row}>
                  <Text style={[styles.label, local.grow]}>{dayName}</Text>
                  <Text style={styles.caption}>{t.closedAllDay}</Text>
                  <Switch
                    accessibilityLabel={`${dayName}: ${t.closedAllDay}`}
                    value={h.closed}
                    onValueChange={(closed) => {
                      setDay(day, { closed });
                    }}
                    trackColor={{ true: theme.primary, false: theme.borderStrong }}
                  />
                </View>
                {!h.closed ? (
                  <View style={styles.row}>
                    <View style={local.grow}>
                      <TextField
                        label={`${t.openLabel} (${dayName})`}
                        value={h.open}
                        onChangeText={(v) => {
                          setDay(day, { open: v });
                        }}
                        maxLength={5}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                    <View style={local.grow}>
                      <TextField
                        label={`${t.closeLabel} (${dayName})`}
                        value={h.close}
                        onChangeText={(v) => {
                          setDay(day, { close: v });
                        }}
                        maxLength={5}
                        keyboardType="numbers-and-punctuation"
                      />
                    </View>
                  </View>
                ) : null}
                {err(`hours-${String(day)}`) ? (
                  <Text accessibilityLiveRegion="polite" style={styles.error}>
                    {err(`hours-${String(day)}`)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </>
      ) : null}

      {!reviewing && step === 'photos' ? (
        <>
          <Text style={styles.muted}>{t.photosHint}</Text>
          <View style={styles.wrap}>
            {form.photos.map((uri, index) => (
              <View key={uri} style={local.photo}>
                <Image source={{ uri }} style={local.photoImage} accessibilityIgnoresInvertColors />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={format(t.removePhoto, { number: index + 1 })}
                  onPress={() => {
                    set(
                      'photos',
                      form.photos.filter((p) => p !== uri),
                    );
                  }}
                  style={[local.removePhoto, { backgroundColor: theme.surface }]}
                >
                  <Icon name="close" color={theme.danger} size={20} />
                </Pressable>
              </View>
            ))}
          </View>
          <Button
            label={t.addPhotos}
            icon="images-outline"
            variant="secondary"
            disabled={form.photos.length >= MAX_PHOTOS}
            onPress={() => {
              void addPhotos();
            }}
            testID="biz-add-photos"
          />
          <Button
            label={t.useCurrentLocation}
            icon="locate-outline"
            variant="secondary"
            onPress={() => {
              void locateMe();
            }}
            testID="biz-location"
          />
          {locationMessage ? (
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {locationMessage}
            </Text>
          ) : null}
        </>
      ) : null}

      <View style={styles.row}>
        <View style={local.grow}>
          <Button label={t.back} variant="secondary" onPress={goBack} testID="biz-back" />
        </View>
        <View style={local.grow}>
          {reviewing ? (
            <Button
              label={t.submitForApproval}
              onPress={() => {
                setSubmitted(true);
              }}
              testID="biz-submit"
            />
          ) : (
            <Button label={t.next} onPress={goNext} testID="biz-next" />
          )}
        </View>
      </View>
      <Notice>{t.previewFormNotice}</Notice>
    </ScrollView>
  );
}

const local = StyleSheet.create({
  grow: { flex: 1 },
  progress: { flexDirection: 'row', gap: spacing.xs },
  progressSegment: { flex: 1, height: 6, borderRadius: radius.pill },
  photo: { width: 96, height: 96 },
  photoImage: { width: 96, height: 96, borderRadius: radius.md },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: minTouchTarget,
    height: minTouchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
