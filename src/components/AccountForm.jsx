import { useState } from 'react';

/**
 * Tipos de cuenta disponibles con su metadata.
 */
const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Efectivo', icon: '💵', description: 'Dinero en mano' },
  { value: 'checking', label: 'Cuenta Corriente', icon: '🏦', description: 'Cuenta bancaria principal' },
  { value: 'savings', label: 'Ahorro', icon: '🐷', description: 'Cuenta de ahorros' },
  { value: 'credit_card', label: 'Tarjeta de Crédito', icon: '💳', description: 'Línea de crédito (permite deuda)' },
];

/**
 * Iconos disponibles para selección rápida.
 */
const AVAILABLE_ICONS = ['💵', '🏦', '🐷', '💳', '💰', '🪙', '💎', '📦', '🏠', '🚗'];

/**
 * AccountForm — Formulario para crear/editar una cuenta.
 *
 * Props:
 * - onSubmit(data): Callback con los datos del formulario
 * - initialData: Datos iniciales para edición (opcional)
 * - loading: Estado de carga externo
 * - onCancel: Callback para cancelar
 */
export default function AccountForm({ onSubmit, initialData = null, loading = false, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'checking');
  const [balance, setBalance] = useState(initialData?.balance?.toString() || '0');
  const [currency, setCurrency] = useState(initialData?.currency || 'USD');
  const [icon, setIcon] = useState(initialData?.icon || '🏦');
  const [color, setColor] = useState(initialData?.color || '#6366f1');

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      name,
      type,
      balance: parseFloat(balance) || 0,
      currency,
      icon,
      color,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      {/* Nombre */}
      <div className="entity-form__field">
        <label htmlFor="account-name" className="entity-form__label">
          Nombre de la cuenta
        </label>
        <input
          id="account-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Banco Principal"
          required
          className="entity-form__input"
        />
      </div>

      {/* Tipo de cuenta */}
      <div className="entity-form__field">
        <label className="entity-form__label">Tipo de cuenta</label>
        <div className="entity-form__options">
          {ACCOUNT_TYPES.map((accountType) => (
            <button
              key={accountType.value}
              type="button"
              onClick={() => {
                setType(accountType.value);
                setIcon(accountType.icon);
              }}
              className={`entity-form__option ${type === accountType.value ? 'entity-form__option--active' : ''}`}
            >
              <span className="entity-form__option-icon">{accountType.icon}</span>
              <span className="entity-form__option-label">{accountType.label}</span>
              <span className="entity-form__option-desc">{accountType.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Balance inicial */}
      <div className="entity-form__field">
        <label htmlFor="account-balance" className="entity-form__label">
          {initialData ? 'Balance actual' : 'Balance inicial'}
        </label>
        <div className="entity-form__input-group">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="entity-form__select entity-form__select--small"
            aria-label="Moneda"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="COP">COP</option>
            <option value="MXN">MXN</option>
            <option value="ARS">ARS</option>
          </select>
          <input
            id="account-balance"
            type="number"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
            className="entity-form__input"
          />
        </div>
        {type === 'credit_card' && (
          <p className="entity-form__hint">
            Para tarjetas de crédito: ingresa 0 si no tienes deuda, o un número negativo si debes.
          </p>
        )}
      </div>

      {/* Icono */}
      <div className="entity-form__field">
        <label className="entity-form__label">Icono</label>
        <div className="entity-form__icon-grid">
          {AVAILABLE_ICONS.map((emoji) => (
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
        <label htmlFor="account-color" className="entity-form__label">
          Color
        </label>
        <input
          id="account-color"
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
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear cuenta'}
        </button>
      </div>
    </form>
  );
}
