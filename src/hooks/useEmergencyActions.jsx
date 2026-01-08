// src/hooks/useEmergencyActions.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import preciseLocationService from '@/lib/preciseLocationService';
import { Capacitor } from '@capacitor/core';

const useEmergencyActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  // Función para cargar APIs dinámicamente y de forma segura
  const loadCapacitorAPIs = async () => {
    // Comprobar si estamos en un dispositivo nativo
    if (Capacitor.isNativePlatform()) {
      try {
        const { AppLauncher } = await import('@capacitor/app-launcher');
        return { AppLauncher };
      } catch (e) {
        console.error("Error al cargar AppLauncher:", e);
        return { AppLauncher: null };
      }
    }
    return { AppLauncher: null };
  };

  // Cargar contactos al montar
  useEffect(() => {
    if (user) {
      loadEmergencyContacts();
    }
  }, [user]);

  const loadEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contactos_emergencia') // ✅ CORREGIDO: Usar nombre en español
        .select('*')
        .eq('user_id', user.id)
        .order('prioridad', { ascending: true }); // ✅ CORREGIDO: Usar prioridad en lugar de created_at

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  };

  // 🚨 AUXILIO CON AUDIO - CÓDIGO ORIGINAL QUE FUNCIONABA
  const sendAudioEmergency = async () => {
    console.log('🚨 [DEBUG] sendAudioEmergency llamado');
    console.log('🚨 [DEBUG] Contactos disponibles:', contacts.length);
    console.log('🚨 [DEBUG Usuario actual:', user?.id);
    
    if (!user) {
      toast({ title: '❌ Error de sesión', description: 'No hay usuario logueado. Inicia sesión primero.' });
      console.log('🚨 [DEBUG] No hay usuario logueado');
      return;
    }
    
    if (contacts.length === 0) {
      toast({ title: '⚠️ Sin contactos', description: 'Configura contactos de emergencia primero.' });
      console.log('🚨 [DEBUG] No hay contactos configurados');
      return;
    }

    try {
      console.log('🚨 [DEBUG] Iniciando proceso de auxilio...');
      toast({ title: '🎤 Solicitando permisos de micrófono...', description: '' });

      // 1. Solicitar permisos de micrófono
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Error micrófono:', err);
        toast({ title: '❌ Error de micrófono', description: 'No se pudo acceder al micrófono. Permite el acceso.' });
        return;
      }

      // 2. Obtener ubicación con Google Maps (máxima precisión)
      toast({ title: '🎯 Obteniendo ubicación con Google Maps...', description: 'Precisión máxima para emergencia' });

      const position = await preciseLocationService.getCurrentPosition({
        requireHighAccuracy: true,
        timeout: 10000,
        retries: 2
      });
      
      console.log(`🎯 [AUXILIO Ubicación obtenida - Precisión: ${position.accuracy}m (Fuente: ${position.source})`);

      // 3. Mensaje: "Estamos grabando tu entorno durante 15 segundos"
      toast({ 
        title: '🎙️ Estamos grabando tu entorno durante 15 segundos', 
        description: 'Mantén el micrófono cerca del audio que quieres capturar' 
      });

      // 4. Grabar audio exactamente 15 segundos
      const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];
      
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      const stopRec = () => new Promise((resolve) => { 
        rec.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          resolve();
        };
        rec.stop(); 
      });
      
      rec.start();
      
      // Contador de 15 segundos
      for (let i = 15; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({ 
          title: `🎙️ GRABANDO... ${i-1} segundos restantes`, 
          description: 'Capturando audio del entorno...' 
        });
      }
      
      if (rec.state === 'recording') {
        rec.stop();
      }
      
      await stopRec();

      toast({ title: '☁️ Subiendo audio...', description: 'Procesando grabación de emergencia' });

      // 5. Subir audio al bucket audios-panico
      const blob = new Blob(chunks, { type: 'audio/webm' });
      if (blob.size === 0) {
        toast({ title: '❌ Error', description: 'No se pudo grabar audio. Intenta de nuevo.' });
        return;
      }

      const fileName = `panico_${Date.now()}.webm`;
      
      const { error: upErr } = await supabase.storage
        .from('audios-panico')
        .upload(fileName, blob, { 
          contentType: 'audio/webm',
          cacheControl: '3600'
        });
      
      if (upErr) {
        console.error('Error subida:', upErr);
        toast({ title: '❌ Error al subir audio', description: upErr.message });
        return;
      }

      const { data: urlData } = supabase.storage.from('audios-panico').getPublicUrl(fileName);
      const audioUrl = urlData.publicUrl;

      // 6. Crear mensaje EXACTO para WhatsApp
      const mensajeWA = `Esta persona está en peligro.

Audio de emergencia: ${audioUrl}

Ubicación actual: https://maps.google.com/?q=${position.latitude},${position.longitude}
Precisión: ${Math.round(position.accuracy)}m (${position.source})

⚠️ Mensaje enviado desde Zinha App - Sistema de Emergencia`;

      // 7. Enviar por WhatsApp a contactos de emergencia (prioridad 1, 2, 3)
      const { AppLauncher } = await loadCapacitorAPIs();
      
      if (AppLauncher) {
        // Estamos en el móvil, usamos el plugin
        contacts.forEach((contact) => {
          const telefono = contact.telefono.replace(/\D/g, '');
          const url = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensajeWA)}`;
          AppLauncher.openUrl({ url });
        });
      } else {
        // Estamos en la web, usamos el método tradicional
        contacts.forEach((contact) => {
          const telefono = contact.telefono.replace(/\D/g, '');
          const url = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensajeWA)}`;
          window.open(url, '_blank');
        });
      }

      // 8. Guardar evento en base de datos
      try {
        await supabase.from('eventos_peligro').insert({
          user_id: user.id,
          latitud: position.latitude,
          longitud: position.longitude,
          mensaje: mensajeWA,
          enviado: true,
          creado_en: new Date().toISOString()
        });
      } catch (insertErr) {
        console.error('Error al guardar evento:', insertErr);
      }

      toast({ 
        title: '✅ ¡Alerta de auxilio enviada!', 
        description: `Audio y ubicación enviados a tus contactos de emergencia con precisión de ${Math.round(position.accuracy)}m` 
      });

    } catch (error) {
      console.error('❌ [ERROR CRÍTICO] Error en auxilio con audio:', error);
      toast({ title: '❌ Error crítico en auxilio', description: error.message });
    }
  };

  // 👥 ACOMPAÑAMIENTO EN TIEMPO REAL
  const toggleCompanionship = async () => {
    if (contacts.length === 0) {
      toast({ title: '⚠️ Sin contactos', description: 'Configura contactos de emergencia primero.' });
      return;
    }

    // --- LÓGICA PARA DETENER EL SEGUIMIENTO ---
    if (isFollowing) {
      await preciseLocationService.stopWatch();
      setIsFollowing(false);
      
      if (window.__currentTrackingToken) {
        // Marcamos el acompañamiento como inactivo en la base de datos
        try {
          await supabase.from('acompanamientos_activos')
            .update({ activo: false, fin: new Date().toISOString() })
            .eq('token', window.__currentTrackingToken);
          window.__currentTrackingToken = null;
          toast({
            title: '🔒 Acompañamiento finalizado',
            description: 'Has llegado a tu destino de forma segura.'
          });
        } catch (error) {
          console.error('Error al finalizar seguimiento:', error);
          toast({
            title: '⚠️ Error al finalizar',
            description: 'El seguimiento puede seguir activo. Intenta de nuevo.'
          });
        }
      }
      return;
    }

    // Primero verificar permisos de ubicación
    try {
      toast({ title: '📍 Verificando ubicación...', description: 'Permitiendo acceso a tu ubicación.' });
      
      const position = await preciseLocationService.getCurrentPosition({
        requireHighAccuracy: true,
        timeout: 10000,
        retries: 2
      });

      if (!position) {
        toast({
          title: '❌ Error de ubicación',
          description: 'No se pudo obtener tu ubicación. Verifica los permisos.'
        });
        return;
      }

      console.log('✅ Ubicación inicial obtenida:', position);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      toast({
        title: '❌ Error de ubicación',
        description: 'Permite el acceso a tu ubicación para continuar.'
      });
      return;
    }

    // --- LÓGICA PARA INICIAR EL SEGUIMIENTO ---
    toast({ 
      title: '🚶‍♀️ Iniciando acompañamiento...',
      description: 'Creando tu enlace seguro y activando el seguimiento.'
    });

    try {
      // 1. Verificar y solicitar permisos de ubicación ANTES de hacer nada
      toast({
        title: '📍 Solicitando permisos de ubicación...',
        description: 'Necesitamos tu permiso para seguirte.'
      });
      const hasPermission = await preciseLocationService.checkAndRequestPermissions();
      if (!hasPermission) {
        toast({
          title: '❌ Permiso de ubicación denegado',
          description: 'No podemos iniciar el acompañamiento sin tu permiso.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: '✅ Permisos aceptados',
        description: 'Obteniendo tu ubicación inicial...'
      });

      // 2. Iniciar el seguimiento en la base de datos para obtener el token y el ID
      let trackingInfo;
      let acompanamiento_id, token, trackingUrl;
      try {
        const { data, error } = await supabase.rpc('iniciar_seguimiento_tiempo_real_v2', {
          p_user_id: user.id,
          p_destino: 'Acompañamiento en tiempo real',
          p_contacto_emergencia: contacts[0]?.telefono || 'No configurado'
        });

        if (error) throw error;

        acompanamiento_id = data.id;
        token = data.token;
        trackingUrl = data.url_seguimiento || data.url || null;

        if (!acompanamiento_id || !token || !trackingUrl) {
          throw new Error("Datos de seguimiento incompletos recibidos del servidor.");
        }

        console.log("✅ Seguimiento creado en la base de datos:", { acompanamiento_id, token, trackingUrl });
      // Guardar token para referencia global
      window.__currentTrackingToken = token;

      } catch (err) {
        console.error('❌ Error inesperado al iniciar seguimiento en la base de datos:', err);
        toast({
          title: '❌ Error de red',
          description: 'No se pudo crear el evento de acompañamiento. Revisa tu conexión.'
        });
        return;
      }

      // 3. Iniciar el servicio de seguimiento en segundo plano con los datos normalizados
        toast({
        title: '🛰️ Activando seguimiento en segundo plano...',
        description: 'Tu ubicación se enviará de forma segura.'
        });
      await preciseLocationService.startBackgroundTaskWatch({ acompanamiento_id, token });

      // 4. ABRIR LA URL DE SEGUIMIENTO (Ahora que el servicio ya está activo)
      console.log("✅ Servicio en segundo plano iniciado. Abriendo URL de seguimiento...");
      window.open(trackingUrl, "_blank");

      // 5. Notificar a los contactos
      console.log("📱 Enviando enlace a contactos:", contacts);
      const mensaje = encodeURIComponent(`🚶‍♀️ ACOMPÁÑAME - Estoy en camino y quiero que me acompañes virtualmente.\n\n👀 Sigue mi ubicación en tiempo real aquí:\n${trackingUrl}\n\n⚠️ Por favor mantén este enlace abierto hasta que llegue a mi destino.`);
      
      try {
        const { AppLauncher } = await loadCapacitorAPIs();
        
        // Enviar mensaje a cada contacto
        for (const contact of contacts) {
          try {
            const telefono = contact.telefono.replace(/\D/g, '');
            const url = `https://wa.me/52${telefono}?text=${mensaje}`;
            
            console.log("🔗 Enviando WhatsApp a:", telefono);
            
            if (AppLauncher) {
              // Móvil - Usar Capacitor
              await AppLauncher.openUrl({ url });
            } else {
              // Web - Abrir en nueva pestaña
              window.open(url, '_blank');
            }
            
            // Esperar 1.5 segundos entre cada envío para evitar bloqueos
            await new Promise(resolve => setTimeout(resolve, 1500));
          } catch (contactError) {
            console.error(`Error al enviar a ${contact.telefono}:`, contactError);
          }
        }
      } catch (error) {
        console.error("❌ Error al enviar mensajes de WhatsApp:", error);
        toast({
          title: "⚠️ Error al enviar mensajes",
          description: "El seguimiento está activo pero hubo un error al notificar a los contactos."
        });
      }

      setIsFollowing(true);
      toast({ 
        title: '✅ ¡Acompañamiento activo!',
        description: 'Tu ubicación se comparte de forma segura. Puedes bloquear el teléfono.'
      });

    } catch (error) {
      console.error('❌ [ERROR CRÍTICO] Error al iniciar acompañamiento:', error);
      toast({ title: '❌ Error al iniciar', description: error.message });
      // Limpiar en caso de fallo
      await preciseLocationService.stopWatch();
      setIsFollowing(false);
    }
  };


  // 📞 LLAMADA SEGURA - Reproduce audio del bucket audios-seguridad
  const reproducirLlamadaSegura = async () => {
    try {
      // Obtener la URL pública del audio desde el bucket audios-seguridad
      const { data } = supabase.storage.from('audios-seguridad').getPublicUrl('Amiga Molesta.mp3');
      const audioUrl = data?.publicUrl;
      
      if (!audioUrl) {
        toast({ title: '❌ Error', description: 'No se encontró el audio de seguridad' });
        return;
      }
      
      // Crear y reproducir audio
      const audio = new Audio(audioUrl);
      
      toast({ title: '📞 Llamada segura', description: 'Reproduciendo audio de seguridad...' });
      
      try {
        await audio.play();
      } catch (playError) {
        toast({ title: '❌ Error', description: 'Error al reproducir audio. Intenta de nuevo.' });
        return;
      }
      
      // Cuando termine el audio, opcional: realizar alguna acción
      audio.onended = () => {
        console.log('Audio de llamada segura terminado');
      };
      
    } catch (error) {
      console.error('Error en llamada segura:', error);
      toast({ title: '❌ Error', description: 'Error al cargar audio: ' + error.message });
    }
  };

  return {
    contacts,
    isFollowing,
    sendAudioEmergency,
    toggleCompanionship,
    reproducirLlamadaSegura,
    loadEmergencyContacts
  };
};

const useEmergencyActionsHook = useEmergencyActions;
export { useEmergencyActionsHook as useEmergencyActions };
export default useEmergencyActionsHook;

