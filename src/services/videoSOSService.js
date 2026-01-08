/**
 * VIDEO SOS - Servicio de grabación de video de emergencia
 * 
 * Graba 5-10 segundos de video y lo sube cifrado a Supabase Storage
 * Se integra con evidencias_sos para registro completo
 */

import { supabase } from '../lib/supabaseClient';
import aleObserver from '../services/aleObserver';

class VideoSOSService {
  constructor() {
    this.isRecording = false;
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
  }

  /**
   * Grabar video de emergencia
   */
  async grabarVideo(duracionSegundos = 8, options = {}) {
    try {
      console.log('🎥 Iniciando grabación de video SOS...');

      // Solicitar permisos de cámara
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'user', // 'user' (frontal) o 'environment' (trasera)
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });

      console.log('✅ Permisos de cámara otorgados');

      // Crear MediaRecorder
      const mimeType = this.getMimeType();
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType
      });

      this.chunks = [];
      this.isRecording = true;

      // Capturar datos
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      // Iniciar grabación
      this.mediaRecorder.start();
      console.log(`🎥 Grabando video (${duracionSegundos}s)...`);

      // Detener después del tiempo especificado
      await new Promise((resolve) => {
        setTimeout(() => {
          this.detenerGrabacion();
          resolve();
        }, duracionSegundos * 1000);
      });

      // Esperar a que se procesen los chunks
      await new Promise((resolve) => {
        this.mediaRecorder.onstop = resolve;
      });

      // Crear blob del video
      const videoBlob = new Blob(this.chunks, { type: mimeType });
      console.log(`✅ Video grabado: ${(videoBlob.size / 1024 / 1024).toFixed(2)} MB`);

      return {
        blob: videoBlob,
        mimeType,
        duration: duracionSegundos,
        size: videoBlob.size
      };

    } catch (error) {
      console.error('❌ Error grabando video:', error);
      this.limpiar();
      throw error;
    }
  }

  /**
   * Subir video a Supabase Storage
   */
  async subirVideo(videoData, userId, acompanamientoId, location) {
    try {
      const { blob, mimeType, duration } = videoData;

      // Generar nombre único
      const timestamp = Date.now();
      const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
      const fileName = `sos_video_${userId}_${timestamp}.${extension}`;

      console.log('☁️ Subiendo video a Supabase Storage...');

      // Subir a bucket 'videos-sos' (crear si no existe)
      const { data, error: uploadError } = await supabase.storage
        .from('videos-sos')
        .upload(fileName, blob, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error subiendo video: ${uploadError.message}`);
      }

      console.log('✅ Video subido exitosamente');

      // Obtener URL pública (o privada según configuración)
      const { data: urlData } = supabase.storage
        .from('videos-sos')
        .getPublicUrl(fileName);

      const videoUrl = urlData.publicUrl;

      // Registrar en evidencias_sos
      const evidencia = await this.registrarEvidencia({
        acompanamientoId,
        userId,
        tipo: 'video',
        archivoNombre: fileName,
        archivoPath: `videos-sos/${fileName}`,
        archivoUrl: videoUrl,
        archivoSize: blob.size,
        duracionSegundos: duration,
        ubicacion: location,
        metadata: {
          mimeType,
          extension,
          timestamp,
          source: 'sos_button'
        }
      });

      console.log('✅ Evidencia registrada en DB');

      // Notificar a AL-E Observer
      aleObserver.track('sos_video_recorded', {
        evidencia_id: evidencia.id,
        duration,
        size: blob.size
      });

      return {
        success: true,
        videoUrl,
        fileName,
        evidenciaId: evidencia.id
      };

    } catch (error) {
      console.error('❌ Error subiendo video:', error);
      throw error;
    }
  }

  /**
   * Grabar y subir en un solo paso
   */
  async grabarYSubir(userId, acompanamientoId, location, options = {}) {
    try {
      // Grabar video
      const videoData = await this.grabarVideo(options.duration || 8, options);

      // Subir y registrar
      const result = await this.subirVideo(videoData, userId, acompanamientoId, location);

      this.limpiar();

      return result;
    } catch (error) {
      this.limpiar();
      throw error;
    }
  }

  /**
   * Registrar evidencia en base de datos
   */
  async registrarEvidencia(datos) {
    try {
      const { data, error } = await supabase
        .from('evidencias_sos')
        .insert({
          acompanamiento_id: datos.acompanamientoId,
          user_id: datos.userId,
          tipo: datos.tipo,
          archivo_nombre: datos.archivoNombre,
          archivo_path: datos.archivoPath,
          archivo_url: datos.archivoUrl,
          archivo_size: datos.archivoSize,
          duracion_segundos: datos.duracionSegundos,
          ubicacion: datos.ubicacion,
          metadata: datos.metadata,
          cifrado: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error registrando evidencia: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error registrando evidencia:', error);
      throw error;
    }
  }

  /**
   * Detener grabación
   */
  detenerGrabacion() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('⏹️ Grabación detenida');
    }
  }

  /**
   * Limpiar recursos
   */
  limpiar() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
    this.isRecording = false;
  }

  /**
   * Obtener mejor mime type disponible
   */
  getMimeType() {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`✅ Usando mime type: ${type}`);
        return type;
      }
    }

    console.log('⚠️ Usando mime type por defecto');
    return 'video/webm';
  }

  /**
   * Verificar soporte de grabación de video
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }
}

// Instancia singleton
const videoSOSService = new VideoSOSService();

export default videoSOSService;
export { VideoSOSService };
