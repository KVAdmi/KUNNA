-- TABLA: secretos_seguros
-- Bóveda segura para información sensible

CREATE TABLE IF NOT EXISTS secretos_seguros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('password', 'documento', 'contacto', 'medico', 'evidencia')),
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL, -- Encriptado en el cliente (futuro)
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Solo el owner puede ver/modificar sus secretos
ALTER TABLE secretos_seguros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven solo sus secretos"
  ON secretos_seguros FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan sus secretos"
  ON secretos_seguros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan sus secretos"
  ON secretos_seguros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus secretos"
  ON secretos_seguros FOR DELETE
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_secretos_user ON secretos_seguros(user_id);
CREATE INDEX idx_secretos_categoria ON secretos_seguros(categoria);
