// app/app/(tabs)/index.tsx (or wherever your home lives)
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User, Flame } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/authProvider';

export default function HomeScreen() {
  const { session } = useAuth();

  if (!session) {
    router.replace('/signin');
    return null;
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Header with greeting and profile */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text
              className="text-3xl text-white font-bold"
              style={{ fontFamily: 'Poppins_600SemiBold' }}
            >
              Good Morning
            </Text>
            <Text
              className="text-3xl text-white font-bold"
              style={{ fontFamily: 'Poppins_600SemiBold' }}
            >
              {session.user?.email?.split('@')[0] || 'Athlete'}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-800 p-3 rounded-full border-2 border-gray-700"
            onPress={() => router.push('/profile')}
          >
            <User size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-red-600 rounded-3xl p-8 mb-6 shadow-lg"
          onPress={() => router.push('/tests')}
        >
          <View className="items-center">
            <Text
              className="text-white text-2xl font-bold"
              style={{ fontFamily: 'Poppins_700Bold' }}
            >
              🎙️ RECORD
            </Text>
            <Text
              className="text-red-100 text-sm mt-2 opacity-90"
              style={{ fontFamily: 'Poppins_400Regular' }}
            >
              Start your session
            </Text>
          </View>
        </TouchableOpacity>

        {/* Example streaks card */}
        <View className="bg-gray-900 rounded-3xl p-6 mb-8 border border-gray-800">
          <View className="flex-row items-center justify-between">
            <View>
              <Text
                className="text-white text-xl font-bold mb-2"
                style={{ fontFamily: 'Poppins_600SemiBold' }}
              >
                🔥 Current Streak
              </Text>
              <Text
                className="text-orange-400 text-3xl font-bold"
                style={{ fontFamily: 'Poppins_700Bold' }}
              >
                15 Days
              </Text>
              <Text
                className="text-gray-400 text-sm mt-1"
                style={{ fontFamily: 'Poppins_400Regular' }}
              >
                Keep it up!
              </Text>
            </View>
            <View className="bg-orange-500 p-4 rounded-2xl">
              <Flame size={32} color="#FFFFFF" />
            </View>
          </View>
        </View>

      </View>
    </ScrollView>
  );
}
