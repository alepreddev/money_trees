import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import AccountCard from '@/components/AccountCard';
import AccountForm from '@/components/AccountForm';
import Modal from '@/components/Modal';

/**
 * Formatea un número como moneda.
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * AccountsPage — Página de gestión de cuentas / billeteras.
 *
 * Funcionalidades:
 * - Resumen de totales (activos, deudas, patrimonio neto)
 * - Listado de cuentas con sus balances
 * - Crear nueva cuenta (modal)
 * - Editar cuenta existente (modal)
 * - Eliminar cuenta (con confirmación)
 */
export default function AccountsPage() {
  const {
    accounts,
    loading,
    error,
    totals,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // --- Handlers ---
  async function handleCreate(data) {
    setFormLoading(true);
    setFormError(null);

    const { error: createError } = await createAccount(data);

    if (createError) {
      setFormError(createError.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setShowCreateModal(false);
  }

  async function handleUpdate(data) {
    if (!editingAccount) return;

    setFormLoading(true);
    setFormError(null);

    const { error: updateError } = await updateAccount(editingAccount.id, data);

    if (updateError) {
      setFormError(updateError.message);
      setFormLoading(false);
      return;
    }

    setFormLoading(false);
    setEditingAccount(null);
  }

  async function handleDelete(id) {
    await deleteAccount(id);
  }

  // --- Render ---
  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando cuentas...</p>
      </div>
    );
  }

  return (
    <div className="accounts-page">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__row">
          <div>
            <h2 className="page-header__title">Mis Cuentas</h2>
            <p className="page-header__subtitle">Gestiona tus billeteras y balances</p>
          </div>
          <button
            onClick={() => {
              setFormError(null);
              setShowCreateModal(true);
            }}
            className="page-header__action"
          >
            + Nueva cuenta
          </button>
        </div>
      </header>

      {/* Error global */}
      {error && (
        <div className="page-error" role="alert">{error}</div>
      )}

      {/* Tarjetas de resumen financiero */}
      <section className="accounts-summary">
        <article className="metric-card">
          <span className="metric-card__label">Activos</span>
          <span className="metric-card__value metric-card__value--income">
            {formatCurrency(totals.assets)}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Deudas</span>
          <span className="metric-card__value metric-card__value--expense">
            {formatCurrency(totals.debts)}
          </span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Patrimonio Neto</span>
          <span className={`metric-card__value ${totals.netWorth >= 0 ? 'metric-card__value--income' : 'metric-card__value--expense'}`}>
            {formatCurrency(totals.netWorth)}
          </span>
        </article>
      </section>

      {/* Lista de cuentas */}
      {accounts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🏦</span>
          <h3 className="empty-state__title">No tienes cuentas aún</h3>
          <p className="empty-state__text">
            Crea tu primera cuenta para empezar a registrar tus finanzas.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="empty-state__action"
          >
            + Crear mi primera cuenta
          </button>
        </div>
      ) : (
        <section className="accounts-grid">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={(acc) => {
                setFormError(null);
                setEditingAccount(acc);
              }}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}

      {/* Modal: Crear cuenta */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Cuenta"
      >
        {formError && (
          <div className="page-error" role="alert">{formError}</div>
        )}
        <AccountForm
          onSubmit={handleCreate}
          loading={formLoading}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Modal: Editar cuenta */}
      <Modal
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        title="Editar Cuenta"
      >
        {formError && (
          <div className="page-error" role="alert">{formError}</div>
        )}
        {editingAccount && (
          <AccountForm
            onSubmit={handleUpdate}
            initialData={editingAccount}
            loading={formLoading}
            onCancel={() => setEditingAccount(null)}
          />
        )}
      </Modal>
    </div>
  );
}
