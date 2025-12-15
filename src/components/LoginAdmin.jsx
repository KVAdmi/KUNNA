import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'asistia24@gmail.com', // Pre-llenar para facilitar pruebas
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setStatusMessage('Por favor ingresa email y contraseña');
      return;
    }

    try {
      // Login simple sin contexto
      setStatusMessage('Iniciando sesión...');
      
      if (data?.user) {
        setStatusMessage(`¡Bienvenida ${data.user.email}!`);
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setStatusMessage('Error inesperado al iniciar sesión');
    }
  };

  // Quick login para admin (solo para desarrollo)
  const quickAdminLogin = async () => {
    if (formData.email === 'asistia24@gmail.com') {
      try {
        // Intentar con contraseña común de desarrollo
        const passwords = ['123456', 'admin123', 'asistia24', 'zinha2024'];
        
        for (const password of passwords) {
          try {
            const { data, error } = await signIn(formData.email, password);
            if (!error && data?.user) {
              setStatusMessage('¡Login exitoso!');
              navigate('/dashboard');
              return;
            }
          } catch (err) {
            // Continuar con el siguiente password
            continue;
          }
        }
        
        setStatusMessage('No se pudo acceder con contraseñas comunes. Ingresa tu contraseña.');
        
      } catch (error) {
        console.error('Quick login error:', error);
        setStatusMessage('Error en acceso rápido');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acceso al Sistema
          </h1>
          <p className="text-gray-600">
            Ingresa con tu cuenta de administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Panel de desarrollo para admin */}
        {formData.email === 'asistia24@gmail.com' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">
              🔧 Panel de Desarrollo
            </h3>
            <p className="text-xs text-yellow-700 mb-3">
              Como eres la administradora, puedes usar acceso rápido para pruebas.
            </p>
            <button
              onClick={quickAdminLogin}
              disabled={loading}
              className="w-full bg-yellow-500 text-white py-2 px-4 rounded text-sm font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
            >
              Acceso Rápido Admin
            </button>
            <p className="text-xs text-yellow-600 mt-2">
              Esto intentará contraseñas comunes de desarrollo
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/registro-titular')}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                Regístrate aquí
              </button>
            </p>
            <p>
              ¿Eres beneficiaria?{' '}
              <button
                onClick={() => navigate('/registro-beneficiaria')}
                className="text-pink-600 hover:text-pink-800 font-medium"
              >
                Regístrate con código
              </button>
            </p>
          </div>
        </div>

        {/* Información de estados para desarrollo */}
        <div className="mt-8 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">
            Estado del Sistema (Dev)
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>📧 Admin: asistia24@gmail.com</p>
            <p>🔑 Código especial: ADMIN2024</p>
            <p>🎯 Rol: super_admin</p>
            <p>💳 Acceso: Ilimitado</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
