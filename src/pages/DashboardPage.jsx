import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * DashboardPage — Vista Principal Consolidada (Fase 6).
 * Presenta métricas clave, evolución mensual, distribución de gastos por categoría,
 * cuentas principales, metas de ahorro y últimos movimientos.
 */
export default function DashboardPage() {
  const { profile } = useAuth();
  const {
    netWorth,
    monthSummary,
    expensesByCategory,
    monthlyTrend,
    recentTransactions,
    topAccounts,
    savingGoalsProgress,
    budgetHealth,
    loading
  } = useDashboard();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(val || 0));
  };

  // Encontrar el valor máximo para el gráfico de barras (para calcular porcentajes de altura)
  const maxTrendAmount = useMemo(() => {
    let max = 0;
    monthlyTrend.forEach((t) => {
      if (t.income > max) max = t.income;
      if (t.expense > max) max = t.expense;
    });
    return max > 0 ? max : 1;
  }, [monthlyTrend]);

  // Construir el conic-gradient dinámico para el gráfico circular
  const pieConicStyle = useMemo(() => {
    if (!expensesByCategory || expensesByCategory.length === 0) {
      return { background: 'var(--color-surface-sunken)' };
    }
    let currentAngle = 0;
    const slices = expensesByCategory.map((cat) => {
      const start = currentAngle;
      const deg = (cat.percentage / 100) * 360;
      currentAngle += deg;
      return `${cat.color} ${start}deg ${currentAngle}deg`;
    });
    return {
      background: `conic-gradient(${slices.join(', ')})`
    };
  }, [expensesByCategory]);

  return (
    <div className="dashboard-page">
      {/* Saludo y Fecha */}
      <div className="dashboard-welcome">
        <div>
          <h2 className="dashboard-welcome__greeting">
            Hola, {profile?.full_name || 'Usuario'} 👋
          </h2>
          <p className="page-header__subtitle" style={{ margin: 0 }}>
            Aquí tienes el resumen ejecutivo de tus finanzas
          </p>
        </div>
        <span className="dashboard-welcome__date">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {loading ? (
        <div className="loading-state" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          🔄 Consolidando información financiera...
        </div>
      ) : (
        <>
          {/* Tarjetas de Métricas Clave (4 Columnas en Desktop) */}
          <section className="dashboard-metrics">
            <article className="metric-card">
              <span className="metric-card__label">Patrimonio Neto</span>
              <span className="metric-card__value" style={{ color: netWorth.netWorth >= 0 ? 'var(--color-primary)' : 'var(--color-expense)' }}>
                {formatCurrency(netWorth.netWorth)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Activos: {formatCurrency(netWorth.assets)} | Deudas: {formatCurrency(netWorth.debts)}
              </span>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Ingresos del Mes</span>
              <span className="metric-card__value metric-card__value--income">
                {formatCurrency(monthSummary.totalIncome)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Mes en curso
              </span>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Gastos del Mes</span>
              <span className="metric-card__value metric-card__value--expense">
                {formatCurrency(monthSummary.totalExpense)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Mes en curso
              </span>
            </article>

            <article className="metric-card">
              <span className="metric-card__label">Flujo de Caja Neto</span>
              <span className="metric-card__value" style={{ color: monthSummary.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                {monthSummary.netCashFlow > 0 ? '+' : ''}{formatCurrency(monthSummary.netCashFlow)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Ingresos - Gastos
              </span>
            </article>
          </section>

          {/* Gráficos Principales: Evolución de 6 meses y Distribución del mes */}
          <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
            {/* Gráfico de Barras: Evolución 6 Meses */}
            <div className="chart-card">
              <h3 className="chart-card__title">Evolución: Ingresos vs Gastos (6 Meses)</h3>
              <div className="bar-chart__bars">
                {monthlyTrend.map((m, idx) => {
                  const incHeight = Math.max((m.income / maxTrendAmount) * 100, m.income > 0 ? 5 : 0);
                  const expHeight = Math.max((m.expense / maxTrendAmount) * 100, m.expense > 0 ? 5 : 0);
                  return (
                    <div key={idx} className="bar-chart__column">
                      <div className="bar-chart__bar-group" title={`Ingresos: ${formatCurrency(m.income)} | Gastos: ${formatCurrency(m.expense)}`}>
                        <div
                          className="bar-chart__bar bar-chart__bar--income"
                          style={{ height: `${incHeight}%` }}
                        />
                        <div
                          className="bar-chart__bar bar-chart__bar--expense"
                          style={{ height: `${expHeight}%` }}
                        />
                      </div>
                      <span className="bar-chart__label">{m.monthName}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-income)' }} /> Ingresos
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-expense)' }} /> Gastos
                </span>
              </div>
            </div>

            {/* Gráfico Circular: Desglose por Categoría */}
            <div className="chart-card">
              <h3 className="chart-card__title">Distribución de Gastos (Mes Actual)</h3>
              {expensesByCategory.length === 0 ? (
                <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Sin gastos registrados este mes
                </div>
              ) : (
                <div className="pie-chart">
                  <div className="pie-chart__visual" style={pieConicStyle} />
                  <div className="pie-chart__legend">
                    {expensesByCategory.slice(0, 4).map((cat, idx) => (
                      <div key={idx} className="pie-chart__legend-item">
                        <span className="pie-chart__legend-dot" style={{ backgroundColor: cat.color }} />
                        <span className="pie-chart__legend-name">{cat.icon} {cat.name}</span>
                        <span className="pie-chart__legend-value">{Math.round(cat.percentage)}%</span>
                      </div>
                    ))}
                    {expensesByCategory.length > 4 && (
                      <div className="pie-chart__legend-item" style={{ color: 'var(--color-text-muted)' }}>
                        <span>+ {expensesByCategory.length - 4} categorías más</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Segunda fila: Cuentas y Salud de Presupuestos */}
          <div className="dashboard-grid-2col" style={{ marginBottom: '2rem' }}>
            {/* Cuentas Principales */}
            <div className="chart-card">
              <div className="dashboard-section__header">
                <h3 className="chart-card__title" style={{ margin: 0 }}>Cuentas & Billeteras</h3>
              </div>
              {topAccounts.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No hay cuentas creadas.</p>
              ) : (
                <div className="account-mini-list">
                  {topAccounts.map((acc) => (
                    <div key={acc.id} className="account-mini-item">
                      <span className="account-mini-item__icon" style={{ color: acc.color }}>
                        {acc.icon || '💰'}
                      </span>
                      <span className="account-mini-item__name">{acc.name}</span>
                      <span className="account-mini-item__balance">
                        {formatCurrency(acc.balance)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Salud Presupuestaria y Metas */}
            <div className="chart-card">
              <h3 className="chart-card__title">Ejecución Presupuestaria del Mes</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="budget-health__stat">
                  <span className="budget-health__label">Consumido vs Techo Total</span>
                  <span className="budget-health__value">
                    {formatCurrency(budgetHealth.totalSpent)} / {formatCurrency(budgetHealth.totalLimit)}
                  </span>
                </div>
                <div className="budget-health__bar">
                  <div
                    className="budget-health__fill"
                    style={{
                      width: `${Math.min(budgetHealth.percentage, 100)}%`,
                      backgroundColor:
                        budgetHealth.percentage > 100
                          ? 'var(--color-danger)'
                          : budgetHealth.percentage > 85
                          ? 'var(--color-warning)'
                          : 'var(--color-income)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>{Math.round(budgetHealth.percentage || 0)}% ejecutado</span>
                  {budgetHealth.overBudgetCount > 0 && (
                    <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                      ⚠️ {budgetHealth.overBudgetCount} categoría(s) excedidas
                    </span>
                  )}
                </div>
              </div>

              <h3 className="chart-card__title" style={{ marginTop: '1.5rem' }}>Avance de Metas Rápidas</h3>
              {savingGoalsProgress.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>No hay metas configuradas aún.</p>
              ) : (
                <div className="goals-mini-grid">
                  {savingGoalsProgress.slice(0, 2).map((g) => (
                    <div key={g.id} className="goal-mini-item">
                      <div className="goal-mini-item__header">
                        <span className="goal-mini-item__icon">{g.icon || '🎯'}</span>
                        <span className="goal-mini-item__name">{g.name}</span>
                        <span className="goal-mini-item__pct">{Math.round(g.percentage)}%</span>
                      </div>
                      <div className="goal-mini-item__bar">
                        <div
                          className="goal-mini-item__fill"
                          style={{ width: `${g.percentage}%`, backgroundColor: g.color || 'var(--color-primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Últimos Movimientos */}
          <div className="chart-card">
            <h3 className="chart-card__title">Últimos Movimientos Registrados</h3>
            {recentTransactions.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
                Aún no has registrado transacciones este mes.
              </p>
            ) : (
              <div className="recent-tx-list">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="recent-tx-item">
                    <span className="recent-tx-item__icon" style={{ color: tx.category?.color || 'var(--color-primary)' }}>
                      {tx.type === 'transfer' ? '🔀' : tx.category?.icon || '💵'}
                    </span>
                    <div className="recent-tx-item__info">
                      <span className="recent-tx-item__desc">
                        {tx.description || (tx.type === 'transfer' ? 'Transferencia entre cuentas' : tx.category?.name || 'Movimiento')}
                      </span>
                      <span className="recent-tx-item__cat">
                        {tx.type === 'transfer'
                          ? `${tx.account?.name || 'Origen'} ➔ ${tx.to_account?.name || 'Destino'}`
                          : `${tx.account?.name || 'Cuenta'} • ${tx.transaction_date}`}
                      </span>
                    </div>
                    <span
                      className={`recent-tx-item__amount recent-tx-item__amount--${tx.type}`}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
