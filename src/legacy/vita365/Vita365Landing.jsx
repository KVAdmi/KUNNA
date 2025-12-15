import React from 'react';
import { useNavigate } from 'react-router-dom';

const Vita365Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Registro de Titulares',
      description: 'Sistema completo de alta con suscripción y pagos',
      icon: '👤',
      action: () => navigate('/registro-titular'),
      color: 'purple'
    },
    {
      title: 'Beneficiarios sin App',
      description: 'Para hombres o mujeres que no usarán la aplicación',
      icon: '📋',
      action: () => navigate('/dashboard'),
      color: 'blue'
    },
    {
      title: 'Beneficiarias con App',
      description: 'Para mujeres con acceso completo a Zinha',
      icon: '📱',
      action: () => navigate('/registro-beneficiaria'),
      color: 'pink'
    },
    {
      title: 'Dashboard Titular',
      description: 'Gestión completa de beneficiarios y recompensas',
      icon: '🏠',
      action: () => navigate('/dashboard'),
      color: 'green'
    }
  ];

  const businessRules = [
    '🚹 Hombres: Solo certificado Vita365',
    '🚺 Mujeres: Opción de certificado + app Zinha',
    '🔄 Reemplazo de beneficiarios disponible',
    '🎁 Sistema automático de recompensas',
    '⚱️ Elegibilidad funeraria después de 3 meses',
    '💰 Planes: Mensual, Anual y Vitalicio'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema Vita365
              </h1>
              <p className="text-gray-600 mt-1">
                Protección integral y bienestar femenino
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => navigate('/registro-titular')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🛡️</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema Completo Implementado
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Todos los flujos según tus especificaciones: registro de titulares, 
            beneficiarios con y sin app, sistema de códigos, recompensas y dashboard completo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={feature.action}
            >
              <div className={`w-16 h-16 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Business Rules */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Reglas de Negocio Implementadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessRules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
              >
                <span className="text-purple-600 font-medium">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✅ Estado de Implementación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Backend Completo:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Tablas: suscripciones, beneficiarios, pagos, certificados</li>
                <li>✅ Funciones: generar_codigo_acceso, usar_codigo, emitir_certificado</li>
                <li>✅ Vista: vw_titular_resumen</li>
                <li>✅ Políticas RLS configuradas</li>
                <li>✅ Sistema de recompensas automático</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Frontend Completo:</h4>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Registro de titulares con suscripción</li>
                <li>✅ Alta de beneficiarios (con/sin app)</li>
                <li>✅ Registro de beneficiarias con código</li>
                <li>✅ Dashboard titular con gestión completa</li>
                <li>✅ Sistema de reemplazo de beneficiarios</li>
                <li>✅ Guardas de negocio en UI</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-6 inline-block">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 Próximos Pasos Sugeridos:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Integrar Stripe para pagos reales</li>
                <li>• Crear Edge Functions para generar PDFs</li>
                <li>• Implementar notificaciones automáticas</li>
                <li>• Configurar Storage para certificados</li>
                <li>• Agregar más validaciones de negocio</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Acciones Rápidas para Probar
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/registro-titular')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Probar Registro Titular
            </button>
            <button
              onClick={() => navigate('/registro-beneficiaria')}
              className="bg-gradient-to-r from-pink-600 to-pink-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-700 hover:to-pink-800 transition-all"
            >
              Probar Registro Beneficiaria
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
            >
              Ver Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            Sistema Vita365 - Implementación completa según especificaciones
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Todos los flujos A, B, C, D, E y F implementados ✅
          </p>
        </div>
      </div>
    </div>
  );
};

export default Vita365Landing;
