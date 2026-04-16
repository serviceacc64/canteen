const isBrowser = typeof window !== 'undefined';

export const getItem = (key, fallback = null) => {
  if (!isBrowser) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
};

export const setItem = (key, value) => {
  if (!isBrowser) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

export const removeItem = (key) => {
  if (!isBrowser) return false;

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
};

const storage = {
  getItem,
  setItem,
  removeItem,
};

export default storage;
