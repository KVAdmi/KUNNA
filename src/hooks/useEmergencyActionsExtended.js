// Enviar SMS automáticamente a contactos de emergencia (solo nativo)
async function enviarSMSContactos(mensaje) {
  try {
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.SMS) {
      console.warn('Plugin SMS no disponible. Solo funciona en app nativa.');
      return;
    }
    for (const contact of contacts) {
      const telefono = contact.telefono.replace(/\D/g, '');
      if (!telefono || telefono.length < 10) continue;
      try {
        await window.Capacitor.Plugins.SMS.send({
          numbers: [telefono],
          message: mensaje
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error('Error enviando SMS:', err);
      }
    }
  } catch (error) {
    console.error('Error global SMS:', error);
  }
}
// Enviar audio y ubicación a contactos automáticamente
async function enviarAudioYUbicacionAContactos(audioUrl) {
  try {
    // Obtener ubicación actual
    let position;
    try {
      position = await preciseLocationService.getCurrentPosition({ requireHighAccuracy: true, timeout: 10000, retries: 2 });
    } catch (err) {
      position = { latitude: '--', longitude: '--' };
    }
    // Mensaje de emergencia
    const mensaje = `🚨 EMERGENCIA KUNNA 🚨\n\nLa usuaria necesita ayuda.\n\nUbicación: https://maps.google.com/?q=${position.latitude},${position.longitude}\nAudio del entorno: ${audioUrl}`;
    // Enviar por SMS automáticamente si es nativo
    await enviarSMSContactos(mensaje);
    // Enviar por WhatsApp como fallback
    for (const contact of contacts) {
      const telefono = contact.telefono.replace(/\D/g, '');
      if (!telefono || telefono.length < 10) continue;
      const urlScheme = `whatsapp://send?text=${encodeURIComponent(mensaje)}`;
      const urlWeb = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensaje)}`;
      try {
        const { AppLauncher } = await loadCapacitorAPIs();
        if (AppLauncher) {
          await AppLauncher.openUrl({ url: urlScheme });
        } else {
          window.open(urlWeb, '_blank');
        }
      } catch (err) {
        console.error('[SOS] Error WhatsApp audio:', err);
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.error('Error al enviar audio y ubicación:', error);
  }
}
// src/hooks/useEmergencyActionsExtended.js
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import supabase from '@/lib/customSupabaseClient';
import preciseLocationService from '@/lib/preciseLocationService';
import { Capacitor } from '@capacitor/core';
import { getTrackingUrl } from '@/config/tracking';
import { Media } from '@capacitor-community/media';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// 🎙️ AUDIO NATIVO - Variables globales para el loop
let audioLoopInterval = null;
let isRecordingNow = false;

// 🎙️ Función para grabar UN chunk de 30s y subirlo
async function recordAndUploadAudioChunk() {
  if (isRecordingNow) {
    console.log('[AUDIO NATIVO] Ya hay grabación en progreso, saltando...');
    return;
  }

  const acompId = window.__currentAcompId;
  const userId = (await supabase.auth.getUser())?.data?.user?.id;

  if (!acompId || !userId) {
    console.error('[AUDIO NATIVO] Sin acompId o userId');
    return;
  }

  try {
    isRecordingNow = true;
    console.log('[AUDIO NATIVO] 🎙️ Iniciando grabación chunk 30s...');

    // Iniciar grabación nativa
    const { uri } = await Media.startRecording({
      outputFormat: 'aac',
      audioQuality: 'high',
      duration: 30000
    });

    console.log('[AUDIO NATIVO] ✅ Grabación URI:', uri);
    await new Promise(resolve => setTimeout(resolve, 30000));

    const { uri: finalUri } = await Media.stopRecording();
    console.log('[AUDIO NATIVO] ✅ Grabación completada:', finalUri);

    const fileData = await Filesystem.readFile({ 
      path: finalUri,
      directory: Directory.Data
    });

    const byteString = atob(fileData.data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const audioBlob = new Blob([uint8Array], { type: 'audio/aac' });
    const fileName = `${userId}/${acompId}/audio_${Date.now()}.m4a`;

    const { data, error } = await supabase.storage
      .from('audios-panico')
      .upload(fileName, audioBlob, {
        contentType: 'audio/aac',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    await supabase.from('evidencias_sos').insert({
      acompanamiento_id: acompId,
      user_id: userId,
      tipo: 'audio',
      archivo_nombre: fileName.split('/').pop(),
      archivo_path: fileName,
      archivo_size_bytes: audioBlob.size,
      duracion_segundos: 30,
      metadata: { 
        format: 'm4a',
        native: true,
        plugin: '@capacitor-community/media'
      }
    });

    console.log('[AUDIO NATIVO] ✅ Chunk subido y registrado:', fileName);
  } catch (error) {
    console.error('[AUDIO NATIVO] ❌ Error en chunk:', error);
  } finally {
    isRecordingNow = false;
  }
}

async function startNativeAudioLoop() {
  if (audioLoopInterval) {
    console.log('[AUDIO NATIVO] Loop ya iniciado');
    return;
  }
  console.log('[AUDIO NATIVO] 🔄 Iniciando loop continuo...');
  await recordAndUploadAudioChunk();
  audioLoopInterval = setInterval(async () => {
    await recordAndUploadAudioChunk();
  }, 32000);
}

async function stopNativeAudioLoop() {
  if (audioLoopInterval) {
    clearInterval(audioLoopInterval);
    audioLoopInterval = null;
    console.log('[AUDIO NATIVO] ✅ Loop detenido');
  }
  if (isRecordingNow) {
    try {
      await Media.stopRecording();
    } catch (err) {
      console.error('[AUDIO NATIVO] Error deteniendo:', err);
    }
  }
  isRecordingNow = false;
}

const useEmergencyActionsExtended = () => {
  // Listener para evento nativo de voz (Android bridge)
  useEffect(() => {
    let pluginListener;
    if (Capacitor.isNativePlatform() && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ZinhaBridgePlugin) {
      pluginListener = window.Capacitor.Plugins.ZinhaBridgePlugin.addListener('zinhavoice', async (data) => {
        if (data && data.comando === 'detener') {
          await detenerTodo();
        }
      });
    }
    return () => {
      if (pluginListener && pluginListener.remove) pluginListener.remove();
    };
  }, []);
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // 🔄 Función para cargar APIs dinámicamente y de forma segura
  const loadCapacitorAPIs = async () => {
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

  // 📱 Cargar contactos al montar
  useEffect(() => {
    if (user) {
      loadEmergencyContacts();
    }
  }, [user]);

  const loadEmergencyContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contactos_emergencia')
        .select('*')
        .eq('user_id', user.id)
        .order('prioridad', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error cargando contactos:', error);
    }
  };

  // Asegura token ANTES de cualquier post/insert
  const ensureActiveToken = async (userId) => {
    // 1) si ya hay uno en memoria/estado, úsalo
    let token = window?.currentAcompanamientoToken || null;

    // 2) si no, intenta traer el activo desde Supabase
    if (!token) {
      const { data, error } = await supabase
        .from('acompanamientos_activos')
        .select('token')
        .eq('user_id', userId)
        .eq('activo', true)
        .limit(1)
        .maybeSingle();
      if (error) console.warn('[SOS] No hay activo previo:', error);
      token = data?.token || null;
    }

    // 3) si sigue sin token, créalo ahora
    if (!token) {
      const nuevo = crypto?.randomUUID?.() || String(Date.now());
      const { error: insErr } = await supabase.from('acompanamientos_activos').insert({
        user_id: userId,
        token: nuevo,
        inicio: new Date().toISOString(),
        activo: true,
        ruta_seguimiento: [],
      });
      if (insErr) throw insErr;
      token = nuevo;
    }

    window.currentAcompanamientoToken = token;
    return token;
  };

  // 👥 ACOMPAÑAMIENTO EN TIEMPO REAL
  const toggleCompanionship = async () => {
  // Solicitar permisos de audio y video antes de iniciar cualquier acción
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    await navigator.mediaDevices.getUserMedia({ video: true });
    console.log('[PERMISOS] Audio y video permitidos');
  } catch (err) {
    toast({ title: '❌ Permiso denegado', description: 'Debes permitir acceso a micrófono y cámara para activar el acompañamiento.' });
    console.error('[PERMISOS] Error permisos audio/video:', err);
    return;
  }
  console.log('[SOS] toggleCompanionship llamado. isFollowing:', isFollowing);
  if (!user || !user.id) {
    toast({ title: '❌ Error de sesión', description: 'No hay usuario logueado. Inicia sesión primero.' });
    console.error('[SOS] No hay usuario logueado');
    return;
  }
  if (!contacts || contacts.length === 0) {
    toast({ title: '⚠️ Sin contactos', description: 'Configura contactos de emergencia primero.' });
    console.error('[SOS] No hay contactos configurados');
    return;
  }

    // --- LÓGICA PARA DETENER EL SEGUIMIENTO ---
    if (isFollowing) {
    try {
      await preciseLocationService.stopWatch();
      
      // 🛑 DETENER GRABACIÓN NATIVA DE AUDIO
      try {
        await stopNativeAudioLoop();
        console.log('[SOS] ✅ Audio nativo detenido');
      } catch (audioErr) {
        console.error('[SOS] Error al detener audio nativo:', audioErr);
      }
      
      setIsFollowing(false);
      if (window.__currentTrackingToken) {
        await supabase.from('acompanamientos_activos')
          .update({ activo: false, fin: new Date().toISOString() })
          .eq('token', window.__currentTrackingToken);
        window.__currentTrackingToken = null;
        window.__currentAcompId = null;
        toast({
          title: '🔒 Acompañamiento finalizado',
          description: 'Has llegado a tu destino de forma segura.'
        });
      }
    } catch (error) {
      console.error('[SOS] Error al finalizar seguimiento:', error);
      toast({
        title: '⚠️ Error al finalizar',
        description: 'El seguimiento puede seguir activo. Intenta de nuevo.'
      });
    }
    return;
    }

    // --- LÓGICA PARA INICIAR EL SEGUIMIENTO ---
    try {
      toast({ 
        title: '🚶‍♀️ Iniciando acompañamiento...',
        description: 'Verificando permisos y creando enlace seguro.'
      });

      // Paso 1: Crear el registro de seguimiento en la BD para obtener el token.
      let acompanamiento_id, token, trackingUrl;
      try {
        const { data, error } = await supabase.rpc('iniciar_seguimiento_tiempo_real_v2', {
          p_user_id: user.id,
          p_destino: 'Acompañamiento en tiempo real',
          p_contacto_emergencia: contacts[0]?.telefono || 'No configurado'
        });

        if (error) throw error;

        const result = Array.isArray(data) ? data[0] : data;
          acompanamiento_id = result?.id;
          token = result?.token;
        trackingUrl = result?.url_seguimiento || result?.url || null;

        if (!token || !trackingUrl) {
          throw new Error('No se recibió un token o URL de seguimiento válidos.');
        }
      } catch (err) {
        toast({ title: '❌ Error de Red', description: 'No se pudo crear el evento de acompañamiento.' });
        console.error('[SOS] Error RPC seguimiento:', err);
        return;
      }

      // Guardar token globalmente TAN PRONTO como se obtenga.
      window.__currentTrackingToken = token;
      window.__currentAcompId = acompanamiento_id; // 💾 Guardar ID para evidencias

      // Paso 2: Obtener la ubicación inicial del GPS.
      let position;
      try {
        position = await preciseLocationService.getCurrentPosition({
          requireHighAccuracy: true,
          timeout: 10000,
          retries: 2
        });
        console.log('[GPS-NATIVO] Posición obtenida:', position);
      } catch (err) {
        toast({ title: '❌ Error de ubicación', description: 'No se pudo obtener tu ubicación. Verifica los permisos.' });
        console.error('[SOS] Error de ubicación:', err);
        // Si falla la ubicación, es importante detener el acompañamiento para no dejar registros fantasma.
        await supabase.from('acompanamientos_activos').update({ activo: false, fin: new Date().toISOString() }).eq('token', token);
        window.__currentTrackingToken = null;
        return;
      }

      // Paso 3: Actualizar el registro recién creado con la ubicación inicial.
      try {
        const { error: locError } = await supabase.from('acompanamientos_activos').update({
          latitud_actual: position.latitude,
          longitud_actual: position.longitude,
          precision_metros: Math.round(position.accuracy),
          ubicacion_actual: {
            type: 'Point',
            coordinates: [position.longitude, position.latitude]
          },
          ultima_actualizacion_ubicacion: new Date().toISOString()
        }).eq('token', token); // Usar el token que acabamos de obtener.

        if (locError) throw locError;
        console.log('[SUPABASE] Ubicación inicial registrada');
      } catch (err) {
        toast({ title: '❌ Error al registrar ubicación', description: 'No se pudo guardar la ubicación inicial.' });
        console.error('[SUPABASE] Error ubicación:', err);
        // También limpiar si este paso falla.
        await supabase.from('acompanamientos_activos').update({ activo: false, fin: new Date().toISOString() }).eq('token', token);
        window.__currentTrackingToken = null;
        return;
      }

      // El resto del flujo continúa como antes...
      // Iniciar servicio de seguimiento
    try {
        await preciseLocationService.startBackgroundTaskWatch({ token });
      } catch (err) {
        toast({ title: '❌ Error', description: 'No se pudo iniciar el seguimiento en segundo plano.' });
        console.error('[SOS] Error BG tracking:', err);
        return;
      }

      // Generar la URL pública real para seguimiento
      const trackingUrlPublic = getTrackingUrl(token);

      // Abrir URL de seguimiento en nueva pestaña
    try {
        window.open(trackingUrlPublic, "_blank");
      } catch (err) {
        toast({ title: '⚠️ Error al abrir tracking', description: 'No se pudo abrir el enlace de seguimiento.' });
        console.error('[SOS] Error al abrir tracking:', err);
      }

      // 📱 FIX 4: MENSAJE AUTOMÁTICO A CONTACTOS DE EMERGENCIA
      const horaActual = new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const mensajeSOS = `� SOS KUNNA ACTIVADO

Estoy en una situación de riesgo. Sigue mi ubicación en tiempo real aquí:
${trackingUrlPublic}

Hora: ${horaActual}

Si el link deja de actualizar, llama a emergencias.`;

      // Enviar a TODOS los contactos usando Share nativo o WhatsApp
      for (const contact of contacts) {
        const telefono = contact.telefono.replace(/\D/g, '');
        if (!telefono || telefono.length < 10) {
          console.error('[SOS] Número inválido para contacto:', contact.telefono);
          continue;
        }

        try {
          // Usar Share nativo si está disponible (Capacitor)
          if (Capacitor.isNativePlatform()) {
            await Share.share({
              title: '🚨 SOS KUNNA ACTIVADO',
              text: mensajeSOS,
              url: trackingUrlPublic,
              dialogTitle: `Compartir SOS con ${contact.nombre || telefono}`
            });
          } else {
            // Fallback web: abrir WhatsApp
            const urlWeb = `https://wa.me/52${telefono}?text=${encodeURIComponent(mensajeSOS)}`;
            window.open(urlWeb, '_blank');
          }
          
          // Delay entre envíos para no saturar
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (err) {
          console.error('[SOS] Error enviando a contacto:', contact.nombre, err);
        }
      }

      toast({
        title: '✅ SOS enviado',
        description: `Mensaje compartido con ${contacts.length} contacto(s)`
      });

      setIsFollowing(true);
      
      // 🎙️ INICIAR GRABACIÓN NATIVA DE AUDIO EN LOOP
      try {
        await startNativeAudioLoop();
        console.log('[SOS] ✅ Audio nativo iniciado en loop continuo');
      } catch (audioErr) {
        console.error('[SOS] Error al iniciar audio nativo:', audioErr);
        toast({ 
          title: '⚠️ Audio no disponible', 
          description: 'El tracking continúa sin grabación de audio.'
        });
      }
      
      toast({ 
        title: '✅ ¡Acompañamiento activo!',
        description: 'Grabando audio nativo cada 30s. Ubicación en tiempo real.'
      });

    } catch (error) {
      console.error('Error al iniciar acompañamiento:', error);
      toast({ title: '❌ Error al iniciar', description: error.message });
      await preciseLocationService.stopWatch();
      setIsFollowing(false);
    }
  };

  // 📞 LLAMADA SEGURA
  const reproducirLlamadaSegura = async () => {
    try {
      const { data } = supabase.storage
        .from('audios-seguridad')
        .getPublicUrl('Amiga Molesta.mp3');

      const audioUrl = data?.publicUrl;

      if (!audioUrl) {
        toast({
          title: '❌ Error',
          description: 'No se encontró el audio'
        });
        return;
      }

      const audio = new Audio(audioUrl);
      await audio.play();

      toast({
        title: '📞 Llamada segura',
        description: 'Reproduciendo audio...'
      });

    } catch (error) {
      console.error('Error en llamada segura:', error);
      toast({
        title: '❌ Error',
        description: error.message
      });
    }
  };

  // 🚨 SIRENA DE EMERGENCIA
  const reproducirSirena = async () => {
    try {
      const audio = new Audio('/audio/sos_alerta.mp3');
      audio.volume = 1.0; // Volumen máximo
      await audio.play();

      toast({
        title: '🚨 ¡ALERTA ACTIVADA!',
        description: 'Reproduciendo sirena de emergencia'
      });

    } catch (error) {
      console.error('Error al reproducir sirena:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo reproducir la sirena'
      });
    }
  };

  // 🔐 NOTIFICACIÓN SILENCIOSA
  const enviarNotificacionSilenciosa = async () => {
    try {
      if (contacts.length === 0) {
        toast({
          title: '⚠️ Sin contactos',
          description: 'Configura contactos primero'
        });
        return;
      }

      const mensaje = encodeURIComponent('🔐 Notificación silenciosa activada desde Zinha');
      const { AppLauncher } = await loadCapacitorAPIs();

      for (const contact of contacts) {
        const telefono = contact.telefono.replace(/\D/g, '');
        const url = `https://wa.me/52${telefono}?text=${mensaje}`;

        if (AppLauncher) {
          await AppLauncher.openUrl({ url });
        } else {
          window.open(url, '_blank');
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      toast({
        title: '✅ Notificación enviada',
        description: 'Contactos notificados silenciosamente'
      });

    } catch (error) {
      console.error('Error al enviar notificación:', error);
      toast({
        title: '❌ Error',
        description: error.message
      });
    }
  };

  // 📸 CÁMARA SILENCIOSA
  const activarCamaraSilenciosa = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      const blob = await imageCapture.takePhoto();
      const fileName = `silenciosa_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('fotos-silenciosas')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Detener la cámara inmediatamente
      track.stop();

      toast({
        title: '📸 Foto capturada',
        description: 'Imagen guardada de forma segura'
      });

    } catch (error) {
      console.error('Error al capturar foto:', error);
      toast({
        title: '❌ Error de cámara',
        description: error.message
      });
    }
  };

  // Nueva función para capturar evidencia de cámara (imágenes o videos)
const capturarEvidenciaCamara = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoTracks = stream.getVideoTracks();
    const imageCapture = new ImageCapture(videoTracks[0]);

    const blob = await imageCapture.takePhoto();
    const nombreArchivo = `evidencia_${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('evidencia-camara')
      .upload(nombreArchivo, blob);

    if (error) {
      console.error("Error subiendo evidencia de cámara:", error);
      return;
    }

    await supabase.from('evidencia_camara').insert([
      {
        user_id: user.id,
        acompanamiento_id: acompanamientoId,
        archivo_nombre: nombreArchivo,
        archivo_url: data.path,
        tipo: 'imagen',
      },
    ]);
  } catch (error) {
    console.error("Error capturando evidencia de cámara:", error);
  }
};

  // 🛑 DETENER TODO
  const detenerTodo = async () => {
    try {
      // Detener audio nativo si está activo
      await stopNativeAudioLoop();

      // Detener seguimiento si está activo
      if (isFollowing) {
        await toggleCompanionship();
      }

      toast({ 
        title: '🛑 Comandos detenidos por voz', 
        description: 'Todas las acciones de emergencia detenidas'
      });

    } catch (error) {
      console.error('Error al detener todo:', error);
      toast({ 
        title: '❌ Error', 
        description: 'No se pudieron detener todas las acciones'
      });
    }
  };

  return {
    contacts,
    isFollowing,
    isRecording,
    toggleCompanionship,
    reproducirLlamadaSegura,
    reproducirSirena,
    enviarNotificacionSilenciosa,
    activarCamaraSilenciosa,
    detenerTodo,
    loadEmergencyContacts
  };
};

export { useEmergencyActionsExtended };
export default useEmergencyActionsExtended;
