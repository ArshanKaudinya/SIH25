import 'react-native-url-polyfill/auto';              // keep for RN
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: AsyncStorage as any,      // ALWAYS AsyncStorage (no web fallback)
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,         // native apps don’t use URL flows
  },
});
