import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Video, Upload, Play, X, Activity, Eye, BarChart3, Camera, Pause, Square, FolderOpen, FileVideo } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';

export default function Test() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1); // 1: feedback type, 2: sport selection
  const [selectedFeedbackType, setSelectedFeedbackType] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [recordingMode, setRecordingMode] = useState(''); // 'record' or 'upload'
  const [showCamera, setShowCamera] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<number | null>(null);

  // Timer effect for recordingtext strings must be rendered with a <Text> componenet
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, isPaused]);

  // Check audio permissions on component mount
  useEffect(() => {
    checkAudioPermissions();
  }, []);

  const checkAudioPermissions = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setAudioPermission(status === 'granted');
    } catch (error) {
      console.error('Error checking audio permissions:', error);
      setAudioPermission(false);
    }
  };

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setAudioPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      setAudioPermission(false);
      return false;
    }
  };

  const feedbackTypes = [
    {
      id: 'live',
      title: 'Live Feedback',
      description: 'Real-time analysis during exercise',
      icon: Eye,
      color: '#10B981'
    },
    {
      id: 'deep',
      title: 'Deep Analysis',
      description: 'Comprehensive post-exercise analysis',
      icon: BarChart3,
      color: '#3B82F6'
    }
  ];

  const sports = [
    {
      id: 'situps',
      title: 'Sit-ups',
      emoji: '🏃‍♂️',
      color: '#EF4444'
    },
    {
      id: 'pushups',
      title: 'Push-ups',
      emoji: '💪',
      color: '#F59E0B'
    },
    {
      id: 'vertical_jumps',
      title: 'Vertical Jumps',
      emoji: '🦘',
      color: '#10B981'
    },
    {
      id: 'squats',
      title: 'Squats',
      emoji: '🏋️‍♂️',
      color: '#8B5CF6'
    }
  ];

  const handleStart = (mode: string) => {
    setRecordingMode(mode);
    setIsModalVisible(true);
    setStep(1);
    setSelectedFeedbackType('');
    setSelectedSport('');
  };

  const handleFeedbackTypeSelect = (type: string) => {
    setSelectedFeedbackType(type);
    setStep(2);
  };

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
  };

  const handleBeginSession = async () => {
    setIsModalVisible(false);

    if (recordingMode === 'record' && selectedFeedbackType === 'live') {
      // Check camera permissions before opening camera
      if (!permission) {
        // Camera permissions are still loading
        return;
      }

      if (!permission.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please grant camera access to record exercise videos.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Check audio permissions
      if (audioPermission === null) {
        await checkAudioPermissions();
      }

      if (!audioPermission) {
        const audioGranted = await requestAudioPermissions();
        if (!audioGranted) {
          Alert.alert(
            'Audio Permission Required',
            'Please grant microphone access to record videos with audio.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Open camera for live recording
      setShowCamera(true);
    } else if (recordingMode === 'upload') {
      // Show file upload interface
      setShowFileUpload(true);
    } else {
      // For deep analysis recording, show alert and proceed
      Alert.alert(
        'Session Starting',
        `Starting ${selectedFeedbackType} session for ${selectedSport} with ${recordingMode === 'record' ? 'video recording' : 'file upload'}`,
        [{ text: 'OK' }]
      );
    }

    // Reset state
    setStep(1);
    setSelectedFeedbackType('');
    setSelectedSport('');
    setRecordingMode('');
  };  const handleStartRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        setRecordingTime(0);

        // Start recording
        const video = await cameraRef.current.recordAsync();

        if (video) {
          console.log('Video recorded:', video.uri);
          Alert.alert(
            'Recording Complete',
            'Your exercise session has been recorded successfully!',
            [{ text: 'OK' }]
          );
        }

      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording. Please try again.');
      } finally {
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
  };

  const handlePauseRecording = () => {
    // Note: Expo Camera doesn't support pause/resume during recording
    // This would need to be implemented as stop/start with multiple clips
    Alert.alert(
      'Pause Not Supported',
      'Camera recording cannot be paused. You can stop and start a new recording.',
      [{ text: 'OK' }]
    );
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setShowCamera(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };  const handleFileUpload = () => {
    // File picker logic for M4V files
    Alert.alert(
      'File Upload',
      'Please select an M4V file from your device',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => {
          // Implement file picker here
          setShowFileUpload(false);
          Alert.alert('Success', 'M4V file uploaded successfully!');
        }}
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetModal = () => {
    setIsModalVisible(false);
    setStep(1);
    setSelectedFeedbackType('');
    setSelectedSport('');
    setRecordingMode('');
  };

  const resetCamera = () => {
    setShowCamera(false);
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  };

  const resetFileUpload = () => {
    setShowFileUpload(false);
  };

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="px-6 pt-16 pb-8">
        {/* Header */}
        <View className="mb-8">
          <Text
            className="text-3xl text-white font-bold mb-2"
            style={{ fontFamily: 'Poppins_700Bold' }}
          >
            🎯 Exercise Tests
          </Text>
          <Text
            className="text-gray-400 text-base"
            style={{ fontFamily: 'Poppins_400Regular' }}
          >
            Record or upload your exercise session
          </Text>
        </View>

        {/* Recording Options */}
        <View className="space-y-4 mb-8">
          {/* Record Video Option */}
          <TouchableOpacity
            className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
            onPress={() => handleStart('record')}
          >
            <View className="flex-row items-center">
              <View className="bg-red-600 p-4 rounded-2xl mr-4">
                <Video size={32} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-white text-xl font-bold mb-1"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  📹 Record Video
                </Text>
                <Text
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                >
                  Start live recording session
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Upload File Option */}
          <TouchableOpacity
            className="bg-gray-900 rounded-3xl p-6 border border-gray-800"
            onPress={() => handleStart('upload')}
          >
            <View className="flex-row items-center">
              <View className="bg-blue-600 p-4 rounded-2xl mr-4">
                <Upload size={32} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-white text-xl font-bold mb-1"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  📁 Upload M4V File
                </Text>
                <Text
                  className="text-gray-400 text-sm"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                >
                  Upload existing video file
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="bg-gray-900 rounded-3xl p-6 border border-gray-800">
          <Text
            className="text-white text-lg font-bold mb-4"
            style={{ fontFamily: 'Poppins_600SemiBold' }}
          >
            📋 Instructions
          </Text>
          <View className="space-y-3">
            <View className="flex-row">
              <Text className="text-orange-400 text-sm mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>1.</Text>
              <Text className="text-gray-300 text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Choose to record a new video or upload an existing M4V file
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-orange-400 text-sm mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>2.</Text>
              <Text className="text-gray-300 text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Select feedback type: Live Feedback or Deep Analysis
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-orange-400 text-sm mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>3.</Text>
              <Text className="text-gray-300 text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Choose your exercise: Sit-ups, Push-ups, Vertical Jumps, or Squats
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-orange-400 text-sm mr-2" style={{ fontFamily: 'Poppins_600SemiBold' }}>4.</Text>
              <Text className="text-gray-300 text-sm flex-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                Start your session and get personalized feedback
              </Text>
            </View>
          </View>
        </View>

        {/* Selection Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={resetModal}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-end">
            <View className="bg-gray-900 rounded-t-3xl p-6 max-h-4/5">
              {/* Modal Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className="text-white text-xl font-bold"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  {step === 1 ? '🎯 Choose Feedback Type' : '🏃‍♂️ Select Sport'}
                </Text>
                <TouchableOpacity onPress={resetModal}>
                  <X size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {step === 1 ? (
                  /* Feedback Type Selection */
                  <View className="space-y-4">
                    {feedbackTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <TouchableOpacity
                          key={type.id}
                          className={`p-4 rounded-2xl border-2 ${
                            selectedFeedbackType === type.id
                              ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                              : 'border-gray-700 bg-gray-800'
                          }`}
                          onPress={() => handleFeedbackTypeSelect(type.id)}
                        >
                          <View className="flex-row items-center">
                            <View className="p-3 rounded-xl mr-4" style={{ backgroundColor: type.color }}>
                              <IconComponent size={24} color="#FFFFFF" />
                            </View>
                            <View className="flex-1">
                              <Text
                                className="text-white text-lg font-bold mb-1"
                                style={{ fontFamily: 'Poppins_600SemiBold' }}
                              >
                                {type.title}
                              </Text>
                              <Text
                                className="text-gray-400 text-sm"
                                style={{ fontFamily: 'Poppins_400Regular' }}
                              >
                                {type.description}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  /* Sport Selection */
                  <View className="space-y-4">
                    <View className="grid grid-cols-2 gap-4">
                      {sports.map((sport) => (
                        <TouchableOpacity
                          key={sport.id}
                          className={`p-4 rounded-2xl border-2 ${
                            selectedSport === sport.id
                              ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                              : 'border-gray-700 bg-gray-800'
                          }`}
                          onPress={() => handleSportSelect(sport.id)}
                        >
                          <View className="items-center">
                            <Text className="text-4xl mb-2">{sport.emoji}</Text>
                            <Text
                              className="text-white text-lg font-bold text-center"
                              style={{ fontFamily: 'Poppins_600SemiBold' }}
                            >
                              {sport.title}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Begin Session Button */}
                    {selectedSport && (
                      <TouchableOpacity
                        className="bg-green-600 rounded-2xl p-4 mt-6"
                        onPress={handleBeginSession}
                      >
                        <View className="flex-row items-center justify-center">
                          <Play size={20} color="#FFFFFF" className="mr-2" />
                          <Text
                            className="text-white text-lg font-bold"
                            style={{ fontFamily: 'Poppins_600SemiBold' }}
                          >
                            Begin Session
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Back Button for Step 2 */}
              {step === 2 && (
                <TouchableOpacity
                  className="bg-gray-800 rounded-2xl p-3 mt-4"
                  onPress={() => setStep(1)}
                >
                  <Text
                    className="text-gray-300 text-center font-semibold"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  >
                    ← Back to Feedback Type
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

        {/* Camera Interface for Live Recording */}
        <Modal
          visible={showCamera}
          transparent={false}
          animationType="slide"
          onRequestClose={resetCamera}
        >
          <View className="flex-1 bg-black">
            {/* Check if permissions are granted */}
            {(!permission?.granted || !audioPermission) ? (
              <View className="flex-1 justify-center items-center bg-black">
                <Camera size={120} color="#9CA3AF" />
                <Text
                  className="text-white text-xl mt-4 text-center"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  Permissions Required
                </Text>
                <Text
                  className="text-gray-400 text-sm mt-2 text-center px-8"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                >
                  Please grant camera and microphone access to record exercise videos
                </Text>

                {/* Permission Status */}
                <View className="mt-6 space-y-2">
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${permission?.granted ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className="text-gray-300" style={{ fontFamily: 'Poppins_400Regular' }}>
                      <Text>Camera: {permission?.granted ? 'Granted' : 'Required'}</Text>
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className={`w-3 h-3 rounded-full mr-3 ${audioPermission ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className="text-gray-300" style={{ fontFamily: 'Poppins_400Regular' }}>
                      <Text>Microphone: {audioPermission ? 'Granted' : 'Required'}</Text>
                    </Text>
                  </View>
                </View>

                <View className="flex-row space-x-3 mt-6">
                  {!permission?.granted && (
                    <TouchableOpacity
                      className="bg-blue-600 px-4 py-3 rounded-xl"
                      onPress={requestPermission}
                    >
                      <Text
                        className="text-white font-semibold"
                        style={{ fontFamily: 'Poppins_500Medium' }}
                      >
                        Grant Camera
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!audioPermission && (
                    <TouchableOpacity
                      className="bg-green-600 px-4 py-3 rounded-xl"
                      onPress={requestAudioPermissions}
                    >
                      <Text
                        className="text-white font-semibold"
                        style={{ fontFamily: 'Poppins_500Medium' }}
                      >
                        Grant Audio
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ) : (
              <>
                {/* Camera View */}
                <CameraView
                  ref={cameraRef}
                  style={{ flex: 1 }}
                  facing={facing}
                  mode="video"
                />

                {/* Camera Controls Overlay */}
                <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
                  {/* Camera Flip Button */}
                  <TouchableOpacity
                    className="bg-black bg-opacity-50 p-3 rounded-full"
                    onPress={toggleCameraFacing}
                  >
                    <Camera size={24} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Recording Status */}
                  {isRecording && (
                    <View className="bg-red-600 px-4 py-2 rounded-full flex-row items-center">
                      <View className="w-3 h-3 bg-white rounded-full mr-2" />
                      <Text
                        className="text-white font-bold"
                        style={{ fontFamily: 'Poppins_600SemiBold' }}
                      >
                        <Text>REC {formatTime(recordingTime)}</Text>
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Recording Controls Overlay */}
            <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-80 p-6">
              {/* Control Buttons */}
              <View className="flex-row justify-center items-center space-x-8">
                {/* Close Button */}
                <TouchableOpacity
                  className="bg-gray-700 p-4 rounded-full"
                  onPress={resetCamera}
                >
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Start/Stop Recording Button */}
                {!isRecording ? (
                  <TouchableOpacity
                    className="bg-red-600 p-6 rounded-full"
                    onPress={handleStartRecording}
                  >
                    <Play size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="bg-red-600 p-6 rounded-full"
                    onPress={handleStopRecording}
                  >
                    <Square size={32} color="#FFFFFF" />
                  </TouchableOpacity>
                )}

                {/* Camera Flip Button */}
                <TouchableOpacity
                  className="bg-gray-700 p-4 rounded-full"
                  onPress={toggleCameraFacing}
                >
                  <Camera size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Recording Instructions */}
              <View className="mt-4">
                <Text
                  className="text-center text-gray-300 text-sm"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                >
                  <Text>
                    {!isRecording
                      ? 'Tap the red button to start recording'
                      : 'Recording in progress - tap red button to stop'
                    }
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </Modal>        {/* File Upload Interface */}
        <Modal
          visible={showFileUpload}
          transparent={true}
          animationType="slide"
          onRequestClose={resetFileUpload}
        >
          <View className="flex-1 bg-black bg-opacity-50 justify-center px-6">
            <View className="bg-gray-900 rounded-3xl p-6">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className="text-white text-xl font-bold"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  📁 Upload M4V File
                </Text>
                <TouchableOpacity onPress={resetFileUpload}>
                  <X size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Upload Area */}
              <TouchableOpacity
                className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl p-8 mb-6"
                onPress={handleFileUpload}
              >
                <View className="items-center">
                  <FileVideo size={48} color="#6B7280" />
                  <Text
                    className="text-white text-lg font-bold mt-4"
                    style={{ fontFamily: 'Poppins_600SemiBold' }}
                  >
                    Select M4V File
                  </Text>
                  <Text
                    className="text-gray-400 text-sm mt-2 text-center"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    Tap to browse and select your exercise video file (.m4v format only)
                  </Text>
                </View>
              </TouchableOpacity>

              {/* File Requirements */}
              <View className="bg-gray-800 rounded-2xl p-4 mb-4">
                <Text
                  className="text-yellow-400 text-sm font-bold mb-2"
                  style={{ fontFamily: 'Poppins_600SemiBold' }}
                >
                  ⚠️ File Requirements:
                </Text>
                <View className="space-y-1">
                  <Text
                    className="text-gray-300 text-xs"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    • File format: M4V only
                  </Text>
                  <Text
                    className="text-gray-300 text-xs"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    • Maximum file size: 100MB
                  </Text>
                  <Text
                    className="text-gray-300 text-xs"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  >
                    • Recommended duration: 30 seconds - 5 minutes
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-700 p-3 rounded-xl"
                  onPress={resetFileUpload}
                >
                  <Text
                    className="text-gray-300 text-center font-semibold"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-blue-600 p-3 rounded-xl"
                  onPress={handleFileUpload}
                >
                  <Text
                    className="text-white text-center font-semibold"
                    style={{ fontFamily: 'Poppins_500Medium' }}
                  >
                    Browse Files
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}