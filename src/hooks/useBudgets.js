import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useBudgets — Hook para gestionar techos de gasto mensuales por categoría.
 */
export function useBudgets() {
  const { user } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [spentMap, setSpentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetsAndSpending = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener presupuestos del mes/año con su categoría
      const { data: budgetsData, error: budgetsErr } = await supabase
        .from('budgets')
        .select(`
          id,
          category_id,
          amount_limit,
          month,
          year,
          categories (
            id,
            name,
            icon,
            color,
            type
          )
        `)
        .eq('user_id', user.id)
        .eq('month', month)
        .eq('year', year);

      if (budgetsErr) throw budgetsErr;

      // 2. Obtener transacciones de gasto de ese mes/año para calcular consumido
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data: txData, error: txErr } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (txErr) throw txErr;

      // Agrupar gastos por category_id
      const spending = {};
      (txData || []).forEach((tx) => {
        if (tx.category_id) {
          spending[tx.category_id] = (spending[tx.category_id] || 0) + Number(tx.amount);
        }
      });

      setBudgets(budgetsData || []);
      setSpentMap(spending);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, month, year]);

  useEffect(() => {
    fetchBudgetsAndSpending();
  }, [fetchBudgetsAndSpending]);

  // Lista de presupuestos con cálculo de gasto y porcentaje
  const enrichedBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = spentMap[b.category_id] || 0;
      const limit = Number(b.amount_limit);
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      return {
        ...b,
        spent,
        percentage,
      };
    });
  }, [budgets, spentMap]);

  // Totales globales del mes
  const totals = useMemo(() => {
    const totalLimit = enrichedBudgets.reduce((acc, b) => acc + Number(b.amount_limit), 0);
    const totalSpentInBudgets = enrichedBudgets.reduce((acc, b) => acc + b.spent, 0);
    const totalSpentOverall = Object.values(spentMap).reduce((acc, val) => acc + val, 0);
    return {
      totalLimit,
      totalSpentInBudgets,
      totalSpentOverall,
      percentage: totalLimit > 0 ? (totalSpentInBudgets / totalLimit) * 100 : 0,
    };
  }, [enrichedBudgets, spentMap]);

  // Crear o actualizar un presupuesto para el mes actual
  async function upsertBudget({ category_id, amount_limit }) {
    if (!user) return { error: { message: 'No autenticado' } };

    const { data, error: upsertErr } = await supabase
      .from('budgets')
      .upsert(
        {
          user_id: user.id,
          category_id,
          amount_limit: Number(amount_limit),
          month,
          year,
        },
        { onConflict: 'user_id, category_id, month, year' }
      )
      .select()
      .single();

    if (!upsertErr) {
      await fetchBudgetsAndSpending();
    }
    return { data, error: upsertErr };
  }

  async function deleteBudget(id) {
    if (!user) return { error: { message: 'No autenticado' } };

    const { error: delErr } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!delErr) {
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    }
    return { error: delErr };
  }

  function goToPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function goToCurrentMonth() {
    const n = new Date();
    setMonth(n.getMonth() + 1);
    setYear(n.getFullYear());
  }

  return {
    month,
    year,
    budgets: enrichedBudgets,
    totals,
    spentMap,
    loading,
    error,
    upsertBudget,
    deleteBudget,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    refetch: fetchBudgetsAndSpending,
  };
}
