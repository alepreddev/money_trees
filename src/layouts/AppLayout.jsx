import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SettingsModal from '@/components/SettingsModal';

/**
 * AppLayout — Layout principal de la aplicación autenticada.
 * 
 * Estructura:
 * - Header con navegación principal y datos del usuario
 * - Contenido principal (Outlet de React Router)
 * - Barra de navegación inferior (mobile)
 * - Modal de configuración de usuario
 */
export default function AppLayout() {
  const { user, profile, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || profile?.email || user?.email || 'Usuario';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  async function handleSignOut() {
    await signOut();
  }

  return (
    <div className="app-layout">
      {/* === HEADER / SIDEBAR (Desktop) === */}
      <header className="app-header">
        <div className="app-header__brand">
          <img src="/images/mt-icon.png" alt="Money Trees" className="app-header__logo-img" />
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
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="app-header__user-btn"
            aria-label="Abrir configuración de cuenta"
          >
            <span className="app-header__username">
              {displayName}
            </span>
            <div className="app-header__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="app-header__avatar-img" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
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

      {/* === MODAL DE CONFIGURACIÓN === */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        profile={profile}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
