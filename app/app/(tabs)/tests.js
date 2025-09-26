import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, Dimensions, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { useCameraPermissions } from 'expo-camera';
import { supabase } from '@/constants/supabase';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
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
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!permission?.granted) requestPermission(); });
  useEffect(() => {
    let id;
    if (isWorkoutStarted && workoutStartTime) {
      id = setInterval(() => setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000)), 1000);
    }
    return () => clearInterval(id);
  }, [isWorkoutStarted, workoutStartTime]);

  async function postPushupsSession(reps) {
    if (!API_BASE) throw new Error('EXPO_PUBLIC_API_BASE is undefined');
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.access_token) throw new Error('No auth session');
    const token = data.session.access_token;
    const session_score = Math.floor(80 + Math.random() * 21);

    const r = await fetch(`${API_BASE}/pushups`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({ session_reps: reps, session_score }),
    });

    const text = await r.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch {}
    if (!r.ok) throw new Error(json?.detail || `HTTP ${r.status}: ${text}`);
    return json;
  }

  const handleStartStopWorkout = async () => {
    if (isWorkoutStarted) {
      try {
        setSaving(true);
        const finalReps = Number.isFinite(repsCounter) ? repsCounter : 0;
        await postPushupsSession(finalReps);
        Alert.alert('Saved', `Session logged: ${finalReps} reps`);
      } catch (e) {
        console.error(e);
        Alert.alert('Save failed', e.message || 'Could not log session');
      } finally {
        setSaving(false);
        setIsWorkoutStarted(false);
        setWorkoutStartTime(null);
        setElapsedTime(0);
        setRepsCounter(0);
      }
    } else {
      setIsWorkoutStarted(true);
      setWorkoutStartTime(Date.now());
      setElapsedTime(0);
      setRepsCounter(0);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const exercise = 'pushup';
  const difficulty = 'easy';
  const posetracker_url =
    `${POSETRACKER_API}?token=${encodeURIComponent(API_KEY || '')}` +
    `&exercise=${exercise}&difficulty=${difficulty}&width=${Math.round(width)}&height=${Math.round(height)}&keypoints=true`;

  // Don’t override window.postMessage; keep it minimal
  const jsBridge = `
    window.webViewCallback = (data) => window.ReactNativeWebView.postMessage(JSON.stringify(data));
    true;
  `;

  const handleCounter = (count) => { if (isWorkoutStarted) setRepsCounter(count || 0); };
  const handleInfos = (infos) => setCurrentPoseTrackerInfos(infos);

  const webViewCallback = (info) => {
    if (info?.type === 'counter') handleCounter(info.current_count);
    else handleInfos(info);
  };

  const onMessage = (event) => {
    try {
      const raw = event.nativeEvent.data;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      webViewCallback(parsed);
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <WebView
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        style={styles.webView}
        source={{ uri: posetracker_url }}
        originWhitelist={['*']}
        injectedJavaScript={jsBridge}
        onMessage={onMessage}
        mixedContentMode="compatibility"
        onError={(e) => console.warn('WebView error:', e.nativeEvent)}
        onHttpError={(e) => console.warn('HTTP', e.nativeEvent.statusCode, e.nativeEvent.description)}
      />

      {/* Top Status */}
      <View className="absolute top-12 left-0 right-0 z-20">
        <View className="mx-4 bg-black/70 rounded-2xl p-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <View className={`w-3 h-3 rounded-full mr-2 ${!poseTrackerInfos ? 'bg-yellow-400' : 'bg-green-400'}`} />
              <Text className="text-white font-semibold">{!poseTrackerInfos ? 'Loading AI...' : 'AI Ready'}</Text>
            </View>
            {isWorkoutStarted && <Text className="text-blue-300 font-mono text-lg font-bold">⏱️ {formatTime(elapsedTime)}</Text>}
          </View>
          {poseTrackerInfos?.ready === false && (
            <View className="bg-orange-500/20 rounded-lg p-3 border border-orange-400">
              <Text className="text-orange-100 text-center font-medium">📍 Move {poseTrackerInfos?.postureDirection}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Counter + Button */}
      <View className="absolute top-1/3 left-0 right-0 z-20 px-4">
        <View className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-3xl p-6 mx-4 border border-white/20">
          <Text className="text-white/80 text-center text-lg mb-2">Push-ups Completed</Text>
          <Text className="text-white text-center text-6xl font-black mb-2">{repsCounter}</Text>
        </View>
      </View>

      <View className="absolute bottom-20 left-0 right-0 z-20 px-4">
        <View className="bg-black/80 rounded-2xl p-6 mx-4">
          <TouchableOpacity
            onPress={handleStartStopWorkout}
            disabled={saving || poseTrackerInfos?.ready === false}
            className={`rounded-2xl p-4 ${
              saving ? 'bg-gray-600'
              : isWorkoutStarted ? 'bg-red-500 active:bg-red-600'
              : poseTrackerInfos?.ready === false ? 'bg-gray-500'
              : 'bg-green-500 active:bg-green-600'
            }`}
          >
            <Text className="text-white text-center text-xl font-bold">
              {saving ? 'Saving…' : isWorkoutStarted ? '⏹️ Stop Workout' : '▶️ Start Workout'}
            </Text>
          </TouchableOpacity>
          {poseTrackerInfos?.ready === false && (
            <Text className="text-gray-400 text-center text-sm mt-2">Position yourself correctly to enable start</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column' },
  webView: { width: '100%', height: '100%', zIndex: 1 },
});
