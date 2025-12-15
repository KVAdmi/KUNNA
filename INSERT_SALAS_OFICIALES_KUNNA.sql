-- =============================================
-- INSERTAR SALAS OFICIALES DE LA COMUNIDAD KUNNA
-- 5 círculos de confianza temáticos
-- =============================================

-- IMPORTANTE: Ejecutar después de crear la tabla salas_comunidad
-- Este script inserta las 5 salas emocionales de KUNNA

-- Limpiar salas existentes (opcional - comentar si quieres mantener otras salas)
-- DELETE FROM public.salas_comunidad;

-- =============================================
-- INSERTAR LAS 5 SALAS OFICIALES
-- =============================================

INSERT INTO public.salas_comunidad (
  id,
  nombre,
  descripcion,
  icono,
  color,
  activa,
  privada,
  max_usuarios,
  moderada
) VALUES

-- 1. GRITOS AHOGADOS
(
  gen_random_uuid(),
  'Gritos Ahogados',
  'Un espacio íntimo para desahogo profundo. Aquí las mujeres pueden soltar lo que han guardado por años, sin juicio y sin máscaras.',
  '🌫️',
  '#8d7583', -- Rosa grisáceo profundo
  true,
  false,
  50,
  true
),

-- 2. SOLAS PERO NO
(
  gen_random_uuid(),
  'Solas Pero No',
  'Para quienes sienten vacío, distancia emocional, noches pesadas o soledad acompañada. Aquí se acompañan entre ellas.',
  '🌙',
  '#382a3c', -- Púrpura oscuro nocturno
  true,
  false,
  50,
  true
),

-- 3. AUTODUDA
(
  gen_random_uuid(),
  'Autoduda',
  'El lugar para hablar de inseguridades, comparación, miedo al fracaso, sentirse "insuficiente" o "rota". Aquí se reconstruye la voz interna.',
  '🪞',
  '#c8a6a6', -- Rosa empolvado suave
  true,
  false,
  50,
  true
),

-- 4. CICATRICES SUAVES
(
  gen_random_uuid(),
  'Cicatrices Suaves',
  'Espacio para sanar heridas antiguas, relaciones que dolieron, trauma emocional, vínculos rotos. El objetivo es procesar, no revivir.',
  '🕊️',
  '#b8a8c8', -- Lavanda sanadora
  true,
  false,
  50,
  true
),

-- 5. RENACER
(
  gen_random_uuid(),
  'Renacer',
  'Para quienes están listas para levantarse, crear nuevos hábitos, celebrar avances, y compartir micro-victorias. Un espacio luminoso.',
  '✨',
  '#c1d43a', -- Verde lima brillante
  true,
  false,
  50,
  true
);

-- =============================================
-- VERIFICAR INSERCIÓN
-- =============================================

-- Consultar las salas creadas
SELECT 
  nombre,
  descripcion,
  icono,
  color,
  activa,
  created_at
FROM public.salas_comunidad
ORDER BY created_at DESC;

-- =============================================
-- COMENTARIOS Y CATEGORÍAS
-- =============================================

COMMENT ON TABLE public.salas_comunidad IS 
'Círculos de Confianza de KUNNA - 5 salas temáticas diseñadas como refugios emocionales para la comunidad de mujeres';

-- Opcional: Si quieres agregar una columna de categoría explícita en el futuro:
-- ALTER TABLE public.salas_comunidad ADD COLUMN categoria TEXT;
-- UPDATE public.salas_comunidad SET categoria = 'catarsis' WHERE nombre = 'Gritos Ahogados';
-- UPDATE public.salas_comunidad SET categoria = 'conexion' WHERE nombre = 'Solas Pero No';
-- UPDATE public.salas_comunidad SET categoria = 'autoestima' WHERE nombre = 'Autoduda';
-- UPDATE public.salas_comunidad SET categoria = 'sanacion' WHERE nombre = 'Cicatrices Suaves';
-- UPDATE public.salas_comunidad SET categoria = 'crecimiento' WHERE nombre = 'Renacer';
