/**
 * TransactionCard — Tarjeta visual para un movimiento del flujo de caja.
 *
 * Muestra:
 * - Icono y nombre de la categoría (o indicador de transferencia)
 * - Cuenta origen (y cuenta destino si es transferencia)
 * - Monto formateado y coloreado (verde ingreso, rojo gasto, azul transferencia)
 * - Fecha formateada
 * - Botón para eliminar (reverting balance via DB trigger)
 */

export default function TransactionCard({ transaction, onDelete }) {
  const isIncome = transaction.type === 'income';
  const isExpense = transaction.type === 'expense';
  const isTransfer = transaction.type === 'transfer';

  const amount = Number(transaction.amount);

  // Formatear moneda
  function formatCurrency(val, currency = 'USD') {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(val);
  }

  // Formatear fecha
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('es', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  }

  const accountName = transaction.account?.name || 'Cuenta eliminada';
  const accountCurrency = transaction.account?.currency || 'USD';

  // Determinar icono y título
  let icon = '💸';
  let title = transaction.description || 'Transacción';

  if (isTransfer) {
    icon = '⇄';
    const toAccountName = transaction.to_account?.name || 'Cuenta';
    title = transaction.description || `Transferencia a ${toAccountName}`;
  } else if (transaction.category) {
    icon = transaction.category.icon || (isIncome ? '💰' : '🛒');
    title = transaction.description || transaction.category.name;
  }

  return (
    <article className={`tx-card tx-card--${transaction.type}`}>
      <div className="tx-card__icon-wrapper">
        <span className="tx-card__icon">{icon}</span>
      </div>

      <div className="tx-card__details">
        <h4 className="tx-card__title">{title}</h4>
        <div className="tx-card__meta">
          <span className="tx-card__account">
            {transaction.account?.icon || '🏦'} {accountName}
            {isTransfer && transaction.to_account && (
              <span> ➔ {transaction.to_account.icon} {transaction.to_account.name}</span>
            )}
          </span>
          {transaction.category && transaction.description && (
            <span className="tx-card__category"> • {transaction.category.name}</span>
          )}
        </div>
      </div>

      <div className="tx-card__right">
        <span className={`tx-card__amount tx-card__amount--${transaction.type}`}>
          {isIncome ? '+' : isExpense ? '-' : ''}
          {formatCurrency(amount, accountCurrency)}
        </span>
        <span className="tx-card__date">{formatDate(transaction.transaction_date)}</span>
      </div>

      {onDelete && (
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar esta transacción? El balance de la cuenta se revertirá automáticamente.')) {
              onDelete(transaction.id);
            }
          }}
          className="tx-card__delete"
          aria-label="Eliminar transacción"
        >
          ✕
        </button>
      )}
    </article>
  );
}
