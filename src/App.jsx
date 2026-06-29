import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import AccountsPage from '@/pages/AccountsPage';
import CategoriesPage from '@/pages/CategoriesPage';

/**
 * App — Componente raíz.
 * 
 * Árbol de rutas:
 *   /login        → Solo usuarios NO autenticados
 *   /register     → Solo usuarios NO autenticados
 *   /dashboard    → Solo usuarios autenticados (dentro de AppLayout)
 *   /accounts     → Gestión de cuentas (Fase 3)
 *   /categories   → Gestión de categorías (Fase 3)
 *   /transactions → (Fase 4)
 *   /budgets      → (Fase 5)
 *   /             → Redirige a /dashboard
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- Rutas públicas (solo sin sesión) --- */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* --- Rutas protegidas (requieren sesión) --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              {/* Fases futuras:
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/new" element={<NewTransactionPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              */}
            </Route>
          </Route>

          {/* --- Fallback: redirigir al dashboard --- */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
