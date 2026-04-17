import { supabase, isSupabaseConfigured } from './supabaseClient';

const ensureConfigured = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
    );
  }
};

export const signUp = async (email, password) => {
  ensureConfigured();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  ensureConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const updatePassword = async (password) => {
  ensureConfigured();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  ensureConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
};

export const getSession = async () => {
  ensureConfigured();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
};

export const getUser = async () => {
  ensureConfigured();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data;
};
