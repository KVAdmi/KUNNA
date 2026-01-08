-- =====================================================
-- SCHEMA COMPLETO PARA AL-E Y NUEVAS FUNCIONALIDADES
-- =====================================================

-- 1. TABLA DE EVENTOS DE AL-E (Observador)
-- =====================================================
CREATE TABLE IF NOT EXISTS ale_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices idempotentes para ale_events
CREATE INDEX IF NOT EXISTS idx_ale_events_user_id ON ale_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ale_events_timestamp ON ale_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ale_events_type ON ale_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ale_events_priority ON ale_events(priority);

-- 2. TABLA DE PATRONES DE USUARIO (Analyzer)
-- =====================================================
CREATE TABLE IF NOT EXISTS ale_user_patterns (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  patterns JSONB NOT NULL DEFAULT '{}',
  typical_activity_hours INTEGER[],
  typical_inactivity_hours NUMERIC DEFAULT 8,
  frequent_locations JSONB DEFAULT '[]',
  common_routes JSONB DEFAULT '[]',
  baseline_established BOOLEAN DEFAULT false,
  last_analysis TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CÍRCULOS DE CONFIANZA
-- =====================================================
CREATE TABLE IF NOT EXISTS circulos_confianza (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Mi Círculo',
  miembros UUID[] NOT NULL DEFAULT '{}',
  alertas_activas BOOLEAN DEFAULT true,
  nivel_acceso TEXT DEFAULT 'basico' CHECK (nivel_acceso IN ('basico', 'completo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_circulos_user_id ON circulos_confianza(user_id);

-- 4. ESTADOS DE USUARIO (para círculos)
-- =====================================================
CREATE TABLE IF NOT EXISTS estados_usuario (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'en_silencio', 'en_riesgo', 'emergencia')),
  ultima_actividad TIMESTAMPTZ DEFAULT NOW(),
  tracking_activo BOOLEAN DEFAULT false,
  analisis_ale JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SALIDAS PROGRAMADAS (Citas)
-- =====================================================
CREATE TABLE IF NOT EXISTS salidas_programadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  fecha_hora TIMESTAMPTZ NOT NULL,
  lugar TEXT,
  coordenadas JSONB, -- {lat, lng}
  persona_contacto TEXT,
  telefono_contacto TEXT,
  check_ins_requeridos INTEGER[] DEFAULT '{30, 60, 120}', -- minutos
  check_ins_completados INTEGER[] DEFAULT '{}',
  estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'activa', 'completada', 'cancelada', 'alerta')),
  ale_monitoring BOOLEAN DEFAULT true,
  notas TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salidas_user_id ON salidas_programadas(user_id);
CREATE INDEX IF NOT EXISTS idx_salidas_fecha ON salidas_programadas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_salidas_estado ON salidas_programadas(estado);

-- 6. CHECK-INS DE SALIDAS
-- =====================================================
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salida_id UUID REFERENCES salidas_programadas(id) ON DELETE CASCADE,
  programado_minutos INTEGER NOT NULL,
  completado BOOLEAN DEFAULT false,
  ubicacion JSONB,
  notas TEXT,
  ale_verification JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_checkins_salida_id ON check_ins(salida_id);

-- 7. EMERGENCIAS ACTIVAS
-- =====================================================
CREATE TABLE IF NOT EXISTS emergencias_activas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  fase_actual TEXT CHECK (fase_actual IN ('fase1', 'fase2', 'fase3')),
  datos JSONB NOT NULL DEFAULT '{}',
  activa BOOLEAN DEFAULT true,
  tracking_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_emergencias_user_id ON emergencias_activas(user_id);
CREATE INDEX IF NOT EXISTS idx_emergencias_activa ON emergencias_activas(activa);

-- 8. NOTIFICACIONES DEL CÍRCULO
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones_circulo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circulo_id UUID REFERENCES circulos_confianza(id) ON DELETE CASCADE,
  destinatario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB DEFAULT '{}',
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  leida_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notif_circulo_destinatario ON notificaciones_circulo(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notif_circulo_leida ON notificaciones_circulo(leida);

-- 9. ACTUALIZAR TABLA EVIDENCIAS_SOS (si no existe)
-- =====================================================
CREATE TABLE IF NOT EXISTS evidencias_sos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acompanamiento_id UUID REFERENCES acompanamientos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('audio', 'video', 'foto', 'screenshot', 'gps')),
  archivo_nombre TEXT,
  archivo_path TEXT,
  archivo_url TEXT,
  archivo_size INTEGER,
  duracion_segundos INTEGER,
  metadata JSONB DEFAULT '{}',
  ubicacion JSONB,
  cifrado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidencias_acomp_id ON evidencias_sos(acompanamiento_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_user_id ON evidencias_sos(user_id);
CREATE INDEX IF NOT EXISTS idx_evidencias_tipo ON evidencias_sos(tipo);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- AL-E Events
ALTER TABLE ale_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus propios eventos" ON ale_events;
DROP POLICY IF EXISTS "Usuarios crean sus propios eventos" ON ale_events;

CREATE POLICY "Usuarios ven sus propios eventos"
  ON ale_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios crean sus propios eventos"
  ON ale_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AL-E Patterns
ALTER TABLE ale_user_patterns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus propios patrones" ON ale_user_patterns;
DROP POLICY IF EXISTS "Sistema actualiza patrones" ON ale_user_patterns;

CREATE POLICY "Usuarios ven sus propios patrones"
  ON ale_user_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema actualiza patrones"
  ON ale_user_patterns FOR ALL
  USING (true);

-- Círculos de Confianza
ALTER TABLE circulos_confianza ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven su círculo" ON circulos_confianza;
DROP POLICY IF EXISTS "Usuarios gestionan su círculo" ON circulos_confianza;

CREATE POLICY "Usuarios ven su círculo"
  ON circulos_confianza FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = ANY(miembros));

CREATE POLICY "Usuarios gestionan su círculo"
  ON circulos_confianza FOR ALL
  USING (auth.uid() = user_id);

-- Estados de Usuario
ALTER TABLE estados_usuario ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven su estado y de su círculo" ON estados_usuario;
DROP POLICY IF EXISTS "Usuarios actualizan su estado" ON estados_usuario;

CREATE POLICY "Usuarios ven su estado y de su círculo"
  ON estados_usuario FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE user_id = estados_usuario.user_id
      AND auth.uid() = ANY(miembros)
    )
  );

