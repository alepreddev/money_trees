import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider — Proveedor global de estado de autenticación.
 * 
 * Expone:
 * - user: Objeto del usuario autenticado (null si no hay sesión)
 * - session: Objeto de sesión activa de Supabase
 * - loading: Boolean mientras se resuelve el estado inicial de auth
 * - profile: Datos del perfil del usuario desde public.profiles
 * - signUp(email, password, metadata): Registro de nuevo usuario
 * - signIn(email, password): Inicio de sesión
 * - signOut(): Cierre de sesión
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar el perfil del usuario desde public.profiles
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error cargando perfil:', error.message);
      return null;
    }
    return data;
  }

  useEffect(() => {
    // 1. Obtener sesión actual al montar
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      }

      setLoading(false);
    });

    // 2. Escuchar cambios de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const profileData = await fetchProfile(newSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // 3. Cleanup al desmontar
    return () => {
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

  async function signOut() {
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
