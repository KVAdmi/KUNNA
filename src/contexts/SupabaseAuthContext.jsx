import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import supabase from '../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';
import { getResetPasswordRedirectURL, getOAuthRedirectURL } from '@/utils/environment';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();

  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSession = useCallback(async (session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        handleSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const handleRegister = async (e, email, password, name, codigoInvitacion) => {
    e.preventDefault();

    if (!email || !password || !name) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, completa todos los campos.',
      });
      return { error: new Error('Campos incompletos') };
    }

    const generarCodigo = () => {
      // Generar código más legible y único
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const timestamp = Date.now().toString().slice(-4); // Últimos 4 dígitos del timestamp
      let codigo = 'ZH'; // Prefijo Zinha
      
      // Agregar 4 caracteres aleatorios
      for (let i = 0; i < 4; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      
      // Agregar timestamp para unicidad
      codigo += timestamp;
      
      console.log('📝 Código de invitación generado:', codigo);
      return codigo;
    };

    const codigoGenerado = generarCodigo();

    console.log('🔑 Registrando usuario con código:', {
      codigoInvitacion: codigoInvitacion || 'No proporcionado',
      codigoGenerado,
      codigoFinal: codigoInvitacion || codigoGenerado
    });

    setLoading(true);
    
    const { data, error } = await signUp(email, password, {
      username: name,
      codigo_invitacion: codigoInvitacion || codigoGenerado,
    });

    if (error) {
      console.error("Error en registro:", error);
      toast({
        variant: 'destructive',
        title: 'Error al registrarte',
        description: error.message,
      });
      setLoading(false);
      return { error };
    } else {
      toast({
        title: '¡Bienvenida a KUNNA!',
        description: 'Tu cuenta ha sido creada. Completa tu perfil y procede con el pago para activar tu membresía.',
      });

      setLoading(false);
      return { error: null, redirectTo: '/perfil' }; // Cambiar redirección a perfil
    }
  };

  const signUp = useCallback(async (email, password, { username, codigo_invitacion }) => {
    console.log('📝 Creando usuario en Supabase:', {
      email,
      username,
      codigo_invitacion
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: username,
          codigo_invitacion_personal: codigo_invitacion,
          plan_activo: 'free',
          plan_tipo: 'gratuito',
          created_at: new Date().toISOString(),
        }
      }
    });

    if (error) {
      console.error("❌ Error en signUp:", error);
      toast({
        variant: 'destructive',
        title: 'Error al registrarte',
        description: error.message || 'Algo salió mal',
      });
    } else {
      console.log('✅ Usuario creado exitosamente:', data);
    }

    return { data, error };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    console.log('🔐 Iniciando login para:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🔐 Resultado de login:', { data: data?.user?.id, error });

    if (data?.user?.id) {
      console.log('👤 Usuario logueado, verificando perfil...');
      
      const { data: perfilExistente, error: perfilError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      console.log('👤 Perfil encontrado:', { perfil: perfilExistente, error: perfilError });

      if (!perfilExistente && !perfilError) {
        console.log('👤 Creando nuevo perfil...');
        const { data: newProfile, error: insertError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.full_name || "Invitada",
          created_at: new Date().toISOString(),
          plan_activo: "free",
          plan_tipo: "gratuito",
          updated_at: new Date().toISOString()
        });
        console.log('👤 Nuevo perfil creado:', { newProfile, insertError });
      }
    }

    if (error) {
      console.error('❌ Error en login:', error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message || "Algo salió mal",
      });
    }

    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cerrar sesión',
        description: error.message || 'Algo salió mal',
      });
    }

    return { error };
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = getOAuthRedirectURL();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error con Google',
        description: error.message || 'Algo salió mal con Google',
      });
    }

    return { error };
  }, [toast]);

  const resetPassword = useCallback(async (email) => {
    const redirectTo = getResetPasswordRedirectURL();
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al enviar correo',
        description: error.message || 'No se pudo enviar el correo de recuperación',
      });
    } else {
      toast({
        title: 'Correo enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
      });
    }

    return { error };
  }, [toast]);

  const updatePassword = useCallback(async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error al actualizar contraseña',
        description: error.message || 'No se pudo actualizar la contraseña',
      });
    } else {
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada con éxito.',
      });
    }

    return { error };
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resetPassword,
    updatePassword,
    handleRegister,
  }), [user, session, loading, signUp, signIn, signOut, signInWithGoogle, resetPassword, updatePassword, handleRegister]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
