/**
 * AccountCard — Tarjeta visual de una cuenta individual.
 *
 * Props:
 * - account: Objeto de cuenta { id, name, type, balance, currency, icon, color }
 * - onEdit(account): Callback para editar
 * - onDelete(id): Callback para eliminar
 */

const TYPE_LABELS = {
  cash: 'Efectivo',
  checking: 'Cuenta Corriente',
  savings: 'Ahorro',
  credit_card: 'Tarjeta de Crédito',
};

export default function AccountCard({ account, onEdit, onDelete }) {
  const balance = Number(account.balance);
  const isNegative = balance < 0;

  /**
   * Formatea un número como moneda.
   */
  function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  return (
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
            onClick={() => {
              if (window.confirm(`¿Eliminar la cuenta "${account.name}"? Las transacciones asociadas también se eliminarán.`)) {
                onDelete(account.id);
              }
            }}
            className="account-card__btn account-card__btn--danger"
            aria-label={`Eliminar ${account.name}`}
          >
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
