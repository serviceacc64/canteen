import { useEffect, useState } from 'react';
import { getAuthState, setAuthState, subscribe } from '../services/authStore';

const useAuth = () => {
  const [auth, setAuth] = useState(getAuthState());

  useEffect(() => {
    const unsubscribe = subscribe(setAuth);
    return unsubscribe;
  }, []);

  const login = (user = { name: 'Canteen Staff' }) => {
    setAuthState({
      isAuthenticated: true,
      user,
      loggedAt: new Date().toISOString(),
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
  };

  return {
    isAuthenticated: Boolean(auth?.isAuthenticated),
    user: auth?.user || null,
    login,
    logout,
  };
};

export default useAuth;