CREATE POLICY "Usuarios actualizan su estado"
  ON estados_usuario FOR ALL
  USING (auth.uid() = user_id);

-- Salidas Programadas
ALTER TABLE salidas_programadas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus salidas" ON salidas_programadas;
DROP POLICY IF EXISTS "Usuarios gestionan sus salidas" ON salidas_programadas;

CREATE POLICY "Usuarios ven sus salidas"
  ON salidas_programadas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus salidas"
  ON salidas_programadas FOR ALL
  USING (auth.uid() = user_id);

-- Check-ins
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven check-ins de sus salidas" ON check_ins;
DROP POLICY IF EXISTS "Usuarios crean check-ins" ON check_ins;

CREATE POLICY "Usuarios ven check-ins de sus salidas"
  ON check_ins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM salidas_programadas
      WHERE id = check_ins.salida_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios crean check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM salidas_programadas
      WHERE id = check_ins.salida_id
      AND user_id = auth.uid()
    )
  );

-- Emergencias Activas
ALTER TABLE emergencias_activas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus emergencias y de su círculo" ON emergencias_activas;
DROP POLICY IF EXISTS "Sistema gestiona emergencias" ON emergencias_activas;

CREATE POLICY "Usuarios ven sus emergencias y de su círculo"
  ON emergencias_activas FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE circulos_confianza.user_id = emergencias_activas.user_id
      AND auth.uid() = ANY(miembros)
    )
  );

CREATE POLICY "Sistema gestiona emergencias"
  ON emergencias_activas FOR ALL
  USING (true);

-- Notificaciones Círculo
ALTER TABLE notificaciones_circulo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus notificaciones" ON notificaciones_circulo;
DROP POLICY IF EXISTS "Sistema crea notificaciones" ON notificaciones_circulo;

CREATE POLICY "Usuarios ven sus notificaciones"
  ON notificaciones_circulo FOR SELECT
  USING (auth.uid() = destinatario_id);

CREATE POLICY "Sistema crea notificaciones"
  ON notificaciones_circulo FOR INSERT
  WITH CHECK (true);

-- Evidencias SOS
ALTER TABLE evidencias_sos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios ven sus evidencias" ON evidencias_sos;
DROP POLICY IF EXISTS "Sistema crea evidencias" ON evidencias_sos;

CREATE POLICY "Usuarios ven sus evidencias"
  ON evidencias_sos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema crea evidencias"
  ON evidencias_sos FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener miembros del círculo
CREATE OR REPLACE FUNCTION get_circulo_miembros(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  nombre_completo TEXT,
  telefono TEXT,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.nombre_completo,
    p.telefono,
    COALESCE(e.estado, 'activa') as estado
  FROM circulos_confianza c
  CROSS JOIN UNNEST(c.miembros) AS miembro_id
  JOIN profiles p ON p.user_id = miembro_id
  LEFT JOIN estados_usuario e ON e.user_id = miembro_id
  WHERE c.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE ale_events IS 'Eventos capturados por AL-E Observer para análisis de patrones';
COMMENT ON TABLE ale_user_patterns IS 'Patrones de comportamiento analizados por AL-E';
COMMENT ON TABLE circulos_confianza IS 'Redes privadas de apoyo de cada usuaria';
COMMENT ON TABLE estados_usuario IS 'Estado actual de cada usuaria visible para su círculo';
COMMENT ON TABLE salidas_programadas IS 'Citas y salidas con check-ins de seguridad';
COMMENT ON TABLE emergencias_activas IS 'Emergencias en curso gestionadas por AL-E Guardian';
