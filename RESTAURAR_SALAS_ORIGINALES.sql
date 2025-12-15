-- =============================================
-- RESTAURAR SALAS ORIGINALES - DESHACER TODO
-- =============================================

-- ELIMINAR TODAS LAS SALAS NUEVAS/DUPLICADAS
DELETE FROM public.salas_comunidad
WHERE created_at > NOW() - INTERVAL '2 hours';

-- RESTAURAR LAS 4 SALAS ORIGINALES QUE FUNCIONABAN
INSERT INTO public.salas_comunidad (nombre, descripcion, icono, color, activa, privada, max_usuarios, moderada)
VALUES
('General', 'Conversación general de la comunidad KUNNA', '💬', '#c8a6a6', true, false, 50, true),
('Apoyo Emocional', 'Espacio seguro para compartir y recibir apoyo', '💬', '#8d7583', true, false, 50, true),
('Autocuidado', 'Tips y experiencias de bienestar personal', '💬', '#c1d43a', true, false, 50, true),
('Madres', 'Espacio para madres que buscan apoyo y comunidad', '💬', '#382a3c', true, false, 50, true)
ON CONFLICT DO NOTHING;

-- VERIFICAR
SELECT id, nombre, descripcion FROM public.salas_comunidad ORDER BY created_at;
