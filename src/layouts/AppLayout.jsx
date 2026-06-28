import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * AppLayout — Layout principal de la aplicación autenticada.
 * 
 * Estructura:
 * - Header con navegación principal y datos del usuario
 * - Contenido principal (Outlet de React Router)
 * - Barra de navegación inferior (mobile)
 */
export default function AppLayout() {
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="app-layout">
      {/* === HEADER / SIDEBAR (Desktop) === */}
      <header className="app-header">
        <div className="app-header__brand">
          <h1>Money Trees</h1>
        </div>

        <nav className="app-nav">
          <NavLink to="/dashboard" className="app-nav__link">
            Dashboard
          </NavLink>
          <NavLink to="/accounts" className="app-nav__link">
            Cuentas
          </NavLink>
          <NavLink to="/transactions" className="app-nav__link">
            Transacciones
          </NavLink>
          <NavLink to="/budgets" className="app-nav__link">
            Presupuestos
          </NavLink>
          <NavLink to="/categories" className="app-nav__link">
            Categorías
          </NavLink>
        </nav>

        <div className="app-header__user">
          {profile && (
            <span className="app-header__username">
              {profile.full_name || profile.email}
            </span>
          )}
          <button onClick={handleSignOut} className="app-header__signout">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="app-main">
        <Outlet />
      </main>

      {/* === NAVEGACIÓN INFERIOR (Mobile) === */}
      <nav className="app-bottom-nav">
        <NavLink to="/dashboard" className="app-bottom-nav__item">
          <span className="app-bottom-nav__icon">📊</span>
          <span className="app-bottom-nav__label">Inicio</span>
        </NavLink>
        <NavLink to="/accounts" className="app-bottom-nav__item">
          <span className="app-bottom-nav__icon">🏦</span>
          <span className="app-bottom-nav__label">Cuentas</span>
        </NavLink>
        <NavLink to="/transactions/new" className="app-bottom-nav__item app-bottom-nav__item--primary">
          <span className="app-bottom-nav__icon">＋</span>
        </NavLink>
        <NavLink to="/transactions" className="app-bottom-nav__item">
          <span className="app-bottom-nav__icon">📝</span>
          <span className="app-bottom-nav__label">Flujo</span>
        </NavLink>
        <NavLink to="/budgets" className="app-bottom-nav__item">
          <span className="app-bottom-nav__icon">🎯</span>
          <span className="app-bottom-nav__label">Metas</span>
        </NavLink>
      </nav>
    </div>
  );
}
