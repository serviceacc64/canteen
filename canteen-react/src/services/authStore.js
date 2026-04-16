import { getItem, setItem } from './storage';

const AUTH_KEY = 'canteen_auth';
const defaultAuth = {
  isAuthenticated: false,
  user: null,
};

let authState = getItem(AUTH_KEY, defaultAuth) ?? defaultAuth;
const listeners = new Set();

export const getAuthState = () => authState;

export const setAuthState = (nextAuth) => {
  authState = nextAuth;
  setItem(AUTH_KEY, authState);
  listeners.forEach((listener) => listener(authState));
};

export const subscribe = (listener) => {
  listeners.add(listener);
  listener(authState);
  return () => {
    listeners.delete(listener);
  };
};

export default {
  getAuthState,
  setAuthState,
  subscribe,
};
