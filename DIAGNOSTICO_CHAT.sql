-- =============================================
-- DIAGNÓSTICO: Verificar estado de las tablas del chat
-- =============================================

-- 1. Verificar que la tabla mensajes_sala existe y tiene la estructura correcta
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'mensajes_sala'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS activas en mensajes_sala
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'mensajes_sala';

-- 3. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('mensajes_sala', 'usuarios_sala', 'salas_comunidad');

-- 4. Verificar contenido de mensajes_sala (últimos 5)
SELECT 
  id,
  sala_id,
  user_id,
  contenido,
  tipo,
  creado_en
FROM mensajes_sala
ORDER BY creado_en DESC
LIMIT 5;

-- 5. Verificar salas activas
SELECT 
  id,
  nombre,
  activa,
  created_at
FROM salas_comunidad
ORDER BY created_at DESC;
