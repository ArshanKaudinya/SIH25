// app/hooks/authProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/constants/supabase';

type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
type Role = 'athlete' | 'coach';

type Athlete = {
  id: string;
  username: string | null;
  full_name: string | null;
  age?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  coach_id?: string | null;
};

type Coach = {
  id: string;
  username: string | null;
  full_name: string | null;
};

type Profile = { role: 'athlete'; data: Athlete } | { role: 'coach'; data: Coach };

type Ctx = {
  session: Session | null;
  loading: boolean;
  role: Role | null;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: Role) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthCtx = createContext<Ctx | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const deriveRole = async (uid: string): Promise<Role | null> => {
    // Check coaches table first
    const { data: coachRow, error: coachErr } = await supabase
      .from('coaches')
      .select('id')
      .eq('id', uid)
      .maybeSingle();
  
    if (!coachErr && coachRow) return 'coach';
  
    // Then check athletes table
    const { data: athleteRow, error: athleteErr } = await supabase
      .from('users')
      .select('id')
      .eq('id', uid)
      .maybeSingle();
  
    if (!athleteErr && athleteRow) return 'athlete';
  
    return null; // not found in either
  };
  

  const fetchProfile = async (s: Session | null) => {
    if (!s?.user) {
      setRole(null);
      setProfile(null);
      return;
    }
  
    const uid = s.user.id;
    const r = await deriveRole(uid);
    setRole(r);
  
    if (r === 'coach') {
      const { data } = await supabase
        .from('coaches')
        .select('id, username, full_name')
        .eq('id', uid)
        .maybeSingle();
      if (data) setProfile({ role: 'coach', data });
    }
  
    if (r === 'athlete') {
      const { data } = await supabase
        .from('users')
        .select('id, username, full_name, age, height_cm, weight_kg, coach_id')
        .eq('id', uid)
        .maybeSingle();
      if (data) setProfile({ role: 'athlete', data });
    }
  };
  

  const refreshProfile = async () => { await fetchProfile(session); };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session ?? null);
      await fetchProfile(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ?? null);
      fetchProfile(s ?? null);
    });

    return () => { sub.subscription.unsubscribe(); };
  });

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    setSession(data.session);
    await fetchProfile(data.session ?? null);
  };

  const signUp = async (email: string, password: string, signupRole: Role = 'athlete') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: signupRole } },
    });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const getToken = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session?.access_token ?? null;
  };

  return (
    <AuthCtx.Provider
      value={{ session, loading, role, profile, refreshProfile, signIn, signUp, signOut, getToken }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
