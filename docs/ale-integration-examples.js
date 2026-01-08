/**
 * EJEMPLO DE INTEGRACIÓN AL-E CORE EN PUNTOS CRÍTICOS
 * 
 * Copiar estos snippets en los archivos correspondientes de KUNNA
 */

// =====================================================
// 1. CHECK-INS FALLIDOS (src/services/checkInsManager.js)
// =====================================================
import aleCoreClient from '@/lib/ale/aleCoreClient';
import actionExecutor from '@/lib/ale/actionExecutor';

// Dentro de checkScheduledCheckIns(), cuando detectas check-in fallido:
async checkScheduledCheckIns() {
  // ... código existente que detecta check-in fallido ...
  
  if (checkInFailed) {
    try {
      // Emitir evento a AL-E Core
      const eventResult = await aleCoreClient.checkInFailed(
        userId, 
        `Check-in no completado: ${checkIn.nombre_lugar}`
      );

      // Pedir decisión
      const decision = await aleCoreClient.decide({
        user_id: userId,
        event_id: eventResult.core_event_id,
        context: {
          checkin_type: 'scheduled_trip',
          destination: checkIn.nombre_lugar,
          expected_time: checkIn.fecha_hora_programada
        }
      });

      // Ejecutar acciones
      if (decision.actions && decision.actions.length > 0) {
        await actionExecutor.execute(userId, decision.actions, decision.decision_id);
      }
    } catch (error) {
      console.error('Error integrando con AL-E Core:', error);
      // No romper el flujo local si Core falla
    }
  }
}

// =====================================================
// 2. DIARIO EMOCIONAL (src/pages/EmotionalJournal.jsx)
// =====================================================
import aleCoreClient from '@/lib/ale/aleCoreClient';

// Dentro de handleSaveEntry(), después de guardar en Supabase:
const handleSaveEntry = async () => {
  // ... código existente que guarda en Supabase ...
  
  if (success) {
    try {
      // Analizar riesgo básico (puedes mejorar con NLP)
      const riskWords = ['miedo', 'no puedo', 'sola', 'ayuda', 'asustada', 'peligro', 'amenaza', 'violencia'];
      const hasRisk = riskWords.some(word => entryText.toLowerCase().includes(word));
      const riskLevel = hasRisk ? 'risk' : 'normal';

      // Emitir evento a AL-E Core
      await aleCoreClient.diaryEntry(
        user.id,
        entryText,
        riskLevel
      );
    } catch (error) {
      console.error('Error enviando diario a AL-E Core:', error);
    }
  }
};

// =====================================================
// 3. SOS MANUAL (src/components/SOSButton.jsx o similar)
// =====================================================
import aleCoreClient from '@/lib/ale/aleCoreClient';
import actionExecutor from '@/lib/ale/actionExecutor';

// Cuando se presiona botón SOS:
const handleSOSPress = async () => {
  try {
    // Obtener ubicación si está disponible
    let location = null;
    if (navigator.geolocation) {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }

    // Emitir SOS a AL-E Core
    const eventResult = await aleCoreClient.sosManual(user.id, location);

    // Pedir decisión inmediata
    const decision = await aleCoreClient.decide({
      user_id: user.id,
      event_id: eventResult.core_event_id,
      context: {
        trigger: 'manual_button',
        location,
        timestamp: new Date().toISOString()
      }
    });

    // Ejecutar acciones críticas INMEDIATAMENTE
    if (decision.actions && decision.actions.length > 0) {
      await actionExecutor.execute(user.id, decision.actions, decision.decision_id);
    }

    // IMPORTANTE: También ejecutar protocolo SOS local de KUNNA
    // No depender solo de AL-E Core para SOS manual
    await executeLocalSOSProtocol();

  } catch (error) {
    console.error('Error en SOS:', error);
    // CRÍTICO: Si falla todo, ejecutar protocolo local
    await executeLocalSOSProtocol();
  }
};

// =====================================================
// 4. CAMBIO DE ESTADO (src/pages/SecurityModule.jsx o similar)
// =====================================================
import aleCoreClient from '@/lib/ale/aleCoreClient';

// Cuando usuario cambia su estado manualmente:
const handleRiskLevelChange = async (newLevel) => {
  try {
    // Actualizar en Supabase local
    await supabase
      .from('profiles')
      .update({ risk_level: newLevel })
      .eq('id', user.id);

    // Notificar a AL-E Core
    await aleCoreClient.stateChange(user.id, newLevel);

    toast({
      title: 'Estado actualizado',
      description: `Tu nivel de riesgo ahora es: ${newLevel}`
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
  }
};

// =====================================================
// 5. HOOK DE INACTIVIDAD (src/hooks/useInactivityMonitor.js)
// =====================================================
// NOTA: Este hook ya NO necesita llamar a AL-E Core directamente.
// La Netlify Scheduled Function (inactivity-scan.ts) se encarga de eso.
// Solo debe actualizar last_activity_at en Supabase.

import { useEffect, useRef } from 'react';
import supabase from '@/lib/customSupabaseClient';

export function useInactivityMonitor(userId) {
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    if (!userId) return;

    const updateActivity = async () => {
      const now = Date.now();
      // Solo actualizar cada 5 minutos para no saturar DB
      if (now - lastUpdateRef.current > 5 * 60 * 1000) {
        lastUpdateRef.current = now;
        
        await supabase
          .from('profiles')
          .update({ last_activity_at: new Date().toISOString() })
          .eq('id', userId);
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));

    return () => {
      events.forEach(e => window.removeEventListener(e, updateActivity));
    };
  }, [userId]);
}

// =====================================================
// 6. ACTUALIZACIÓN PERIÓDICA DE ACTIVIDAD (App.jsx)
// =====================================================
import { useEffect } from 'react';
import supabase from '@/lib/customSupabaseClient';

// En el componente App principal:
function App() {
  const { user } = useAuth();

  // Actualizar actividad cada 2 minutos mientras la app está abierta
  useEffect(() => {
    if (!user) return;

    const updateActivity = async () => {
      await supabase
        .from('profiles')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', user.id);
    };

    // Actualizar inmediatamente
    updateActivity();

    // Actualizar cada 2 minutos
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  // ... resto del componente
}

// =====================================================
// RESUMEN DE INTEGRACIÓN
// =====================================================

/**
 * PUNTOS DE INTEGRACIÓN COMPLETADOS:
 * 
 * ✅ Check-ins fallidos → AL-E Core → Decisión → Acciones
 * ✅ Diario emocional → AL-E Core (con análisis básico de riesgo)
 * ✅ SOS manual → AL-E Core + Protocolo local (fallback)
 * ✅ Cambio de estado → AL-E Core
 * ✅ Actividad del usuario → Actualizar last_activity_at
 * ✅ Scan automático de inactividad (Netlify Function cada 15min)
 * 
 * ARQUITECTURA:
 * Frontend → Netlify Functions → AL-E Core
 *              ↓
 *         Supabase KUNNA (logs + auditoría)
 * 
 * SEGURIDAD:
 * - Service tokens NUNCA en frontend
 * - Todas las llamadas a Core pasan por Netlify Functions
 * - Logs completos en Supabase KUNNA para auditoría
 * - Fallback local si Core falla (especialmente en SOS)
 */
