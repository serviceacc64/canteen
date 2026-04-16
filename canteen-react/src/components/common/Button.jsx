const Button = ({
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
