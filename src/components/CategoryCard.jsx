/**
 * CategoryCard — Tarjeta visual de una categoría.
 *
 * Props:
 * - category: { id, name, type, icon, color, is_system }
 * - onEdit(category): Callback para editar (solo no-sistema)
 * - onDelete(id): Callback para eliminar (solo no-sistema)
 */
export default function CategoryCard({ category, onEdit, onDelete }) {
  const isSystem = category.is_system;

  return (
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
            onClick={() => {
              if (window.confirm(`¿Eliminar la categoría "${category.name}"?`)) {
                onDelete(category.id);
              }
            }}
            className="category-card__btn category-card__btn--danger"
            aria-label={`Eliminar ${category.name}`}
          >
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
