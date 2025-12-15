-- =============================================
-- ARREGLAR POLÍTICAS RLS PARA QUE EL CHAT FUNCIONE
-- =============================================

-- PASO 1: Eliminar políticas antiguas que pueden estar causando problemas
DROP POLICY IF EXISTS "Users can view room participants" ON usuarios_sala;
DROP POLICY IF EXISTS "Users can join rooms" ON usuarios_sala;
DROP POLICY IF EXISTS "Users can update their own room sessions" ON usuarios_sala;

DROP POLICY IF EXISTS "allow_read_messages" ON mensajes_sala;
DROP POLICY IF EXISTS "allow_insert_messages" ON mensajes_sala;
DROP POLICY IF EXISTS "allow_update_own_messages" ON mensajes_sala;

-- PASO 2: Crear políticas RLS CORRECTAS para usuarios_sala
ALTER TABLE usuarios_sala ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver participantes de salas públicas
CREATE POLICY "authenticated_can_view_participants"
ON usuarios_sala FOR SELECT
TO authenticated
USING (true);

-- Usuarios pueden insertar su propia entrada
CREATE POLICY "users_can_join_rooms"
ON usuarios_sala FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar su propia entrada (marcar salida)
CREATE POLICY "users_can_update_own_session"
ON usuarios_sala FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PASO 3: Crear políticas RLS CORRECTAS para mensajes_sala
ALTER TABLE mensajes_sala ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer mensajes
CREATE POLICY "authenticated_can_read_messages"
ON mensajes_sala FOR SELECT
TO authenticated
USING (true);

-- Usuarios autenticados pueden insertar sus propios mensajes
CREATE POLICY "authenticated_can_insert_messages"
ON mensajes_sala FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propios mensajes
CREATE POLICY "users_can_update_own_messages"
ON mensajes_sala FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden eliminar sus propios mensajes
CREATE POLICY "users_can_delete_own_messages"
ON mensajes_sala FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- PASO 4: Asegurar políticas para salas_comunidad
ALTER TABLE salas_comunidad ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_read_salas" ON salas_comunidad;

-- Todos pueden ver las salas públicas
CREATE POLICY "authenticated_can_view_salas"
ON salas_comunidad FOR SELECT
TO authenticated
USING (activa = true);

-- PASO 5: Verificar que las políticas están activas
SELECT 
  schemaname, 
  tablename, 
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('mensajes_sala', 'usuarios_sala', 'salas_comunidad')
ORDER BY tablename, policyname;
