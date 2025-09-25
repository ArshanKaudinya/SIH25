import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg'; 
import { useAuth } from '@/hooks/authProvider';

export default function AddScreen() {
  const { profile, session } = useAuth();
  const [coachId, setCoachId] = useState<string | null>(null);

  useEffect(() => {
    // Use either the profile row id or session.user.id
    if (profile?.role === 'coach') {
      setCoachId(profile.data.id);
    } else if (session?.user) {
      setCoachId(session.user.id);
    }
  }, [profile, session]);

  if (!coachId) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading coach ID…</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my roster on the app using this Coach ID: ${coachId}`,
      });
    } catch (err: any) {
      console.warn('Share error:', err.message);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Your Coach ID</Text>
      <Text style={styles.coachId}>{coachId}</Text>

      <View style={{ marginVertical: 20 }}>
        <QRCode value={coachId} size={200} backgroundColor="black" color="white" />
      </View>

      <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
        <Text style={styles.shareText}>Share Coach ID</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' },
  title: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  coachId: { color: '#facc15', fontSize: 14, marginBottom: 20 },
  text: { color: 'white' },
  shareBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  shareText: { color: 'white', fontWeight: '700' },
});
