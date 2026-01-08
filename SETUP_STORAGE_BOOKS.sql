-- ========================================
-- STORAGE POLICIES - BUCKET BOOKS
-- Para portadas de libros
-- ========================================

-- ⚠️ IMPORTANTE: CREAR BUCKET MANUALMENTE PRIMERO
-- 1. Ir a Supabase Dashboard → Storage → "New bucket"
-- 2. Nombre: books
-- 3. Public: YES (activar)
-- 4. File size limit: 2MB
-- 5. Allowed MIME types: image/*
-- 6. Click "Create bucket"

-- DESPUÉS ejecutar este SQL:

-- 1. LIMPIAR POLICIES EXISTENTES
DROP POLICY IF EXISTS "Usuarias pueden subir portadas" ON storage.objects;
DROP POLICY IF EXISTS "Portadas son públicas para lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarias pueden actualizar sus portadas" ON storage.objects;
DROP POLICY IF EXISTS "Usuarias pueden eliminar sus portadas" ON storage.objects;

-- 2. POLICY: Upload de portadas
-- Solo usuarias autenticadas pueden subir a carpeta portadas/
CREATE POLICY "Usuarias pueden subir portadas"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'books' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'portadas'
  );

-- 3. POLICY: Lectura pública de portadas
-- Cualquiera puede ver las portadas (público)
CREATE POLICY "Portadas son públicas para lectura"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'books'
    AND (storage.foldername(name))[1] = 'portadas'
  );

-- 4. POLICY: Actualizar portadas propias
-- Solo la usuaria puede actualizar sus propios archivos
CREATE POLICY "Usuarias pueden actualizar sus portadas"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'books'
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'books'
    AND auth.role() = 'authenticated'
  );

-- 5. POLICY: Eliminar portadas propias
-- Solo la usuaria puede eliminar sus propios archivos
CREATE POLICY "Usuarias pueden eliminar sus portadas"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'books'
    AND auth.role() = 'authenticated'
  );

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver políticas activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%portadas%'
ORDER BY policyname;

-- Ver buckets
SELECT * FROM storage.buckets WHERE id = 'books';

-- ========================================
-- VERIFICAR BUCKET EXISTE ANTES DE EJECUTAR
-- ========================================
-- Si este query NO retorna el bucket 'books':
-- 1. Ve a Storage → Buckets
-- 2. Click "New bucket"
-- 3. ID: books, Public: YES
-- 4. Vuelve aquí y ejecuta las policies de arriba
