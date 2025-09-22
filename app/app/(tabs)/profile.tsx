import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, UserPlus, Globe, LogOut, MapPin, Calendar, Edit, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: 'Hardik Sharma',
    age: 22,
    city: 'Mumbai, India',
    coachId: null as string | null,
    email: 'hardik.sharma@email.com',
    joinDate: 'September 2024'
  });

  const handleAddCoachId = () => {
    Alert.alert(
      'Add Coach ID',
      'Enter your coach ID to connect with your trainer',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Add',
          onPress: () => {
            // For demo purposes, set a sample coach ID
            setProfileData(prev => ({ ...prev, coachId: 'COACH_2024_001' }));
            Alert.alert('Success', 'Coach ID added successfully!');
          }
        }
      ]
    );
  };

  const handleOpenWebProfile = () => {
    Alert.alert(
      'Open Web Profile',
      'This will open your profile in the web browser',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open',
          onPress: () => {
            Alert.alert('Opening...', 'Web profile would open here');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Logged Out', 'You have been successfully logged out');
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="mb-8">
          <Text
            className="text-3xl text-white font-bold"
            style={{ fontFamily: 'Poppins_700Bold' }}
          >
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="bg-gray-900 rounded-3xl p-8 mb-8 border border-gray-800">
          {/* Profile Picture */}
          <View className="items-center mb-8">
            <View className="relative">
              <View className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full items-center justify-center shadow-xl">
                <User size={44} color="#FFFFFF" />
              </View>
            </View>
            <Text
              className="text-white text-2xl font-bold mt-6 mb-1"
              style={{ fontFamily: 'Poppins_700Bold' }}
            >
              {profileData.name}
            </Text>
            <Text
              className="text-gray-400 text-base"
              style={{ fontFamily: 'Poppins_400Regular' }}
            >
              {profileData.email}
            </Text>
          </View>

          {/* Personal Info Grid */}
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-4 border-b border-gray-800">
              <View className="flex-row items-center">
                <View className="bg-blue-600 p-2.5 rounded-xl mr-4">
                  <Calendar size={22} color="#FFFFFF" />
                </View>
                <View>
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Age
                  </Text>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    {profileData.age} years old
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
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Location
                  </Text>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    {profileData.city}
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
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Coach Status
                  </Text>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    {profileData.coachId ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>
              {profileData.coachId && (
                <View className="bg-green-500 px-3 py-2 rounded-full">
                  <Text
                    className="text-white text-xs font-bold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    Active
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>        {/* Action Buttons */}
        <View className="space-y-4">
          {/* Add Coach ID */}
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl border border-gray-800"
            onPress={handleAddCoachId}
          >
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center">
                <View className="bg-blue-600 p-3 rounded-xl mr-4">
                  <UserPlus size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    Add Coach ID
                  </Text>
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Connect with your trainer
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {/* Open Profile on Web */}
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl border border-gray-800"
            onPress={handleOpenWebProfile}
          >
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center">
                <View className="bg-green-600 p-3 rounded-xl mr-4">
                  <Globe size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    Open on Web
                  </Text>
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    View profile in browser
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            className="bg-gray-900 rounded-2xl border border-gray-800"
            onPress={handleLogout}
          >
            <View className="flex-row items-center justify-between p-5">
              <View className="flex-row items-center">
                <View className="bg-red-600 p-3 rounded-xl mr-4">
                  <LogOut size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text
                    className="text-white text-lg font-semibold"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    Logout
                  </Text>
                  <Text
                    className="text-gray-400 text-sm"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
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
  );
}