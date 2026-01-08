-- =====================================================
-- STORAGE BUCKET PARA VIDEOS SOS
-- =====================================================

-- Este SQL se ejecuta en el Supabase SQL Editor
-- Crea el bucket privado para videos de emergencia con políticas RLS

-- 1. Crear el bucket (si no existe)
-- NOTA: Este INSERT puede fallar si el bucket ya existe, es normal
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos-sos',
  'videos-sos',
  false, -- PRIVADO
  104857600, -- 100MB max por archivo
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas RLS para el bucket videos-sos

-- Política de UPLOAD: Solo el usuario puede subir sus propios videos
CREATE POLICY "Usuarios suben sus propios videos SOS"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos-sos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política de SELECT: Usuario ve sus videos + miembros de su círculo
CREATE POLICY "Usuarios ven sus videos y de su círculo"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'videos-sos' 
  AND (
    -- Mis propios videos
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Videos de usuarios en mi círculo
    EXISTS (
      SELECT 1 FROM circulos_confianza
      WHERE user_id = ((storage.foldername(name))[1])::uuid
      AND auth.uid() = ANY(miembros)
    )
  )
);

-- Política de DELETE: Solo el usuario puede borrar sus videos
CREATE POLICY "Usuarios borran sus propios videos SOS"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos-sos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON TABLE storage.objects IS 'Bucket videos-sos configurado para evidencias SOS con RLS';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ejecuta esto después para verificar que el bucket existe:
-- SELECT * FROM storage.buckets WHERE id = 'videos-sos';
