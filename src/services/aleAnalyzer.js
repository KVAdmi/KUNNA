/**
 * AL-E ANALYZER - Analizador de Patrones
 * 
 * Procesa eventos y detecta patrones de comportamiento
 * Identifica rutinas, anomalías y señales de riesgo
 */

import { requestDecision } from './eventsClient';
import { supabase } from '../lib/supabaseClient';

class ALEAnalyzer {
  constructor() {
    this.patterns = {};
    this.baselines = {};
  }

  /**
   * Analizar patrones completos de usuario
   */
  async analyzeUserPatterns(userId, timeframe = '7d') {
    try {
      // Obtener eventos históricos
      const events = await this.getHistoricalEvents(userId, timeframe);
      
      // Enviar a AL-E para análisis profundo
      const analysis = await requestDecision({
        context: { userId, timeframe, events },
        prompt: 'Analizar patrones de comportamiento del usuario'
      });
      
      // Guardar patrones detectados
      await this.savePatterns(userId, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error analizando patrones:', error);
      return null;
    }
  }

  /**
   * Detectar desviaciones de rutina
   */
  async detectDeviations(userId, currentEvent) {
    try {
      // Obtener baseline del usuario
      const baseline = await this.getUserBaseline(userId);
      
      if (!baseline) {
        console.log('⚠️ No hay baseline para usuario:', userId);
        return { hasDeviation: false, reason: 'no_baseline' };
      }

      // Comparar evento actual con patrones históricos
      const deviation = await this.compareWithBaseline(currentEvent, baseline);
      
      return deviation;
    } catch (error) {
      console.error('Error detectando desviaciones:', error);
      return { hasDeviation: false, error: true };
    }
  }

  /**
   * Evaluar riesgo basado en contexto
   */
  async assessRisk(userId, situation) {
    try {
      // Obtener contexto completo del usuario
      const context = await this.getUserContext(userId);
      
      // Enviar a AL-E para evaluación de riesgo
      const riskAssessment = await requestDecision({
        context: {
          ...situation,
          user_context: context,
          historical_patterns: this.patterns[userId]
        },
        prompt: 'Evaluar nivel de riesgo de la situación actual'
      });
      
      return riskAssessment;
    } catch (error) {
      console.error('Error evaluando riesgo:', error);
      return { level: 'unknown', error: true };
    }
  }

  /**
   * Detectar inactividad inusual
   */
  async detectUnusualInactivity(userId) {
    try {
      const { data: lastActivity } = await supabase
        .from('ale_events')
        .select('timestamp')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (!lastActivity) return { unusual: false };

      const hoursSinceActivity = (Date.now() - new Date(lastActivity.timestamp)) / (1000 * 60 * 60);
      
      // Obtener patrón de actividad normal
      const baseline = await this.getUserBaseline(userId);
      const typicalInactivity = baseline?.typical_inactivity_hours || 8;

      if (hoursSinceActivity > typicalInactivity * 1.5) {
        return {
          unusual: true,
          hours: hoursSinceActivity,
          expected: typicalInactivity,
          severity: hoursSinceActivity > typicalInactivity * 2 ? 'high' : 'medium'
        };
      }

      return { unusual: false, hours: hoursSinceActivity };
    } catch (error) {
      console.error('Error detectando inactividad:', error);
      return { unusual: false, error: true };
    }
  }

  /**
   * Analizar cambios de estado emocional
   */
  async analyzeEmotionalState(userId, recentEntries) {
    try {
      const userContext = await this.getUserContext(userId);
      const analysis = await requestDecision({
        context: {
          user_id: userId,
          entries: recentEntries,
          context: userContext
        },
        prompt: 'Analizar estado emocional basado en entradas recientes'
      });

      return analysis;
    } catch (error) {
      console.error('Error analizando estado emocional:', error);
      return null;
    }
  }

  /**
   * Detectar patrones de ubicación
   */
  async analyzeLocationPatterns(userId, locations) {
    try {
      // Identificar lugares frecuentes
      const frequentLocations = this.identifyFrequentLocations(locations);
      
      // Detectar rutas habituales
      const commonRoutes = this.identifyCommonRoutes(locations);
      
      // Identificar horarios por ubicación
      const locationSchedules = this.identifyLocationSchedules(locations);

      return {
        frequent_locations: frequentLocations,
        common_routes: commonRoutes,
        schedules: locationSchedules
      };
    } catch (error) {
      console.error('Error analizando ubicaciones:', error);
      return null;
    }
  }

  /**
   * Helpers privados
   */
  async getHistoricalEvents(userId, timeframe) {
    const days = parseInt(timeframe.replace('d', ''));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ale_events')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', since)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserBaseline(userId) {
    const { data } = await supabase
      .from('ale_user_patterns')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  async savePatterns(userId, patterns) {
    const { error } = await supabase
      .from('ale_user_patterns')
      .upsert({
        user_id: userId,
        patterns: patterns,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error guardando patrones:', error);
    }
  }

  async getUserContext(userId) {
    // Obtener contexto completo del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: recentEvents } = await supabase
      .from('ale_events')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    return {
      profile,
      recent_events: recentEvents,
      timestamp: new Date().toISOString()
    };
  }

  compareWithBaseline(event, baseline) {
    // Lógica de comparación con baseline
    // Esto será expandido según necesidades específicas
    const eventTime = new Date(event.timestamp).getHours();
    const typicalTimes = baseline.typical_activity_hours || [];

    const isUnusualTime = !typicalTimes.includes(eventTime);
    
    return {
      hasDeviation: isUnusualTime,
      type: isUnusualTime ? 'unusual_time' : 'normal',
      severity: isUnusualTime ? 'medium' : 'low'
    };
  }

  identifyFrequentLocations(locations) {
    // Agrupar ubicaciones cercanas
    const locationClusters = {};
    
    locations.forEach(loc => {
      const key = `${Math.round(loc.latitude * 100)}_${Math.round(loc.longitude * 100)}`;
      locationClusters[key] = (locationClusters[key] || 0) + 1;
    });

    return Object.entries(locationClusters)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ location: key, visits: count }));
  }

  identifyCommonRoutes(locations) {
    // Identificar secuencias comunes de ubicaciones
    // Implementación simplificada
    return [];
  }

  identifyLocationSchedules(locations) {
    // Identificar horarios típicos por ubicación
    // Implementación simplificada
    return {};
  }
}

// Instancia singleton
const aleAnalyzer = new ALEAnalyzer();

export default aleAnalyzer;
