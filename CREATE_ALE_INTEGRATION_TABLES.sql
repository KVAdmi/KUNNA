-- ============================================
-- TABLAS PARA INTEGRACIÓN KUNNA + AL-E CORE
-- ============================================
-- Ejecutar en Supabase KUNNA SQL Editor

-- 1) OUTBOX: Eventos enviados a AL-E Core
CREATE TABLE IF NOT EXISTS kunna_ale_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- checkin_failed, inactivity, diary_entry, state_change, sos_manual
  payload JSONB NOT NULL,
  core_event_id TEXT, -- ID devuelto por Core
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'retry')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kunna_ale_outbox_user ON kunna_ale_outbox(user_id);
CREATE INDEX idx_kunna_ale_outbox_status ON kunna_ale_outbox(status);
CREATE INDEX idx_kunna_ale_outbox_created ON kunna_ale_outbox(created_at);
CREATE INDEX idx_kunna_ale_outbox_event_type ON kunna_ale_outbox(event_type);

-- 2) DECISIONS: Decisiones recibidas de AL-E Core
CREATE TABLE IF NOT EXISTS kunna_ale_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  core_event_id TEXT,
  core_decision_id TEXT,
  actions JSONB DEFAULT '[]'::jsonb,
  executed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kunna_ale_decisions_user ON kunna_ale_decisions(user_id);
CREATE INDEX idx_kunna_ale_decisions_core_event ON kunna_ale_decisions(core_event_id);

-- 3) ACTION LOGS: Registro de ejecución de acciones
CREATE TABLE IF NOT EXISTS kunna_ale_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  decision_id UUID REFERENCES kunna_ale_decisions(id),
  action_type TEXT NOT NULL, -- send_silent_verification, alert_trust_circle, escalate_full_sos, start_evidence_recording
  action_payload JSONB,
  result JSONB,
  status TEXT DEFAULT 'ok' CHECK (status IN ('ok', 'fail', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kunna_ale_action_logs_user ON kunna_ale_action_logs(user_id);
CREATE INDEX idx_kunna_ale_action_logs_decision ON kunna_ale_action_logs(decision_id);
CREATE INDEX idx_kunna_ale_action_logs_status ON kunna_ale_action_logs(status);

-- 4) Agregar last_activity_at a profiles si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 5) Agregar risk_level a profiles si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'risk_level'
  ) THEN
    ALTER TABLE profiles ADD COLUMN risk_level TEXT DEFAULT 'normal' CHECK (risk_level IN ('normal', 'alert', 'risk', 'critical'));
  END IF;
END $$;

-- Índice para queries de inactividad
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON profiles(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_profiles_risk_level ON profiles(risk_level);

COMMENT ON TABLE kunna_ale_outbox IS 'Eventos enviados desde KUNNA a AL-E Core';
COMMENT ON TABLE kunna_ale_decisions IS 'Decisiones recibidas de AL-E Core';
COMMENT ON TABLE kunna_ale_action_logs IS 'Log de ejecución de acciones devueltas por AL-E Core';
