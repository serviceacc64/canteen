import { useState, useEffect } from 'react';

const formatCents = (cents) => {
  const dollars = (cents / 100).toFixed(2);
  return dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseDollars = (str) => {
  const clean = str.replace(/[^\d.]/g, '');
  const num = parseFloat(clean) || 0;
  return Math.round(num * 100);
};

const InputCurrency = ({
  value = 0,
  onChange,
  placeholder = '0.00',
  className = '',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(formatCents(value));

  useEffect(() => {
    setDisplayValue(formatCents(value));
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value;
    setDisplayValue(raw);
    const cents = parseDollars(raw);
    onChange?.({ target: { value: cents } });
  };

  const handleBlur = () => {
    setDisplayValue(formatCents(value));
  };

  return (
    <div className={`input-currency ${className}`.trim()}>
      <span>₱</span>
      <input
        type="text"
        pattern="[0-9.,]"
        inputMode="decimal"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    </div>
  );
};

export default InputCurrency;

