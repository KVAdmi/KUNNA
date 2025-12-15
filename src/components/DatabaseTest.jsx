import React, { useEffect, useState } from 'react';
import supabase from '../lib/customSupabaseClient.js';

const DatabaseTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testDatabase = async () => {
      const tests = [];

      // Test 1: Conexión básica
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        tests.push({
          name: 'Conexión a tabla profiles',
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Conectado correctamente',
          details: error ? error.details : data
        });
      } catch (err) {
        tests.push({
          name: 'Conexión a tabla profiles',
          status: 'error',
          message: err.message,
          details: 'Error fatal de conexión'
        });
      }

      // Test 2: Verificar estructura de auth
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        tests.push({
          name: 'Sistema de autenticación',
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Auth configurado',
          details: user ? 'Usuario logueado' : 'Sin usuario activo'
        });
      } catch (err) {
        tests.push({
          name: 'Sistema de autenticación',
          status: 'error',
          message: err.message,
          details: 'Error en auth'
        });
      }

      // Test 3: Variables de entorno
      const envTest = {
        name: 'Variables de entorno',
        status: 'info',
        message: 'Configuración actual',
        details: {
          URL: import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          keyPreview: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        }
      };
      tests.push(envTest);

      setResults(tests);
      setLoading(false);
    };

    testDatabase();
  }, []);

  if (loading) {
    return <div className="p-4">🔄 Ejecutando tests...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔍 Diagnóstico Supabase KUNNA</h1>
      
      {results.map((test, index) => (
        <div key={index} className={`border rounded p-4 mb-4 ${
          test.status === 'success' ? 'bg-green-50 border-green-200' :
          test.status === 'error' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <h3 className="font-semibold">
            {test.status === 'success' ? '✅' : 
             test.status === 'error' ? '❌' : 'ℹ️'} {test.name}
          </h3>
          <p className="text-sm mt-1">{test.message}</p>
          {test.details && (
            <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {typeof test.details === 'object' 
                ? JSON.stringify(test.details, null, 2) 
                : test.details}
            </pre>
          )}
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold">🔧 Próximos pasos:</h3>
        <ol className="list-decimal list-inside text-sm mt-2">
          <li>Si ves errores de tabla "profiles", ejecuta los scripts SQL en Supabase</li>
          <li>Si auth falla, verifica las credenciales</li>
          <li>Si todo está OK, el problema puede ser en el frontend</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseTest;