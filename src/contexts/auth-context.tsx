'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'teacher' | 'parent') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const log = (...args: unknown[]) => console.log('[Auth]', ...args);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tracks an in-flight signIn so that onAuthStateChange does NOT reset
  // the already-resolved profile back to null during the transition.
  const pendingSignInRef = useRef(false);
  // Tracks the latest profile-fetch request id so stale fetches can't overwrite fresh ones.
  const fetchIdRef = useRef(0);

  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    const id = ++fetchIdRef.current;
    log('fetchProfile start — userId:', userId, '| requestId:', id);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    // Stale fetch — a newer one is in flight; ignore this result.
    if (id !== fetchIdRef.current) {
      log('fetchProfile stale — ignoring requestId:', id);
      return null;
    }
    if (error) {
      log('fetchProfile error:', error.message);
      return null;
    }
    log('fetchProfile success — role:', data?.role ?? 'none', '| requestId:', id);
    setProfile(data);
    return data;
  };

  // Initial session check on mount
  useEffect(() => {
    let cancelled = false;
    const checkSession = async () => {
      log('initial session check start');
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      log('initial session — userId:', session?.user?.id ?? 'none');
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      if (!cancelled) {
        setLoading(false);
        log('initial session check done — loading=false');
      }
    };
    checkSession();
    return () => { cancelled = true; };
  }, [supabase]);

  // Subscribe to auth changes — callback MUST NOT be async (deadlock guard).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        log('onAuthStateChange — event:', event, '| userId:', session?.user?.id ?? 'none');
        // If signIn already resolved with a profile, do NOT clobber it during the
        // subsequent SIGNED_IN / INITIAL_SESSION events — they'd reset profile to null
        // and cause the dashboard layout to redirect back to /login (loop).
        if (pendingSignInRef.current) {
          log('onAuthStateChange — pending signIn active, skipping profile reset');
          if (session?.user) setUser(session.user);
          return;
        }
        if (session?.user) {
          setUser(session.user);
          // Fire-and-forget profile fetch wrapped in an async IIFE (deadlock guard).
          (async () => {
            await fetchProfile(session.user.id);
          })();
        } else {
          log('onAuthStateChange — no session, clearing state');
          setUser(null);
          setProfile(null);
          ++fetchIdRef.current; // invalidate any in-flight fetch
        }
      }
    );
    return () => { subscription.unsubscribe(); };
  }, [supabase]);

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    log('signIn start — email:', email);
    pendingSignInRef.current = true;

    log('signIn — calling signInWithPassword');
    const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      log('signIn error:', error.message);
      pendingSignInRef.current = false;
      throw error;
    }
    if (!authUser) {
      pendingSignInRef.current = false;
      throw new Error('Login failed: no user returned');
    }

    log('signIn success — userId:', authUser.id);

    // Fetch profile immediately with the same client instance.
    log('signIn — fetching profile');
    const profileData = await fetchProfile(authUser.id);

    if (!profileData) {
      log('signIn — profile missing after fetch');
      pendingSignInRef.current = false;
      throw new Error('Profile not found. Please contact the administrator.');
    }

    log('signIn — profile role:', profileData.role, '| routing incoming');
    setUser(authUser);
    setProfile(profileData);

    // Release the guard AFTER React has committed the new profile so that
    // the subsequent onAuthStateChange event sees a stable state.
    setTimeout(() => {
      pendingSignInRef.current = false;
      log('signIn — pending guard released');
    }, 500);

    return profileData;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'admin' | 'teacher' | 'parent'
  ): Promise<void> => {
    log('signUp start — email:', email, '| role:', role);
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) throw signUpError;
    if (!newUser) throw new Error('User creation failed');

    const { error: profileError } = await supabase.from('users').insert({
      id: newUser.id,
      email,
      full_name: fullName,
      role,
    });

    if (profileError) throw profileError;

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .maybeSingle();

    setUser(newUser);
    setProfile(profileData);
  };

  const signOut = async (): Promise<void> => {
    log('signOut');
    pendingSignInRef.current = false;
    ++fetchIdRef.current;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
