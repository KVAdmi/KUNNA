

import { useState } from 'react';
import supabase from '@/lib/customSupabaseClient';
import preciseLocationService from '@/lib/preciseLocationService';

export default function BotonAuxilio() {
  const [grabando, setGrabando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const handleClick = async (e) => {
    // ⭐ CRÍTICO: Prevenir propagación del evento
    e.preventDefault();
    e.stopPropagation();
    
    if (grabando) return; // Evitar doble click

    try {
      setGrabando(true);
      setMensaje('🎤 Solicitando permisos de micrófono...');

      // 1. Solicitar permisos de micrófono Y ubicación PRIMERO
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Error micrófono:', err);
        alert('❌ No se pudo acceder al micrófono. Por favor permite el acceso en la configuración del navegador.');
        setGrabando(false);
        setMensaje('');
        return;
      }

      // 2. Solicitar permisos de ubicación
      if (!navigator.geolocation) {
        alert('❌ Tu dispositivo no soporta geolocalización');
        stream.getTracks().forEach(track => track.stop());
        setGrabando(false);
        setMensaje('');
        return;
      }

      setMensaje('🎯 Obteniendo ubicación de máxima precisión...');

      // 3. Obtener ubicación con máxima precisión usando el nuevo servicio
      let position;
      try {
        position = await preciseLocationService.getCurrentPosition({
          requireHighAccuracy: true,
          timeout: 20000,
          retries: 3
        });
        console.log(`🎯 [AUXILIO] Ubicación obtenida - Precisión: ${position.accuracy}m (Fuente: ${position.source})`);
      } catch (locationError) {
        console.error('Error ubicación de alta precisión:', locationError);
        
        // Fallback a geolocalización nativa si falla el servicio principal
        console.log('🔄 Intentando con geolocalización nativa como fallback...');
        const fallbackPosition = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({
              latitude: p.coords.latitude,
              longitude: p.coords.longitude,
              accuracy: p.coords.accuracy,
              timestamp: p.timestamp,
              source: 'fallback-native'
            }),
            (e) => reject(e),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
          )
        ).catch((e) => {
          console.error('Error ubicación fallback:', e);
          alert('❌ Error al obtener ubicación. Asegúrate de permitir el acceso.');
          return null;
        });
        
        if (!fallbackPosition) {
          stream.getTracks().forEach(track => track.stop());
          setGrabando(false);
          setMensaje('');
          return;
        }
        
        position = fallbackPosition;
        console.log(`⚠️ [AUXILIO-FALLBACK] Usando precisión: ${position.accuracy}m`);
      }

      const lat = position.latitude;
      const lon = position.longitude;

      setMensaje('👤 Verificando usuario...');

      // 4. Usuario actual
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user;
      if (!user) {
        alert('❌ Error: No hay sesión activa. Por favor inicia sesión.');
        stream.getTracks().forEach(track => track.stop());
        setGrabando(false);
        setMensaje('');
        return;
      }

      setMensaje('📞 Buscando contacto de emergencia...');

      // 5. Buscar contacto emergencia prioridad 2, si no hay, usa el único
      const { data: contactos, error: errContactos } = await supabase
        .from('contactos_emergencia')
        .select('*')
        .eq('user_id', user.id)
        .eq('activo', true)
        .order('prioridad', { ascending: true });

      if (errContactos) {
        console.error('Error contactos:', errContactos);
        alert('❌ Error al buscar contactos de emergencia: ' + errContactos.message);
        stream.getTracks().forEach(track => track.stop());
        setGrabando(false);
        setMensaje('');
        return;
      }

      if (!contactos || contactos.length === 0) {
        alert('❌ No tienes contactos de emergencia configurados. Ve a tu perfil y agrega al menos uno.');
        stream.getTracks().forEach(track => track.stop());
        setGrabando(false);
        setMensaje('');
        return;
      }

      let contacto = contactos.find(c => c.prioridad === 2) || contactos[0];
      const numero = (contacto.wa_e164 || contacto.telefono || '').replace(/\D/g, '');

      if (!numero) {
        alert('❌ Error: El contacto de emergencia no tiene número válido. Verifica la información del contacto.');
        stream.getTracks().forEach(track => track.stop());
        setGrabando(false);
        setMensaje('');
        return;
      }

      setMensaje('🎙️ GRABANDO AUDIO... (15 segundos)');

      // 6. Grabar audio exactamente 15 segundos
      const rec = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' 
      });
      const chunks = [];
      
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      const stopRec = () => new Promise((resolve) => { 
        rec.onstop = () => {
          stream.getTracks().forEach(track => track.stop()); // Liberar micrófono
          resolve();
        };
        rec.stop(); 
      });
      
      rec.start();
      
      // Mostrar countdown
      let countdown = 15;
      const countdownInterval = setInterval(() => {
        countdown--;
        setMensaje(`🎙️ GRABANDO... ${countdown} segundos restantes`);
        if (countdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);
      
      setTimeout(() => { 
        clearInterval(countdownInterval);
        if (rec.state === 'recording') {
          rec.stop();
        }
      }, 15000);
      
      await stopRec();

      setMensaje('☁️ Subiendo audio...');

      // 7. Subir audio al bucket audios-panico
      const blob = new Blob(chunks, { type: 'audio/webm' });
      if (blob.size === 0) {
        alert('❌ Error: No se pudo grabar audio. Intenta de nuevo.');
        setGrabando(false);
        setMensaje('');
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
        alert('❌ Error al subir audio: ' + upErr.message);
        setGrabando(false);
        setMensaje('');
        return;
      }

      const { data: pub } = supabase.storage.from('audios-panico').getPublicUrl(fileName);
      const audioUrl = pub.publicUrl;

      setMensaje('📱 Preparando mensaje...');

      // 8. Crear el mensaje EXACTO según especificaciones CON PRECISIÓN
      const mensajeWA = `Esta persona está en peligro.

Audio de emergencia: ${audioUrl}

Ubicación actual: https://maps.google.com/?q=${lat},${lon}
Precisión: ${Math.round(position.accuracy)}m (${position.source})

⚠️ Mensaje enviado desde Zinha App - Sistema de Emergencia`;

      setMensaje('📲 Abriendo WhatsApp...');

      // 9. Abrir WhatsApp (prevenir que se propague)
      setTimeout(() => {
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensajeWA)}`, "_blank");
      }, 500);

      // 10. Guardar en eventos_peligro
      const { error: insertErr } = await supabase.from('eventos_peligro').insert({
        user_id: user.id,
        latitud: lat,
        longitud: lon,
        mensaje: mensajeWA,
        enviado: true,
        creado_en: new Date().toISOString()
      });

      if (insertErr) {
        console.error('Error al guardar evento:', insertErr);
        // No alertamos al usuario, es secundario
      }

      setMensaje('✅ ¡Alerta enviada exitosamente!');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMensaje('');
      }, 3000);

    } catch (e) {
      console.error('Error inesperado:', e);
      alert('❌ Error inesperado: ' + e.message);
      setMensaje('❌ Error al enviar alerta');
      setTimeout(() => {
        setMensaje('');
      }, 3000);
    } finally {
      setGrabando(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={grabando}
      className="bg-red-800 text-white text-xl rounded-xl px-6 py-4 shadow-lg w-full touch-manipulation"
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        outline: 'none'
      }}
    >
      {grabando ? '⏳ Procesando...' : '🔴 AUXILIO'}
      {mensaje && (
        <div className="mt-2 text-sm font-normal leading-tight">
          {mensaje}
        </div>
      )}
    </button>
  );
}
