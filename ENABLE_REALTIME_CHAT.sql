-- =============================================
-- ACTIVAR REALTIME PARA CHAT EN VIVO
-- =============================================

-- PASO 1: Habilitar Realtime en la tabla mensajes_sala
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_sala;

-- PASO 2: Asegurar que las réplicas están habilitadas
ALTER TABLE public.mensajes_sala REPLICA IDENTITY FULL;

-- PASO 3: Verificar que está activo
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename = 'mensajes_sala';

-- =============================================
-- RESULTADO ESPERADO
-- =============================================
-- Si aparece una fila con "public" y "mensajes_sala" = REALTIME ACTIVO ✅
-- Si no aparece nada = REALTIME NO ACTIVO ❌

-- =============================================
-- SOLUCIÓN ALTERNATIVA (si falla el ALTER)
-- =============================================
-- Ve a Supabase Dashboard → Database → Replication
-- Busca "mensajes_sala" y activa el toggle "Enable Realtime"
