const ProgressBar = ({ value = 0, max = 100 }) => (
  <progress value={value} max={max}>
    {value}%
  </progress>
);

export default ProgressBar;
