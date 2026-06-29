import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import CategoryCard from '@/components/CategoryCard';
import CategoryForm from '@/components/CategoryForm';
import Modal from '@/components/Modal';

/**
 * CategoriesPage — Página de gestión de categorías.
 *
 * Funcionalidades:
 * - Filtro por tipo (Todos, Ingresos, Gastos)
 * - Separación visual entre categorías del sistema y personalizadas
 * - Crear nueva categoría (modal)
 * - Editar/eliminar categorías propias
 */
export default function CategoriesPage() {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    userCategories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'income', 'expense'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // --- Categorías filtradas ---
  function getFilteredCategories() {
    switch (activeFilter) {
      case 'income':
        return incomeCategories;
      case 'expense':
        return expenseCategories;
      default:
        return categories;
    }
  }

  const filteredCategories = getFilteredCategories();

  // Separar en sistema y personalizadas para el listado
  const systemCategories = filteredCategories.filter((c) => c.is_system);
  const customCategories = filteredCategories.filter((c) => !c.is_system);

  // --- Handlers ---
  async function handleCreate(data) {
    setFormLoading(true);
    setFormError(null);

    const { error: createError } = await createCategory(data);

    if (createError) {
      setFormError(createError.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setShowCreateModal(false);
  }

  async function handleUpdate(data) {
    if (!editingCategory) return;

    setFormLoading(true);
    setFormError(null);

    const { error: updateError } = await updateCategory(editingCategory.id, data);

    if (updateError) {
      setFormError(updateError.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setEditingCategory(null);
  }

  async function handleDelete(id) {
    await deleteCategory(id);
  }

  // --- Render ---
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h2 className="page-header__title">Categorías</h2>
            <p className="page-header__subtitle">
              Organiza tus ingresos y gastos
            </p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
            className="page-header__action"
          >
            + Nueva categoría
          </button>
        </div>
      </header>

      {/* Error global */}
      {error && (
        <div className="page-error" role="alert">{error}</div>
      )}

      {/* Filtros por tipo */}
      <div className="categories-filters">
        <button
          onClick={() => setActiveFilter('all')}
          className={`filter-btn ${activeFilter === 'all' ? 'filter-btn--active' : ''}`}
        >
          Todas ({categories.length})
        </button>
        <button
          onClick={() => setActiveFilter('income')}
          className={`filter-btn ${activeFilter === 'income' ? 'filter-btn--active filter-btn--income' : ''}`}
        >
          📈 Ingresos ({incomeCategories.length})
        </button>
        <button
          onClick={() => setActiveFilter('expense')}
          className={`filter-btn ${activeFilter === 'expense' ? 'filter-btn--active filter-btn--expense' : ''}`}
        >
          📉 Gastos ({expenseCategories.length})
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="categories-stats">
        <span>
          {systemCategories.length} del sistema • {customCategories.length} personalizadas
        </span>
      </div>

      {/* Categorías personalizadas */}
      {customCategories.length > 0 && (
        <section className="categories-section">
          <h3 className="categories-section__title">Mis categorías</h3>
          <div className="categories-list">
            {customCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={(c) => {
                  setFormError(null);
                  setEditingCategory(c);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categorías del sistema */}
      {systemCategories.length > 0 && (
        <section className="categories-section">
          <h3 className="categories-section__title">Categorías del sistema</h3>
          <div className="categories-list">
            {systemCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
              />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {filteredCategories.length === 0 && (
        <div className="empty-state">
          <span className="empty-state__icon">📋</span>
          <h3 className="empty-state__title">No hay categorías</h3>
          <p className="empty-state__text">
            No se encontraron categorías con este filtro.
          </p>
        </div>
      )}

      {/* Modal: Crear categoría */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Categoría"
      >
        {formError && (
          <div className="page-error" role="alert">{formError}</div>
        )}
        <CategoryForm
          onSubmit={handleCreate}
          loading={formLoading}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal: Editar categoría */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Editar Categoría"
      >
        {formError && (
          <div className="page-error" role="alert">{formError}</div>
        )}
        {editingCategory && (
          <CategoryForm
            onSubmit={handleUpdate}
            initialData={editingCategory}
            fixedType={editingCategory.type}
            loading={formLoading}
            onCancel={() => setEditingCategory(null)}
          />
        )}
      </Modal>
    </div>
  );
}
