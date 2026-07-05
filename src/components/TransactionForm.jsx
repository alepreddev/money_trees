import { useState, useEffect } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { validateAmount, sanitizeText, validateDate, validateTransfer } from '@/lib/validators';
import { Toast } from '@/lib/alerts/alerts';

/**
 * TransactionForm — Formulario unificado de transacción rápida (Fricción Cero).
 *
 * Lógica condicional:
 * - income/expense → muestra selector de categoría, oculta cuenta destino
 * - transfer → muestra cuenta destino, oculta categoría
 *
 * Props:
 * - onSubmit(data): Callback con datos validados
 * - loading: Estado de carga
 * - onCancel: Callback cancelar (opcional)
 * - defaultType: Tipo preseleccionado ('income', 'expense', 'transfer')
 */
export default function TransactionForm({ onSubmit, loading = false, onCancel, defaultType = 'expense' }) {
  const { accounts } = useAccounts();
  const { incomeCategories, expenseCategories } = useCategories();

  const [type, setType] = useState(defaultType);
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Categorías según el tipo seleccionado
  const availableCategories = type === 'income' ? incomeCategories : expenseCategories;

  // Pre-seleccionar primera cuenta disponible
  useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Reset categoría cuando cambia el tipo
  useEffect(() => {
    setCategoryId('');
    setToAccountId('');
  }, [type]);

  function handleSubmit(e) {
    e.preventDefault();

    // Validaciones estrictas con retroalimentación visual (Fase 1 Plan de Seguridad)
    const amountVal = validateAmount(amount, { fieldName: 'El monto' });
    if (!amountVal.isValid) {
      Toast.show(amountVal.error, { type: 'ios', status: 'error' });
      return;
    }

    if (!accountId) {
      Toast.show('Debes seleccionar una cuenta de origen.', { type: 'ios', status: 'error' });
      return;
    }

    if (type === 'transfer') {
      const transferVal = validateTransfer(accountId, toAccountId);
      if (!transferVal.isValid) {
        Toast.show(transferVal.error, { type: 'ios', status: 'error' });
        return;
      }
    } else {
      if (!categoryId) {
        Toast.show('Debes seleccionar una categoría para clasificar el movimiento.', { type: 'ios', status: 'error' });
        return;
      }
    }

    const dateVal = validateDate(transactionDate, { fieldName: 'La fecha de transacción' });
    if (!dateVal.isValid) {
      Toast.show(dateVal.error, { type: 'ios', status: 'error' });
      return;
    }

    let cleanDesc = '';
    if (description && description.trim()) {
      const descVal = sanitizeText(description, { maxLen: 150, fieldName: 'La descripción' });
      if (!descVal.isValid) {
        Toast.show(descVal.error, { type: 'ios', status: 'error' });
        return;
      }
      cleanDesc = descVal.value;
    }

    onSubmit({
      type,
      amount: amountVal.value,
      account_id: accountId,
      to_account_id: type === 'transfer' ? toAccountId : null,
      category_id: type !== 'transfer' ? categoryId : null,
      description: cleanDesc,
      transaction_date: dateVal.value,
    });

    // Reset después de enviar
    setAmount('');
    setDescription('');
    setCategoryId('');
    setToAccountId('');
  }

  // Cuentas destino (excluir la cuenta origen)
  const destinationAccounts = accounts.filter((a) => a.id !== accountId);

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      {/* === Tipo de transacción === */}
      <div className="tx-type-selector">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`tx-type-btn tx-type-btn--expense ${type === 'expense' ? 'tx-type-btn--active' : ''}`}
        >
          <span className="tx-type-btn__icon">↓</span>
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`tx-type-btn tx-type-btn--income ${type === 'income' ? 'tx-type-btn--active' : ''}`}
        >
          <span className="tx-type-btn__icon">↑</span>
          Ingreso
        </button>
        <button
          type="button"
          onClick={() => setType('transfer')}
          className={`tx-type-btn tx-type-btn--transfer ${type === 'transfer' ? 'tx-type-btn--active' : ''}`}
        >
          <span className="tx-type-btn__icon">⇄</span>
          Transferencia
        </button>
      </div>

      {/* === Monto === */}
      <div className="tx-amount-field">
        <label htmlFor="tx-amount" className="entity-form__label">Monto</label>
        <div className="tx-amount-input">
          <span className="tx-amount-input__symbol">$</span>
          <input
            id="tx-amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            autoFocus
            className="tx-amount-input__field"
          />
        </div>
      </div>

      {/* === Cuenta origen === */}
      <div className="entity-form__field">
        <label htmlFor="tx-account" className="entity-form__label">
          {type === 'transfer' ? 'Desde' : 'Cuenta'}
        </label>
        <select
          id="tx-account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
          className="entity-form__select tx-select"
        >
          <option value="">Selecciona una cuenta</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.icon} {acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* === Cuenta destino (solo transfers) === */}
      {type === 'transfer' && (
        <div className="entity-form__field">
          <label htmlFor="tx-to-account" className="entity-form__label">
            Hacia
          </label>
          <select
            id="tx-to-account"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            required
            className="entity-form__select tx-select"
          >
            <option value="">Selecciona cuenta destino</option>
            {destinationAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.icon} {acc.name}
              </option>
            ))}
          </select>
          {accountId === toAccountId && toAccountId && (
            <p className="entity-form__hint" style={{ color: 'var(--color-expense)' }}>
              La cuenta destino debe ser diferente a la origen.
            </p>
          )}
        </div>
      )}

      {/* === Categoría (solo income/expense) === */}
      {type !== 'transfer' && (
        <div className="entity-form__field">
          <label htmlFor="tx-category" className="entity-form__label">
            Categoría
          </label>
          <select
            id="tx-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="entity-form__select tx-select"
          >
            <option value="">Selecciona categoría</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* === Descripción === */}
      <div className="entity-form__field">
        <label htmlFor="tx-description" className="entity-form__label">
          Descripción <span className="entity-form__hint">(opcional)</span>
        </label>
        <input
          id="tx-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿En qué fue?"
          className="entity-form__input"
        />
      </div>

      {/* === Fecha === */}
      <div className="entity-form__field">
        <label htmlFor="tx-date" className="entity-form__label">Fecha</label>
        <input
          id="tx-date"
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          required
          className="entity-form__input"
        />
      </div>

      {/* === Botones === */}
      <div className="entity-form__actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="entity-form__btn entity-form__btn--secondary">
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !amount || !accountId}
          className="entity-form__btn entity-form__btn--primary"
        >
          {loading ? 'Guardando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}
