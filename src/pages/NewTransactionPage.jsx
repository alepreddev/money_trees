import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from '@/components/TransactionForm';
import { Toast } from '@/lib/alerts/alerts';
import '@/styles/transactions.css';

/**
 * NewTransactionPage — Página dedicada para registro rápido de transacciones.
 * Ideal para el botón "＋" de la barra inferior móvil.
 */
export default function NewTransactionPage() {
  const navigate = useNavigate();
  const { createTransaction } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate(data) {
    setLoading(true);
    setError(null);

    const { error: insertError } = await createTransaction(data);

    if (insertError) {
      setError(insertError.message);
      Toast.show(insertError.message, { type: 'ios', status: 'error' });
      setLoading(false);
      return;
    }

    setLoading(false);
    Toast.show('Movimiento registrado con éxito', { type: 'ios', status: 'success' });
    // Redirigir al historial una vez creado
    navigate('/transactions');
  }

  return (
    <div className="new-tx-page">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="page-header__title">Nuevo Movimiento</h2>
        <p className="page-header__subtitle">Registra un ingreso, gasto o transferencia</p>
      </header>

      {error && <div className="page-error" role="alert">{error}</div>}

      <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <TransactionForm
          onSubmit={handleCreate}
          loading={loading}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
