-- CREATE_CIRCULO_MESSAGES_TABLE.sql
-- Versión alineada con el esquema ya existente en producción

-- 1. Crear tabla circulo_messages (si no existe)
CREATE TABLE IF NOT EXISTS circulo_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circulo_id UUID REFERENCES circulos_confianza(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'ubicacion', 'alerta', 'check_in')),
  metadata JSONB DEFAULT '{}',
  ale_moderation JSONB,
  ale_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 2. Índices para rendimiento (idempotentes)
CREATE INDEX IF NOT EXISTS idx_circulo_messages_circulo_id ON circulo_messages(circulo_id);
CREATE INDEX IF NOT EXISTS idx_circulo_messages_sender_id ON circulo_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_circulo_messages_created_at ON circulo_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_circulo_messages_moderation ON circulo_messages(ale_approved) WHERE ale_approved = false;

-- 3. RLS: Solo miembros del círculo pueden ver/enviar mensajes
ALTER TABLE circulo_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Miembros ven mensajes de su círculo" ON circulo_messages;
DROP POLICY IF EXISTS "Miembros envían mensajes a su círculo" ON circulo_messages;
DROP POLICY IF EXISTS "Usuarios editan sus mensajes" ON circulo_messages;
DROP POLICY IF EXISTS "Usuarios borran sus mensajes" ON circulo_messages;

CREATE POLICY "Miembros ven mensajes de su círculo"
  ON circulo_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE id = circulo_messages.circulo_id
      AND (user_id = auth.uid() OR auth.uid() = ANY(miembros))
    )
  );

CREATE POLICY "Miembros envían mensajes a su círculo"
  ON circulo_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE id = circulo_messages.circulo_id
      AND (user_id = auth.uid() OR auth.uid() = ANY(miembros))
    )
  );

CREATE POLICY "Usuarios editan sus mensajes"
  ON circulo_messages FOR UPDATE
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Usuarios borran sus mensajes"
  ON circulo_messages FOR DELETE
  USING (auth.uid() = sender_id);

COMMENT ON TABLE circulo_messages IS 'Mensajes del chat de círculos con moderación AL-E';
