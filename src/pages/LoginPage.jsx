import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/lib/alerts/alerts';
import '@/styles/auth.css';

/**
 * LoginPage — Página de inicio de sesión.
 * 
 * Conectada a supabase.auth.signInWithPassword via AuthContext.
 */
export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      Toast.show(authError.message, { type: 'ios', status: 'error' });
      setLoading(false);
    } else {
      Toast.show('¡Bienvenido de vuelta!', { type: 'ios', status: 'success' });
    }
    // Si fue exitoso, AuthContext detecta la sesión y redirige automáticamente
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--split">
        <div className="auth-card__form-section">
          <div className="auth-card__header">
            <div className="auth-card__title-row">
              <img
                src="/images/mt-icon.png"
                alt="Money Trees Logo"
                className="auth-card__logo-icon"
              />
              <h1 className="auth-card__title">Money Trees</h1>
            </div>
            <p className="auth-card__subtitle">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-form__error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-form__field">
              <label htmlFor="login-email" className="auth-form__label">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoComplete="email"
                className="auth-form__input"
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="login-password" className="auth-form__label">
                Contraseña
              </label>
              <div className="auth-form__input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  minLength={6}
                  className="auth-form__input auth-form__input--password"
                />
                <button
                  type="button"
                  className="auth-form__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg className="auth-form__eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="auth-form__eye-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="auth-divider">
            <span>o continúa con</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={async () => {
              const { error: googleError } = await signInWithGoogle();
              if (googleError) {
                Toast.show(googleError.message, { type: 'ios', status: 'error' });
              }
            }}
          >
            <svg className="auth-google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Google
          </button>

          <p className="auth-card__footer">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-card__link">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div className="auth-card__visual">
          <img
            src="/images/money-t-image.jpg"
            alt="Money Trees Banner"
            className="auth-card__banner-img"
          />
        </div>
      </div>
    </div>
  );
}
