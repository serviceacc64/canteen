import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);
  return [value, setValue];
};

export default useLocalStorage;
