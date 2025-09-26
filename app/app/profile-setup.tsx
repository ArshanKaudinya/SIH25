// app/app/profile-setup.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform,
  TouchableOpacity, FlatList, NativeScrollEvent, NativeSyntheticEvent
} from "react-native";
import { supabase } from "@/constants/supabase";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/authProvider";

const ITEM_W = 56;
const SCROLLER_W = 280;

export default function ProfileSetup() {
  const { session } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [age, setAge] = useState<number | null>(20);
  const [height, setHeight] = useState<number | null>(170); // cm
  const [weight, setWeight] = useState<string>(''); // kg text

  // options
  const ageOptions = useMemo(() => Array.from({ length: 71 }, (_, i) => i + 14), []);
  const heightOptions = useMemo(() => Array.from({ length: 131 }, (_, i) => i + 150), []);

  // refs for scrollers
  const ageRef = useRef<FlatList<number>>(null);
  const heightRef = useRef<FlatList<number>>(null);

  type ScrollerProps = {
    data: number[];
    selected: number | null;
    onChange: (value: number) => void; // simpler than passing event back up
  };
  
  const MinimalScroller = React.forwardRef<FlatList<number>, ScrollerProps>(
    ({ data, selected, onChange }, ref) => {
      const listRef = React.useRef<FlatList<number>>(null);
      React.useImperativeHandle(ref, () => listRef.current as FlatList<number>);
  
      // keep external selected in sync
      useEffect(() => {
        if (selected != null) {
          const idx = data.indexOf(selected);
          if (idx >= 0) {
            listRef.current?.scrollToIndex({ index: idx, animated: true });
          }
        }
      }, [selected, data]);
  
      const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const x = e.nativeEvent.contentOffset.x;
        const idx = Math.max(0, Math.min(data.length - 1, Math.round(x / ITEM_W)));
        const value = data[idx];
        onChange(value);
  
        // hard-snap to index so alignment is pixel-perfect
        listRef.current?.scrollToIndex({ index: idx, animated: true });
      };
  
      return (
        <View style={scroller.box}>
          <View pointerEvents="none" style={scroller.marker} />
          <FlatList
            ref={listRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data}
            keyExtractor={(n) => String(n)}
            snapToInterval={ITEM_W}
            snapToAlignment="center"
            disableIntervalMomentum
            decelerationRate="fast"
            onMomentumScrollEnd={handleMomentumEnd}
            getItemLayout={(_, index) => ({ length: ITEM_W, offset: ITEM_W * index, index })}
            contentContainerStyle={{ paddingHorizontal: (SCROLLER_W - ITEM_W) / 2 }}
            renderItem={({ item, index }) => {
              const active = item === selected;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => listRef.current?.scrollToIndex({ index, animated: true })}
                >
                  <View style={[scroller.item, active && scroller.itemActive]}>
                    <Text style={[scroller.text, active && scroller.textActive]}>
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      );
    }
  );
  MinimalScroller.displayName = "MinimalScroller";
  
  // center initial selections
  useEffect(() => {
    if (age && ageRef.current) {
      const idx = ageOptions.indexOf(age);
      if (idx >= 0) ageRef.current.scrollToIndex({ index: idx, animated: false });
    }
    if (height && heightRef.current) {
      const idx = heightOptions.indexOf(height);
      if (idx >= 0) heightRef.current.scrollToIndex({ index: idx, animated: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async () => {
    try {
      if (!session?.user) throw new Error('Not logged in');
      if (!fullName.trim()) throw new Error('Please enter your full name');
      if (!gender) throw new Error('Please choose your gender');
      if (!age) throw new Error('Please select your age');
      if (!height) throw new Error('Please select your height');

      const weightKg = weight ? parseInt(weight, 10) : null;

      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim(),
          age,
          gender,
          height_cm: height,
          weight_kg: Number.isFinite(weightKg as number) ? weightKg : null,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      Alert.alert('Success', 'Profile saved');
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e.message || String(e));
    }
  };

  if (!session) {
    return (
      <View style={[styles.wrap, { backgroundColor: 'black' }]}>
        <Text style={[styles.title, { color: 'white' }]}>
          You must be logged in to complete your profile.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'black' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.wrap}>
          <Text style={[styles.title, { color: 'white' }]}>Complete your Profile</Text>

          {/* Full name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="e.g. Hardik Sharma"
            placeholderTextColor="#888"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            returnKeyType="done"
          />

          {/* Gender: 3 pill buttons */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(['male', 'female', 'other'] as const).map((g) => {
              const selected = gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[styles.genderBtn, selected && styles.genderBtnActive]}
                >
                  <Text style={[styles.genderText, selected && styles.genderTextActive]}>
                    {g[0].toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Age</Text>
            <MinimalScroller
            ref={ageRef}
            data={ageOptions}
            selected={age}
            onChange={(v) => setAge(v)}
            />
            <Text style={styles.unitNote}>years</Text>

            <Text style={styles.label}>Height</Text>
            <MinimalScroller
            ref={heightRef}
            data={heightOptions}
            selected={height}
            onChange={(v) => setHeight(v)}
            />
            <Text style={styles.unitNote}>cm</Text>


          {/* Weight input */}
          <Text style={styles.label}>Weight</Text>
          <View style={styles.row}>
            <TextInput
              placeholder="e.g. 70"
              placeholderTextColor="#888"
              style={[styles.input, { flex: 1 }]}
              value={weight}
              onChangeText={(t) => setWeight(t.replace(/[^\d]/g, ''))}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <Text style={styles.unit}>kg</Text>
          </View>

          <View style={{ height: 14 }} />
          <Button title="Save Profile" onPress={saveProfile} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}


const scroller = StyleSheet.create({
    box: {
      width: SCROLLER_W,
      alignSelf: "center",
      position: "relative",
      marginBottom: 8,
    },
    marker: {
      position: "absolute",
      left: (SCROLLER_W - ITEM_W) / 2,
      width: ITEM_W,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#374151",
      top: 4,
    },
    item: { width: ITEM_W, height: 48, alignItems: "center", justifyContent: "center" },
    itemActive: { backgroundColor: "#111827", borderRadius: 8 },
    text: { color: "#9ca3af", fontSize: 18 },
    textActive: { color: "white", fontWeight: "700" },
  });

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 16, fontWeight: '600' },
  label: { color: '#d1d5db', marginTop: 12, marginBottom: 6, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: '#333', padding: 12, borderRadius: 10,
    marginBottom: 8, color: 'white', backgroundColor: '#0f0f0f'
  },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: {
    flex: 1,
    borderWidth: 1, borderColor: '#333',
    backgroundColor: '#0f0f0f',
    paddingVertical: 10, borderRadius: 999,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderText: { color: '#d1d5db', fontWeight: '600' },
  genderTextActive: { color: 'white' },
  row: { flexDirection: 'row', alignItems: 'center' },
  unit: { color: '#9ca3af', marginLeft: 10, alignSelf: 'center' },
  unitNote: { color: '#9ca3af', textAlign: 'center', marginTop: 2, marginBottom: 6 },
});
