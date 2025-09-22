import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { TrendingUp, Clock, Trophy, Target, Award } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ExerciseData {
  avgTime: string;
  avgScore: number;
  bestScore: number;
  totalUnits: number;
  dailyProgress: { day: string; value: number }[];
}

const exerciseData: Record<string, ExerciseData> = {
  pushups: {
    avgTime: '2.5 min',
    avgScore: 87,
    bestScore: 95,
    totalUnits: 1250,
    dailyProgress: [
      { day: 'Mon', value: 30 },
      { day: 'Tue', value: 45 },
      { day: 'Wed', value: 35 },
      { day: 'Thu', value: 50 },
      { day: 'Fri', value: 40 },
      { day: 'Sat', value: 55 },
      { day: 'Sun', value: 48 },
    ],
  },
  situps: {
    avgTime: '3.2 min',
    avgScore: 82,
    bestScore: 91,
    totalUnits: 980,
    dailyProgress: [
      { day: 'Mon', value: 25 },
      { day: 'Tue', value: 40 },
      { day: 'Wed', value: 30 },
      { day: 'Thu', value: 45 },
      { day: 'Fri', value: 35 },
      { day: 'Sat', value: 50 },
      { day: 'Sun', value: 42 },
    ],
  },
  highjump: {
    avgTime: '1.8 min',
    avgScore: 78,
    bestScore: 88,
    totalUnits: 156,
    dailyProgress: [
      { day: 'Mon', value: 20 },
      { day: 'Tue', value: 35 },
      { day: 'Wed', value: 25 },
      { day: 'Thu', value: 40 },
      { day: 'Fri', value: 30 },
      { day: 'Sat', value: 45 },
      { day: 'Sun', value: 38 },
    ],
  },
  squats: {
    avgTime: '4.1 min',
    avgScore: 85,
    bestScore: 93,
    totalUnits: 1420,
    dailyProgress: [
      { day: 'Mon', value: 35 },
      { day: 'Tue', value: 50 },
      { day: 'Wed', value: 40 },
      { day: 'Thu', value: 55 },
      { day: 'Fri', value: 45 },
      { day: 'Sat', value: 60 },
      { day: 'Sun', value: 52 },
    ],
  },
};

const BarChart = ({ data }: { data: { day: string; value: number }[] }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const chartWidth = width - 48;
  const barWidth = (chartWidth - 60) / data.length;

  return (
    <View className="bg-gray-900 rounded-2xl p-4 mb-6 border border-gray-800">
      <Text className="text-white text-lg font-bold mb-4" style={{ fontFamily: 'Poppins_600SemiBold' }}>
        📈 Daily Progress
      </Text>
      <View className="flex-row items-end justify-between h-48">
        {data.map((item, index) => (
          <View key={index} className="items-center" style={{ width: barWidth }}>
            <View className="flex-1 justify-end mb-2">
              <View
                className="bg-blue-500 rounded-t-lg"
                style={{
                  height: (item.value / maxValue) * 160,
                  width: barWidth - 10,
                }}
              />
            </View>
            <Text className="text-gray-400 text-xs" style={{ fontFamily: 'Poppins_400Regular' }}>
              {item.day}
            </Text>
            <Text className="text-white text-xs font-semibold" style={{ fontFamily: 'Poppins_500Medium' }}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const StatCard = ({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) => (
  <View className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex-1">
    <View className="flex-row items-center mb-3">
      <View className={`p-2 rounded-lg ${color}`}>
        {icon}
      </View>
    </View>
    <Text className="text-gray-400 text-xs mb-1" style={{ fontFamily: 'Poppins_400Regular' }}>
      {title}
    </Text>
    <Text className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
      {value}
    </Text>
  </View>
);

export default function Progress() {
  const [selectedExercise, setSelectedExercise] = useState<keyof typeof exerciseData>('pushups');
  const currentData = exerciseData[selectedExercise];

  const exercises = [
    { key: 'pushups', label: '💪 Push-ups', emoji: '💪' },
    { key: 'situps', label: '🏋️ Sit-ups', emoji: '🏋️' },
    { key: 'highjump', label: '🏃 High Jump', emoji: '🏃' },
    { key: 'squats', label: '🏋️ Squats', emoji: '🏋️' },
  ];

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="mb-8">
          <Text
            className="text-3xl text-white font-bold mb-2"
            style={{ fontFamily: 'Poppins_700Bold' }}
          >
            📊 Progress
          </Text>
          <Text
            className="text-gray-400 text-base"
            style={{ fontFamily: 'Poppins_400Regular' }}
          >
            Track your exercise performance
          </Text>
        </View>

        {/* Exercise Tabs */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row gap-3 px-1">
              {exercises.map((exercise) => (
                <TouchableOpacity
                  key={exercise.key}
                  onPress={() => setSelectedExercise(exercise.key as keyof typeof exerciseData)}
                  className={`px-4 py-3 rounded-2xl border ${
                    selectedExercise === exercise.key
                      ? 'bg-blue-600 border-blue-500'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedExercise === exercise.key ? 'text-white' : 'text-gray-300'
                    }`}
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  >
                    {exercise.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Bar Chart */}
        <BarChart data={currentData.dailyProgress} />

        {/* Statistics Cards */}
        <View className="gap-4">
          <Text
            className="text-white text-lg font-bold mb-2"
            style={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            📋 Statistics
          </Text>

          {/* Row 1 */}
          <View className="flex-row gap-4">
            <StatCard
              icon={<Clock size={20} color="#FFFFFF" />}
              title="Avg Time Spent"
              value={currentData.avgTime}
              color="bg-blue-600"
            />
            <StatCard
              icon={<TrendingUp size={20} color="#FFFFFF" />}
              title="Avg Score"
              value={`${currentData.avgScore}%`}
              color="bg-green-600"
            />
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-4">
            <StatCard
              icon={<Trophy size={20} color="#FFFFFF" />}
              title="Best Score"
              value={`${currentData.bestScore}%`}
              color="bg-yellow-600"
            />
            <StatCard
              icon={<Target size={20} color="#FFFFFF" />}
              title="Total Units"
              value={currentData.totalUnits}
              color="bg-purple-600"
            />
          </View>
        </View>

        {/* Achievement Badge */}
        <View className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 mt-6 border border-orange-500">
          <View className="flex-row items-center">
            <View className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
              <Award size={24} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text
                className="text-white text-lg font-bold"
                style={{ fontFamily: 'Poppins_600SemiBold' }}
              >
                🏆 This Week's Champion
              </Text>
              <Text
                className="text-orange-100 text-sm mt-1"
                style={{ fontFamily: 'Poppins_400Regular' }}
              >
                You've improved by 15% this week!
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}