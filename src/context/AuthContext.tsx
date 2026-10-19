import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile, UserRole } from '@/lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string, companyName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(error: unknown, fallback: string) {
  const message = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string'
        ? error.message
        : '';
  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes('email not confirmed')) {
    return 'Email is not confirmed. Check your inbox, or disable Confirm email in Supabase Authentication settings for local testing.';
  }
  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Email or password is incorrect. Use the credentials for a user in this Supabase project, or create the account again here.';
  }
  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('email rate')) {
    return 'Email rate limit reached. Wait a few minutes before trying again, or disable email confirmation in Supabase for local testing.';
  }
  if (normalizedMessage.includes('fetch')) {
    return 'Unable to reach Supabase. Check VITE_SUPABASE_URL and that the Supabase project is active.';
  }
  return message || fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error || data) {
      setProfile(data ?? null);
      return;
    }

    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const role = currentUser.user_metadata?.role as UserRole | undefined;
    if (!role || !['student', 'company', 'admin'].includes(role)) {
      setProfile(null);
      return;
    }

    const { data: createdProfile } = await supabase
      .from('profiles')
      .insert({
        id: currentUser.id,
        role,
        full_name: currentUser.user_metadata?.full_name ?? null,
        email: currentUser.email ?? null,
        company_name: currentUser.user_metadata?.company_name ?? null,
      })
      .select()
      .single();
    setProfile(createdProfile ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      (async () => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await loadProfile(sess.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(
    email: string,
    password: string,
    role: UserRole,
    fullName: string,
    companyName?: string
  ): Promise<{ error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, full_name: fullName, company_name: companyName ?? null } },
      });
      if (error) return { error: formatAuthError(error, 'Sign-up failed. Please try again.') };
      if (!data.user) return { error: 'Sign-up failed. Please try again.' };

      if (!data.session) return { error: null };

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        role,
        full_name: fullName,
        email,
        company_name: companyName ?? null,
      }, { onConflict: 'id' });
      if (profileError) return { error: formatAuthError(profileError, 'Profile creation failed. Please try again.') };
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'Sign-up failed. Please try again.') };
    }
  }

  async function signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: formatAuthError(error, 'Sign-in failed. Please try again.') };
      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error, 'Sign-in failed. Please try again.') };
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, role: profile?.role ?? null,
      loading, signUp, signIn, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
