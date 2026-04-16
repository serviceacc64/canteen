const Modal = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;

  return (
    <div className="modal show" aria-hidden={!open}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-label={title}>
        {title ? (
          <header>
            <h3>{title}</h3>
          </header>
        ) : null}
        <div className="modal-body">{children}</div>
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
