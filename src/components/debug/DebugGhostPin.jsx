import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

export default function DebugGhostPin() {
  const { user } = useAuth();
  const [ghostHash, setGhostHash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('ghost_pin_hash')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error cargando PIN:', error);
        }
        
        setGhostHash(data?.ghost_pin_hash || null);
      } catch (err) {
        console.error('Error:', err);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px', 
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h4>Debug Ghost PIN</h4>
      <p>Usuario logueado: {user ? 'SÍ' : 'NO'}</p>
      <p>User ID: {user?.id || 'N/A'}</p>
      <p>Loading: {loading ? 'SÍ' : 'NO'}</p>
      <p>Ghost Hash: {ghostHash ? 'CONFIGURADO' : 'NO CONFIGURADO'}</p>
      <p>Hash length: {ghostHash ? ghostHash.length : 0}</p>
    </div>
  );
}
