import { useState, useEffect } from 'react';

const GOAL_ICONS = ['🎯', '🛡️', '🏖️', '🚗', '🏡', '💻', '📚', '📈', '🚀', '✈️'];

/**
 * SavingGoalForm — Formulario para crear o editar una meta de ahorro.
 */
export default function SavingGoalForm({ initialData, onSubmit, loading, onCancel }) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#10b981');
  const [isEmergencyFund, setIsEmergencyFund] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTargetAmount(initialData.target_amount || '');
      setCurrentAmount(initialData.current_amount !== undefined ? initialData.current_amount : '0');
      setTargetDate(initialData.target_date || '');
      setIcon(initialData.icon || '🎯');
      setColor(initialData.color || '#10b981');
      setIsEmergencyFund(Boolean(initialData.is_emergency_fund));
    }
  }, [initialData]);

  function handleEmergencyToggle(checked) {
    setIsEmergencyFund(checked);
    if (checked && !name) {
      setName('Fondo de Emergencia (6 Meses)');
      setIcon('🛡️');
      setColor('#3b82f6');
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre de la meta es obligatorio.');
      return;
    }

    const tVal = parseFloat(targetAmount);
    if (isNaN(tVal) || tVal <= 0) {
      setError('El objetivo de ahorro debe ser mayor a 0.');
      return;
    }

    const cVal = parseFloat(currentAmount) || 0;

    onSubmit({
      name: name.trim(),
      target_amount: tVal,
      current_amount: cVal,
      target_date: targetDate || null,
      icon,
      color,
      is_emergency_fund: isEmergencyFund,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && (
        <div className="page-error" role="alert">
          {error}
        </div>
      )}

      <div className="entity-form__field" style={{ backgroundColor: 'var(--color-surface-raised)', padding: '12px', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
        <label className="entity-form__label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
          <input
            type="checkbox"
            checked={isEmergencyFund}
            onChange={(e) => handleEmergencyToggle(e.target.checked)}
            disabled={loading}
          />
          🛡️ ¿Es un Fondo de Emergencia?
        </label>
        <span className="entity-form__hint">
          Prioriza tu estabilidad reservando de 3 a 6 meses de tus gastos vitales fijos.
        </span>
      </div>

      <div className="entity-form__field">
        <label htmlFor="goal-name" className="entity-form__label">
          Nombre de la Meta
        </label>
        <input
          id="goal-name"
          type="text"
          placeholder="Ej: Vacaciones de Verano, Auto nuevo..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="entity-form__input"
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="entity-form__field">
          <label htmlFor="goal-target" className="entity-form__label">
            Objetivo Total ($)
          </label>
          <input
            id="goal-target"
            type="number"
            step="0.01"
            min="1"
            placeholder="Ej: 3000.00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            disabled={loading}
            className="entity-form__input"
            required
          />
        </div>

        <div className="entity-form__field">
          <label htmlFor="goal-current" className="entity-form__label">
            Acumulado Inicial ($)
          </label>
          <input
            id="goal-current"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ej: 500.00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            disabled={loading || !!initialData}
            className="entity-form__input"
          />
        </div>
      </div>

      <div className="entity-form__field">
        <label htmlFor="goal-date" className="entity-form__label">
          Fecha Límite (Opcional)
        </label>
        <input
          id="goal-date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          disabled={loading}
          className="entity-form__input"
        />
      </div>

      <div className="entity-form__field">
        <label className="entity-form__label">Icono</label>
        <div className="entity-form__icon-grid">
          {GOAL_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`entity-form__icon-btn ${icon === emoji ? 'entity-form__icon-btn--active' : ''}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="entity-form__field">
        <label htmlFor="goal-color" className="entity-form__label">
          Color Identificador
        </label>
        <input
          id="goal-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="entity-form__color"
        />
      </div>

      <div className="entity-form__actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="entity-form__btn entity-form__btn--secondary"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="entity-form__btn entity-form__btn--primary"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar Meta' : 'Crear Meta'}
        </button>
      </div>
    </form>
  );
}
