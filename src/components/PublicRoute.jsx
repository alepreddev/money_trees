import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * PublicRoute — Rutas accesibles solo para usuarios NO autenticados.
 * 
 * Si el usuario ya tiene sesión activa, redirige al dashboard.
 * Útil para evitar que un usuario logueado vea login/register.
 */
export default function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
