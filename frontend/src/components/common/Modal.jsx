const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true">
      <div>
        {title && <h2>{title}</h2>}
        <button type="button" onClick={onClose} aria-label="Close modal">
          x
        </button>
      </div>
      {children}
    </div>
  );
};

export default Modal;
