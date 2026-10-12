import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { colors } from '@/theme';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.green },
        headerTintColor: colors.white,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.grey,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <SymbolView name="house.fill" tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <SymbolView name="camera.fill" tintColor={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SymbolView name="gearshape.fill" tintColor={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
