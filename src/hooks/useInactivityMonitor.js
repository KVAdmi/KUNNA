/**
 * USE INACTIVITY MONITOR (JS)
 * 
 * Hook de React para detectar inactividad del usuario.
 */

import { useEffect, useRef } from 'react';
import { kceEvents } from '../core/kce/index.js';

export function useInactivityMonitor(userId, thresholdMinutes = 30) {
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);
  const eventListenersAddedRef = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveMs = now - lastActivityRef.current;
      const inactiveMinutes = Math.floor(inactiveMs / (60 * 1000));

      if (inactiveMinutes >= thresholdMinutes) {
        console.log(`⏰ Inactividad detectada: ${inactiveMinutes} minutos`);
        
        kceEvents.inactivityDetected(userId, inactiveMinutes);
        
        // Resetear para no emitir continuamente
        lastActivityRef.current = Date.now();
      }
    };

    // Registrar listeners de actividad
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    if (!eventListenersAddedRef.current) {
      events.forEach(event => {
        window.addEventListener(event, updateActivity, { passive: true });
      });
      eventListenersAddedRef.current = true;
    }

    // Revisar cada 5 minutos
    checkIntervalRef.current = setInterval(checkInactivity, 5 * 60 * 1000);

    console.log(`✅ Monitor de inactividad iniciado (${thresholdMinutes} min)`);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      
      eventListenersAddedRef.current = false;
    };
  }, [userId, thresholdMinutes]);
}
