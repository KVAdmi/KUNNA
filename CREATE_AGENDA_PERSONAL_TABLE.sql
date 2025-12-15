-- =============================================
-- CREAR TABLA AGENDA_PERSONAL
-- Para el módulo de Agenda Personal de KUNNA
-- =============================================

CREATE TABLE IF NOT EXISTS public.agenda_personal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Datos del evento
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  notificar BOOLEAN DEFAULT false,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

ALTER TABLE agenda_personal ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo ven sus propios eventos
CREATE POLICY "Users can view own agenda events"
ON agenda_personal FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios pueden crear sus propios eventos
CREATE POLICY "Users can create own agenda events"
ON agenda_personal FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios eventos
CREATE POLICY "Users can update own agenda events"
ON agenda_personal FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios eventos
CREATE POLICY "Users can delete own agenda events"
ON agenda_personal FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_agenda_personal_updated_at
BEFORE UPDATE ON agenda_personal
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_agenda_user_id ON agenda_personal(user_id);
CREATE INDEX idx_agenda_fecha ON agenda_personal(fecha);
CREATE INDEX idx_agenda_user_fecha ON agenda_personal(user_id, fecha);

-- =============================================
-- VERIFICAR CREACIÓN
-- =============================================

SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'agenda_personal'
ORDER BY ordinal_position;

-- =============================================
-- COMENTARIO
-- =============================================

COMMENT ON TABLE agenda_personal IS 
'Agenda personal de la usuaria KUNNA - eventos, citas, recordatorios';
