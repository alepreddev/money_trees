import { useAuth } from '@/contexts/AuthContext';

/**
 * DashboardPage — Página principal del usuario autenticado.
 * 
 * Fase 1: Esqueleto básico que confirma la sesión activa.
 * Se expandirá en Fase 6 con métricas, gráficos y resumen financiero.
 */
export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h2 className="page-header__title">
          Hola, {profile?.full_name || 'Usuario'} 👋
        </h2>
        <p className="page-header__subtitle">
          Resumen de tus finanzas personales
        </p>
      </header>

      {/* Tarjetas de métricas principales — se llenarán en Fase 6 */}
      <section className="dashboard-metrics">
        <article className="metric-card">
          <span className="metric-card__label">Balance Neto</span>
          <span className="metric-card__value">$0.00</span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Ingresos del Mes</span>
          <span className="metric-card__value metric-card__value--income">$0.00</span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Gastos del Mes</span>
          <span className="metric-card__value metric-card__value--expense">$0.00</span>
        </article>
        <article className="metric-card">
          <span className="metric-card__label">Flujo de Caja</span>
          <span className="metric-card__value">$0.00</span>
        </article>
      </section>

      {/* Secciones adicionales se agregarán por fase */}
      <section className="dashboard-placeholder">
        <p>Las transacciones recientes y gráficos aparecerán aquí conforme avancemos en las siguientes fases.</p>
      </section>
    </div>
  );
}
