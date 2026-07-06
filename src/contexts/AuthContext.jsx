import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { clearAllCache } from '@/lib/cache';

const AuthContext = createContext(null);

/**
 * AuthProvider — Proveedor global de estado de autenticación (Blindado Fase 3).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar el perfil del usuario desde public.profiles
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error cargando perfil:', error.message);
        // Si el token expiró o es inválido, limpiar sesión para evitar ciclos
        if (error.code === 'PGRST301' || error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('token')) {
          clearAllCache();
          supabase.auth.signOut();
        }
        return null;
      }
      return data;
    } catch (err) {
      console.error('Excepción al cargar perfil:', err);
      return null;
    }
  }

  useEffect(() => {
    let isMounted = true;

    // 1. Obtener sesión actual al montar
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!isMounted) return;

      if (error || !data?.session) {
        if (error) console.warn('Sesión inválida o expirada:', error.message);
        clearAllCache();
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      const currentSession = data.session;
      setSession(currentSession);
      setUser(currentSession.user ?? null);

      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        if (isMounted) setProfile(profileData);
      }

      if (isMounted) setLoading(false);
    }).catch((err) => {
      console.error('Error crítico al resolver sesión:', err);
      if (isMounted) {
        clearAllCache();
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED' || !newSession) {
          clearAllCache();
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setSession(newSession);
        setUser(newSession.user ?? null);

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (isMounted) setProfile(profileData);
        } else {
          setProfile(null);
        }

        if (isMounted) setLoading(false);
      }
    );

    // 3. Cleanup al desmontar para evitar fugas de memoria
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Métodos de autenticación ---

  async function signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  }

  async function signOut() {
    clearAllCache();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error cerrando sesión:', error.message);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error };
  }

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — Hook para consumir el contexto de autenticación.
 * Lanza error si se usa fuera de AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
