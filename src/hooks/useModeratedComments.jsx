/**
 * HOOK DE COMENTARIOS CON MODERACIÓN AL-E
 * 
 * Hook reutilizable para comentarios con moderación automática
 */

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import moderationService from '../services/moderationService';
import aleObserver from '../services/aleObserver';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useModeratedComments(bookId, chapterId) {
  const { user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  /**
   * Cargar comentarios
   */
  const cargarComentarios = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            nombre_completo,
            avatar_url
          )
        `)
        .eq('chapter_id', chapterId)
        .eq('moderated', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComentarios(data || []);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      toast.error('Error al cargar comentarios');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Enviar comentario con moderación
   */
  const enviarComentario = async (contenido, parentId = null) => {
    if (!contenido.trim()) {
      toast.error('El comentario no puede estar vacío');
      return { success: false };
    }

    setEnviando(true);

    try {
      // 1. MODERAR CON AL-E
      toast.loading('Verificando comentario...', { id: 'moderating' });

      const moderation = await moderationService.moderateComment(
        contenido,
        user.id,
        bookId
      );

      if (!moderation.allowed) {
        toast.dismiss('moderating');
        toast.error(moderation.reason, { duration: 5000 });
        
        // Registrar intento de comentario rechazado
        aleObserver.track('comment_rejected', {
          book_id: bookId,
          chapter_id: chapterId,
          reason: moderation.reason,
          severity: moderation.severity
        });

        return { success: false, reason: moderation.reason };
      }

      toast.dismiss('moderating');
      toast.loading('Publicando comentario...', { id: 'posting' });

      // 2. INSERTAR EN BD
      const { data, error } = await supabase
        .from('comments')
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          contenido,
          parent_id: parentId,
          moderated: true,
          moderated_by: 'ale_auto'
        })
        .select(`
          *,
          profiles:user_id (
            nombre_completo,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      toast.dismiss('posting');
      toast.success('✅ Comentario publicado');

      // 3. NOTIFICAR A AL-E
      aleObserver.trackCommentPosted(bookId, chapterId);

      // 4. RECARGAR COMENTARIOS
      await cargarComentarios();

      return { success: true, data };
    } catch (error) {
      console.error('Error enviando comentario:', error);
      toast.dismiss('posting');
      toast.error('Error al publicar comentario');
      return { success: false, error };
    } finally {
      setEnviando(false);
    }
  };

  /**
   * Reportar comentario
   */
  const reportarComentario = async (comentarioId, razon) => {
    try {
      await moderationService.reportContent(
        comentarioId,
        'comment',
        razon,
        user.id
      );

      toast.success('Gracias por tu reporte. Lo revisaremos pronto.');
    } catch (error) {
      console.error('Error reportando comentario:', error);
      toast.error('Error al reportar comentario');
    }
  };

  return {
    comentarios,
    cargando,
    enviando,
    cargarComentarios,
    enviarComentario,
    reportarComentario
  };
}

export default useModeratedComments;
