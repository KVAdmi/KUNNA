import React, { useEffect, useState } from 'react';
import supabase from '@/lib/customSupabaseClient.js';

const SupabaseTest = () => {
  const [status, setStatus] = useState('Verificando...');
  const [details, setDetails] = useState({});

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log("🔍 Iniciando verificación de Supabase...");
        
        // Test 1: Conexión básica
        const { data: connectionTest, error: connectionError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        console.log("1️⃣ Test de conexión:", { connectionTest, connectionError });
        
        // Test 2: Verificar autenticación
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("2️⃣ Sesión actual:", { session, sessionError });
        
        // Test 3: Intentar signUp de prueba
        const testEmail = `testuser${Date.now()}@example.com`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'TestPassword123!',
          options: {
            data: {
              full_name: 'Test User',
              codigo_invitacion_personal: 'TEST123',
              tipo_plan: 'basico'
            }
          }
        });
        
        console.log("3️⃣ Test SignUp:", { signUpData, signUpError });
        
        setDetails({
          connectionTest: connectionError ? `Error: ${connectionError.message}` : 'OK',
          session: session ? 'Sesión activa' : 'Sin sesión',
          signUp: signUpError ? `Error: ${signUpError.message}` : 'OK',
          testEmail
        });
        
        if (connectionError || signUpError) {
          setStatus('❌ Error detectado');
        } else {
          setStatus('✅ Todo funcionando');
        }
        
      } catch (error) {
        console.error("💥 Error en testSupabase:", error);
        setStatus('❌ Error crítico');
        setDetails({ error: error.message });
      }
    };

    testSupabase();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #333', 
      margin: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px'
    }}>
      <h3>🔍 Diagnóstico Supabase</h3>
      <p><strong>Estado:</strong> {status}</p>
      
      <div style={{ marginTop: '15px' }}>
        <h4>Detalles:</h4>
        <pre style={{ 
          backgroundColor: '#000', 
          color: '#00ff00', 
          padding: '10px', 
          fontSize: '12px',
          borderRadius: '4px',
          overflow: 'auto'
        }}>
          {JSON.stringify(details, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <p>• Revisa la consola del navegador (F12) para más detalles</p>
        <p>• Si hay errores, revisa la configuración en Supabase</p>
      </div>
    </div>
  );
};

export default SupabaseTest;
