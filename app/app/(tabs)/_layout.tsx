import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Home, FileText, TrendingUp, User, ClipboardList, PlusCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/authProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { role } = useAuth();
  const tint = Colors[colorScheme ?? 'light'].tint;

  // Unified tabs, hide irrelevant ones via href:null
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // Coach wants "Track", athlete wants "Home"
          title: role === 'coach' ? 'Track' : 'Home',
          tabBarIcon: ({ color }) =>
            role === 'coach' ? <ClipboardList size={28} color={color} /> : <Home size={28} color={color} />,
        }}
      />

      {/* Athlete-only */}
      <Tabs.Screen
        name="tests"
        options={{
          title: 'Tests',
          href: role === 'coach' ? null : undefined, // hide for coach
          tabBarIcon: ({ color }) => <FileText size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          href: role === 'coach' ? null : undefined, // hide for coach
          tabBarIcon: ({ color }) => <TrendingUp size={28} color={color} />,
        }}
      />

      {/* Coach-only */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          href: role === 'athlete' ? null : undefined, // hide for athlete
          tabBarIcon: ({ color }) => <PlusCircle size={28} color={color} />,
        }}
      />

      {/* Shared */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
