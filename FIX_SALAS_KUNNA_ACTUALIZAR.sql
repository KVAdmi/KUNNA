-- =============================================
-- CORREGIR SALAS DUPLICADAS - SOLO ACTUALIZAR LAS EXISTENTES
-- =============================================

-- PASO 1: Eliminar las salas duplicadas que acabamos de crear
DELETE FROM public.salas_comunidad
WHERE created_at > NOW() - INTERVAL '1 hour'
AND nombre IN ('Gritos Ahogados', 'Solas Pero No', 'Autoduda', 'Cicatrices Suaves', 'Renacer');

-- PASO 2: Actualizar las 5 salas originales con los nuevos nombres y descripciones

-- Actualizar la sala "General" → "Gritos Ahogados"
UPDATE public.salas_comunidad 
SET 
  nombre = 'Gritos Ahogados',
  descripcion = 'Un espacio íntimo para desahogo profundo. Aquí las mujeres pueden soltar lo que han guardado por años, sin juicio y sin máscaras.',
  icono = '🌫️',
  color = '#8d7583'
WHERE nombre = 'General';

-- Actualizar "Apoyo Emocional" → "Solas Pero No"
UPDATE public.salas_comunidad 
SET 
  nombre = 'Solas Pero No',
  descripcion = 'Para quienes sienten vacío, distancia emocional, noches pesadas o soledad acompañada. Aquí se acompañan entre ellas.',
  icono = '🌙',
  color = '#382a3c'
WHERE nombre = 'Apoyo Emocional';

-- Actualizar "Autocuidado" → "Autoduda"
UPDATE public.salas_comunidad 
SET 
  nombre = 'Autoduda',
  descripcion = 'El lugar para hablar de inseguridades, comparación, miedo al fracaso, sentirse "insuficiente" o "rota". Aquí se reconstruye la voz interna.',
  icono = '🪞',
  color = '#c8a6a6'
WHERE nombre = 'Autocuidado';

-- Actualizar "Madres" → "Cicatrices Suaves"
UPDATE public.salas_comunidad 
SET 
  nombre = 'Cicatrices Suaves',
  descripcion = 'Espacio para sanar heridas antiguas, relaciones que dolieron, trauma emocional, vínculos rotos. El objetivo es procesar, no revivir.',
  icono = '🕊️',
  color = '#b8a8c8'
WHERE nombre = 'Madres';

-- Si tienes una 5ta sala, actualízala aquí (ajusta el nombre original):
-- Buscar cuál es la 5ta sala actual:
-- SELECT id, nombre FROM public.salas_comunidad ORDER BY created_at;

-- Suponiendo que existe una sala que podemos actualizar a "Renacer":
-- UPDATE public.salas_comunidad 
-- SET 
--   nombre = 'Renacer',
--   descripcion = 'Para quienes están listas para levantarse, crear nuevos hábitos, celebrar avances, y compartir micro-victorias. Un espacio luminoso.',
--   icono = '✨',
--   color = '#c1d43a'
-- WHERE nombre = '[NOMBRE_DE_LA_QUINTA_SALA_ACTUAL]';

-- =============================================
-- VERIFICAR QUE SOLO QUEDAN 5 SALAS
-- =============================================

SELECT 
  id,
  nombre,
  descripcion,
  icono,
  color,
  created_at
FROM public.salas_comunidad
ORDER BY created_at;

-- Debería mostrar exactamente 5 salas con los nuevos nombres
