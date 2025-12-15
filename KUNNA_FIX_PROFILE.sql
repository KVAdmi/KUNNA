-- =============================================
-- FIX TEMPORAL - ACTUALIZAR PERFIL EXISTENTE
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Actualizar el perfil existente para que tenga todos los campos necesarios
UPDATE profiles 
SET 
  username = COALESCE(username, 'Usuario'),
  full_name = COALESCE(full_name, 'Usuario KUNNA'),
  plan_activo = COALESCE(plan_activo, 'free'),
  plan_tipo = NULL,  -- Se establece cuando se hace un pago
  profile_completed = false,
  onboarding_completed = false,
  primera_visita = true,
  updated_at = NOW()
WHERE email = 'pattogaribayg@gmail.com';

-- Verificar que el perfil se actualizó correctamente
SELECT * FROM profiles WHERE email = 'pattogaribayg@gmail.com';

-- =============================================
-- VERIFICAR POLÍTICAS RLS
-- =============================================

-- Verificar que RLS está habilitado en las tablas principales
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'payments', 'contactos_emergencia', 'acompanamientos_activos');

-- =============================================
-- PRUEBA DE ACCESO (ejecutar como usuario autenticado)
-- =============================================

-- Esta consulta debería funcionar cuando estés logueado
-- SELECT * FROM profiles WHERE id = auth.uid();