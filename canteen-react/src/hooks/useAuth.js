import { useEffect, useState } from 'react';
import { getAuthState, setAuthState, subscribe, initializeAuth } from '../services/authStore';
import { signOut } from '../services/supabaseAuthApi';

const defaultAuth = {
  isAuthenticated: false,
  user: null,
  session: null,
};

const useAuth = () => {
  const [auth, setAuth] = useState(getAuthState());

  useEffect(() => {
    initializeAuth();
    const unsubscribe = subscribe(setAuth);
    return unsubscribe;
  }, []);

  const login = ({ user, session }) => {
    setAuthState({
      isAuthenticated: Boolean(user),
      user: user ? { id: user.id, email: user.email } : null,
      session,
      loggedAt: new Date().toISOString(),
    });
  };

  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.warn('Logout failed:', error);
    }
    setAuthState(defaultAuth);
  };

  return {
    isAuthenticated: Boolean(auth?.isAuthenticated),
    user: auth?.user || null,
    session: auth?.session || null,
    login,
    logout,
  };
};

export default useAuth;
