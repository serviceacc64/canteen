import { supabase } from './supabaseClient';

const defaultAuth = {
  isAuthenticated: false,
  user: null,
  session: null,
};

let authState = defaultAuth;
const listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => listener(authState));
};

const syncSession = (session) => {
  const user = session?.user ?? null;
  authState = {
    isAuthenticated: Boolean(user),
    user: user ? { id: user.id, email: user.email } : null,
    session,
  };
  notify();
};

export const getAuthState = () => authState;

export const setAuthState = (nextAuth) => {
  authState = nextAuth;
  notify();
};

export const subscribe = (listener) => {
  listeners.add(listener);
  listener(authState);
  return () => {
    listeners.delete(listener);
  };
};

export const initializeAuth = async () => {
  if (!supabase) return;

  const { data, error } = await supabase.auth.getSession();
  if (!error) {
    syncSession(data.session);
  }

  supabase.auth.onAuthStateChange((_event, session) => {
    syncSession(session);
  });
};

export default {
  getAuthState,
  setAuthState,
  subscribe,
  initializeAuth,
};
