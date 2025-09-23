// app/app/signup.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/constants/supabase';
import { useRouter } from 'expo-router';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);

  // set when signUp returns user but no session (email confirmation required)
  const [verifyPending, setVerifyPending] = useState(false);

  const router = useRouter();

  const ensureUserRow = async (uid: string, uname: string) => {
    const { data: existing, error: selErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', uid)
      .limit(1);
    if (selErr) throw selErr;
    if (existing && existing.length > 0) return;

    const { error: insErr } = await supabase.from('users').insert({
      id: uid,
      username: uname,
      full_name: null,
    });
    if (insErr) throw insErr;
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Missing fields', 'Please fill username, email, and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // If your project requires email confirmation, Supabase returns user but NO session.
      if (data.user && !data.session) {
        setVerifyPending(true);
        Alert.alert(
          'Verify your email',
          'We sent a confirmation link to your inbox. Tap CONFIRMED after you verify.'
        );
        return;
      }

      // If confirmation not required, you already have a session: create row then route
      if (data.session && data.user) {
        await ensureUserRow(data.user.id, username);
        router.replace('/profile-setup');
      }
    } catch (e: any) {
      Alert.alert('Signup error', e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmed = async () => {
    // User tapped CONFIRMED after verifying email
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Still not confirmed. Try again in a few seconds.');

      await ensureUserRow(data.user.id, username);
      router.replace('/profile-setup');
    } catch (e: any) {
      Alert.alert('Not confirmed yet', e.message || 'Please wait a few seconds and try CONFIRMED again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create your account</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      {!verifyPending ? (
        <Button title={loading ? 'Loading...' : 'Sign Up'} onPress={handleSignup} />
      ) : (
        <>
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Verify your email</Text>
            <Text style={styles.bannerText}>
              Check your inbox for the confirmation link. Once you’ve confirmed, tap CONFIRMED below.
            </Text>
          </View>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmed} disabled={loading}>
            <Text style={styles.confirmText}>{loading ? 'Checking...' : 'CONFIRMED'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'black' },
  title: { fontSize: 22, marginBottom: 16, color: 'white', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#333', padding: 12, borderRadius: 8,
    marginBottom: 12, color: 'white', backgroundColor: '#0f0f0f'
  },
  banner: {
    backgroundColor: '#111827', borderColor: '#1f2937', borderWidth: 1,
    padding: 12, borderRadius: 10, marginTop: 8, marginBottom: 12
  },
  bannerTitle: { color: 'white', fontWeight: '700', marginBottom: 4 },
  bannerText: { color: '#d1d5db' },
  confirmBtn: {
    backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center'
  },
  confirmText: { color: 'white', fontWeight: '700' },
});
