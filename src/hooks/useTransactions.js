import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

/**
 * useTransactions — Hook para el motor de flujo de caja (con caché y paginación por bloques Fase 2).
 */
export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginación incremental
  const [limit, setLimit] = useState(50);
  const [hasMore, setHasMore] = useState(false);

  // Filtros: mes/año actuales por defecto
  const now = new Date();
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,   // 1-12
    year: now.getFullYear(),
    accountId: null,              // null = todas
    type: null,                   // null = todos, 'income', 'expense', 'transfer'
  });

  // Reset limit al cambiar filtros
  useEffect(() => {
    setLimit(50);
  }, [filters.month, filters.year, filters.accountId, filters.type]);

  // --- Fetch transacciones con joins y paginación por bloques (.range) ---
  const fetchTransactions = useCallback(async (force = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // Calcular rango de fechas del mes seleccionado
    const startDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    const lastDay = new Date(filters.year, filters.month, 0).getDate();
    const endDate = `${filters.year}-${String(filters.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const cacheKey = `transactions_${user.id}_${filters.year}_${filters.month}_${filters.accountId || 'all'}_${filters.type || 'all'}_${limit}`;

    try {
      const data = await fetchWithCache(cacheKey, async () => {
        let query = supabase
          .from('transactions')
          .select(`
            *,
            account:accounts!account_id ( id, name, icon, color ),
            to_account:accounts!to_account_id ( id, name, icon, color ),
            category:categories!category_id ( id, name, icon, color, type )
          `)
          .eq('user_id', user.id)
          .gte('transaction_date', startDate)
          .lte('transaction_date', endDate)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })
          .range(0, limit); // Pedimos limit + 1 (de 0 a limit inclusive) para detectar si hay más

        // Filtro por cuenta
        if (filters.accountId) {
          query = query.or(`account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`);
        }

        // Filtro por tipo
        if (filters.type) {
          query = query.eq('type', filters.type);
        }

        const { data: resData, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        return resData || [];
      }, 60000, force);

      if (data.length > limit) {
        setHasMore(true);
        setTransactions(data.slice(0, limit));
      } else {
        setHasMore(false);
        setTransactions(data);
      }
    } catch (err) {
      setError(err.message || 'Error al obtener transacciones');
    } finally {
      setLoading(false);
    }
  }, [user, filters, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // --- Resumen del periodo ---
  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        const amount = Number(tx.amount);
        if (tx.type === 'income') {
          acc.totalIncome += amount;
        } else if (tx.type === 'expense') {
          acc.totalExpense += amount;
        }
        acc.netCashFlow = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, netCashFlow: 0 }
    );
  }, [transactions]);

  // --- Crear transacción ---
  async function createTransaction({ type, amount, account_id, to_account_id, category_id, description, transaction_date }) {
    setError(null);

    const payload = {
      user_id: user.id,
      type,
      amount: Number(amount),
      account_id,
      description: description?.trim() || null,
      transaction_date: transaction_date || new Date().toISOString().split('T')[0],
    };

    if (type === 'transfer') {
      payload.to_account_id = to_account_id;
      payload.category_id = null;
    } else {
      payload.category_id = category_id;
      payload.to_account_id = null;
    }

    const { data, error: insertError } = await supabase
      .from('transactions')
      .insert(payload)
      .select(`
        *,
        account:accounts!account_id ( id, name, icon, color ),
        to_account:accounts!to_account_id ( id, name, icon, color ),
        category:categories!category_id ( id, name, icon, color, type )
      `)
      .single();

    if (insertError) {
      setError(insertError.message);
      return { data: null, error: insertError };
    }

    // Invalidar cachés relacionadas al cambiar flujo y saldos
    invalidateCache('transactions_');
    invalidateCache('dashboard_');
    invalidateCache('accounts_');
    invalidateCache('budgets_');

    setTransactions((prev) => [data, ...prev]);
    return { data, error: null };
  }

  // --- Eliminar transacción ---
  async function deleteTransaction(id) {
    setError(null);

    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      setError(deleteError.message);
      return { error: deleteError };
    }

    invalidateCache('transactions_');
    invalidateCache('dashboard_');
    invalidateCache('accounts_');
    invalidateCache('budgets_');

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    return { error: null };
  }

  // --- Cargar más registros ---
  function loadMore() {
    if (hasMore && !loading) {
      setLimit((prev) => prev + 50);
    }
  }

  // --- Navegar meses ---
  function goToPreviousMonth() {
    setFilters((prev) => {
      if (prev.month === 1) {
        return { ...prev, month: 12, year: prev.year - 1 };
      }
      return { ...prev, month: prev.month - 1 };
    });
  }

  function goToNextMonth() {
    setFilters((prev) => {
      if (prev.month === 12) {
        return { ...prev, month: 1, year: prev.year + 1 };
      }
      return { ...prev, month: prev.month + 1 };
    });
  }

  function goToCurrentMonth() {
    const now = new Date();
    setFilters((prev) => ({
      ...prev,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }));
  }

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    summary,
    hasMore,
    loadMore,
    createTransaction,
    deleteTransaction,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    refetch: () => fetchTransactions(true),
  };
}
