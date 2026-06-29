/**
 * Modal — Componente modal reutilizable.
 *
 * Props:
 * - isOpen: Boolean que controla visibilidad
 * - onClose: Callback para cerrar
 * - title: Título del modal
 * - children: Contenido del modal
 */
export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close" aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
