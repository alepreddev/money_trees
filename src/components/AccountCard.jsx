import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Toast } from '@/lib/alerts/alerts';

/**
 * AccountCard — Tarjeta visual de una cuenta individual.
 * Potenciada con alertas y ventanas dinámicas de Jose Arocha.
 */

const TYPE_LABELS = {
  cash: 'Efectivo',
  checking: 'Cuenta Corriente',
  savings: 'Ahorro',
  credit_card: 'Tarjeta de Crédito',
};

export default function AccountCard({ account, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const balance = Number(account.balance);
  const isNegative = balance < 0;

  function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  function handleDeleteConfirm() {
    onDelete(account.id);
    Toast.show(`Cuenta "${account.name}" eliminada`, { type: 'ios', status: 'success' });
  }

  return (
    <>
      <article className="account-card" style={{ '--account-color': account.color }}>
        <div className="account-card__header">
          <span className="account-card__icon">{account.icon}</span>
          <span className="account-card__type">{TYPE_LABELS[account.type] || account.type}</span>
        </div>

        <h3 className="account-card__name">{account.name}</h3>

        <p className={`account-card__balance ${isNegative ? 'account-card__balance--negative' : ''}`}>
          {formatCurrency(balance, account.currency)}
        </p>

        <div className="account-card__actions">
          {onEdit && (
            <button
              onClick={() => onEdit(account)}
              className="account-card__btn"
              aria-label={`Editar ${account.name}`}
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => setShowConfirm(true)}
              className="account-card__btn account-card__btn--danger"
              aria-label={`Eliminar ${account.name}`}
            >
              🗑️
            </button>
          )}
        </div>
      </article>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Cuenta?"
        message={`¿Deseas eliminar "${account.name}"? Todas las transacciones asociadas también se eliminarán.`}
        confirmText="Eliminar cuenta"
      />
    </>
  );
}
