import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

/**
 * useAccounts — Hook para gestionar las cuentas del usuario (con caché de Fase 2).
 */
export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch cuentas con caché (3 min) y deduplicación ---
  const fetchAccounts = useCallback(async (force = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithCache(`accounts_${user.id}`, async () => {
        const { data: resData, error: fetchError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        return resData || [];
      }, 180000, force);

      setAccounts(data);
    } catch (err) {
      setError(err.message || 'Error al obtener cuentas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // --- Totales calculados ---
  const totals = accounts.reduce(
    (acc, account) => {
      const balance = Number(account.balance);
      if (account.type === 'credit_card') {
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

    invalidateCache('accounts_');
    invalidateCache('dashboard_');
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

    invalidateCache('accounts_');
    invalidateCache('dashboard_');
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

    invalidateCache('accounts_');
    invalidateCache('dashboard_');
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
    refetch: () => fetchAccounts(true),
  };
}
