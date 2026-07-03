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
