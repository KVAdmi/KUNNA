import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const TestRegister = () => {
  const { signUp, loading } = useAuth();
  const [result, setResult] = useState(null);

  const testSignUp = async () => {
    console.log("🧪 Iniciando prueba de signUp...");
    
    const testData = {
      email: `test+${Date.now()}@example.com`,
      password: 'TestPassword123!',
      username: 'Usuario Test',
      codigo_invitacion: 'TEST123'
    };

    console.log("📧 Datos de prueba:", testData);

    try {
      const { data, error } = await signUp(
        testData.email, 
        testData.password, 
        {
          username: testData.username,
          codigo_invitacion: testData.codigo_invitacion
        }
      );

      console.log("📊 Resultado signUp:", { data, error });
      setResult({ data, error, testData });
    } catch (err) {
      console.error("💥 Error en catch:", err);
      setResult({ error: err, testData });
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🧪 Test de Registro</h3>
      <button 
        onClick={testSignUp} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        {loading ? 'Probando...' : 'Probar signUp'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h4>Resultado:</h4>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestRegister;
