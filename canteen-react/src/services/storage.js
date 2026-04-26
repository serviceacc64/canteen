export const getItem = (_key, fallback = null) => fallback;
export const setItem = (_key, _value) => false;
export const removeItem = (_key) => false;

const storage = {
  getItem,
  setItem,
  removeItem,
};

export default storage;
