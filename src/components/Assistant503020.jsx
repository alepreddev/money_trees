import { useState } from 'react';

function formatCurrency(val) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val || 0);
}

/**
 * Assistant503020 — Asistente Inteligente de Distribución Financiera (Regla 50/30/20).
 */
export default function Assistant503020({ actualIncome = 0 }) {
  const [income, setIncome] = useState(actualIncome > 0 ? actualIncome : 2500);

  const parsedIncome = Number(income) || 0;
  const needsLimit = parsedIncome * 0.50;
  const wantsLimit = parsedIncome * 0.30;
  const savingsLimit = parsedIncome * 0.20;

  return (
    <div className="assistant-503020">
      <div className="assistant-503020__header">
        <div className="assistant-503020__title-group">
          <span className="assistant-503020__badge">🧠 Metodología Harvard</span>
          <h3>Asistente Financiero 50 / 30 / 20</h3>
          <p>
            Calcula la distribución saludable de tu dinero basada en tus ingresos mensuales esperados.
          </p>
        </div>

        <div className="assistant-503020__input-box">
          <label htmlFor="expected-income">Ingreso Mensual Esperado ($)</label>
          <div className="input-with-symbol">
            <span>$</span>
            <input
              id="expected-income"
              type="number"
              step="50"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="entity-form__input"
              style={{ paddingLeft: '2rem' }}
            />
          </div>
          {actualIncome > 0 && (
            <button
              type="button"
              onClick={() => setIncome(actualIncome)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '4px 0',
                fontWeight: 600,
              }}
            >
              ⚡ Usar ingresos reales ({formatCurrency(actualIncome)})
            </button>
          )}
        </div>
      </div>

      <div className="assistant-503020__grid">
        {/* 50% Necesidades */}
        <div className="rule-bucket rule-bucket--needs">
          <div className="rule-bucket__top">
            <div className="rule-bucket__icon">🏠</div>
            <div className="rule-bucket__tag">50% Máximo</div>
          </div>
          <h4>Necesidades Básicas</h4>
          <p className="rule-bucket__amount">{formatCurrency(needsLimit)}</p>
          <p className="rule-bucket__desc">
            Gastos indispensables para vivir: Vivienda, Alimentación, Salud, Servicios básicos y Transporte.
          </p>
        </div>

        {/* 30% Deseos */}
        <div className="rule-bucket rule-bucket--wants">
          <div className="rule-bucket__top">
            <div className="rule-bucket__icon">🎬</div>
            <div className="rule-bucket__tag">30% Flexible</div>
          </div>
          <h4>Estilo de Vida y Deseos</h4>
          <p className="rule-bucket__amount">{formatCurrency(wantsLimit)}</p>
          <p className="rule-bucket__desc">
            Gastos discrecionales para disfrutar: Entretenimiento, Restaurantes, Ropa, Suscripciones y Ocio.
          </p>
        </div>

        {/* 20% Ahorro */}
        <div className="rule-bucket rule-bucket--savings">
          <div className="rule-bucket__top">
            <div className="rule-bucket__icon">🎯</div>
            <div className="rule-bucket__tag">20% Mínimo</div>
          </div>
          <h4>Ahorro e Inversión</h4>
          <p className="rule-bucket__amount">{formatCurrency(savingsLimit)}</p>
          <p className="rule-bucket__desc">
            Construcción patrimonial: Fondo de Emergencia, Inversiones, Jubilación y Metas a largo plazo.
          </p>
        </div>
      </div>
    </div>
  );
}
