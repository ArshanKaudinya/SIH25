import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User, Flame, Trophy, Award, Star, Calendar, Clock, Target } from 'lucide-react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
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
              Hardik
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-800 p-3 rounded-full border-2 border-gray-700"
            onPress={() => router.push('/profile')}
          >
            <User size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Record Card */}
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

        {/* Streaks Card */}
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

        {/* Stats Summary */}
        <View className="bg-gray-900 rounded-3xl p-6 border border-gray-800 mb-6">
          <Text
            className="text-white text-lg font-bold mb-4"
            style={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            📊 This Month
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text
                className="text-blue-400 text-2xl font-bold"
                style={{ fontFamily: 'Poppins_700Bold' }}
              >
                24
              </Text>
              <Text
                className="text-gray-400 text-xs"
                style={{ fontFamily: 'Poppins_400Regular' }}
              >
                Sessions
              </Text>
            </View>
            <View className="items-center">
              <Text
                className="text-green-400 text-2xl font-bold"
                style={{ fontFamily: 'Poppins_700Bold' }}
              >
                18h
              </Text>
              <Text
                className="text-gray-400 text-xs"
                style={{ fontFamily: 'Poppins_400Regular' }}
              >
                Total Time
              </Text>
            </View>
            <View className="items-center">
              <Text
                className="text-purple-400 text-2xl font-bold"
                style={{ fontFamily: 'Poppins_700Bold' }}
              >
                92%
              </Text>
              <Text
                className="text-gray-400 text-xs"
                style={{ fontFamily: 'Poppins_400Regular' }}
              >
                Accuracy
              </Text>
            </View>
          </View>
        </View>

        {/* Session Logs Table */}
        <View className="bg-gray-900 rounded-3xl p-6 border border-gray-800 mb-6">
          <Text
            className="text-white text-lg font-bold mb-4"
            style={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            📋 Recent Logs
          </Text>

          {/* Table Header */}
          <View className="flex-row bg-gray-800 rounded-lg p-3 mb-2">
            <Text className="text-gray-300 text-xs font-semibold flex-1" style={{ fontFamily: 'Poppins_500Medium' }}>
              Date
            </Text>
            <Text className="text-gray-300 text-xs font-semibold flex-1 text-center" style={{ fontFamily: 'Poppins_500Medium' }}>
              Duration
            </Text>
            <Text className="text-gray-300 text-xs font-semibold flex-1 text-right" style={{ fontFamily: 'Poppins_500Medium' }}>
              Type
            </Text>
            <Text className="text-gray-300 text-xs font-semibold flex-1 text-right" style={{ fontFamily: 'Poppins_500Medium' }}>
              Score
            </Text>
          </View>

          {/* Table Rows */}
          <View className="space-y-2">
            <View className="flex-row py-3 border-b border-gray-800">
              <Text className="text-white text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Sep 22
              </Text>
              <Text className="text-gray-300 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                45min
              </Text>
              <Text className="text-blue-400 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                Practice
              </Text>
              <Text className="text-green-400 text-sm flex-1 text-right font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                92%
              </Text>
            </View>

            <View className="flex-row py-3 border-b border-gray-800">
              <Text className="text-white text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Sep 21
              </Text>
              <Text className="text-gray-300 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                30min
              </Text>
              <Text className="text-green-400 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                Test
              </Text>
              <Text className="text-green-400 text-sm flex-1 text-right font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                95%
              </Text>
            </View>

            <View className="flex-row py-3 border-b border-gray-800">
              <Text className="text-white text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Sep 20
              </Text>
              <Text className="text-gray-300 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                1h 15min
              </Text>
              <Text className="text-purple-400 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                Training
              </Text>
              <Text className="text-yellow-400 text-sm flex-1 text-right font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                87%
              </Text>
            </View>

            <View className="flex-row py-3">
              <Text className="text-white text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Sep 19
              </Text>
              <Text className="text-gray-300 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                25min
              </Text>
              <Text className="text-orange-400 text-sm flex-1 text-center" style={{ fontFamily: 'Poppins_400Regular' }}>
                Quick Test
              </Text>
              <Text className="text-red-400 text-sm flex-1 text-right font-semibold" style={{ fontFamily: 'Poppins_600SemiBold' }}>
                78%
              </Text>
            </View>
          </View>

          {/* View More Button */}
          <TouchableOpacity
            className="mt-4 bg-gray-800 rounded-lg p-3 border border-gray-700"
            onPress={() => router.push('/progress')}
          >
            <Text
              className="text-blue-400 text-center text-sm font-semibold"
              style={{ fontFamily: 'Poppins_500Medium' }}
            >
              View More Logs →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
  };