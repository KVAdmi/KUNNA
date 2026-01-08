/**
 * KUNNA CORE ENGINE - LOGGER (JS)
 * 
 * Auditoría de decisiones en JavaScript puro.
 */

import supabase from '../../lib/customSupabaseClient.js';

class KCELogger {
  constructor() {
    this.memoryCache = [];
    this.MAX_CACHE_SIZE = 100;
  }

  async logDecision(decision) {
    try {
      // Guardar en cache
      this.memoryCache.push(decision);
      if (this.memoryCache.length > this.MAX_CACHE_SIZE) {
        this.memoryCache.shift();
      }

      // Persistir en Supabase
      const { error } = await supabase
        .from('ale_events')
        .insert({
          user_id: decision.user_id,
          event_type: 'kce_decision',
          event_data: {
            decision_id: decision.decision_id,
            triggered_by_event_id: decision.triggered_by_event_id,
            applied_rule: decision.applied_rule,
            actions: decision.actions,
            computed_risk_level: decision.computed_risk_level,
            timestamp: decision.timestamp
          },
          priority: this.mapRiskToPriority(decision.computed_risk_level),
          processed: true,
          timestamp: decision.timestamp
        });

      if (error) {
        console.error('❌ Error persistiendo decisión KCE:', error);
      } else {
        console.log(`💾 KCE: Decisión ${decision.decision_id} persistida`);
      }
    } catch (error) {
      console.error('❌ Error en KCE Logger:', error);
    }
  }

  async getDecisionsByUser(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('ale_events')
        .select('*')
        .eq('user_id', userId)
        .eq('event_type', 'kce_decision')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error obteniendo decisiones:', error);
        return this.memoryCache.filter(d => d.user_id === userId).slice(0, limit);
      }

      return data.map(row => ({
        decision_id: row.event_data.decision_id,
        user_id: row.user_id,
        triggered_by_event_id: row.event_data.triggered_by_event_id,
        applied_rule: row.event_data.applied_rule,
        actions: row.event_data.actions,
        computed_risk_level: row.event_data.computed_risk_level,
        timestamp: row.timestamp
      }));
    } catch (error) {
      console.error('❌ Error en getDecisionsByUser:', error);
      return this.memoryCache.filter(d => d.user_id === userId).slice(0, limit);
    }
  }

  mapRiskToPriority(riskLevel) {
    const mapping = {
      normal: 'low',
      alert: 'medium',
      risk: 'high',
      critical: 'critical'
    };
    return mapping[riskLevel] || 'medium';
  }

  getMemoryCache() {
    return [...this.memoryCache];
  }

  clearCache() {
    this.memoryCache = [];
  }
}

const kceLogger = new KCELogger();
export default kceLogger;
