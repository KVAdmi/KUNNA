/**
 * MODERACIÓN CON AL-E
 * 
 * Sistema de moderación automática para comentarios, chat y contenido
 * Protege a las usuarias de contenido tóxico, violento o inapropiado
 */

import aleCore from '../lib/aleCore';

class ModerationService {
  constructor() {
    this.strictMode = true;
    this.autoBlock = true;
  }

  /**
   * Moderar texto (comentario, mensaje, post)
   */
  async moderateText(text, context = {}) {
    try {
      // Verificación rápida de texto vacío
      if (!text || text.trim().length === 0) {
        return { safe: true, reason: 'empty' };
      }

      // Enviar a AL-E para análisis
      const result = await aleCore.moderateContent(text, 'text');

      return {
        safe: result.safe,
        flagged: !result.safe,
        categories: result.categories || [],
        severity: result.severity || 'none',
        reason: result.reason,
        action: result.action || 'allow',
        suggestion: result.suggestion
      };
    } catch (error) {
      console.error('Error en moderación:', error);
      // En caso de error, ser conservador
      return { 
        safe: false, 
        flagged: true, 
        error: true,
        reason: 'moderation_service_error',
        action: 'block'
      };
    }
  }

  /**
   * Moderar comentario antes de publicar
   */
  async moderateComment(comentario, userId, bookId) {
    try {
      const moderation = await this.moderateText(comentario, {
        type: 'comment',
        user_id: userId,
        book_id: bookId
      });

      if (!moderation.safe) {
        return {
          allowed: false,
          reason: this.getHumanReadableReason(moderation),
          severity: moderation.severity,
          categories: moderation.categories
        };
      }

      return {
        allowed: true,
        moderated: true,
        moderated_by: 'ale_auto'
      };
    } catch (error) {
      console.error('Error moderando comentario:', error);
      return {
        allowed: false,
        reason: 'No pudimos verificar tu comentario. Por favor, intenta de nuevo.',
        error: true
      };
    }
  }

  /**
   * Moderar mensaje de chat en tiempo real
   */
  async moderateChatMessage(mensaje, userId, roomId) {
    try {
      const moderation = await this.moderateText(mensaje, {
        type: 'chat',
        user_id: userId,
        room_id: roomId
      });

      if (!moderation.safe) {
        return {
          allowed: false,
          reason: this.getHumanReadableReason(moderation),
          severity: moderation.severity,
          intervention: this.getInterventionMessage(moderation)
        };
      }

      return {
        allowed: true,
        moderated: true
      };
    } catch (error) {
      console.error('Error moderando chat:', error);
      return {
        allowed: false,
        reason: 'No pudimos verificar tu mensaje.',
        error: true
      };
    }
  }

  /**
   * Moderar publicación de blog
   */
  async moderateBlogPost(titulo, contenido, userId) {
    try {
      // Moderar título y contenido por separado
      const [tituloMod, contenidoMod] = await Promise.all([
        this.moderateText(titulo, { type: 'blog_title' }),
        this.moderateText(contenido, { type: 'blog_content' })
      ]);

      if (!tituloMod.safe) {
        return {
          allowed: false,
          field: 'titulo',
          reason: this.getHumanReadableReason(tituloMod)
        };
      }

      if (!contenidoMod.safe) {
        return {
          allowed: false,
          field: 'contenido',
          reason: this.getHumanReadableReason(contenidoMod)
        };
      }

      return {
        allowed: true,
        moderated: true,
        moderated_by: 'ale_auto'
      };
    } catch (error) {
      console.error('Error moderando post:', error);
      return {
        allowed: false,
        reason: 'No pudimos verificar tu publicación.',
        error: true
      };
    }
  }

  /**
   * Verificar si un usuario está siendo tóxico repetidamente
   */
  async checkUserToxicityPattern(userId) {
    try {
      // Implementar lógica para detectar patrones de toxicidad
      // Por ahora, retornar falso
      return {
        is_toxic_user: false,
        flagged_content_count: 0,
        action_required: false
      };
    } catch (error) {
      console.error('Error verificando patrón de toxicidad:', error);
      return { is_toxic_user: false, error: true };
    }
  }

  /**
   * Mensajes humanos según categoría
   */
  getHumanReadableReason(moderation) {
    const { categories, severity } = moderation;

    if (categories.includes('violence') || categories.includes('threat')) {
      return '❌ Tu mensaje contiene lenguaje violento o amenazante. Este es un espacio seguro.';
    }

    if (categories.includes('hate') || categories.includes('harassment')) {
      return '❌ Detectamos lenguaje ofensivo o de acoso. Mantengamos el respeto.';
    }

    if (categories.includes('sexual')) {
      return '❌ Este contenido no es apropiado para este espacio.';
    }

    if (categories.includes('self-harm')) {
      return '💜 Notamos que podrías necesitar apoyo. ¿Quieres hablar con alguien de nuestro equipo?';
    }

    if (categories.includes('toxic')) {
      return '⚠️ Tu mensaje podría ser hiriente para otras personas. ¿Podrías reformularlo?';
    }

    return '⚠️ Tu contenido no cumple con nuestras normas de comunidad segura.';
  }

  /**
   * Mensaje de intervención cuando se detecta contenido problemático
   */
  getInterventionMessage(moderation) {
    const { categories, severity } = moderation;

    if (categories.includes('self-harm')) {
      return {
        title: '💜 Estamos aquí para ti',
        message: 'Notamos que podrías estar pasando por un momento difícil. ¿Te gustaría hablar con alguien del equipo de apoyo de KUNNA?',
        actions: ['Hablar con alguien', 'Ahora no']
      };
    }

    if (severity === 'high') {
      return {
        title: '🛡️ Espacio seguro',
        message: 'KUNNA es un espacio de respeto y cuidado mutuo. Tu mensaje no pudo ser enviado.',
        actions: ['Entiendo']
      };
    }

    return {
      title: '⚠️ Contenido no permitido',
      message: 'Tu mensaje contiene contenido que no está permitido en KUNNA.',
      actions: ['Entiendo']
    };
  }

  /**
   * Reportar contenido manualmente (para revisión humana)
   */
  async reportContent(contentId, contentType, reason, reportedBy) {
    try {
      // Guardar reporte en base de datos
      console.log('📢 Contenido reportado:', {
        contentId,
        contentType,
        reason,
        reportedBy
      });

      return {
        success: true,
        message: 'Gracias por ayudarnos a mantener KUNNA seguro. Revisaremos esto pronto.'
      };
    } catch (error) {
      console.error('Error reportando contenido:', error);
      return {
        success: false,
        error: true
      };
    }
  }
}

// Instancia singleton
const moderationService = new ModerationService();

export default moderationService;
