import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import AppLayout from '@/layouts/AppLayout';

// Code Splitting (Carga perezosa por ruta para reducir tamaño del bundle)
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AccountsPage = lazy(() => import('@/pages/AccountsPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const TransactionsPage = lazy(() => import('@/pages/TransactionsPage'));
const NewTransactionPage = lazy(() => import('@/pages/NewTransactionPage'));
const BudgetsPage = lazy(() => import('@/pages/BudgetsPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--color-text-secondary)' }}>
      {/* <span>Cargando módulo...</span> */}
    </div>
  );
}

/**
 * App — Componente raíz con Code Splitting y Suspense.
 */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
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
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/transactions/new" element={<NewTransactionPage />} />
                  <Route path="/budgets" element={<BudgetsPage />} />
                </Route>
              </Route>

              {/* --- Fallback: redirigir al dashboard --- */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
