const LoadingSpinner = ({ label = "Loading" }) => (
  <div role="status" aria-live="polite">
    {label}
  </div>
);

export default LoadingSpinner;
