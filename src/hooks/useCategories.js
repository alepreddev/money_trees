import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWithCache, invalidateCache } from '@/lib/cache';

/**
 * useCategories — Hook para gestionar categorías del usuario (con caché de Fase 2).
 */
export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch categorías con caché (5 min) y deduplicación ---
  const fetchCategories = useCallback(async (force = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithCache(`categories_${user.id}`, async () => {
        const { data: resData, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .order('is_system', { ascending: false })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        return resData || [];
      }, 300000, force);

      setCategories(data);
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Filtros derivados ---
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const userCategories = categories.filter((c) => !c.is_system);

  // --- Crear categoría ---
  async function createCategory({ name, type, icon = '📋', color = '#8b5cf6' }) {
    setError(null);

    if (!['income', 'expense'].includes(type)) {
      const msg = 'El tipo de categoría debe ser "income" o "expense".';
      setError(msg);
      return { data: null, error: { message: msg } };
    }

    const { data, error: insertError } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: name.trim(),
        type,
        icon,
        color,
        is_system: false,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return { data: null, error: insertError };
    }

    invalidateCache('categories_');
    invalidateCache('dashboard_');
    setCategories((prev) => [...prev, data]);
    return { data, error: null };
  }

  // --- Actualizar categoría ---
  async function updateCategory(id, updates) {
    setError(null);

    const { data, error: updateError } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_system', false)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return { data: null, error: updateError };
    }

    invalidateCache('categories_');
    invalidateCache('dashboard_');
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? data : cat))
    );
    return { data, error: null };
  }

  // --- Eliminar categoría ---
  async function deleteCategory(id) {
    setError(null);

    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_system', false);

    if (deleteError) {
      setError(deleteError.message);
      return { error: deleteError };
    }

    invalidateCache('categories_');
    invalidateCache('dashboard_');
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return { error: null };
  }

  return {
    categories,
    incomeCategories,
    expenseCategories,
    userCategories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: () => fetchCategories(true),
  };
}
