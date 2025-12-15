import React from 'react';
import GeolocationTest from '@/components/debug/GeolocationTest';

const DebugGeolocation = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚨 Debug de Geolocalización - Zinha App
          </h1>
          <p className="text-gray-600">
            Herramientas para diagnosticar problemas de ubicación en el botón ACOMPAÑAME
          </p>
        </div>

        <GeolocationTest />

        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">💡 Instrucciones</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Primero, haz clic en "📍 Test Básico" para verificar permisos</li>
            <li>Si funciona, prueba "💾 Test BD" para verificar la base de datos</li>
            <li>Usa "▶️ Iniciar" para probar el seguimiento continuo</li>
            <li>Revisa la consola del navegador para logs detallados</li>
          </ol>
        </div>

        <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">🚨 Problemas Comunes</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
            <li><strong>Error de permisos:</strong> Permitir ubicación en configuración del navegador</li>
            <li><strong>Precisión baja:</strong> Activar GPS de alta precisión en el dispositivo</li>
            <li><strong>Timeout:</strong> Estar en zona con buena señal GPS</li>
            <li><strong>Error de BD:</strong> Verificar conexión a Supabase</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DebugGeolocation;

