import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { LOCALE_INFO, SUPPORTED_LOCALES } from '@konkan/shared-types';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useI18n } from '../i18n/context';
import { useTheme } from '../theme/useTheme';

/**
 * Language choice as an accessible radio group. Each option is labelled in its own language
 * (and tagged with `accessibilityLanguage` so VoiceOver pronounces it correctly).
 */
export function LanguagePicker() {
  const { locale, setLocale, t } = useI18n();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View>
      <Text style={styles.label} nativeID="language-label">
        {t.languageLabel}
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabelledBy="language-label"
        style={styles.row}
      >
        {SUPPORTED_LOCALES.map((code) => {
          const info = LOCALE_INFO[code];
          const selected = code === locale;
          return (
            <Pressable
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLanguage={info.bcp47}
              onPress={() => {
                setLocale(code);
              }}
              style={[styles.option, selected && styles.optionSelected]}
              testID={`language-${code}`}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {info.nativeName}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    label: { ...typography.label, color: theme.textMuted, marginBottom: spacing.xs },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    option: {
      minHeight: minTouchTarget,
      minWidth: minTouchTarget,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
    optionText: { ...typography.label, color: theme.text },
    optionTextSelected: { color: theme.onPrimary },
  });
}
