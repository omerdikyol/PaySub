import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';

// Utility function to render tab icons
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { t } = useLanguage();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].accent,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].muted,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].card.background,
            borderTopColor: Colors[colorScheme ?? 'light'].border,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('dashboard'),
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="income"
          options={{
            title: t('income'),
            tabBarIcon: ({ color }) => <TabBarIcon name="dollar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: t('expenses'),
            tabBarIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('settings'),
            tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
