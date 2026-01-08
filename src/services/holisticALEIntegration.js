/**
 * INTEGRACIÓN DE AL-E EN ZONA HOLÍSTICA
 * 
 * Wrapper que agrega interpretación emocional personalizada
 * a las lecturas de tarot, numerología y astrología
 */

import aleCore from '../lib/aleCore';
import aleObserver from '../services/aleObserver';

class HolisticALEIntegration {
  /**
   * Interpretar lectura completa con AL-E
   */
  async interpretarLectura(lecturaData, userProfile) {
    try {
      console.log('🔮 AL-E interpretando lectura holística...');

      // Notificar a Observer
      aleObserver.trackHolisticReading(lecturaData.tipo);

      // Enviar a AL-E para interpretación personalizada
      const interpretation = await aleCore.interpretHolistic(lecturaData, {
        nombre: userProfile.nombre,
        fecha_nacimiento: userProfile.fechaNacimiento,
        contexto_emocional: userProfile.contextoEmocional || 'neutral',
        pregunta: userProfile.pregunta || null
      });

      return {
        ...lecturaData,
        interpretacion_ale: interpretation.interpretation,
        mensaje_personal: interpretation.personal_message,
        consejos: interpretation.practical_advice || [],
        reflexion: interpretation.reflection_prompt,
        tono: interpretation.tone || 'warm'
      };
    } catch (error) {
      console.error('Error en interpretación AL-E:', error);
      // Fallback: retornar lectura sin interpretación
      return {
        ...lecturaData,
        interpretacion_ale: null,
        mensaje_personal: this.getMensajeFallback(lecturaData)
      };
    }
  }

  /**
   * Interpretar Tarot con AL-E
   */
  async interpretarTarot(cartaData, userContext) {
    try {
      const lectura = {
        tipo: 'tarot',
        carta: {
          nombre: cartaData.name,
          significado_directo: cartaData.meaning_up,
          significado_invertido: cartaData.meaning_rev,
          descripcion: cartaData.desc,
          imagen_url: cartaData.img
        }
      };

      return await this.interpretarLectura(lectura, userContext);
    } catch (error) {
      console.error('Error interpretando tarot:', error);
      return { ...cartaData, error: true };
    }
  }

  /**
   * Interpretar Numerología con AL-E
   */
  async interpretarNumerologia(numerosData, userContext) {
    try {
      const lectura = {
        tipo: 'numerology',
        numeros: numerosData
      };

      return await this.interpretarLectura(lectura, userContext);
    } catch (error) {
      console.error('Error interpretando numerología:', error);
      return { ...numerosData, error: true };
    }
  }

  /**
   * Interpretar Astrología con AL-E
   */
  async interpretarAstrologia(astroData, userContext) {
    try {
      const lectura = {
        tipo: 'astrology',
        astrologia: {
          signo: astroData.signo,
          elemento: astroData.elemento,
          horoscopo_diario: astroData.horoscopo?.diario,
          horoscopo_semanal: astroData.horoscopo?.semanal
        }
      };

      return await this.interpretarLectura(lectura, userContext);
    } catch (error) {
      console.error('Error interpretando astrología:', error);
      return { ...astroData, error: true };
    }
  }

  /**
   * Generar mensaje combinado (tarot + numerología + astrología)
   */
  async generarMensajeCombinado(todasLecturas, userContext) {
    try {
      console.log('🔮 AL-E generando síntesis holística...');

      const synthesis = await aleCore.request('/holistic/synthesize', {
        readings: todasLecturas,
        user_profile: userContext,
        focus: 'empowerment',
        language: 'es-MX'
      });

      return {
        titulo: synthesis.title || '✨ Tu Mensaje Holístico',
        mensaje_principal: synthesis.main_message,
        mensaje_apertura: synthesis.opening,
        mensaje_cierre: synthesis.closing,
        reflexiones: synthesis.reflections || [],
        acciones_sugeridas: synthesis.suggested_actions || [],
        afirmacion: synthesis.affirmation,
        energia_del_dia: synthesis.daily_energy
      };
    } catch (error) {
      console.error('Error generando mensaje combinado:', error);
      return this.getMensajeCombianadoFallback(todasLecturas);
    }
  }

  /**
   * Mensaje fallback si AL-E no responde
   */
  getMensajeFallback(lecturaData) {
    const mensajes = {
      tarot: '🔮 Esta carta te invita a reflexionar sobre tu camino actual. Cada símbolo tiene un mensaje único para ti.',
      numerology: '🔢 Los números revelan patrones importantes en tu vida. Observa cómo resuenan contigo.',
      astrology: '⭐ Tu carta astral es única. Las estrellas te acompañan en tu viaje personal.'
    };

    return mensajes[lecturaData.tipo] || '✨ Tómate un momento para conectar con esta información.';
  }

  /**
   * Mensaje combinado fallback
   */
  getMensajeCombianadoFallback(lecturas) {
    return {
      titulo: '✨ Tu Lectura Holística',
      mensaje_principal: 'Cada símbolo y número tiene un mensaje especial para ti. Reflexiona sobre cómo resuenan en tu vida actual.',
      mensaje_apertura: 'Las energías cósmicas se alinean para mostrarte tu camino.',
      mensaje_cierre: 'Confía en tu intuición. Ella sabe el camino.',
      reflexiones: [
        '¿Qué sensación te generan estos símbolos?',
        '¿Qué área de tu vida necesita más atención?',
        '¿Qué mensaje resuena más contigo?'
      ],
      acciones_sugeridas: [
        'Medita 5 minutos con esta información',
        'Escribe en tu diario personal',
        'Comparte con alguien de confianza'
      ],
      afirmacion: 'Merezco claridad y paz en mi camino.',
      energia_del_dia: 'Introspección y autocuidado'
    };
  }

  /**
   * Formatear para UI
   */
  formatearParaUI(interpretacionALE) {
    if (!interpretacionALE) return null;

    return {
      principal: interpretacionALE.mensaje_personal,
      interpretacion: interpretacionALE.interpretacion_ale,
      consejos: interpretacionALE.consejos,
      reflexion: interpretacionALE.reflexion,
      mostrarALE: true
    };
  }
}

// Instancia singleton
const holisticALE = new HolisticALEIntegration();

export default holisticALE;
export { HolisticALEIntegration };
