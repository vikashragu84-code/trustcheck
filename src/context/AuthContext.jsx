import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'

  // Helper to fetch user's existing profile from public.profiles
  const fetchProfile = async (userId) => {
    if (!userId || !isSupabaseConfigured()) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Could not fetch user profile from public.profiles:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Error querying public.profiles:', err.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // 1. Get initial session
    const initSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Error fetching Supabase session:', error.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.warn('Supabase initialization error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Sign Up with email & password (DO NOT insert duplicate profile rows)
  const signUp = async ({ email, password, fullName }) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Please replace the placeholder VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file with your actual Supabase project keys.'
      );
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          },
        },
      });

      if (error) throw error;

      const needsEmailVerification = !data.session && data.user;
      return { data, needsEmailVerification };
    } catch (err) {
      if (err.message === 'Failed to fetch' || err instanceof TypeError) {
        throw new Error(
          'Failed to connect to Supabase. Please verify that VITE_SUPABASE_URL in your .env file contains a valid, reachable Supabase project URL.'
        );
      }
      throw err;
    }
  };

  // Sign In with email & password
  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Please replace the placeholder VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file with your actual Supabase project keys.'
      );
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch' || err instanceof TypeError) {
        throw new Error(
          'Failed to connect to Supabase. Please verify that VITE_SUPABASE_URL in your .env file contains a valid, reachable Supabase project URL.'
        );
      }
      throw err;
    }
  };

  // Sign Out
  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAuthModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    signUp,
    signIn,
    signOut,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
