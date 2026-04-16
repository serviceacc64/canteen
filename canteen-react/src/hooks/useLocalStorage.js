import { useEffect, useState } from 'react';
import { getItem, setItem } from '../services/storage';

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const existing = getItem(key, initialValue);
    return existing ?? initialValue;
  });

  useEffect(() => {
    setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};

export default useLocalStorage;
