// app/app/profile.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Linking, ActivityIndicator, Platform } from 'react-native';
import { User, UserPlus, Globe, LogOut, MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/hooks/authProvider';
import { useRouter, Href } from 'expo-router';

type DBUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  coach_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function Profile() {
  const { session, signOut } = useAuth();
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [coachModal, setCoachModal] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const router = useRouter();

  const authEmail = session?.user?.email ?? '';
  const joinDate = useMemo(() => {
    // prefer auth user creation time; fallback to db row
    const iso = (session?.user?.created_at as string) || dbUser?.created_at || '';
    try {
      const d = iso ? new Date(iso) : null;
      return d ? d.toLocaleString(undefined, { month: 'long', year: 'numeric' }) : '—';
    } catch {
      return '—';
    }
  }, [session, dbUser]);

  const displayName = dbUser?.full_name || dbUser?.username || authEmail?.split('@')[0] || 'Athlete';
  const cityLabel = 'Set your city in profile'; // you can extend users table later

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        // 1) validate auth
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData.user) throw new Error(userErr?.message || 'Not authenticated');

        const uid = userData.user.id;

        // 2) try fetch profile
        const { data: rows, error: selErr } = await supabase.from('users').select('*').eq('id', uid).limit(1);
        if (selErr) throw selErr;

        if (rows && rows.length > 0) {
          if (alive) setDbUser(rows[0] as DBUser);
        } else {
          // 3) create minimal row if missing
          const username = authEmail ? authEmail.split('@')[0] : `user_${uid.slice(0, 6)}`;
          const payload: Partial<DBUser> = {
            id: uid,
            username,
            full_name: userData.user.user_metadata?.name || username,
          };
          const { data: created, error: insErr } = await supabase.from('users').insert(payload).select('*').limit(1);
          if (insErr) throw insErr;
          if (alive) setDbUser((created?.[0] as DBUser) || null);
        }
      } catch (e: any) {
        console.warn('Profile load error:', e?.message || e);
        Alert.alert('Profile', e?.message || 'Failed to load profile');
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [session?.user?.id]);

  const updateCoachId = async (newId: string) => {
    if (!dbUser) return;
    try {
      setBusy(true);
      const { data, error } = await supabase.from('users').update({ coach_id: newId }).eq('id', dbUser.id).select('*').limit(1);
      if (error) throw error;
      setDbUser(data?.[0] as DBUser);
      Alert.alert('Coach connected', 'Coach ID saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save Coach ID.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddCoachId = () => {
    // Cross-platform input: use our own modal
    setCoachInput(dbUser?.coach_id || '');
    setCoachModal(true);
  };

  const handleOpenWebProfile = async () => {
    try {
      const uid = dbUser?.id || session?.user?.id;
      if (!uid) throw new Error('No user id');
      // Point this to your real dashboard if you have one
      const url = `https://example.com/athlete/${uid}`;
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('Cannot open browser on this device');
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Open Web Profile', e?.message || 'Failed to open profile');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setBusy(true);
            // local scope ensures AsyncStorage token is wiped even if network fails
            await supabase.auth.signOut({ scope: 'local' });
          } finally {
            setBusy(false);
            // AuthProvider will re-render the stack and send you to /signin
          }
        },
      },
    ]);
  };

  if(!session) {
    router.replace('/signin' as Href);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator />
        <Text className="text-white mt-3">Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-black">
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl text-white font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
              Profile
            </Text>
          </View>

          {/* Profile Card */}
          <View className="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-800">
            <View className="items-center mb-8">
              <View className="w-28 h-28 rounded-full items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
                <User size={44} color="#FFFFFF" />
              </View>
              <Text className="text-white text-2xl font-bold mt-6 mb-1" style={{ fontFamily: 'Poppins_700Bold' }}>
                {displayName}
              </Text>
              <Text className="text-gray-400 text-base" style={{ fontFamily: 'Poppins_400Regular' }}>
                {authEmail || 'no-email@unknown'}
              </Text>
            </View>

            {/* Personal Info */}
            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
                <View className="flex-row items-center">
                  <View className="bg-blue-600 p-2.5 rounded-xl mr-4">
                    <Calendar size={22} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      Member since
                    </Text>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {joinDate}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
                <View className="flex-row items-center">
                  <View className="bg-green-600 p-2.5 rounded-xl mr-4">
                    <MapPin size={22} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      Location
                    </Text>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {cityLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-4">
                <View className="flex-row items-center">
                  <View className="bg-purple-600 p-2.5 rounded-xl mr-4">
                    <UserPlus size={22} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      Coach Status
                    </Text>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {dbUser?.coach_id ? 'Connected' : 'Not connected'}
                    </Text>
                  </View>
                </View>
                {dbUser?.coach_id ? (
                  <View className="bg-green-500 px-3 py-2 rounded-full">
                    <Text className="text-white text-xs font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {dbUser.coach_id}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="space-y-4">
            <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleAddCoachId} disabled={busy}>
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <View className="bg-blue-600 p-3 rounded-xl mr-4">
                    <UserPlus size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      {dbUser?.coach_id ? 'Change Coach ID' : 'Add Coach ID'}
                    </Text>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      Connect with your trainer
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleOpenWebProfile} disabled={busy}>
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <View className="bg-green-600 p-3 rounded-xl mr-4">
                    <Globe size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Open on Web
                    </Text>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      View profile in browser
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleLogout} disabled={busy}>
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <View className="bg-red-600 p-3 rounded-xl mr-4">
                    <LogOut size={24} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text className="text-white text-lg font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                      Logout
                    </Text>
                    <Text className="text-gray-400 text-sm" style={{ fontFamily: 'Poppins_400Regular' }}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Coach ID modal */}
      <Modal visible={coachModal} animationType="slide" transparent onRequestClose={() => setCoachModal(false)}>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <Text className="text-white text-lg font-semibold mb-3">Enter Coach ID</Text>
            <TextInput
              value={coachInput}
              onChangeText={setCoachInput}
              placeholder="COACH_XXXXX"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              className="border border-gray-700 rounded-xl px-4 py-3 text-white"
            />
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setCoachModal(false)} className="px-4 py-2 mr-2">
                <Text className="text-gray-300">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!coachInput.trim()) {
                    Alert.alert('Coach ID', 'Please enter a valid ID');
                    return;
                  }
                  setCoachModal(false);
                  await updateCoachId(coachInput.trim());
                }}
                className="px-4 py-2 bg-blue-600 rounded-lg"
                disabled={busy}
              >
                <Text className="text-white">{busy ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
