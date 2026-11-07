import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/feed/TabBar';
import { useAuth } from '@/context/auth';
import { useUserData } from '@/context/userdata';
import { useAlerts } from '@/hooks/useAlerts';

export default function TabsLayout() {
  const { user } = useAuth();
  const { favorites } = useUserData();
  const alerts = useAlerts();

  // The whole signed-in area is protected.
  if (!user) return <Redirect href="/account" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} badges={{ saved: favorites.length, alerts: alerts.length }} />}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="saved" options={{ title: 'Saved jobs' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
