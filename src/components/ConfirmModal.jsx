import Modal from '@/components/Modal';

/**
 * ConfirmModal — Ventana emergente de confirmación basada en "dinamic-windows".
 * Reemplaza los window.confirm del navegador con estética y animación moderna.
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} sizeClass="w-sm" animation="top">
      <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
        <button
          onClick={onClose}
          type="button"
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-text)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          type="button"
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: 'var(--color-danger)',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(214, 48, 49, 0.3)'
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
