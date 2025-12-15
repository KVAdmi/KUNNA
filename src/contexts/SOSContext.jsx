import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { supabase } from '../config/supabaseClient.js';

const SOS_INTERVAL = 15000; // 15 segundos
const AUDIO_INTERVAL = 120000; // 2 minutos

export const SOSContext = React.createContext(null);

export function SOSProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);
  const [trackingTask, setTrackingTask] = useState(null);

  // Iniciar SOS
  const startSOS = async (destino = null, contactoEmergencia = null) => {
    try {
      // Solicitar permisos
      await Geolocation.requestPermissions({
        permissions: ['location', 'coarseLocation']
      });
      
      // Obtener ubicación inicial
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      // Iniciar seguimiento en Supabase
      const { data, error } = await supabase.rpc('iniciar_seguimiento_tiempo_real_v2', {
        p_user_id: userId,
        p_destino: destino,
        p_contacto_emergencia: contactoEmergencia
      });

      if (error) throw error;

      const { id, token, url } = data;
      setToken(token);

      // Enviar alerta inicial
      await sendWhatsAppAlert(url, position, token);

      // Iniciar servicio foreground en Android
      if (Capacitor.getPlatform() === 'android') {
        await startForegroundService();
      }

      // Iniciar tracking periódico
      const task = setInterval(async () => {
        await updateLocation();
        await recordAudio();
      }, SOS_INTERVAL);

      setTrackingTask(task);
      setIsActive(true);

    } catch (error) {
      console.error('Error al iniciar SOS:', error);
    }
  };

  // Detener SOS
  const stopSOS = async (pinReal = true) => {
    try {
      if (pinReal) {
        // Detener tracking real
        await supabase.rpc('detener_seguimiento', {
          p_token: token
        });

        clearInterval(trackingTask);
        
        if (Capacitor.getPlatform() === 'android') {
          await stopForegroundService();
        }

        setIsActive(false);
        setToken(null);

      } else {
        // PIN señuelo - seguir tracking silencioso
        await sendEscalationAlert();
      }

    } catch (error) {
      console.error('Error al detener SOS:', error);
    }
  };

  // Actualizar ubicación
  const updateLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      await supabase.from('acompanamientos_activos')
        .update({
          latitud_actual: position.coords.latitude,
          longitud_actual: position.coords.longitude,
          precision_metros: position.coords.accuracy,
          ultima_actualizacion_ubicacion: new Date()
        })
        .eq('token', token);

      await supabase.from('ruta_seguimiento')
        .insert({
          token,
          latitud: position.coords.latitude,
          longitud: position.coords.longitude,
          timestamp: new Date()
        });

      setLocation(position);

    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
    }
  };

  // Grabar audio
  const recordAudio = async () => {
    // Implementar grabación de audio
  };

  useEffect(() => {
    // Recuperar estado si hay un SOS activo
    checkActiveTracking();
    return () => {
      if (trackingTask) clearInterval(trackingTask);
    };
  }, []);

  return (
    <SOSContext.Provider value={{
      isActive,
      location,
      token,
      startSOS,
      stopSOS
    }}>
      {children}
    </SOSContext.Provider>
  );
}
