import { useState } from 'react';
import ConfirmModal from '@/components/ConfirmModal';
import { Toast } from '@/lib/alerts/alerts';

/**
 * CategoryCard — Tarjeta visual de una categoría.
 * Potenciada con alertas y ventanas dinámicas de Jose Arocha.
 */
export default function CategoryCard({ category, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isSystem = category.is_system;

  function handleDeleteConfirm() {
    onDelete(category.id);
    Toast.show(`Categoría "${category.name}" eliminada`, { type: 'ios', status: 'success' });
  }

  return (
    <>
      <article
        className={`category-card ${isSystem ? 'category-card--system' : ''}`}
        style={{ '--category-color': category.color }}
      >
        <div className="category-card__main">
          <span className="category-card__icon">{category.icon}</span>
          <div className="category-card__info">
            <h4 className="category-card__name">{category.name}</h4>
            <span className={`category-card__type category-card__type--${category.type}`}>
              {category.type === 'income' ? 'Ingreso' : 'Gasto'}
            </span>
          </div>
        </div>

        <div className="category-card__actions">
          {isSystem && (
            <span className="category-card__badge">Sistema</span>
          )}
          {!isSystem && onEdit && (
            <button
              onClick={() => onEdit(category)}
              className="category-card__btn"
              aria-label={`Editar ${category.name}`}
            >
              ✏️
            </button>
          )}
          {!isSystem && onDelete && (
            <button
              onClick={() => setShowConfirm(true)}
              className="category-card__btn category-card__btn--danger"
              aria-label={`Eliminar ${category.name}`}
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
        title="¿Eliminar Categoría?"
        message={`¿Estás seguro de eliminar la categoría "${category.name}"?`}
        confirmText="Eliminar"
      />
    </>
  );
}
