const Input = ({ label, id, ...props }) => (
  <label htmlFor={id}>
    {label}
    <input id={id} {...props} />
  </label>
);

export default Input;
