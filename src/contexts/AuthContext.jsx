import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/customSupabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error in getInitialSession:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        
        // Si es el admin y no tiene profile, crear uno automáticamente
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data?.user?.email === 'asistia24@gmail.com') {
          await createAdminProfile(userId, currentUser.data.user.email);
          return;
        }
        
        setProfile(null);
        return;
      }

      console.log('Profile loaded:', profileData);
      setProfile(profileData);
      
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const createAdminProfile = async (userId, email) => {
    try {
      console.log('Creating admin profile for:', email);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          username: 'AdminZinha',
          nombre_completo: 'Administrador Sistema Zinha',
          has_paid: true,
          profile_completed: true,
          codigo_donativo: 'ADMIN2024',
          rol: 'super_admin',
          app_access: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating admin profile:', error);
        return;
      }

      console.log('Admin profile created:', data);
      setProfile(data);
      
    } catch (error) {
      console.error('Error in createAdminProfile:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful:', data.user?.email);
      return { data, error: null };
      
    } catch (error) {
      console.error('Error in signIn:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful:', data.user?.email);
      return { data, error: null };
      
    } catch (error) {
      console.error('Error in signUp:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      console.log('Google OAuth initiated');
      return { data, error: null };
      
    } catch (error) {
      console.error('Error in signInWithGoogle:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      console.log('Sign out successful');
      setUser(null);
      setProfile(null);
      
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.email === 'asistia24@gmail.com' || profile?.rol === 'super_admin';
  };

  const hasAccess = () => {
    // Admin siempre tiene acceso
    if (isAdmin()) return true;
    
    // Usuario normal necesita pago y perfil completo
    return profile?.has_paid === true && profile?.profile_completed === true;
  };

  const refreshProfile = () => {
    if (user?.id) {
      loadUserProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAdmin,
    hasAccess,
    refreshProfile,
    // Para compatibilidad con componentes existentes
    isAuthenticated: !!user,
    login: signIn,
    logout: signOut,
    handleRegister: signUp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};