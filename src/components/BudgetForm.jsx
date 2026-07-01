import { useState, useEffect } from 'react';

/**
 * BudgetForm — Formulario para configurar el techo de gasto de una categoría en un mes.
 */
export default function BudgetForm({ categories = [], initialData, onSubmit, loading, onCancel }) {
  const [categoryId, setCategoryId] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [error, setError] = useState(null);

  // Filtrar solo categorías de gasto ('expense')
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.category_id || '');
      setAmountLimit(initialData.amount_limit || '');
    } else if (expenseCategories.length > 0 && !categoryId) {
      setCategoryId(expenseCategories[0].id);
    }
  }, [initialData, expenseCategories]);

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Debes seleccionar una categoría.');
      return;
    }

    const val = parseFloat(amountLimit);
    if (isNaN(val) || val <= 0) {
      setError('El límite de gasto debe ser mayor a 0.');
      return;
    }

    onSubmit({
      category_id: categoryId,
      amount_limit: val,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {error && (
        <div className="page-error" role="alert">
          {error}
        </div>
      )}

      <div className="entity-form__field">
        <label htmlFor="budget-category" className="entity-form__label">
          Categoría de Gasto
        </label>
        <select
          id="budget-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={!!initialData || loading}
          className="entity-form__select"
          required
        >
          <option value="" disabled>Seleccionar categoría...</option>
          {expenseCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {initialData && (
          <span className="entity-form__hint">
            Para cambiar de categoría, elimina este presupuesto y crea uno nuevo.
          </span>
        )}
      </div>

      <div className="entity-form__field">
        <label htmlFor="budget-limit" className="entity-form__label">
          Límite o Techo de Gasto Mensual ($)
        </label>
        <input
          id="budget-limit"
          type="number"
          step="0.01"
          min="1"
          placeholder="Ej: 350.00"
          value={amountLimit}
          onChange={(e) => setAmountLimit(e.target.value)}
          disabled={loading}
          className="entity-form__input"
          required
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
          disabled={loading || !amountLimit}
          className="entity-form__btn entity-form__btn--primary"
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar Techo' : 'Crear Presupuesto'}
        </button>
      </div>
    </form>
  );
}
