import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useAccounts — Hook para gestionar las cuentas del usuario.
 *
 * Retorna:
 * - accounts: Array de cuentas del usuario
 * - loading: Estado de carga inicial
 * - error: Error si la consulta falla
 * - totals: { assets, debts, netWorth } calculados
 * - createAccount(data): Crear nueva cuenta
 * - updateAccount(id, data): Actualizar cuenta existente
 * - deleteAccount(id): Eliminar cuenta
 * - refetch(): Recargar manualmente
 */
export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch cuentas ---
  const fetchAccounts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setAccounts(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // --- Totales calculados ---
  const totals = accounts.reduce(
    (acc, account) => {
      const balance = Number(account.balance);
      if (account.type === 'credit_card') {
        // Tarjeta de crédito: balance negativo = deuda
        acc.debts += Math.abs(balance);
      } else {
        acc.assets += balance;
      }
      acc.netWorth = acc.assets - acc.debts;
      return acc;
    },
    { assets: 0, debts: 0, netWorth: 0 }
  );

  // --- Crear cuenta ---
  async function createAccount({ name, type, balance = 0, currency = 'USD', icon = '💰', color = '#6366f1' }) {
    setError(null);

    const { data, error: insertError } = await supabase
      .from('accounts')
      .insert({
        user_id: user.id,
        name: name.trim(),
        type,
        balance: Number(balance),
        currency,
        icon,
        color,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return { data: null, error: insertError };
    }

    setAccounts((prev) => [...prev, data]);
    return { data, error: null };
  }

  // --- Actualizar cuenta ---
  async function updateAccount(id, updates) {
    setError(null);

    const { data, error: updateError } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? data : acc))
    );
    return { data, error: null };
  }

  // --- Eliminar cuenta ---
  async function deleteAccount(id) {
    setError(null);

    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      setError(deleteError.message);
      return { error: deleteError };
    }

    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    return { error: null };
  }

  return {
    accounts,
    loading,
    error,
    totals,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
}
