import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type IoniconsProps = ComponentProps<typeof Ionicons>;
export type IconName = IoniconsProps['name'];
export type IconColor = NonNullable<IoniconsProps['color']>;

/** Decorative icon: always hidden from screen readers (the adjacent text carries meaning). */
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: string;
  size?: number;
  color: IconColor;
}) {
  return (
    <Ionicons
      name={name as IconName}
      size={size}
      color={color}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
