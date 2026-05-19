const Button = ({ children, type = "button", className = "", ...props }) => (
  <button type={type} className={className} {...props}>
    {children}
  </button>
);

export default Button;
