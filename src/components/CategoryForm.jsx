import { useState } from 'react';
import { sanitizeText } from '@/lib/validators';
import { Toast } from '@/lib/alerts/alerts';

/**
 * Iconos disponibles para categorías.
 */
const INCOME_ICONS = ['💼', '💻', '📈', '🎁', '💵', '🏆', '📊', '🤝'];
const EXPENSE_ICONS = ['🍔', '🚗', '🏠', '💡', '🏥', '📚', '🎬', '👕', '📱', '📋', '✈️', '🎮'];

/**
 * CategoryForm — Formulario para crear/editar una categoría.
 *
 * Props:
 * - onSubmit(data): Callback con { name, type, icon, color }
 * - initialData: Datos para edición (opcional)
 * - loading: Estado de carga
 * - onCancel: Callback para cancelar
 * - fixedType: Si se pasa, el tipo queda fijo y no se puede cambiar (para filtrado estricto)
 */
export default function CategoryForm({ onSubmit, initialData = null, loading = false, onCancel, fixedType = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(fixedType || initialData?.type || 'expense');
  const [icon, setIcon] = useState(initialData?.icon || '📋');
  const [color, setColor] = useState(initialData?.color || '#8b5cf6');

  const currentType = fixedType || type;
  const availableIcons = currentType === 'income' ? INCOME_ICONS : EXPENSE_ICONS;

  function handleSubmit(e) {
    e.preventDefault();

    const nameVal = sanitizeText(name, { maxLen: 50, fieldName: 'El nombre de la categoría' });
    if (!nameVal.isValid) {
      Toast.show(nameVal.error, { type: 'ios', status: 'error' });
      return;
    }

    onSubmit({
      name: nameVal.value,
      type: currentType,
      icon,
      color,
    });
  }

  function handleTypeChange(newType) {
    if (fixedType) return; // No permitir cambio si está fijo
    setType(newType);
    // Reset icon al cambiar tipo
    setIcon(newType === 'income' ? '💼' : '📋');
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {/* Tipo de categoría */}
      {!fixedType && (
        <div className="entity-form__field">
          <label className="entity-form__label">Tipo de categoría</label>
          <div className="entity-form__toggle">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`entity-form__toggle-btn ${currentType === 'income' ? 'entity-form__toggle-btn--income' : ''}`}
            >
              📈 Ingreso
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`entity-form__toggle-btn ${currentType === 'expense' ? 'entity-form__toggle-btn--expense' : ''}`}
            >
              📉 Gasto
            </button>
          </div>
        </div>
      )}

      {/* Nombre */}
      <div className="entity-form__field">
        <label htmlFor="category-name" className="entity-form__label">
          Nombre
        </label>
        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={currentType === 'income' ? 'Ej: Bonus anual' : 'Ej: Comida rápida'}
          required
          className="entity-form__input"
        />
      </div>

      {/* Icono */}
      <div className="entity-form__field">
        <label className="entity-form__label">Icono</label>
        <div className="entity-form__icon-grid">
          {availableIcons.map((emoji) => (
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

      {/* Color */}
      <div className="entity-form__field">
        <label htmlFor="category-color" className="entity-form__label">
          Color
        </label>
        <input
          id="category-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="entity-form__color"
        />
      </div>

      {/* Botones */}
      <div className="entity-form__actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="entity-form__btn entity-form__btn--secondary">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={loading || !name.trim()} className="entity-form__btn entity-form__btn--primary">
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear categoría'}
        </button>
      </div>
    </form>
  );
}
