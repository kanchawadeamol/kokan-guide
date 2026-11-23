import { minTouchTarget, radius, spacing, typography } from '@konkan/design-tokens';
import type { ColorTheme } from '@konkan/design-tokens';
import { SAMPLE_NOTICE } from '@konkan/sample-data';
import type { VerificationStatus } from '@konkan/sample-data';
import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useI18n } from '../i18n/context';
import { useTheme } from '../theme/useTheme';
import { Icon } from './Icon';
import { useSharedStyles } from './styles';

function useControlStyles() {
  const theme = useTheme();
  return useMemo(() => ({ theme, styles: createStyles(theme) }), [theme]);
}

// ---------------------------------------------------------------- Button

export interface ButtonProps {
  label: string;
  /** Optional for disabled buttons, which never fire. */
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: string;
  /** Visually and semantically disabled, but still focusable so the reason can be heard. */
  disabled?: boolean;
  /** Spoken after the label, e.g. why the button is disabled. */
  hint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  hint,
  testID,
}: ButtonProps) {
  const { theme, styles } = useControlStyles();
  const textColor =
    variant === 'primary' && !disabled
      ? theme.onPrimary
      : disabled
        ? theme.textMuted
        : theme.primary;
  return (
    <Pressable
      accessibilityRole="button"
      // Explicit label: icon glyphs must never become part of the announced name.
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      {...(hint ? { accessibilityHint: hint } : {})}
      onPress={() => {
        if (!disabled) onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'ghost' && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
      testID={testID}
    >
      {icon ? <Icon name={icon} color={textColor} size={20} /> : null}
      <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------- TextField

export interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  hint?: string;
  error?: string | undefined;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  maxLength?: number;
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  hint,
  error,
  placeholder,
  keyboardType,
  multiline,
  maxLength,
  autoComplete,
  textContentType,
  testID,
}: TextFieldProps) {
  const { theme, styles } = useControlStyles();
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.fieldLabel}>
        {label}
      </Text>
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        accessibilityLabelledBy={labelId}
        {...(hint || error ? { accessibilityHint: [error, hint].filter(Boolean).join('. ') } : {})}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        autoComplete={autoComplete}
        textContentType={textContentType}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          setFocused(false);
        }}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
        testID={testID}
      />
      {error ? (
        // Live region: TalkBack announces the error as soon as it appears.
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- Picker

export interface PickerOption {
  value: string;
  label: string;
}

export function PickerField({
  label,
  value,
  options,
  onChange,
  error,
  testID,
}: {
  label: string;
  value: string;
  options: readonly PickerOption[];
  onChange: (value: string) => void;
  error?: string | undefined;
  testID?: string;
}) {
  const { t } = useI18n();
  const { theme, styles } = useControlStyles();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? t.choose}`}
        {...(error ? { accessibilityHint: error } : {})}
        onPress={() => {
          setOpen(true);
        }}
        style={[styles.input, styles.pickerButton, error ? styles.inputError : null]}
        testID={testID}
      >
        <Text style={selected ? styles.pickerValue : styles.pickerPlaceholder}>
          {selected?.label ?? t.choose}
        </Text>
        <Icon name="chevron-down" color={theme.textMuted} size={18} />
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => {
          setOpen(false);
        }}
      >
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text accessibilityRole="header" style={styles.modalTitle}>
              {label}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t.back}
              onPress={() => {
                setOpen(false);
              }}
              style={styles.iconButton}
            >
              <Icon name="close" color={theme.text} />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(o) => o.value}
            accessibilityRole="radiogroup"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityLabel={item.label}
                accessibilityState={{ checked: item.value === value }}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={styles.option}
                testID={testID ? `${testID}-${item.value}` : undefined}
              >
                <Text style={styles.optionText}>{item.label}</Text>
                {item.value === value ? <Icon name="checkmark" color={theme.primary} /> : null}
              </Pressable>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

// ---------------------------------------------------------------- Checkbox and radio group

export function Checkbox({
  label,
  checked,
  onChange,
  error,
  testID,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string | undefined;
  testID?: string;
}) {
  const { theme, styles } = useControlStyles();
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked }}
        {...(error ? { accessibilityHint: error } : {})}
        onPress={() => {
          onChange(!checked);
        }}
        style={styles.checkRow}
        testID={testID}
      >
        <Icon
          name={checked ? 'checkbox' : 'square-outline'}
          color={checked ? theme.primary : theme.borderStrong}
          size={26}
        />
        <Text style={styles.checkLabel}>{label}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: readonly PickerOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
}) {
  const { theme, styles } = useControlStyles();
  const labelId = useId();
  return (
    <View style={styles.field}>
      <Text nativeID={labelId} style={styles.fieldLabel}>
        {label}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabelledBy={labelId}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked }}
              onPress={() => {
                onChange(option.value);
              }}
              style={styles.checkRow}
            >
              <Icon
                name={checked ? 'radio-button-on' : 'radio-button-off'}
                color={checked ? theme.primary : theme.borderStrong}
                size={24}
              />
              <Text style={styles.checkLabel}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------- Badges and banners

export function StatusBadge({ status }: { status: VerificationStatus }) {
  const { t } = useI18n();
  const { theme, styles } = useControlStyles();
  const config = {
    verified: { icon: 'checkmark-circle', color: theme.success, label: t.verified },
    pending: { icon: 'time', color: theme.warning, label: t.pending },
    unverified: { icon: 'ellipse-outline', color: theme.textMuted, label: t.unverified },
  }[status];
  return (
    <View style={styles.badge}>
      <Icon name={config.icon} color={config.color} size={16} />
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

export function SampleBanner() {
  const { locale } = useI18n();
  const { styles } = useSharedStyles();
  return (
    <View style={styles.banner} accessibilityRole="text">
      <Text style={styles.body}>{SAMPLE_NOTICE[locale]}</Text>
    </View>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  const { styles } = useSharedStyles();
  return (
    <View style={styles.banner}>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

// ---------------------------------------------------------------- styles

function createStyles(theme: Readonly<ColorTheme>) {
  return StyleSheet.create({
    button: {
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    buttonPrimary: { backgroundColor: theme.primary },
    buttonSecondary: {
      borderWidth: 1,
      borderColor: theme.borderStrong,
      backgroundColor: theme.surface,
    },
    buttonGhost: { backgroundColor: 'transparent' },
    buttonDisabled: {
      backgroundColor: theme.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    pressed: { opacity: 0.85 },
    buttonText: { ...typography.label, fontWeight: '600' },
    field: { gap: spacing.xs },
    fieldLabel: { ...typography.label, color: theme.text },
    fieldHint: { ...typography.caption, color: theme.textMuted },
    fieldError: { ...typography.label, color: theme.danger },
    input: {
      minHeight: minTouchTarget,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: theme.borderStrong,
      borderRadius: radius.md,
      backgroundColor: theme.surface,
      color: theme.text,
      ...typography.body,
    },
    inputMultiline: { minHeight: 120, paddingTop: spacing.md, textAlignVertical: 'top' },
    inputFocused: { borderColor: theme.focusRing, borderWidth: 2 },
    inputError: { borderColor: theme.danger, borderWidth: 2 },
    pickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pickerValue: { ...typography.body, color: theme.text },
    pickerPlaceholder: { ...typography.body, color: theme.textMuted },
    modal: { flex: 1, backgroundColor: theme.background },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: { ...typography.heading, color: theme.text },
    iconButton: {
      minWidth: minTouchTarget,
      minHeight: minTouchTarget,
      alignItems: 'center',
      justifyContent: 'center',
    },
    option: {
      minHeight: minTouchTarget + 8,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    optionText: { ...typography.body, color: theme.text },
    checkRow: {
      minHeight: minTouchTarget,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    checkLabel: { ...typography.body, color: theme.text, flexShrink: 1 },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: theme.surfaceMuted,
      alignSelf: 'flex-start',
    },
    badgeText: { ...typography.caption, fontWeight: '600' },
  });
}
