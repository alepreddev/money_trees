import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import TransactionCard from '@/components/TransactionCard';
import TransactionForm from '@/components/TransactionForm';
import Modal from '@/components/Modal';
import { Toast } from '@/lib/alerts/alerts';

/**
 * Formatea moneda para el resumen
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Nombre del mes en español
 */
function getMonthName(monthNumber) {
  const date = new Date(2000, monthNumber - 1, 1);
  return new Intl.DateTimeFormat('es', { month: 'long' }).format(date);
}

/**
 * TransactionsPage — Página de historial y gestión de flujo de caja.
 */
export default function TransactionsPage() {
  const navigate = useNavigate();
  const {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    summary,
    createTransaction,
    deleteTransaction,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useTransactions();

  const { accounts } = useAccounts();
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Handler para crear desde el modal modal
  async function handleCreate(data) {
    setFormLoading(true);
    setFormError(null);

    const { error: insertError } = await createTransaction(data);

    if (insertError) {
      setFormError(insertError.message);
      Toast.show(insertError.message, { type: 'ios', status: 'error' });
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setShowModal(false);
    Toast.show('Movimiento registrado con éxito', { type: 'ios', status: 'success' });
  }

  return (
    <div className="transactions-page">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h2 className="page-header__title">Flujo de Caja</h2>
            <p className="page-header__subtitle">
              Historial detallado de ingresos, gastos y transferencias
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="page-header__action"
          >
            + Nueva transacción
          </button>
        </div>
      </header>

      {error && <div className="page-error" role="alert">{error}</div>}

      {/* Navegador de mes y año */}
      <div className="tx-month-nav">
        <button onClick={goToPreviousMonth} className="tx-month-nav__btn" aria-label="Mes anterior">
          ←
        </button>
        <div className="tx-month-nav__current" onClick={goToCurrentMonth} title="Volver al mes actual">
          <span className="tx-month-nav__month">{getMonthName(filters.month)}</span>
          <span className="tx-month-nav__year">{filters.year}</span>
        </div>
        <button onClick={goToNextMonth} className="tx-month-nav__btn" aria-label="Mes siguiente">
          →
        </button>
      </div>

      {/* Resumen financiero del periodo */}
      <section className="dashboard-metrics">
        <article className="metric-card">
          <span className="metric-card__label">Ingresos</span>
          <span className="metric-card__value metric-card__value--income">
            +{formatCurrency(summary.totalIncome)}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Gastos</span>
          <span className="metric-card__value metric-card__value--expense">
            -{formatCurrency(summary.totalExpense)}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Flujo Neto</span>
          <span className={`metric-card__value ${summary.netCashFlow >= 0 ? 'metric-card__value--income' : 'metric-card__value--expense'}`}>
            {summary.netCashFlow >= 0 ? '+' : ''}{formatCurrency(summary.netCashFlow)}
          </span>
        </article>
      </section>

      {/* Barra de filtros */}
      <div className="tx-filters">
        {/* Filtro por tipo */}
        <div className="categories-filters" style={{ margin: 0 }}>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: null }))}
            className={`filter-btn ${!filters.type ? 'filter-btn--active' : ''}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: 'income' }))}
            className={`filter-btn ${filters.type === 'income' ? 'filter-btn--active filter-btn--income' : ''}`}
          >
            ↑ Ingresos
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: 'expense' }))}
            className={`filter-btn ${filters.type === 'expense' ? 'filter-btn--active filter-btn--expense' : ''}`}
          >
            ↓ Gastos
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, type: 'transfer' }))}
            className={`filter-btn ${filters.type === 'transfer' ? 'filter-btn--active' : ''}`}
          >
            ⇄ Transferencias
          </button>
        </div>

        {/* Filtro por cuenta */}
        <select
          value={filters.accountId || ''}
          onChange={(e) => setFilters((prev) => ({ ...prev, accountId: e.target.value || null }))}
          className="entity-form__select tx-account-filter"
        >
          <option value="">Todas las cuentas</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.icon} {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de transacciones */}
      {loading ? (
        <div className="loading-state" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Cargando movimientos de {getMonthName(filters.month)}...
        </div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📝</span>
          <h3 className="empty-state__title">Sin movimientos este mes</h3>
          <p className="empty-state__text">
            No hay transacciones registradas en {getMonthName(filters.month)} de {filters.year} con los filtros seleccionados.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="empty-state__action"
          >
            + Registrar movimiento
          </button>
        </div>
      ) : (
        <div className="tx-list">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onDelete={deleteTransaction}
            />
          ))}
        </div>
      )}

      {/* Modal para nueva transacción */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nuevo Movimiento"
        animation="bottom"
      >
        {formError && <div className="page-error" role="alert">{formError}</div>}
        <TransactionForm
          onSubmit={handleCreate}
          loading={formLoading}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
