import { minTouchTarget } from '@konkan/design-tokens';
import { Tabs } from 'expo-router';

import { useI18n } from '../../src/i18n/context';
import { useTheme } from '../../src/theme/useTheme';
import { Icon } from '../../src/ui/Icon';

export default function TabLayout() {
  const { t } = useI18n();
  const theme = useTheme();
  const tabs = [
    { name: 'index', title: t.tabHome, icon: 'home' },
    { name: 'search', title: t.tabSearch, icon: 'search' },
    { name: 'saved', title: t.tabSaved, icon: 'heart' },
    { name: 'profile', title: t.tabProfile, icon: 'person' },
  ] as const;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          minHeight: minTouchTarget + 16,
        },
        // Each tab is its own touch target: guarantee the 48dp minimum per item.
        tabBarItemStyle: { minHeight: minTouchTarget },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.name === 'index' ? t.appName : tab.title,
            tabBarLabel: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? tab.icon : `${tab.icon}-outline`}
                // Navigation passes a ColorValue; our tint colours are always strings.
                color={typeof color === 'string' ? color : theme.textMuted}
                size={24}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
