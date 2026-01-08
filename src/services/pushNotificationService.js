// src/services/pushNotificationService.js
// Servicio de notificaciones push para alertas del círculo

import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '../config/supabaseClient';

class PushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.token = null;
  }

  /**
   * Inicializar servicio de notificaciones
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Solo en plataformas nativas
      if (!Capacitor.isNativePlatform()) {
        console.log('[Push] No es plataforma nativa, usando LocalNotifications');
        await this.initializeLocalNotifications();
        return;
      }

      // Pedir permisos
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        
        // Escuchar token de registro
        PushNotifications.addListener('registration', (token) => {
          console.log('[Push] Token registrado:', token.value);
          this.token = token.value;
          this.saveTokenToDatabase(token.value);
        });

        // Escuchar errores de registro
        PushNotifications.addListener('registrationError', (error) => {
          console.error('[Push] Error de registro:', error);
        });

        // Escuchar notificaciones recibidas
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('[Push] Notificación recibida:', notification);
          this.handleNotificationReceived(notification);
        });

        // Escuchar acciones en notificaciones
        PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('[Push] Acción en notificación:', action);
          this.handleNotificationAction(action);
        });

        this.isInitialized = true;
        console.log('[Push] Inicializado correctamente');
      } else {
        console.warn('[Push] Permisos no concedidos');
      }
    } catch (error) {
      console.error('[Push] Error inicializando:', error);
    }
  }

  /**
   * Inicializar notificaciones locales (fallback)
   */
  async initializeLocalNotifications() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display === 'granted') {
        this.isInitialized = true;
        console.log('[LocalNotifications] Inicializado correctamente');
      }
    } catch (error) {
      console.error('[LocalNotifications] Error:', error);
    }
  }

  /**
   * Guardar token en base de datos
   */
  async saveTokenToDatabase(token) {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase
        .from('usuarios')
        .update({ 
          push_token: token,
          push_token_updated_at: new Date().toISOString()
        })
        .eq('id', user.data.user.id);

      console.log('[Push] Token guardado en BD');
    } catch (error) {
      console.error('[Push] Error guardando token:', error);
    }
  }

  /**
   * Enviar notificación local
   */
  async sendLocalNotification({ title, body, data = {}, id = null }) {
    try {
      const notificationId = id || Date.now();

      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId,
          title,
          body,
          extra: data,
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          smallIcon: 'ic_stat_kunna',
          largeIcon: 'ic_launcher'
        }]
      });

      console.log('[LocalNotification] Enviada:', title);
    } catch (error) {
      console.error('[LocalNotification] Error:', error);
    }
  }

  /**
   * Notificación de cambio de estado del círculo
   */
  async notifyCircleStateChange(memberName, newState) {
    const titles = {
      'en_riesgo': '⚠️ Alerta del Círculo',
      'emergencia': '🚨 EMERGENCIA',
      'en_silencio': '💤 Estado del Círculo'
    };

    const bodies = {
      'en_riesgo': `${memberName} está en riesgo y podría necesitar apoyo`,
      'emergencia': `${memberName} está en EMERGENCIA - Revisa inmediatamente`,
      'en_silencio': `${memberName} cambió a estado "En Silencio"`
    };

    await this.sendLocalNotification({
      title: titles[newState] || '📢 Actualización del Círculo',
      body: bodies[newState] || `${memberName} actualizó su estado`,
      data: {
        type: 'circle_state_change',
        state: newState,
        member: memberName
      }
    });
  }

  /**
   * Notificación de check-in pendiente
   */
  async notifyCheckInPending(salidaTitulo, minutosRetrasados) {
    await this.sendLocalNotification({
      title: '⏰ Check-in Pendiente',
      body: `${salidaTitulo}: Llevas ${minutosRetrasados} min sin confirmar`,
      data: {
        type: 'check_in_pending',
        salida: salidaTitulo,
        minutos: minutosRetrasados
      }
    });
  }

  /**
   * Notificación de escalamiento activado
   */
  async notifyEscalationTriggered(fase, memberName = null) {
    const messages = {
      'fase1': {
        title: '📢 Alerta Suave',
        body: memberName 
          ? `${memberName} podría necesitar apoyo. Se notificó al círculo.`
          : 'Tu círculo fue notificado - Podrías necesitar apoyo'
      },
      'fase2': {
        title: '⚠️ Escalamiento Fase 2',
        body: memberName
          ? `${memberName} necesita ayuda urgente. Llamadas iniciadas.`
          : 'Se iniciaron llamadas automáticas a tus contactos'
      },
      'fase3': {
        title: '🚨 EMERGENCIA CRÍTICA',
        body: memberName
          ? `${memberName} está en emergencia total. Contacta inmediatamente.`
          : 'Emergencia total activada - Tracking público compartido'
      }
    };

    const msg = messages[fase] || messages.fase1;

    await this.sendLocalNotification({
      title: msg.title,
      body: msg.body,
      data: {
        type: 'escalation',
        fase,
        member: memberName
      }
    });
  }

  /**
   * Notificación de contenido moderado
   */
  async notifyContentModerated(reason) {
    await this.sendLocalNotification({
      title: '🛡️ Mensaje Bloqueado',
      body: `Tu mensaje fue bloqueado por ${reason}. Tu bienestar es importante.`,
      data: {
        type: 'content_moderated',
        reason
      }
    });
  }

  /**
   * Notificación de video SOS grabado
   */
  async notifyVideoSOSRecorded() {
    await this.sendLocalNotification({
      title: '📹 Video de Emergencia',
      body: 'Video de seguridad grabado y guardado correctamente',
      data: {
        type: 'video_sos'
      }
    });
  }

  /**
   * Manejar notificación recibida mientras app está en foreground
   */
  handleNotificationReceived(notification) {
    console.log('[Push] Manejando notificación:', notification);
    
    // Mostrar alerta o toast según el tipo
    if (notification.data?.type === 'emergencia') {
      // Mostrar alerta crítica
      if (window.confirm(`🚨 ${notification.title}\n\n${notification.body}\n\n¿Ver detalles?`)) {
        // Navegar a la pantalla correspondiente
        window.location.href = '/circulo';
      }
    }
  }

  /**
   * Manejar acción en notificación (cuando usuario toca)
   */
  handleNotificationAction(action) {
    console.log('[Push] Manejando acción:', action);
    
    const data = action.notification.data;
    
    switch (data?.type) {
      case 'circle_state_change':
      case 'escalation':
        window.location.href = '/circulo';
        break;
        
      case 'check_in_pending':
        window.location.href = '/salidas';
        break;
        
      case 'content_moderated':
        // No hacer nada, solo informar
        break;
        
      default:
        window.location.href = '/';
    }
  }

  /**
   * Cancelar todas las notificaciones pendientes
   */
  async cancelAll() {
    try {
      await LocalNotifications.cancel({ notifications: [] });
      console.log('[Push] Todas las notificaciones canceladas');
    } catch (error) {
      console.error('[Push] Error cancelando notificaciones:', error);
    }
  }

  /**
   * Obtener notificaciones pendientes
   */
  async getPending() {
    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('[Push] Error obteniendo pendientes:', error);
      return [];
    }
  }
}

// Singleton
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
