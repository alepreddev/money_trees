import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@/lib/alerts/alerts';

/**
 * LoginPage — Página de inicio de sesión.
 * 
 * Conectada a supabase.auth.signInWithPassword via AuthContext.
 */
export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">Money Trees</h1>
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
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              minLength={6}
              className="auth-form__input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-form__submit"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="auth-card__link">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
