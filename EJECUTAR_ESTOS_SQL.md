# 📋 SQL PENDIENTES DE EJECUTAR

## ⚡ INSTRUCCIONES RÁPIDAS (5 minutos)

1. Abre Supabase Dashboard: https://supabase.com/dashboard
2. Ve a tu proyecto KUNNA
3. Click en **SQL Editor** (ícono de rayo en el menú izquierdo)
4. Click en **New Query**
5. Copia y pega cada SQL de abajo
6. Click en **Run** (o Ctrl/Cmd + Enter)

---

## 🔥 SQL #1: Tabla de Chat para Círculos (2 min)

**Archivo:** `CREATE_CIRCULO_MESSAGES_TABLE.sql`

```sql
-- =====================================================
-- TABLA DE MENSAJES PARA CÍRCULOS DE CONFIANZA
-- =====================================================

CREATE TABLE IF NOT EXISTS circulo_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circulo_id UUID REFERENCES circulos_confianza(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  tipo TEXT DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagen', 'ubicacion', 'alerta', 'check_in')),
  metadata JSONB DEFAULT '{}',
  ale_moderation JSONB, -- Resultado de moderación de AL-E
  ale_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Índices para rendimiento
CREATE INDEX idx_circulo_messages_circulo_id ON circulo_messages(circulo_id);
CREATE INDEX idx_circulo_messages_sender_id ON circulo_messages(sender_id);
CREATE INDEX idx_circulo_messages_created_at ON circulo_messages(created_at DESC);
CREATE INDEX idx_circulo_messages_moderation ON circulo_messages(ale_approved) WHERE ale_approved = false;

-- RLS: Solo miembros del círculo pueden ver/enviar mensajes
ALTER TABLE circulo_messages ENABLE ROW LEVEL SECURITY;

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
```

---

## 🎥 SQL #2: Storage para Videos SOS (3 min)

**Archivo:** `CREATE_STORAGE_VIDEOS_SOS.sql`

```sql
-- =====================================================
-- STORAGE BUCKET PARA VIDEOS SOS
-- =====================================================

-- 1. Crear el bucket (si falla con "already exists", está bien, continúa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos-sos',
  'videos-sos',
  false,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas RLS para videos-sos

CREATE POLICY "Usuarios suben sus propios videos SOS"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos-sos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Usuarios ven sus videos y de su círculo"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos-sos' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE user_id = ((storage.foldername(name))[1])::uuid
      AND auth.uid() = ANY(miembros)
    )
  )
);

CREATE POLICY "Usuarios borran sus propios videos SOS"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos-sos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## ✅ VERIFICACIÓN

Después de ejecutar ambos SQL, verifica con:

```sql
-- Verificar tabla de mensajes
SELECT COUNT(*) FROM circulo_messages;

-- Verificar bucket de videos
SELECT * FROM storage.buckets WHERE id = 'videos-sos';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'circulo_messages';
SELECT * FROM pg_policies WHERE tablename = 'objects' AND polname LIKE '%videos-sos%';
```

---

## 🎯 RESULTADO ESPERADO

Deberías ver:
- ✅ Tabla `circulo_messages` creada con 4 políticas RLS
- ✅ Bucket `videos-sos` con `public = false` y 3 políticas RLS
- ✅ Sin errores en el SQL Editor

---

## ⏱️ TIEMPO TOTAL: ~5 minutos

Una vez ejecutados estos 2 SQL, el sistema estará al **100%** y listo para usar.
