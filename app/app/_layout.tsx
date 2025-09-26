import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/authProvider';
import { supabase } from '@/constants/supabase';
import { useEffect, useState } from 'react';

function RootNavigator() {
  const { session, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<'auth' | 'setup' | 'app'>('auth');

  useEffect(() => {
    const check = async () => {
      if (loading) return;

      // No local session -> auth stack
      if (!session) {
        setRoute('auth');
        setReady(true);
        console.log('[router] route=auth (no session)');
        return;
      }

      // Validate token with Supabase
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        await supabase.auth.signOut({ scope: 'local' }); // purge stale token
        setRoute('auth');
        setReady(true);
        console.log('[router] route=auth (stale/invalid token)');
        return;
      }

      // Profile gate (optional: treat missing full_name as incomplete)
      const { data: rows, error: selErr } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', data.user.id)
        .limit(1);

      if (selErr) {
        // don’t block login on profile fetch failure; send to app
        console.warn('[router] users select error:', selErr.message);
        setRoute('app');
      } else if (!rows || rows.length === 0 || !rows[0]?.full_name) {
        setRoute('setup');
        console.log('[router] route=setup (profile incomplete)');
      } else {
        setRoute('app');
        // console.log('[router] route=app (valid user)');
      }
      setReady(true);
    };
    check();
  }, [session, loading]);

  if (!ready) return null; // optional splash

  if (route === 'auth') {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
      </Stack>
    );
  }

  if (route === 'setup') {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="profile-setup" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
