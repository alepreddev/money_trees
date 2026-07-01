import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useDashboard — Hook central para alimentar la vista principal del Dashboard (Fase 6).
 *
 * Agrega en una sola consulta paralela:
 * 1. Patrimonio Neto (Cuentas activas vs Deudas en tarjetas de crédito)
 * 2. Resumen de Ingresos, Gastos y Flujo de Caja del mes actual
 * 3. Desglose de Gastos por Categoría del mes actual
 * 4. Evolución de Ingresos vs Gastos en los últimos 6 meses
 * 5. Transacciones más recientes
 * 6. Top Cuentas por balance
 * 7. Progreso en Metas de Ahorro y Fondo de Emergencia
 * 8. Salud Presupuestaria del mes en curso
 */
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    netWorth: { assets: 0, debts: 0, netWorth: 0 },
    monthSummary: { totalIncome: 0, totalExpense: 0, netCashFlow: 0, month: 1, year: 2026 },
    expensesByCategory: [],
    monthlyTrend: [],
    recentTransactions: [],
    topAccounts: [],
    savingGoalsProgress: [],
    budgetHealth: { totalLimit: 0, totalSpent: 0, percentage: 0, overBudgetCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Rango mes actual
    const startDateCurrent = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const lastDayCurrent = new Date(currentYear, currentMonth, 0).getDate();
    const endDateCurrent = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayCurrent).padStart(2, '0')}`;

    // Rango últimos 6 meses
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const startDateTrend = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;

    try {
      const [
        accountsRes,
        currentMonthTxRes,
        trendTxRes,
        recentTxRes,
        goalsRes,
        budgetsRes
      ] = await Promise.all([
        // 1. Cuentas
        supabase.from('accounts').select('*').eq('user_id', user.id),
        // 2. Transacciones del mes actual (con join a categorías para el gráfico circular)
        supabase
          .from('transactions')
          .select('id, amount, type, category_id, category:categories!category_id(id, name, icon, color)')
          .eq('user_id', user.id)
          .gte('transaction_date', startDateCurrent)
          .lte('transaction_date', endDateCurrent),
        // 3. Transacciones de últimos 6 meses (para gráfico de barras)
        supabase
          .from('transactions')
          .select('amount, type, transaction_date')
          .eq('user_id', user.id)
          .gte('transaction_date', startDateTrend),
        // 4. Últimas 5 transacciones
        supabase
          .from('transactions')
          .select(`
            *,
            account:accounts!account_id ( id, name, icon, color ),
            to_account:accounts!to_account_id ( id, name, icon, color ),
            category:categories!category_id ( id, name, icon, color, type )
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5),
        // 5. Metas de ahorro
        supabase.from('saving_goals').select('*').eq('user_id', user.id),
        // 6. Presupuestos del mes actual
        supabase
          .from('budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', currentMonth)
          .eq('year', currentYear)
      ]);

      if (accountsRes.error) throw accountsRes.error;
      if (currentMonthTxRes.error) throw currentMonthTxRes.error;
      if (trendTxRes.error) throw trendTxRes.error;
      if (recentTxRes.error) throw recentTxRes.error;
      if (goalsRes.error) throw goalsRes.error;
      if (budgetsRes.error) throw budgetsRes.error;

      const accounts = accountsRes.data || [];
      const currentTx = currentMonthTxRes.data || [];
      const trendTx = trendTxRes.data || [];
      const recentTx = recentTxRes.data || [];
      const goals = goalsRes.data || [];
      const budgets = budgetsRes.data || [];

      // --- Cálculo 1: Net Worth y Top Accounts ---
      let assets = 0;
      let debts = 0;
      accounts.forEach((acc) => {
        const bal = Number(acc.balance);
        if (acc.type === 'credit_card') {
          debts += Math.abs(bal);
        } else {
          assets += bal;
        }
      });
      const topAccounts = [...accounts].sort((a, b) => Number(b.balance) - Number(a.balance)).slice(0, 5);

      // --- Cálculo 2 y 3: Resumen del mes y Desglose de Gastos por Categoría ---
      let totalIncome = 0;
      let totalExpense = 0;
      const catSpentMap = {};

      currentTx.forEach((tx) => {
        const amt = Number(tx.amount);
        if (tx.type === 'income') {
          totalIncome += amt;
        } else if (tx.type === 'expense') {
          totalExpense += amt;
          const catId = tx.category_id || 'unassigned';
          if (!catSpentMap[catId]) {
            catSpentMap[catId] = {
              name: tx.category?.name || 'Sin Categoría',
              icon: tx.category?.icon || '📦',
              color: tx.category?.color || '#9CA3AF',
              total: 0
            };
          }
          catSpentMap[catId].total += amt;
        }
      });

      const expensesByCategory = Object.values(catSpentMap)
        .map((item) => ({
          ...item,
          percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

      // --- Cálculo 4: Evolución últimos 6 meses ---
      const trendMap = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        trendMap[key] = {
          month: d.getMonth() + 1,
          monthName: MONTH_NAMES[d.getMonth()],
          year: d.getFullYear(),
          income: 0,
          expense: 0
        };
      }

      trendTx.forEach((tx) => {
        if (!tx.transaction_date) return;
        const key = tx.transaction_date.substring(0, 7);
        if (trendMap[key]) {
          const amt = Number(tx.amount);
          if (tx.type === 'income') trendMap[key].income += amt;
          if (tx.type === 'expense') trendMap[key].expense += amt;
        }
      });

      const monthlyTrend = Object.values(trendMap);

      // --- Cálculo 7: Metas de ahorro ---
      const savingGoalsProgress = goals.map((g) => {
        const current = Number(g.current_amount || 0);
        const target = Number(g.target_amount || 0);
        return {
          ...g,
          percentage: target > 0 ? Math.min((current / target) * 100, 100) : 0
        };
      });

      // --- Cálculo 8: Salud Presupuestaria ---
      const budgetSpentMap = {};
      currentTx.filter((t) => t.type === 'expense').forEach((t) => {
        if (t.category_id) {
          budgetSpentMap[t.category_id] = (budgetSpentMap[t.category_id] || 0) + Number(t.amount);
        }
      });

      let totalLimit = 0;
      let totalSpentInBudgets = 0;
      let overBudgetCount = 0;

      budgets.forEach((b) => {
        const limit = Number(b.amount_limit || 0);
        const spent = budgetSpentMap[b.category_id] || 0;
        totalLimit += limit;
        totalSpentInBudgets += spent;
        if (spent > limit && limit > 0) {
          overBudgetCount++;
        }
      });

      setData({
        netWorth: { assets, debts, netWorth: assets - debts },
        monthSummary: {
          totalIncome,
          totalExpense,
          netCashFlow: totalIncome - totalExpense,
          month: currentMonth,
          year: currentYear
        },
        expensesByCategory,
        monthlyTrend,
        recentTransactions: recentTx,
        topAccounts,
        savingGoalsProgress,
        budgetHealth: {
          totalLimit,
          totalSpent: totalSpentInBudgets,
          percentage: totalLimit > 0 ? (totalSpentInBudgets / totalLimit) * 100 : 0,
          overBudgetCount
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}
