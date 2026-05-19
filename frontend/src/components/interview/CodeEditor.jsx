const CodeEditor = ({ value = "", onChange }) => (
  <textarea value={value} onChange={onChange} spellCheck="false" />
);

export default CodeEditor;
