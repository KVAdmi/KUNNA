import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';
import { supabase } from '../config/supabaseClient.js';
import permissionsService from '../lib/permissionsService.js';
import preciseLocationService from '../lib/preciseLocationService.js';

const AUDIO_INTERVAL = 120000; // 2 minutos

export const SOSContext = React.createContext(null);

export function SOSProvider({ children }) {
  const [isActive, setIsActive] = useState(false);
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);
  const [trackingTask, setTrackingTask] = useState(null);

  const sendWhatsAppAlert = async (trackingUrl, position, trackingToken) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data: profile } = await supabase
        .from('usuarios')
        .select('contactos_emergencia')
        .eq('id', userId)
        .single();

      const contactos = profile?.contactos_emergencia || [];
      if (contactos.length === 0) return;

      const mensaje = `🚨 EMERGENCIA KUNNA\n📍 ${trackingUrl}\nLat: ${position.latitude}, Lon: ${position.longitude}`;

      for (const contacto of contactos) {
        const telefono = contacto.telefono?.replace(/\D/g, '');
        if (!telefono || telefono.length < 10) continue;

        if (Capacitor.isNativePlatform()) {
          await Share.share({ title: '🚨 EMERGENCIA', text: mensaje });
        } else {
          window.open(`https://wa.me/52${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error) {
      console.error('[SOS] Error WhatsApp:', error);
    }
  };

  const startSOS = async () => {
    try {
      console.log('[SOS] Iniciando...');
      await permissionsService.requestAllSOSPermissions();
      const position = await preciseLocationService.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase.rpc('iniciar_seguimiento_tiempo_real_v2', { p_user_id: userId });
      if (error) throw error;
      setToken(data.token);
      await sendWhatsAppAlert(data.url, position, data.token);
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.schedule({
          notifications: [{
            title: "🚨 SOS Kunna Activo",
            body: "Tracking activo",
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) }
          }]
        });
      }
      await preciseLocationService.startBackgroundTaskWatch({ token: data.token });
      setIsActive(true);
      console.log('[SOS] Activo');
    } catch (error) {
      console.error('[SOS] Error:', error);
      alert(`Error SOS: ${error.message}`);
    }
  };

  const stopSOS = async (pinReal = true) => {
    try {
      if (pinReal) {
        await supabase.rpc('detener_seguimiento', { p_token: token });
        await preciseLocationService.stopBackgroundTaskWatch();
        if (trackingTask) clearInterval(trackingTask);
        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
        }
        setIsActive(false);
        setToken(null);
      }
    } catch (error) {
      console.error('[SOS] Error stop:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (trackingTask) clearInterval(trackingTask);
    };
  }, []);

  return (
    <SOSContext.Provider value={{ isActive, location, token, startSOS, stopSOS }}>
      {children}
    </SOSContext.Provider>
  );
}
