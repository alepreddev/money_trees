import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useSavingGoals — Hook para gestionar las metas de ahorro y fondo de emergencia.
 */
export function useSavingGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from('saving_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('is_emergency_fund', { ascending: false })
        .order('created_at', { ascending: false });

      if (err) throw err;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching saving goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function createGoal(data) {
    if (!user) return { error: { message: 'No autenticado' } };

    const { data: created, error: createErr } = await supabase
      .from('saving_goals')
      .insert([
        {
          user_id: user.id,
          name: data.name,
          target_amount: Number(data.target_amount),
          current_amount: Number(data.current_amount || 0),
          target_date: data.target_date || null,
          icon: data.icon || '🎯',
          color: data.color || '#10b981',
          is_emergency_fund: Boolean(data.is_emergency_fund),
        },
      ])
      .select()
      .single();

    if (!createErr && created) {
      setGoals((prev) => [created, ...prev]);
    }
    return { data: created, error: createErr };
  }

  async function updateGoal(id, data) {
    if (!user) return { error: { message: 'No autenticado' } };

    const { data: updated, error: updateErr } = await supabase
      .from('saving_goals')
      .update({
        name: data.name,
        target_amount: data.target_amount !== undefined ? Number(data.target_amount) : undefined,
        current_amount: data.current_amount !== undefined ? Number(data.current_amount) : undefined,
        target_date: data.target_date || null,
        icon: data.icon,
        color: data.color,
        is_emergency_fund: data.is_emergency_fund,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (!updateErr && updated) {
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
    return { data: updated, error: updateErr };
  }

  async function addContribution(id, amountDelta) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return { error: { message: 'Meta no encontrada' } };

    const newAmount = Math.max(0, Number(goal.current_amount || 0) + Number(amountDelta));
    return updateGoal(id, { current_amount: newAmount });
  }

  async function deleteGoal(id) {
    if (!user) return { error: { message: 'No autenticado' } };

    const { error: delErr } = await supabase
      .from('saving_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!delErr) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
    return { error: delErr };
  }

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    refetch: fetchGoals,
  };
}
