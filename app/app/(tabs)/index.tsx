import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { User, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/authProvider';
import { supabase } from '@/constants/supabase';

type AthleteRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  coach_id?: string | null;
};

function isAthleteProfile(
  profile: ReturnType<typeof useAuth>['profile']
): profile is { role: 'athlete'; data: AthleteRow } {
  return profile?.role === 'athlete';
}

export default function HomeScreen() {
  const { profile, session, role, loading } = useAuth();
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [athletesLoading, setAthletesLoading] = useState(false);

  // Load coach roster when applicable
  // Load coach roster when applicable
useEffect(() => {
  const fetchAthletes = async () => {
    if (!session?.user?.id || role !== 'coach') return;
    try {
      setAthletesLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, age, height_cm, weight_kg, coach_id')
        .eq('coach_id', session.user.id)
        .order('username', { nullsFirst: true });
      if (error) throw error;
      setAthletes(data ?? []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load athletes');
    } finally {
      setAthletesLoading(false);
    }
  };

  fetchAthletes();
}, [session?.user?.id, role]); // ✅ depend only on primitives


  const displayName =
    (profile?.data as { full_name?: string | null })?.full_name ||
    (profile?.data as { username?: string | null })?.username ||
    session?.user?.email?.split('@')[0] ||
    (role === 'coach' ? 'Coach' : 'Athlete');

  // 1) Booting auth — show spinner (not blank)
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  // 2) Not signed in — show a simple screen with CTA (no redirects that can blank)
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: 'white', fontSize: 20 }}>You’re signed out</Text>
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 }}
          onPress={() => router.push('/signin')}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3) Signed in — render the real home
  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl text-white font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              {role === 'coach' ? 'Welcome Coach' : 'Good Morning'}
            </Text>
            <Text className="text-3xl text-white font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
              {displayName}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-800 p-3 rounded-full border-2 border-gray-700"
            onPress={() => router.push('/profile')}
          >
            <User size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* === Athlete view === */}
        {role !== 'coach' && (
          <>
            <TouchableOpacity
              className="bg-red-600 rounded-3xl p-8 mb-6 shadow-lg"
              onPress={() => router.push('/tests')}
            >
              <View className="items-center">
                <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
                  🎙️ RECORD
                </Text>
                <Text className="text-red-100 text-sm mt-2 opacity-90" style={{ fontFamily: 'Poppins_400Regular' }}>
                  Start your session
                </Text>
              </View>
            </TouchableOpacity>

            <View className="bg-gray-900 rounded-3xl p-6 mb-8 border border-gray-800">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-xl font-bold mb-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    🔥 Current Streak
                  </Text>
                  <Text className="text-orange-400 text-3xl font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
                    15 Days
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    Keep it up!
                  </Text>
                </View>
                <View className="bg-orange-500 p-4 rounded-2xl">
                  <Flame size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {isAthleteProfile(profile) && (profile.data.coach_id == null) && (
              <TouchableOpacity
                className="bg-gray-800 rounded-2xl p-4 border border-gray-700"
                onPress={() => {
                  // TODO: router.push('/link-coach')
                }}
              >
                <Text className="text-white text-base" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  Link your Coach →
                </Text>
                <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                  Enter your coach’s username to share your stats.
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* === Coach view === */}
        {role === 'coach' && (
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                Your Athletes
              </Text>
              <TouchableOpacity
                className="bg-gray-800 px-3 py-2 rounded-xl border border-gray-700"
                onPress={() => {
                  // TODO: router.push('/invite-athlete')
                }}
              >
                <Text className="text-white" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                  + Invite
                </Text>
              </TouchableOpacity>
            </View>

            {athletesLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#fff" />
              </View>
            ) : athletes.length === 0 ? (
              <View className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <Text className="text-gray-300" style={{ fontFamily: 'Poppins_400Regular' }}>
                  No athletes linked yet. Send them your username to connect.
                </Text>
              </View>
            ) : (
              athletes.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  className="bg-gray-900 rounded-2xl p-5 mb-3 border border-gray-800"
                  onPress={() => {
                    // TODO: router.push(`/athlete/${a.id}`)
                  }}
                >
                  <Text className="text-white text-lg" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                    {a.full_name || a.username || 'Unnamed Athlete'}
                  </Text>
                  <Text className="text-gray-400 text-sm mt-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {[
                      a.age ? `${a.age}y` : null,
                      a.height_cm ? `${a.height_cm}cm` : null,
                      a.weight_kg ? `${a.weight_kg}kg` : null,
                    ].filter(Boolean).join(' · ') || 'Tap to view stats'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
