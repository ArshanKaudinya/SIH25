import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { useCameraPermissions } from 'expo-camera';

const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const POSETRACKER_API = process.env.EXPO_PUBLIC_POSETRACKER_API;
const { width, height } = Dimensions.get('window');

export default function Test() {
  const [poseTrackerInfos, setCurrentPoseTrackerInfos] = useState();
  const [repsCounter, setRepsCounter] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  });

  useEffect(() => {
    let interval;
    if (isWorkoutStarted && workoutStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutStarted, workoutStartTime]);

  const handleStartStopWorkout = () => {
    if (isWorkoutStarted) {
      // Stop workout
      setIsWorkoutStarted(false);
      setWorkoutStartTime(null);
      setElapsedTime(0);
      setRepsCounter(0);
    } else {
      // Start workout
      setIsWorkoutStarted(true);
      setWorkoutStartTime(Date.now());
      setElapsedTime(0);
      setRepsCounter(0);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exercise = "pushup";
  const difficulty = "easy";

  const posetracker_url = `${POSETRACKER_API}?token=${API_KEY}&exercise=${exercise}&difficulty=${difficulty}&width=${width}&height=${height}&keypoints=${true}`;

  // Bridge JavaScript BETWEEN POSETRACKER & YOUR APP
  const jsBridge = `
    window.addEventListener('message', function(event) {
      window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });

    window.webViewCallback = function(data) {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    };

    const originalPostMessage = window.postMessage;
    window.postMessage = function(data) {
      window.ReactNativeWebView.postMessage(typeof data === 'string' ? data : JSON.stringify(data));
    };

    true; // Important for a correct injection
  `;

  const handleCounter = (count) => {
    console.log('🏋️ COUNTER UPDATE: Reps count changed to:', count);
    if (isWorkoutStarted) {
      setRepsCounter(count);
    }
  };

  const handleInfos = (infos) => {
    setCurrentPoseTrackerInfos(infos);
  };

  const webViewCallback = (info) => {

    // Log specific data types
    if (info?.type) {
      console.log(`🏷️ Message Type: ${info.type}`);
    }

    // Log keypoints if available
    if (info?.keypoints) {
      console.log('🎯 Keypoints detected:', info.keypoints);
      console.log('📍 Number of keypoints:', Object.keys(info.keypoints).length);
    }

    // Log pose confidence if available
    if (info?.confidence !== undefined) {
      console.log(`🎯 Pose Confidence: ${info.confidence}`);
    }

    // Log exercise-specific data
    if (info?.exercise_data) {
      console.log('💪 Exercise Data:', info.exercise_data);
    }

    // Log frame data if available
    if (info?.frame_data) {
      console.log('🎬 Frame Data:', info.frame_data);
    }

    // Log all other properties
    Object.keys(info || {}).forEach(key => {
      if (!['type', 'keypoints', 'confidence', 'exercise_data', 'frame_data'].includes(key)) {
        console.log(`🔍 ${key}:`, info[key]);
      }
    });

    if (info?.type === 'counter') {
      console.log('✅ Counter message detected! Current count:', info.current_count);
      handleCounter(info.current_count);
    } else {
      console.log('ℹ️ Non-counter message:', info);
      handleInfos(info);
    }
  };

  const onMessage = (event) => {
    try {
      let parsedData;
      const rawData = event.nativeEvent.data;

      console.log('📨 Raw message received from WebView:');
      console.log('Type:', typeof rawData);
      console.log('Length:', rawData?.length || 'N/A');
      console.log('Raw Content:', rawData);
      console.log('==============================');

      if (typeof rawData === 'string') {
        parsedData = JSON.parse(rawData);
      } else {
        parsedData = rawData;
      }

      console.log('� Parsed data structure:');
      console.log('Data type:', typeof parsedData);
      console.log('Is Array:', Array.isArray(parsedData));
      console.log('Keys:', Object.keys(parsedData || {}));
      console.log('Full parsed data:', parsedData);
      console.log('==============================');

      webViewCallback(parsedData);
    } catch (error) {
      console.error('❌ Error processing message:', error);
      console.log('🔍 Problematic raw data:', event.nativeEvent.data);
      console.log('🔍 Error details:', error.message);
      console.log('🔍 Error stack:', error.stack);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        style={styles.webView}
        source={{ uri: posetracker_url }}
        originWhitelist={['*']}
        injectedJavaScript={jsBridge}
        onMessage={onMessage}
        debuggingEnabled={true}
        mixedContentMode="compatibility"
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error:', nativeEvent);
        }}
        onLoadingError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView loading error:', nativeEvent);
        }}
        onLoadStart={() => {
          console.log('🌐 WebView started loading PoseTracker API...');
        }}
        onLoad={() => {
          console.log('✅ WebView loaded successfully - PoseTracker API ready');
        }}
        onLoadEnd={() => {
          console.log('🏁 WebView load ended - Should start receiving data soon');
        }}
      />

      {/* Top Status Bar */}
      <View className="absolute top-12 left-0 right-0 z-20">
        <View className="mx-4 bg-black/70 rounded-2xl p-4 backdrop-blur-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${!poseTrackerInfos ? 'bg-yellow-400' : 'bg-green-400'}`}></View>
              <Text className="text-white font-semibold">
                {!poseTrackerInfos ? "Loading AI..." : "AI Ready"}
              </Text>
            </View>
            {isWorkoutStarted && (
              <Text className="text-blue-300 font-mono text-lg font-bold">
                ⏱️ {formatTime(elapsedTime)}
              </Text>
            )}
          </View>

          {poseTrackerInfos?.ready === false && (
            <View className="bg-orange-500/20 rounded-lg p-3 border border-orange-400">
              <Text className="text-orange-100 text-center font-medium">
                📍 Position yourself: Move {poseTrackerInfos?.postureDirection}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Counter Display */}
      <View className="absolute top-1/3 left-0 right-0 z-20 px-4">
        <View className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-3xl p-6 mx-4 backdrop-blur-sm border border-white/20">
          <Text className="text-white/80 text-center text-lg font-medium mb-2">
            Push-ups Completed
          </Text>
          <Text className="text-white text-center text-6xl font-black mb-2">
            {repsCounter}
          </Text>
          <View className="h-1 bg-white/20 rounded-full overflow-hidden">
            <View
              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((repsCounter / 20) * 100, 100)}%` }}
            ></View>
          </View>
          <Text className="text-white/60 text-center text-sm mt-2">
            Goal: 20 reps
          </Text>
        </View>
      </View>

      {/* Control Panel */}
      <View className="absolute bottom-20 left-0 right-0 z-20 px-4">
        <View className="bg-black/80 rounded-2xl p-6 mx-4 backdrop-blur-sm">
          {/* Placement Status */}
          {poseTrackerInfos?.ready !== false && (
            <View className="bg-green-500/20 rounded-lg p-3 mb-4 border border-green-400">
              <Text className="text-green-100 text-center font-medium">
                ✅ Perfect position! Ready to start
              </Text>
            </View>
          )}

          {/* Start/Stop Button */}
          <TouchableOpacity
            onPress={handleStartStopWorkout}
            className={`rounded-2xl p-4 ${
              isWorkoutStarted
                ? 'bg-red-500 active:bg-red-600'
                : poseTrackerInfos?.ready === false
                  ? 'bg-gray-500'
                  : 'bg-green-500 active:bg-green-600'
            }`}
            disabled={poseTrackerInfos?.ready === false}
          >
            <Text className="text-white text-center text-xl font-bold">
              {isWorkoutStarted ? '⏹️ Stop Workout' : '▶️ Start Workout'}
            </Text>
          </TouchableOpacity>

          {poseTrackerInfos?.ready === false && (
            <Text className="text-gray-400 text-center text-sm mt-2">
              Position yourself correctly to enable start button
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  webView: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
});