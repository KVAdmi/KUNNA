import React, { useState } from 'react';
import { supabase } from '../lib/customSupabaseClient.js';

const AdminRecovery = () => {
  const [email, setEmail] = useState('asistia24@gmail.com');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    setLoading(true);
    setStatus('Enviando email de recuperación...');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setStatus(`Error: ${error.message}`);
      } else {
        setStatus('✅ Email de recuperación enviado. Revisa tu bandeja de entrada.');
      }
    } catch (error) {
      setStatus(`Error inesperado: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleDirectLogin = async () => {
    if (!newPassword) {
      setStatus('Ingresa una contraseña');
      return;
    }

    setLoading(true);
    setStatus('Intentando login directo...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: newPassword
      });

      if (error) {
        setStatus(`Error de login: ${error.message}`);
      } else {
        setStatus('✅ Login exitoso! Redirigiendo...');
        // Redirigir al dashboard
        window.location.href = '/admin-dashboard';
      }
    } catch (error) {
      setStatus(`Error inesperado: ${error.message}`);
    }
    
    setLoading(false);
  };

  const handleCreateAdminProfile = async () => {
    setLoading(true);
    setStatus('Creando perfil de administrador...');
    
    try {
      // Verificar si ya existe el perfil
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (existingProfile) {
        // Actualizar perfil existente
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
          .eq('email', email);

        if (error) {
          setStatus(`Error actualizando perfil: ${error.message}`);
        } else {
          setStatus('✅ Perfil de admin actualizado correctamente');
        }
      } else {
        setStatus('❌ No se encontró usuario. Primero debe existir en auth.users');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const checkUserStatus = async () => {
    setLoading(true);
    setStatus('Verificando estado del usuario...');
    
    try {
      // Verificar en profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      // Verificar en admin_users
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();

      // Verificar suscripción
      const { data: subscription } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('titular_profile_id', profile?.id)
        .single();

      let statusMessage = '=== ESTADO DEL USUARIO ===\n';
      statusMessage += `📧 Email: ${email}\n`;
      statusMessage += `👤 Perfil: ${profile ? '✅ Existe' : '❌ No existe'}\n`;
      statusMessage += `💳 Pagado: ${profile?.has_paid ? '✅ Sí' : '❌ No'}\n`;
      statusMessage += `✅ Completado: ${profile?.profile_completed ? '✅ Sí' : '❌ No'}\n`;
      statusMessage += `🔑 Admin: ${adminUser ? '✅ Sí' : '❌ No'}\n`;
      statusMessage += `💎 Suscripción: ${subscription ? `✅ ${subscription.plan}` : '❌ No'}\n`;

      setStatus(statusMessage);
    } catch (error) {
      setStatus(`Error verificando: ${error.message}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          🛠️ Recuperación Admin
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Admin
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nueva Contraseña (para login directo)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: Admin123!"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={checkUserStatus}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              🔍 Verificar Estado
            </button>

            <button
              onClick={handleCreateAdminProfile}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              👑 Crear Perfil Admin
            </button>

            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              📧 Enviar Reset Email
            </button>

            <button
              onClick={handleDirectLogin}
              disabled={loading || !newPassword}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              🚀 Login Directo
            </button>
          </div>

          {status && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {status}
              </pre>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p><strong>Pasos de emergencia:</strong></p>
            <p>1. Ejecutar reset_admin_acceso.sql en Supabase</p>
            <p>2. Crear usuario en Auth UI si no existe</p>
            <p>3. Usar este panel para configurar acceso</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecovery;
