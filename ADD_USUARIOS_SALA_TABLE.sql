-- =============================================
-- CREAR TABLA USUARIOS_SALA
-- Para trackear qué usuarios están en qué salas de chat
-- =============================================

CREATE TABLE IF NOT EXISTS public.usuarios_sala (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sala_id UUID NOT NULL REFERENCES public.salas_comunidad(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Control de sesión
  ingreso_en TIMESTAMPTZ DEFAULT NOW(),
  salio_en TIMESTAMPTZ,
  duracion_minutos INTEGER,
  
  -- Metadatos
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT usuarios_sala_unique UNIQUE (sala_id, user_id, ingreso_en)
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_sala_user ON usuarios_sala(user_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_sala_sala ON usuarios_sala(sala_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_sala_activo ON usuarios_sala(user_id, sala_id) WHERE salio_en IS NULL;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_sala_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Calcular duración si está saliendo
  IF NEW.salio_en IS NOT NULL AND OLD.salio_en IS NULL THEN
    NEW.duracion_minutos = EXTRACT(EPOCH FROM (NEW.salio_en - NEW.ingreso_en)) / 60;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_sala_timestamp
BEFORE UPDATE ON usuarios_sala
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_sala_updated_at();

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

ALTER TABLE usuarios_sala ENABLE ROW LEVEL SECURITY;

-- Usuarios pueden ver quién está en las salas públicas
CREATE POLICY "Users can view room participants"
ON usuarios_sala FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM salas_comunidad
    WHERE salas_comunidad.id = usuarios_sala.sala_id
    AND (salas_comunidad.privada = false OR salas_comunidad.privada IS NULL)
  )
);

-- Usuarios pueden insertar su propia entrada de sala
CREATE POLICY "Users can join rooms"
ON usuarios_sala FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar su propia entrada (para marcar salida)
CREATE POLICY "Users can update their own room sessions"
ON usuarios_sala FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Comentario descriptivo
COMMENT ON TABLE usuarios_sala IS 'Trackea qué usuarios están activos en qué salas de chat de la comunidad KUNNA';
