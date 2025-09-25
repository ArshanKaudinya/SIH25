// app/app/signup.tsx
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '@/constants/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';

type Role = 'athlete' | 'coach';

export default function Signup() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<Role>('athlete'); // tab
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [verifyPending, setVerifyPending] = useState(false);
  const router = useRouter();

  // allow /signup?role=coach to preselect the tab
  useEffect(() => {
    if (params.role === 'coach') setRole('coach');
  }, [params.role]);

  const ensureProfileRow = async (uid: string, uname: string, r: Role) => {
    const table = r === 'coach' ? 'coaches' : 'users';
    const { error } = await supabase
      .from(table)
      .upsert({ id: uid, username: uname, full_name: null }, { onConflict: 'id' });
    if (error) throw error;
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Missing fields', 'Please fill username, email, and password.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
      });
      if (error) throw error;

      if (data.user && !data.session) {
        setVerifyPending(true);
        Alert.alert('Verify your email', 'We sent a confirmation link to your inbox. Tap CONFIRMED after you verify.');
        return;
      }

      if (data.session && data.user) {
        await ensureProfileRow(data.user.id, username, role);
        router.replace(role === 'coach' ? '/(tabs)' : '/profile-setup');
      }
    } catch (e: any) {
      Alert.alert('Signup error', e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmed = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session || !data.user) throw new Error('Still not confirmed. Try again shortly.');

      const metaRole = (data.user.user_metadata?.role as Role) || role;
      await ensureProfileRow(data.user.id, username, metaRole);
      router.replace(metaRole === 'coach' ? '/(tabs)' : '/profile-setup');
    } catch (e: any) {
      Alert.alert('Not confirmed yet', e.message || 'Please wait a few seconds and try CONFIRMED again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create your account</Text>

      {/* Role tabs */}
      <View style={styles.roleRow}>
        {(['athlete','coach'] as const).map(r => {
          const selected = role === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={[styles.roleBtn, selected && styles.roleBtnActive]}
            >
              <Text style={[styles.roleText, selected && styles.roleTextActive]}>
                {r[0].toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  roleBtn: {
    flex: 1, borderWidth: 1, borderColor: '#333', backgroundColor: '#0f0f0f',
    paddingVertical: 10, borderRadius: 999, alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  roleText: { color: '#d1d5db', fontWeight: '600' },
  roleTextActive: { color: 'white' },
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
  confirmBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmText: { color: 'white', fontWeight: '700' },
});
