import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Toast } from '@/lib/alerts/alerts';

/**
 * Formatea moneda en USD (o moneda genérica)
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * BudgetCard — Tarjeta visual del estado de un presupuesto mensual por categoría.
 */
export default function BudgetCard({ budget, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const spent = Number(budget.spent || 0);
  const limit = Number(budget.amount_limit || 0);
  const percentage = Math.min(200, Math.round(budget.percentage || 0));
  const isOverBudget = spent > limit;
  const isNearLimit = !isOverBudget && percentage >= 80;

  // Determinar color de la barra
  let barColor = 'var(--color-income, #10b981)';
  if (isOverBudget) {
    barColor = 'var(--color-expense, #ef4444)';
  } else if (isNearLimit) {
    barColor = '#f59e0b'; // Naranja / Amarillo
  }

  function handleDeleteConfirm() {
    onDelete(budget.id);
    Toast.show('Presupuesto eliminado', { type: 'ios', status: 'success' });
  }

  const catName = budget.categories?.name || 'Categoría';
  const catIcon = budget.categories?.icon || '📊';
  const catColor = budget.categories?.color || '#6366f1';

  return (
    <>
      <article className="budget-card" style={{ '--budget-color': catColor }}>
        <div className="budget-card__header">
          <div className="budget-card__cat">
            <span className="budget-card__icon" style={{ backgroundColor: `${catColor}20`, color: catColor }}>
              {catIcon}
            </span>
            <span className="budget-card__title">{catName}</span>
          </div>
          <div className="budget-card__actions">
            <button
              onClick={() => onEdit(budget)}
              className="account-card__btn"
              aria-label={`Editar presupuesto de ${catName}`}
            >
              ✏️
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="account-card__btn account-card__btn--danger"
              aria-label={`Eliminar presupuesto de ${catName}`}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="budget-card__numbers">
          <div className="budget-card__spent">
            <span className="budget-card__label">Gastado</span>
            <span className={`budget-card__val ${isOverBudget ? 'text-danger' : ''}`}>
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="budget-card__limit">
            <span className="budget-card__label">Límite Mensual</span>
            <span className="budget-card__val">{formatCurrency(limit)}</span>
          </div>
        </div>

        <div className="budget-card__progress-container">
          <div className="budget-card__progress-bar">
            <div
              className="budget-card__progress-fill"
              style={{
                width: `${Math.min(100, percentage)}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
          <div className="budget-card__percentage">
            <span style={{ color: barColor, fontWeight: 700 }}>
              {percentage}%
            </span>
            {isOverBudget && (
              <span className="budget-card__alert-badge">⚠️ Excedido</span>
            )}
            {isNearLimit && (
              <span className="budget-card__alert-badge warning">⚠️ Alerta (&gt;80%)</span>
            )}
          </div>
        </div>
      </article>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Presupuesto?"
        message={`¿Estás seguro de eliminar el techo de gasto de "${catName}"? Esto no afectará las transacciones ya registradas.`}
        confirmText="Eliminar"
      />
    </>
  );
}
