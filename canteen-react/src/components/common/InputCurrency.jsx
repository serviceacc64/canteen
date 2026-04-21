import { useState, useEffect, useRef } from 'react';

const InputCurrency = ({
  value = 0,
  onChange,
  className = '',
  ...props
}) => {
  const [rawInput, setRawInput] = useState('');
  const inputRef = useRef(null);

  // Sync prop value to rawInput on mount/change
  useEffect(() => {
    const peso = value / 100;
    setRawInput(peso.toFixed(2));
  }, [value]);

  const handleChange = (e) => {
    // Allow digits, decimal only
    const val = e.target.value.replace(/[^0-9.]/g, '');
    setRawInput(val);
  };

  const formatPesoDisplay = (peso) => {
    return new Intl.NumberFormat('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(peso).replace(',','');
  };

  const commitValue = () => {
    const raw = rawInput.replace(/,/g, '');
    const peso = parseFloat(raw) || 0;
    const cents = Math.round(peso * 100);
    onChange({ target: { value: cents } });
    // Format for display
    setRawInput(formatPesoDisplay(peso));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitValue();
    }
  };

  const handleBlur = () => {
    commitValue();
  };

  return (
    <div className={`input-currency ${className}`.trim()}>
      <span>₱</span>
      <input
        ref={inputRef}
        type="text"
        value={rawInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...props}
      />
    </div>
  );
};

export default InputCurrency;
