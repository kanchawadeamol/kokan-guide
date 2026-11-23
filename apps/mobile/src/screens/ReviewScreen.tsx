import { minTouchTarget } from '@konkan/design-tokens';
import { getListing } from '@konkan/sample-data';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { maxLength, rating as ratingRule } from '../forms/validation';
import type { ValidationError } from '../forms/validation';
import { useI18n } from '../i18n/context';
import { format } from '../i18n/messages';
import { Button, TextField } from '../ui/controls';
import { Icon } from '../ui/Icon';
import { useSharedStyles } from '../ui/styles';

export function ReviewScreen({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const { styles, theme } = useSharedStyles();
  const router = useRouter();
  const listing = getListing(slug);
  const [stars, setStars] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<{ stars?: ValidationError; text?: ValidationError }>({});
  const [sent, setSent] = useState(false);

  if (!listing) return null;

  const submit = () => {
    const starsError = ratingRule(stars);
    const textError = maxLength(1000)(text);
    setErrors({
      ...(starsError ? { stars: starsError } : {}),
      ...(textError ? { text: textError } : {}),
    });
    if (starsError || textError) return;
    setSent(true);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={styles.title}>
        {t.reviewTitle}
      </Text>
      <Text style={styles.muted}>{listing.name[locale]}</Text>
      {sent ? (
        <>
          <Text accessibilityRole="alert" style={styles.body}>
            {t.reviewThanks}
          </Text>
          <Button
            label={t.done}
            onPress={() => {
              router.back();
            }}
            testID="review-done"
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>{t.ratingLabel}</Text>
          {/* Each star is a radio button announced as "N out of 5 stars". */}
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel={t.ratingLabel}
            style={local.stars}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="radio"
                accessibilityLabel={format(t.starLabel, { count: value })}
                accessibilityState={{ checked: stars === value }}
                onPress={() => {
                  setStars(value);
                }}
                style={local.star}
                testID={`star-${value}`}
              >
                <Icon
                  name={value <= stars ? 'star' : 'star-outline'}
                  color={theme.warning}
                  size={34}
                />
              </Pressable>
            ))}
          </View>
          {errors.stars ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {t[errors.stars]}
            </Text>
          ) : null}
          <TextField
            label={t.reviewTextLabel}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            error={errors.text ? t[errors.text] : undefined}
            testID="review-text"
          />
          <Button label={t.reviewSubmit} onPress={submit} testID="review-submit" />
        </>
      )}
    </ScrollView>
  );
}

const local = StyleSheet.create({
  stars: { flexDirection: 'row' },
  star: {
    minWidth: minTouchTarget,
    minHeight: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
