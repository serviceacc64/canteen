const InputCurrency = ({
  value = 0,
  onChange,
  step = '0.01',
  min = '0',
  className = '',
  ...props
}) => {
  return (
    <div className={`input-currency ${className}`.trim()}>
      <span>₱</span>
      <input
        type="number"
        step={step}
        min={min}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default InputCurrency;
