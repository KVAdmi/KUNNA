// 🎙️ SISTEMA DE AUDIO NATIVO CON @capacitor-community/media
// Para reemplazar en useEmergencyActionsExtended.js

import { Media } from '@capacitor-community/media';
import { Filesystem, Directory } from '@capacitor/filesystem';
import supabase from '@/lib/customSupabaseClient';

// Variables globales para el loop
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
      outputFormat: 'aac', // M4A/AAC nativo
      audioQuality: 'high',
      duration: 30000 // 30 segundos
    });

    console.log('[AUDIO NATIVO] ✅ Grabación URI:', uri);

    // Esperar 30 segundos
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Detener y obtener archivo
    const { uri: finalUri } = await Media.stopRecording();
    console.log('[AUDIO NATIVO] ✅ Grabación completada:', finalUri);

    // Leer archivo del filesystem nativo
    const fileData = await Filesystem.readFile({ 
      path: finalUri,
      directory: Directory.Data
    });

    // Convertir Base64 a Blob
    const byteString = atob(fileData.data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const audioBlob = new Blob([uint8Array], { type: 'audio/aac' });

    // Nombre de archivo
    const fileName = `${userId}/${acompId}/audio_${Date.now()}.m4a`;

    // Upload a Supabase Storage
    const { data, error } = await supabase.storage
      .from('audios-panico')
      .upload(fileName, audioBlob, {
        contentType: 'audio/aac',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Guardar metadata en evidencias_sos
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

// 🎙️ Iniciar loop continuo de grabación
export async function startNativeAudioLoop() {
  if (audioLoopInterval) {
    console.log('[AUDIO NATIVO] Loop ya iniciado');
    return;
  }

  console.log('[AUDIO NATIVO] 🔄 Iniciando loop continuo...');

  // Primera grabación inmediata
  await recordAndUploadAudioChunk();

  // Loop cada 32 segundos (30s grabación + 2s buffer)
  audioLoopInterval = setInterval(async () => {
    await recordAndUploadAudioChunk();
  }, 32000);
}

// 🛑 Detener loop de grabación
export async function stopNativeAudioLoop() {
  if (audioLoopInterval) {
    clearInterval(audioLoopInterval);
    audioLoopInterval = null;
    console.log('[AUDIO NATIVO] ✅ Loop detenido');
  }

  // Si hay grabación en curso, intentar detenerla
  if (isRecordingNow) {
    try {
      await Media.stopRecording();
    } catch (err) {
      console.error('[AUDIO NATIVO] Error deteniendo:', err);
    }
  }

  isRecordingNow = false;
}
