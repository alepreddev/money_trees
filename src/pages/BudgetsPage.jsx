import { useState } from 'react';
import { useBudgets } from '@/hooks/useBudgets';
import { useSavingGoals } from '@/hooks/useSavingGoals';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import BudgetCard from '@/components/BudgetCard';
import BudgetForm from '@/components/BudgetForm';
import Assistant503020 from '@/components/Assistant503020';
import SavingGoalCard from '@/components/SavingGoalCard';
import SavingGoalForm from '@/components/SavingGoalForm';
import Modal from '@/components/Modal';
import { Toast } from '@/lib/alerts/alerts';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatCurrency(val) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
}

/**
 * BudgetsPage — Vista de la Fase 5: Presupuestos Mensuales, Asistente 50/30/20 y Metas de Ahorro.
 */
export default function BudgetsPage() {
  const [activeTab, setActiveTab] = useState('budgets'); // 'budgets' | 'rule' | 'goals'

  // Hooks de datos
  const {
    month,
    year,
    budgets,
    totals,
    loading: budgetsLoading,
    upsertBudget,
    deleteBudget,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useBudgets();

  const {
    goals,
    loading: goalsLoading,
    createGoal,
    updateGoal,
    addContribution,
    deleteGoal,
  } = useSavingGoals();

  const { categories, loading: categoriesLoading } = useCategories();
  const { summary } = useTransactions();

  // Estados modales
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // --- Handlers Presupuestos ---
  async function handleBudgetSubmit(data) {
    setFormLoading(true);
    const { error } = await upsertBudget(data);
    setFormLoading(false);

    if (error) {
      Toast.show(error.message || 'Error al guardar presupuesto', { type: 'ios', status: 'error' });
    } else {
      Toast.show('¡Presupuesto actualizado con éxito!', { type: 'ios', status: 'success' });
      setShowBudgetModal(false);
      setEditingBudget(null);
    }
  }

  // --- Handlers Metas de Ahorro ---
  async function handleGoalSubmit(data) {
    setFormLoading(true);
    let result;
    if (editingGoal) {
      result = await updateGoal(editingGoal.id, data);
    } else {
      result = await createGoal(data);
    }
    setFormLoading(false);

    if (result.error) {
      Toast.show(result.error.message || 'Error al guardar meta', { type: 'ios', status: 'error' });
    } else {
      Toast.show(editingGoal ? 'Meta actualizada con éxito' : '¡Meta creada con éxito!', {
        type: 'ios',
        status: 'success',
      });
      setShowGoalModal(false);
      setEditingGoal(null);
    }
  }

  return (
    <div className="budgets-page">
      {/* Encabezado Principal estandarizado */}
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h2 className="page-header__title">Estabilidad & Presupuestos</h2>
            <p className="page-header__subtitle">
              Controla tus techos de gasto, planifica tus metas y evita sobrecostos
            </p>
          </div>

          {activeTab === 'budgets' && (
            <button
              onClick={() => {
                setEditingBudget(null);
                setShowBudgetModal(true);
              }}
              className="page-header__action"
            >
              + Nuevo Presupuesto
            </button>
          )}

          {activeTab === 'goals' && (
            <button
              onClick={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
              className="page-header__action"
            >
              + Nueva Meta / Fondo
            </button>
          )}
        </div>
      </header>

      {/* Navegación por pestañas estilo cápsula */}
      <div className="categories-filters" style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('budgets')}
          className={`filter-btn ${activeTab === 'budgets' ? 'filter-btn--active' : ''}`}
        >
          📊 Presupuestos Mensuales
        </button>
        <button
          onClick={() => setActiveTab('rule')}
          className={`filter-btn ${activeTab === 'rule' ? 'filter-btn--active' : ''}`}
        >
          🧠 Asistente 50/30/20
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`filter-btn ${activeTab === 'goals' ? 'filter-btn--active' : ''}`}
        >
          🎯 Metas & Fondo de Emergencia
        </button>
      </div>

      {/* ================= PESTAÑA 1: PRESUPUESTOS ================= */}
      {activeTab === 'budgets' && (
        <section className="tab-pane">
          {/* Barra selectora de mes */}
          <div
            className="month-selector-bar"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <button onClick={goToPreviousMonth} className="entity-form__btn entity-form__btn--secondary" style={{ padding: '0.5rem 1rem' }}>
              ◀ Anterior
            </button>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text)' }}>
                {MONTH_NAMES[month - 1]} {year}
              </h3>
              <button
                onClick={goToCurrentMonth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  padding: '2px 0',
                  fontWeight: 600,
                }}
              >
                Ir al mes actual
              </button>
            </div>
            <button onClick={goToNextMonth} className="entity-form__btn entity-form__btn--secondary" style={{ padding: '0.5rem 1rem' }}>
              Siguiente ▶
            </button>
          </div>

          {/* Tarjeta de Resumen Global del Mes */}
          <div
            className="budget-summary-banner"
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Consumo Total del Período
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-text)' }}>
                {formatCurrency(totals.totalSpentInBudgets)} / {formatCurrency(totals.totalLimit)}
              </span>
            </div>
            <div className="budget-card__progress-bar" style={{ height: '12px' }}>
              <div
                className="budget-card__progress-fill"
                style={{
                  width: `${Math.min(100, totals.percentage)}%`,
                  backgroundColor: totals.percentage > 100 ? '#ef4444' : totals.percentage > 80 ? '#f59e0b' : '#10b981',
                }}
              />
            </div>
          </div>

          {/* Grid de Presupuestos */}
          {budgetsLoading ? (
            <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Cargando presupuestos del mes...
            </div>
          ) : budgets.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📊</span>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>Sin presupuestos definidos</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
                No tienes techos de gasto para {MONTH_NAMES[month - 1]} {year}.
              </p>
              <button
                onClick={() => {
                  setEditingBudget(null);
                  setShowBudgetModal(true);
                }}
                className="entity-form__btn entity-form__btn--primary"
              >
                + Crear Primer Presupuesto
              </button>
            </div>
          ) : (
            <div className="accounts-grid">
              {budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={(item) => {
                    setEditingBudget(item);
                  }}
                  onDelete={deleteBudget}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ================= PESTAÑA 2: ASISTENTE 50/30/20 ================= */}
      {activeTab === 'rule' && (
        <section className="tab-pane">
          <Assistant503020
            actualIncome={summary?.totalIncome || 0}
            totalBudgetLimit={totals.totalLimit}
          />
        </section>
      )}

      {/* ================= PESTAÑA 3: METAS Y FONDO ================= */}
      {activeTab === 'goals' && (
        <section className="tab-pane">
          {goalsLoading ? (
            <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Cargando metas de ahorro...
            </div>
          ) : goals.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎯</span>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>Sin metas de ahorro</h3>
              <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 1.5rem 0' }}>
                Crea tu fondo de emergencia o planifica tus ahorros a futuro.
              </p>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setShowGoalModal(true);
                }}
                className="entity-form__btn entity-form__btn--primary"
              >
                + Crear Mi Primera Meta
              </button>
            </div>
          ) : (
            <div className="accounts-grid">
              {goals.map((g) => (
                <SavingGoalCard
                  key={g.id}
                  goal={g}
                  onEdit={(item) => {
                    setEditingGoal(item);
                    setShowGoalModal(true);
                  }}
                  onDelete={deleteGoal}
                  onContribute={addContribution}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* --- Modal: Crear / Editar Presupuesto --- */}
      <Modal
        isOpen={showBudgetModal || !!editingBudget}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? 'Editar Techo de Gasto' : 'Nuevo Presupuesto Mensual'}
        animation="top"
      >
        <BudgetForm
          categories={categories}
          initialData={editingBudget}
          onSubmit={handleBudgetSubmit}
          loading={formLoading || categoriesLoading}
          onCancel={() => {
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
        />
      </Modal>

      {/* --- Modal: Crear / Editar Meta de Ahorro --- */}
      <Modal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        title={editingGoal ? 'Editar Meta de Ahorro' : 'Nueva Meta o Fondo'}
        animation="bottom"
      >
        <SavingGoalForm
          initialData={editingGoal}
          onSubmit={handleGoalSubmit}
          loading={formLoading}
          onCancel={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
        />
      </Modal>
    </div>
  );
}
