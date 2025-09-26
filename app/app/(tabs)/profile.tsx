// app/app/profile.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert,
  Modal, TextInput, Linking, ActivityIndicator
} from 'react-native';
import { User, UserPlus, Globe, LogOut, MapPin, Calendar, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/constants/supabase';
import { useAuth } from '@/hooks/authProvider';
import { useRouter, Href } from 'expo-router';

type Athlete = {
  id: string;
  username: string | null;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  coach_id?: string | null;
  created_at?: string | null;
};

type Coach = {
  id: string;
  username: string | null;
  full_name: string | null;
  created_at?: string | null;
};

export default function Profile() {
  const { role, session } = useAuth(); // role is from auth metadata; if missing we'll treat as athlete
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [coachModal, setCoachModal] = useState(false);
  const [coachInput, setCoachInput] = useState('');
  const router = useRouter();

  const authEmail = session?.user?.email ?? '';
  const effectiveRole = (role === 'coach' || role === 'athlete') ? role : 'athlete'; // fallback

  const joinDate = useMemo(() => {
    const iso =
      (session?.user?.created_at as string) ||
      athlete?.created_at ||
      coach?.created_at ||
      '';
    try {
      return iso ? new Date(iso).toLocaleString(undefined, { month: 'long', year: 'numeric' }) : '—';
    } catch {
      return '—';
    }
  }, [session?.user?.created_at, athlete?.created_at, coach?.created_at]);

  const displayName =
    athlete?.full_name ||
    coach?.full_name ||
    athlete?.username ||
    coach?.username ||
    authEmail.split('@')[0] ||
    'User';

  // ------------ LOAD PROFILE (with deps!) ------------
  useEffect(() => {
    // don’t run until we know the auth user id
    if (!session?.user?.id) { setLoading(false); return; }

    let alive = true;
    const load = async () => {
      try {
        setLoading(true);

        const uid = session.user.id;

        if (effectiveRole === 'coach') {
          const { data, error } = await supabase
            .from('coaches')
            .select('*')
            .eq('id', uid)
            .limit(1);
          if (error) throw error;

          if (!alive) return;
          if (data && data.length > 0) {
            setCoach(data[0] as Coach);
          } else {
            // create minimal coach row if missing
            const username = authEmail ? authEmail.split('@')[0] : `coach_${uid.slice(0, 6)}`;
            const payload: Partial<Coach> = { id: uid, username, full_name: username };
            const { data: created, error: insErr } = await supabase
              .from('coaches')
              .insert(payload)
              .select('*')
              .limit(1);
            if (insErr) throw insErr;
            if (!alive) return;
            setCoach((created?.[0] as Coach) || null);
          }
        } else {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', uid)
            .limit(1);
          if (error) throw error;

          if (!alive) return;
          if (data && data.length > 0) {
            setAthlete(data[0] as Athlete);
          } else {
            // create minimal athlete row if missing
            const username = authEmail ? authEmail.split('@')[0] : `user_${uid.slice(0, 6)}`;
            const payload: Partial<Athlete> = { id: uid, username, full_name: username };
            const { data: created, error: insErr } = await supabase
              .from('users')
              .insert(payload)
              .select('*')
              .limit(1);
            if (insErr) throw insErr;
            if (!alive) return;
            setAthlete((created?.[0] as Athlete) || null);
          }
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
    // ✅ only rerun when role or the auth user id changes
  }, [effectiveRole, session?.user?.id, authEmail]);

  const updateCoachId = async (newId: string) => {
    if (!athlete) return;
    try {
      setBusy(true);
      const { data, error } = await supabase
        .from('users')
        .update({ coach_id: newId })
        .eq('id', athlete.id)
        .select('*')
        .limit(1);
      if (error) throw error;
      setAthlete(data?.[0] as Athlete);
      Alert.alert('Coach connected', 'Coach ID saved successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save Coach ID.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddCoachId = () => {
    setCoachInput(athlete?.coach_id || '');
    setCoachModal(true);
  };

  const handleOpenWebProfile = async () => {
    try {
      const uid = athlete?.id || coach?.id || session?.user?.id;
      if (!uid) throw new Error('No user id');
      const url = `https://example.com/${effectiveRole}/${uid}`;
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('Cannot open browser');
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
            await supabase.auth.signOut({ scope: 'local' });
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (!session) {
    router.replace('/signin' as Href);
    return null;
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
          <Text className="text-3xl text-white font-bold mb-8" style={{ fontFamily: 'Poppins_700Bold' }}>
            Profile
          </Text>

          <View className="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-800">
            <View className="items-center mb-8">
              <View className="w-28 h-28 rounded-full items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
                <User size={44} color="#FFFFFF" />
              </View>
              <Text className="text-white text-2xl font-bold mt-6 mb-1">{displayName}</Text>
              <Text className="text-gray-400 text-base">{authEmail || 'no-email@unknown'}</Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
                <View className="flex-row items-center">
                  <View className="bg-blue-600 p-2.5 rounded-xl mr-4"><Calendar size={22} color="#FFFFFF" /></View>
                  <View>
                    <Text className="text-gray-400 text-sm">Member since</Text>
                    <Text className="text-white text-lg font-semibold">{joinDate}</Text>
                  </View>
                </View>
              </View>

              <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
                <View className="flex-row items-center">
                  <View className="bg-green-600 p-2.5 rounded-xl mr-4"><MapPin size={22} color="#FFFFFF" /></View>
                  <View>
                    <Text className="text-gray-400 text-sm">Location</Text>
                    <Text className="text-white text-lg font-semibold">Set your city in profile</Text>
                  </View>
                </View>
              </View>

              {effectiveRole === 'athlete' && (
                <View className="flex-row items-center justify-between py-4">
                  <View className="flex-row items-center">
                    <View className="bg-purple-600 p-2.5 rounded-xl mr-4"><UserPlus size={22} color="#FFFFFF" /></View>
                    <View>
                      <Text className="text-gray-400 text-sm">Coach Status</Text>
                      <Text className="text-white text-lg font-semibold">
                        {athlete?.coach_id ? 'Connected' : 'Not connected'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View className="space-y-4">
            {effectiveRole === 'athlete' && (
              <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleAddCoachId} disabled={busy}>
                <View className="flex-row items-center justify-between p-5">
                  <View className="flex-row items-center">
                    <View className="bg-blue-600 p-3 rounded-xl mr-4"><UserPlus size={24} color="#FFFFFF" /></View>
                    <View>
                      <Text className="text-white text-lg font-semibold">
                        {athlete?.coach_id ? 'Change Coach ID' : 'Add Coach ID'}
                      </Text>
                      <Text className="text-gray-400 text-sm">Connect with your trainer</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleOpenWebProfile} disabled={busy}>
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <View className="bg-green-600 p-3 rounded-xl mr-4"><Globe size={24} color="#FFFFFF" /></View>
                  <View>
                    <Text className="text-white text-lg font-semibold">Open on Web</Text>
                    <Text className="text-gray-400 text-sm">View profile in browser</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-900 rounded-2xl border border-gray-800" onPress={handleLogout} disabled={busy}>
              <View className="flex-row items-center justify-between p-5">
                <View className="flex-row items-center">
                  <View className="bg-red-600 p-3 rounded-xl mr-4"><LogOut size={24} color="#FFFFFF" /></View>
                  <View>
                    <Text className="text-white text-lg font-semibold">Logout</Text>
                    <Text className="text-gray-400 text-sm">Sign out of your account</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {effectiveRole === 'athlete' && (
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
      )}
    </>
  );
}
