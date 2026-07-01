import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';
import { Toast } from '@/lib/alerts/alerts';

function formatCurrency(val) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
}

/**
 * SavingGoalCard — Tarjeta visual de una meta de ahorro o hucha virtual.
 */
export default function SavingGoalCard({ goal, onEdit, onDelete, onContribute }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contribAmount, setContribAmount] = useState('');
  const [contribLoading, setContribLoading] = useState(false);

  const current = Number(goal.current_amount || 0);
  const target = Number(goal.target_amount || 0);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const isCompleted = current >= target;

  function handleDeleteConfirm() {
    onDelete(goal.id);
    Toast.show('Meta de ahorro eliminada', { type: 'ios', status: 'success' });
  }

  async function handleContributeSubmit(e) {
    e.preventDefault();
    const val = parseFloat(contribAmount);
    if (isNaN(val) || val <= 0) {
      Toast.show('Ingresa un monto válido para aportar', { type: 'ios', status: 'warning' });
      return;
    }

    setContribLoading(true);
    const { error } = await onContribute(goal.id, val);
    setContribLoading(false);

    if (error) {
      Toast.show(error.message, { type: 'ios', status: 'error' });
    } else {
      Toast.show(`¡Aporte de ${formatCurrency(val)} registrado exitosamente!`, { type: 'ios', status: 'success' });
      setShowContributeModal(false);
      setContribAmount('');
    }
  }

  return (
    <>
      <article className={`goal-card ${goal.is_emergency_fund ? 'goal-card--emergency' : ''}`} style={{ '--goal-color': goal.color }}>
        <div className="goal-card__header">
          <div className="goal-card__title-group">
            <span className="goal-card__icon" style={{ backgroundColor: `${goal.color}20` }}>
              {goal.icon}
            </span>
            <div>
              <h4 className="goal-card__name">
                {goal.name}
                {goal.is_emergency_fund && (
                  <span className="emergency-badge">🛡️ Fondo de Emergencia</span>
                )}
              </h4>
              {goal.target_date && (
                <span className="goal-card__date">Meta: {goal.target_date}</span>
              )}
            </div>
          </div>

          <div className="goal-card__actions">
            <button
              onClick={() => onEdit(goal)}
              className="account-card__btn"
              aria-label={`Editar ${goal.name}`}
            >
              ✏️
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="account-card__btn account-card__btn--danger"
              aria-label={`Eliminar ${goal.name}`}
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="goal-card__numbers">
          <div>
            <span className="goal-card__label">Acumulado</span>
            <span className="goal-card__current">{formatCurrency(current)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="goal-card__label">Objetivo</span>
            <span className="goal-card__target">{formatCurrency(target)}</span>
          </div>
        </div>

        <div className="goal-card__progress">
          <div className="budget-card__progress-bar">
            <div
              className="budget-card__progress-fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: isCompleted ? '#10b981' : goal.color,
              }}
            />
          </div>
          <div className="goal-card__meta">
            <span>{percentage}% Completado</span>
            {isCompleted ? (
              <span style={{ color: '#10b981', fontWeight: 700 }}>🎉 ¡Meta Alcanzada!</span>
            ) : (
              <span>Faltan {formatCurrency(Math.max(0, target - current))}</span>
            )}
          </div>
        </div>

        <div className="goal-card__footer">
          <button
            onClick={() => setShowContributeModal(true)}
            className="btn btn--primary btn--sm"
            style={{ width: '100%' }}
          >
            ＋ Aportar a la Meta
          </button>
        </div>
      </article>

      {/* Modal para aportar */}
      <Modal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        title={`Aportar a "${goal.name}"`}
        sizeClass="w-sm"
        animation="top"
      >
        <form onSubmit={handleContributeSubmit} className="entity-form">
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Simula o registra el desvío de dinero hacia esta hucha virtual de ahorro.
          </p>

          <div className="form-group">
            <label htmlFor="contrib-val">Monto a Aportar ($)</label>
            <input
              id="contrib-val"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Ej: 100.00"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              className="form-input"
              required
              autoFocus
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowContributeModal(false)}
              className="btn btn--secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={contribLoading}
              className="btn btn--primary"
            >
              {contribLoading ? 'Guardando...' : 'Confirmar Aporte'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Meta?"
        message={`¿Estás seguro de eliminar la meta "${goal.name}"?`}
        confirmText="Eliminar"
      />
    </>
  );
}
