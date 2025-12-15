import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/customSupabaseClient.js';

const AdminBypass = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBypass, setShowBypass] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (authUser) => {
    try {
      setUser(authUser);
      
      // Intentar cargar profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        
        // Si es el admin, crear profile automáticamente
        if (authUser.email === 'asistia24@gmail.com') {
          await createAdminProfile(authUser);
          return;
        }
        
        setProfile(null);
        return;
      }

      setProfile(profileData);
      
      // Verificar si necesita bypass (admin sin acceso)
      if (authUser.email === 'asistia24@gmail.com' && !profileData.has_paid) {
        setShowBypass(true);
      }
      
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const createAdminProfile = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
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
        console.error('Error creando perfil de administrador');
        setStatus('Error creando perfil de administrador');
        return;
      }

      setProfile(data);
      console.log('Perfil de administrador creado automáticamente');
      setStatus('Perfil de administrador creado automáticamente');
      
    } catch (error) {
      console.error('Error in createAdminProfile:', error);
    }
  };

  const handleBypassAccess = async () => {
    try {
      setLoading(true);
      
      // Actualizar profile para dar acceso completo
      const { error } = await supabase
        .from('profiles')
        .update({
          has_paid: true,
          profile_completed: true,
          codigo_donativo: 'ADMIN2024',
          rol: 'super_admin',
          app_access: true,
          username: 'AdminZinha',
          nombre_completo: 'Administrador Sistema Zinha'
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating admin profile:', error);
        console.error('Error activando acceso de administrador');
        setStatus('Error activando acceso de administrador');
        return;
      }

      // Recargar profile
      await loadUserProfile(user);
      setShowBypass(false);
      console.log('¡Acceso de administrador activado!');
      setStatus('¡Acceso de administrador activado!');
      
    } catch (error) {
      console.error('Error in handleBypassAccess:', error);
      console.error('Error inesperado');
      setStatus('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.email === 'asistia24@gmail.com' || profile?.rol === 'super_admin';
  };

  const hasAccess = () => {
    if (isAdmin()) return true;
    return profile?.has_paid === true && profile?.profile_completed === true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar bypass especial para admin
  if (showBypass && user?.email === 'asistia24@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.018-4.118A10.017 10.017 0 0011 1.001c-5.523 0-10 4.478-10 10 0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10a9.97 9.97 0 00-.982-4.37" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Acceso de Administrador
            </h1>
            <p className="text-gray-600">
              ¡Hola! Eres la administradora del sistema. Activa tu acceso completo.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">
              🔧 Configuración de Admin
            </h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Acceso completo a todas las funciones</li>
              <li>• Sin restricciones de pago</li>
              <li>• Gestión de todos los usuarios</li>
              <li>• Panel de administración avanzado</li>
            </ul>
          </div>

          <button
            onClick={handleBypassAccess}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Activando acceso...
              </div>
            ) : (
              'Activar Acceso de Administrador'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Usuario: {user?.email}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si no tiene acceso y no es admin, mostrar pantalla de acceso requerido
  if (!hasAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Acceso Requerido
            </h1>
            <p className="text-gray-600">
              Para acceder a Zinha necesitas activar tu membresía o tener un código donativo válido.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/registro-titular'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              Activar Membresía
            </button>
            
            <button
              onClick={() => window.location.href = '/completar-perfil'}
              className="w-full bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Completar Perfil
            </button>

            <div className="text-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          {user && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Usuario: {user.email}
              </p>
              {profile && (
                <div className="text-xs text-gray-400 mt-2">
                  <p>Pagado: {profile.has_paid ? '✅' : '❌'}</p>
                  <p>Perfil completo: {profile.profile_completed ? '✅' : '❌'}</p>
                  {profile.codigo_donativo && <p>Código: {profile.codigo_donativo}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Si tiene acceso, mostrar la aplicación
  return children;
};

export default AdminBypass;
