import { useState } from 'react';
import Modal from '@/components/Modal';
import { Toast } from '@/lib/alerts/alerts';

/**
 * SettingsModal — Modal de configuración del usuario con barra lateral (sidebar).
 * 
 * Secciones:
 * 1. Cuenta (Información de usuario logueado, avatar, correo, estado)
 * 2. Personalizar (Modo claro/oscuro y temas de color - Próximamente)
 * 3. Información (Acerca de Money Trees y equipo de desarrollo)
 */
export default function SettingsModal({ isOpen, onClose, user, profile, onSignOut }) {
  const [activeTab, setActiveTab] = useState('account');

  // Determinar nombre, email y avatar del usuario logueado
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || profile?.email || user?.email || 'Usuario';
  const email = profile?.email || user?.email || 'No disponible';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

  function handleThemeClick(themeName) {
    Toast.show(`Tema ${themeName} - Especificaciones en desarrollo`, { type: 'ios', status: 'info' });
  }

  function handleSignOutClick() {
    onClose();
    if (onSignOut) onSignOut();
  }

  function renderAccountTab() {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">Mi Cuenta</h3>
        <p className="settings-section__desc">
          Información general de tu perfil y credenciales de acceso.
        </p>

        <div className="settings-profile-card">
          <div className="settings-profile-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="app-header__avatar-img" />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="settings-profile-info">
            <span className="settings-profile-name">{displayName}</span>
            <span className="settings-profile-email">{email}</span>
            {/* <span className="settings-profile-badge">⚡ Cuenta Pro Activa</span> */}
          </div>
        </div>

        <div className="settings-info-list">
          <div className="settings-info-row">
            <span className="settings-info-label">Proveedor de autenticación</span>
            <span className="settings-info-val">
              {user?.app_metadata?.provider === 'google' ? '🟢 Google OAuth' : '📧 Correo / Contraseña'}
            </span>
          </div>

        </div>
      </div>
    );
  }

  function renderCustomizeTab() {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">Personalizar Apariencia</h3>
        <p className="settings-section__desc">
          Adapta la interfaz visual a tu estilo. (Las especificaciones de color se definirán en la siguiente fase).
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Modo de visualización
          </label>
          <div className="settings-theme-grid">
            <button
              type="button"
              className="settings-theme-card settings-theme-card--active"
              onClick={() => handleThemeClick('Claro')}
            >
              <span style={{ fontSize: '1.25rem' }}>☀️</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Modo Claro</span>
            </button>
            <button
              type="button"
              className="settings-theme-card"
              onClick={() => handleThemeClick('Oscuro')}
            >
              <span style={{ fontSize: '1.25rem' }}>🌙</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Modo Oscuro</span>
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
            Tema de Color del Sistema
          </label>
          <div className="settings-theme-grid">
            <button
              type="button"
              className="settings-theme-card settings-theme-card--active"
              onClick={() => handleThemeClick('Esmeralda (Default)')}
            >
              <span className="settings-theme-dot" style={{ background: '#10b981' }}></span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Esmeralda</span>
            </button>
            <button
              type="button"
              className="settings-theme-card"
              onClick={() => handleThemeClick('Zafiro')}
            >
              <span className="settings-theme-dot" style={{ background: '#3b82f6' }}></span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Zafiro</span>
            </button>
            <button
              type="button"
              className="settings-theme-card"
              onClick={() => handleThemeClick('Amatista')}
            >
              <span className="settings-theme-dot" style={{ background: '#8b5cf6' }}></span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Amatista</span>
            </button>
            <button
              type="button"
              className="settings-theme-card"
              onClick={() => handleThemeClick('Ámbar')}
            >
              <span className="settings-theme-dot" style={{ background: '#f59e0b' }}></span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ámbar</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderAboutTab() {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">Acerca de Money Trees</h3>
        <p className="settings-section__desc">
          Información del sistema y créditos de desarrollo.
        </p>

        <div className="settings-about-card">
          <div className="settings-about-brand">
            <img src="/images/mt-icon.png" alt="Money Trees" className="settings-about-logo" />
            <div>
              <div className="settings-about-title">Money Trees</div>
              <div className="settings-about-version">Versión 1.0.0</div>
            </div>
          </div>

          <p className="settings-about-text">
            <strong>Money Trees</strong> es una plataforma de vanguardia para la gestión financiera personal, control inteligente de flujo de caja y seguimiento de metas de ahorro.
          </p>

          <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '0.875rem', marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            <p style={{ margin: 0 }}>
              <strong>Desarrollado por:</strong> José Arocha.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración del Sistema" sizeClass="w-lg">
      <div className="settings-container">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <div className="settings-sidebar__nav">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`settings-tab ${activeTab === 'account' ? 'settings-tab--active' : ''}`}
            >
              <span className="settings-tab__icon">👤</span>
              <span className="settings-tab__label">Cuenta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('customize')}
              className={`settings-tab ${activeTab === 'customize' ? 'settings-tab--active' : ''}`}
            >
              <span className="settings-tab__icon">🎨</span>
              <span className="settings-tab__label">Personalizar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`settings-tab ${activeTab === 'about' ? 'settings-tab--active' : ''}`}
            >
              <span className="settings-tab__icon">ℹ️</span>
              <span className="settings-tab__label">Información</span>
            </button>
          </div>

          <div className="settings-sidebar__footer">
            <button
              type="button"
              onClick={handleSignOutClick}
              className="settings-logout-btn"
            >
              <span style={{ fontSize: '1.125rem' }}>🚪</span>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Contenido */}
        <main className="settings-content">
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'customize' && renderCustomizeTab()}
          {activeTab === 'about' && renderAboutTab()}
        </main>
      </div>
    </Modal>
  );
}
