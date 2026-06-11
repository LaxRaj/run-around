import { Tabs } from 'expo-router';

// Single-screen app: hide the tab bar for a full-bleed map experience.
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}>
      <Tabs.Screen name="index" options={{ title: 'Map' }} />
    </Tabs>
  );
}
