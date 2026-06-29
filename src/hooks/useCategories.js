import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useCategories — Hook para gestionar categorías del usuario.
 *
 * Las categorías pueden ser:
 * - Globales del sistema (is_system = true, user_id = null)
 * - Personalizadas del usuario (is_system = false, user_id = auth.uid())
 *
 * Retorna:
 * - categories: Todas las categorías visibles (sistema + propias)
 * - incomeCategories: Filtradas por type='income'
 * - expenseCategories: Filtradas por type='expense'
 * - userCategories: Solo las personalizadas del usuario
 * - loading / error
 * - createCategory(data): Crear categoría personalizada
 * - updateCategory(id, data): Actualizar categoría propia
 * - deleteCategory(id): Eliminar categoría propia
 * - refetch()
 */
export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch categorías (sistema + propias) ---
  const fetchCategories = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    // RLS ya filtra: user_id = auth.uid() OR is_system = true
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('is_system', { ascending: false })
      .order('name', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setCategories(data || []);
    setLoading(false);
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

    // Validación: tipo debe ser 'income' o 'expense'
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

    setCategories((prev) => [...prev, data]);
    return { data, error: null };
  }

  // --- Actualizar categoría (solo propias) ---
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

    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? data : cat))
    );
    return { data, error: null };
  }

  // --- Eliminar categoría (solo propias) ---
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
    refetch: fetchCategories,
  };
}
