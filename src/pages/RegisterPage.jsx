import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/lib/alerts/alerts';

/**
 * RegisterPage — Página de registro de nuevo usuario.
 * 
 * Conectada a supabase.auth.signUp via AuthContext.
 * Envia metadata (full_name) que será usada por el trigger de PostgreSQL
 * para poblar automáticamente public.profiles.
 */
export default function RegisterPage() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validación: contraseñas coinciden
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      Toast.show('Las contraseñas no coinciden', { type: 'ios', status: 'warning' });
      return;
    }

    // Validación: longitud mínima
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      Toast.show('Mínimo 6 caracteres en la contraseña', { type: 'ios', status: 'warning' });
      return;
    }

    setLoading(true);

    const { error: authError } = await signUp(email, password, {
      full_name: fullName.trim(),
    });

    if (authError) {
      setError(authError.message);
      Toast.show(authError.message, { type: 'ios', status: 'error' });
      setLoading(false);
      return;
    }

    setSuccess(true);
    Toast.show('¡Cuenta creada exitosamente!', { type: 'ios', status: 'success' });
    setLoading(false);
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1 className="auth-card__title">¡Registro exitoso!</h1>
            <p className="auth-card__subtitle">
              Revisa tu correo electrónico para confirmar tu cuenta.
            </p>
          </div>
          <Link to="/login" className="auth-form__submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
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
            <p className="auth-card__subtitle">Crea tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-form__error" role="alert">
                {error}
              </div>
            )}

            <div className="auth-form__field">
              <label htmlFor="register-name" className="auth-form__label">
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                required
                autoComplete="name"
                className="auth-form__input"
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="register-email" className="auth-form__label">
                Correo electrónico
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="auth-form__label">
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoComplete="new-password"
                minLength={6}
                className="auth-form__input"
              />
            </div>

            <div className="auth-form__field">
              <label htmlFor="register-confirm" className="auth-form__label">
                Confirmar contraseña
              </label>
              <input
                id="register-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                autoComplete="new-password"
                minLength={6}
                className="auth-form__input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-form__submit"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-divider">
            <span>o continúa con</span>
          </div>

          <button
            type="button"
            className="auth-google-btn"
            onClick={() => Toast.show('Registro con Google próximamente', { type: 'ios', status: 'info' })}
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
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-card__link">
              Inicia sesión
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
