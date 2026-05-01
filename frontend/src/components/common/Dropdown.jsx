const Dropdown = ({ label, options = [], value, onChange }) => (
  <label>
    {label}
    <select value={value} onChange={onChange}>
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  </label>
);

export default Dropdown;
