export const getItem = (key, fallback = null) => fallback;
export const setItem = (key, value) => false;
export const removeItem = (key) => false;

const storage = {
  getItem,
  setItem,
  removeItem,
};

export default storage;
