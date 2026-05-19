const Alert = ({ children, type = "info" }) => (
  <div role="alert" data-type={type}>
    {children}
  </div>
);

export default Alert;
