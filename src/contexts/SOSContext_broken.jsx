import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { Share } from '@capacitor/share';
import { supabase } from '../config/supabaseClient.js';
import permissionsService from '../lib/permissionsService.js';
import preciseLocationService from '../lib/preciseLocationService.js';

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
      console.log('[SOS] 🚨 Iniciando sistema SOS...');
      
      // 1️⃣ SOLICITAR TODOS LOS PERMISOS NATIVOS
      console.log('[SOS] 🔐 Solicitando permisos...');
      const permissionsGranted = await permissionsService.requestAllSOSPermissions();
      
      if (!permissionsGranted) {
        throw new Error('No se concedieron todos los permisos necesarios');
      }
      
      // 3️⃣ Iniciar seguimiento en Supabase
      console.log('[SOS] � Iniciando seguimiento en Supabase...');
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { data, error } = await supabase.rpc('iniciar_seguimiento_tiempo_real_v2', {
        p_user_id: userId,
        p_destino: destino,
        p_contacto_emergencia: contactoEmergencia
      });

      if (error) {
        console.error('[SOS] ❌ Error iniciando seguimiento:', error);
        throw error;
      }

      const { id, token: trackingToken, url: trackingUrl } = data;
      setToken(trackingToken);
      
      console.log('[SOS] ✅ Seguimiento iniciado. Token:', trackingToken);

      // 4️⃣ Enviar alerta inicial por WhatsApp usando Share API NATIVO
      await sendWhatsAppAlert(trackingUrl, position, trackingToken);
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
      console.log('[SOS] 🛑 Deteniendo SOS...');
      
      if (pinReal) {
        console.log('[SOS] ✅ PIN correcto - Deteniendo tracking real');
        
        // Detener tracking en Supabase
        await supabase.rpc('detener_seguimiento', {
          p_token: token
        });

        // Detener GPS background
        await preciseLocationService.stopBackgroundTaskWatch();
        
        // Detener intervalo de audio
        if (trackingTask) {
          clearInterval(trackingTask);
        }
        
        // Cancelar notificación persistente
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
        }

        setIsActive(false);
        setToken(null);
        
        console.log('[SOS] ✅ SOS detenido completamente');

      } else {
        console.log('[SOS] ⚠️ PIN SEÑUELO detectado - Escalando alerta silenciosamente');
        
        // Marcar como escalado en la base de datos
        await supabase
          .from('acompanamientos_activos')
          .update({ 
            escalado: true,
            nota_escalamiento: 'Usuario ingresó PIN señuelo - PELIGRO CONFIRMADO'
          })
          .eq('token', token);
        
        // Enviar alerta de escalamiento a autoridades
        await sendEscalationAlert();
        
        // NO detener el tracking, solo simular que se detuvo
        console.log('[SOS] ⚠️ Tracking continúa silenciosamente...');
      }

    } catch (error) {
      console.error('[SOS] ❌ Error al detener SOS:', error);
    }
  };

  // Enviar alerta de escalamiento (PIN señuelo)
  const sendEscalationAlert = async () => {
    try {
      console.log('[SOS] 🚨 ESCALAMIENTO - Enviando alerta a autoridades...');
      
      // Obtener ubicación actual
      const position = await preciseLocationService.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 5000
      });

      // Insertar evento de escalamiento
      await supabase
        .from('evidencias_sos')
        .insert({
          acompanamiento_id: token,
          tipo: 'escalamiento',
          descripcion: 'PIN SEÑUELO DETECTADO - Usuario en peligro confirmado',
          latitud: position.latitude,
          longitud: position.longitude
        });

      console.log('[SOS] ✅ Alerta de escalamiento registrada');
      
    } catch (error) {
      console.error('[SOS] ❌ Error en escalamiento:', error);
    }
  };

  // Grabar audio (usando @capacitor-community/media)
  const recordAudio = async () => {
    try {
      console.log('[SOS-AUDIO] 🎤 Iniciando grabación...');
      
      if (!Capacitor.isNativePlatform()) {
        console.warn('[SOS-AUDIO] ⚠️ Grabación de audio solo en app nativa');
        return;
      }

      const { Media } = await import('@capacitor-community/media');
      
      // Grabar 30 segundos de audio ambiente
      const result = await Media.startRecording({
        outputFormat: 'aac',
        audioQuality: 'high',
        duration: 30000 // 30 segundos
      });

      console.log('[SOS-AUDIO] ✅ Grabación completada:', result.uri);

      // Subir audio a Supabase Storage
      await uploadAudioToStorage(result.uri);

    } catch (error) {
      console.error('[SOS-AUDIO] ❌ Error grabando audio:', error);
    }
  };

  // Subir audio a Supabase Storage
  const uploadAudioToStorage = async (audioUri) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const fileName = `${userId}/${token}/${Date.now()}.m4a`;
      
      // Leer archivo y subir
      const { Filesystem } = await import('@capacitor/filesystem');
      const fileData = await Filesystem.readFile({ path: audioUri });
      
      const { data, error } = await supabase.storage
        .from('audios-panico')
        .upload(fileName, fileData.data, {
          contentType: 'audio/aac',
          upsert: false
        });

      if (error) throw error;

      // Registrar en evidencias_sos
      await supabase
        .from('evidencias_sos')
        .insert({
          acompanamiento_id: token,
          tipo: 'audio',
          archivo_path: data.path,
          archivo_nombre: fileName,
          duracion_segundos: 30
        });

      console.log('[SOS-AUDIO] ✅ Audio subido a Storage:', data.path);

    } catch (error) {
      console.error('[SOS-AUDIO] ❌ Error subiendo audio:', error);
    }
  };

  // Verificar si hay un tracking activo al iniciar
  const checkActiveTracking = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('acompanamientos_activos')
        .select('token, id')
        .eq('usuario_id', userId)
        .eq('activo', true)
        .single();

      if (data && !error) {
        console.log('[SOS] 🔄 Tracking activo detectado. Restaurando...');
        setToken(data.token);
        setIsActive(true);
        
        // Reiniciar tracking GPS
        await preciseLocationService.startBackgroundTaskWatch({ token: data.token });
      }

    } catch (error) {
      console.log('[SOS] No hay tracking activo');
    }
  };

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
