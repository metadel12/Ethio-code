const RecordingControls = ({ recording, onToggle }) => (
  <button type="button" onClick={onToggle}>
    {recording ? "Stop" : "Record"}
  </button>
);

export default RecordingControls;
