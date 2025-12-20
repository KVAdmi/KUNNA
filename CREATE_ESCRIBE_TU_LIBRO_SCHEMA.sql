-- ========================================
-- MÓDULO: ESCRIBE TU LIBRO - KUNNA
-- Base de datos completa
-- ========================================

-- 1. LIBROS
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Info básica
  titulo TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT DEFAULT 'Mi vida para contar', -- Fijo por ahora
  
  -- Estado y visibilidad
  estado TEXT DEFAULT 'draft' CHECK (estado IN ('draft', 'published', 'archived')),
  anon_mode TEXT DEFAULT 'anonimo' CHECK (anon_mode IN ('anonimo', 'alias', 'publico')),
  alias_nombre TEXT, -- Solo si anon_mode='alias'
  
  -- Publicación
  publicacion_tipo TEXT DEFAULT 'extracto' CHECK (publicacion_tipo IN ('extracto', 'completo')),
  extracto_capitulos INT[], -- IDs de capítulos a mostrar como extracto
  
  -- Portada
  portada_url TEXT,
  portada_generada BOOLEAN DEFAULT false,
  
  -- Protección
  proteccion_activa BOOLEAN DEFAULT true, -- No copy/paste/screenshot
  
  -- Metadatos
  total_palabras INT DEFAULT 0,
  total_capitulos INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Índices para books
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_estado ON books(estado);
CREATE INDEX IF NOT EXISTS idx_books_published_at ON books(published_at) WHERE estado = 'published';

-- 2. CAPÍTULOS
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  orden INT NOT NULL,
  
  -- Estado
  estado TEXT DEFAULT 'draft' CHECK (estado IN ('draft', 'published')),
  
  -- Metadatos
  palabras_count INT DEFAULT 0,
  tiempo_lectura_min INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Índices para chapters
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_orden ON chapters(book_id, orden);

-- 3. VERSIONES DE CAPÍTULOS (historial/autosave)
CREATE TABLE IF NOT EXISTS chapter_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  
  contenido TEXT NOT NULL,
  version_number INT NOT NULL,
  nota TEXT, -- Descripción del cambio
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapter_versions_chapter_id ON chapter_versions(chapter_id, version_number DESC);

-- 4. PUBLICACIONES (feed público)
CREATE TABLE IF NOT EXISTS book_publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  
  -- URLs y tokens
  slug TEXT UNIQUE NOT NULL, -- URL amigable: /libro/mi-historia-de-superacion
  anon_token TEXT UNIQUE, -- Token para identificar autor anónimo
  
  -- Visibilidad
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted')),
  
  -- Estadísticas
  views_count INT DEFAULT 0,
  unique_readers INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_book_publications_slug ON book_publications(slug);
CREATE INDEX IF NOT EXISTS idx_book_publications_book_id ON book_publications(book_id);

-- 5. REACCIONES (❤️🫂✨)
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL CHECK (type IN ('heart', 'hug', 'sparkle')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 1 reacción de cada tipo por usuaria por capítulo
  UNIQUE(chapter_id, user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_chapter_id ON reactions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);

-- 6. CALIFICACIONES (⭐ 1-5)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  
  -- Validación de lectura real
  read_time_seconds INT, -- Tiempo total de lectura
  chapters_read INT DEFAULT 0, -- Capítulos leídos
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 1 calificación por libro por usuaria
  UNIQUE(book_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- 7. PEDIDOS DE EBOOK ($199)
CREATE TABLE IF NOT EXISTS ebook_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  
  -- DATOS EDITORIALES (formulario)
  -- Editorial fija
  nombre_editorial TEXT DEFAULT 'KUNNA Editorial',
  
  -- Autor
  nombre_autor TEXT NOT NULL, -- Puede ser "Anónimo", alias, o nombre real
  biografia_autor TEXT,
  
  -- Publicación
  ano_publicacion INT DEFAULT EXTRACT(YEAR FROM NOW()),
  pais_publicacion TEXT DEFAULT 'México',
  idioma TEXT DEFAULT 'Español',
  
  -- ISBN (opcional, si ya lo tienen)
  isbn TEXT,
  
  -- PORTADA
  incluir_portada BOOLEAN DEFAULT true,
  tipo_portada TEXT DEFAULT 'generada' CHECK (tipo_portada IN ('generada', 'propia')),
  portada_custom_url TEXT, -- Si tipo_portada='propia'
  
  -- FORMATO
  formato_solicitado TEXT DEFAULT 'pdf' CHECK (formato_solicitado IN ('pdf', 'epub', 'ambos')),
  
  -- PAGO (Mercado Pago)
  precio DECIMAL(10,2) DEFAULT 199.00,
  estado_pago TEXT DEFAULT 'pending' CHECK (estado_pago IN ('pending', 'paid', 'failed', 'refunded')),
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  
  -- ESTADO DEL PEDIDO
  estado TEXT DEFAULT 'pending' CHECK (estado IN ('pending', 'processing', 'completed', 'failed')),
  
  -- ARCHIVOS GENERADOS
  ebook_pdf_url TEXT,
  ebook_epub_url TEXT,
  
  -- TIMESTAMPS
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ebook_orders_user_id ON ebook_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_book_id ON ebook_orders(book_id);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_estado ON ebook_orders(estado);

-- 8. LOGS DE MODERACIÓN (futuro P1)
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  target_type TEXT NOT NULL CHECK (target_type IN ('chapter', 'comment', 'book')),
  target_id UUID NOT NULL,
  
  verdict TEXT NOT NULL CHECK (verdict IN ('approved', 'rejected', 'flagged', 'review_needed')),
  reasons JSONB, -- {type: 'hate_speech', confidence: 0.95}
  raw_content TEXT,
  
  moderated_by TEXT DEFAULT 'ale', -- 'ale' o user_id de admin
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_moderation_logs_target ON moderation_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_verdict ON moderation_logs(verdict);

-- ========================================
-- RLS POLICIES (Row Level Security)
-- ========================================

-- Habilitar RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapter_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ebook_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

-- BOOKS: solo dueña puede ver/editar sus libros privados
CREATE POLICY "Usuarias pueden ver sus propios libros"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden crear libros"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden actualizar sus libros"
  ON books FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden eliminar sus libros"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- BOOKS PÚBLICOS: lectura pública solo de libros published
CREATE POLICY "Libros publicados son públicos"
  ON books FOR SELECT
  USING (estado = 'published');

-- CHAPTERS: solo dueña puede ver/editar
CREATE POLICY "Usuarias pueden ver capítulos de sus libros"
  ON chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarias pueden crear capítulos en sus libros"
  ON chapters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarias pueden actualizar capítulos de sus libros"
  ON chapters FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuarias pueden eliminar capítulos de sus libros"
  ON chapters FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.user_id = auth.uid()
    )
  );

-- CHAPTERS PÚBLICOS: lectura de capítulos published de libros published
CREATE POLICY "Capítulos publicados son públicos"
  ON chapters FOR SELECT
  USING (
    estado = 'published'
    AND EXISTS (
      SELECT 1 FROM books
      WHERE books.id = chapters.book_id
      AND books.estado = 'published'
    )
  );

-- REACTIONS: cualquiera puede dar reacciones (autenticado)
CREATE POLICY "Usuarias pueden crear reacciones"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden ver todas las reacciones"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Usuarias pueden eliminar sus reacciones"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RATINGS: cualquiera puede calificar (autenticado)
CREATE POLICY "Usuarias pueden crear calificaciones"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden ver todas las calificaciones"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Usuarias pueden actualizar sus calificaciones"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- EBOOK ORDERS: solo dueña puede ver sus pedidos
CREATE POLICY "Usuarias pueden ver sus pedidos"
  ON ebook_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuarias pueden crear pedidos"
  ON ebook_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- BOOK PUBLICATIONS: lectura pública
CREATE POLICY "Publicaciones públicas son visibles"
  ON book_publications FOR SELECT
  USING (visibility = 'public');

-- ========================================
-- TRIGGERS
-- ========================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- FUNCIONES ÚTILES
-- ========================================

-- Contar palabras de un capítulo
CREATE OR REPLACE FUNCTION count_words(texto TEXT)
RETURNS INT AS $$
BEGIN
  RETURN array_length(regexp_split_to_array(trim(texto), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Calcular tiempo de lectura (200 palabras/min promedio)
CREATE OR REPLACE FUNCTION calcular_tiempo_lectura(palabras INT)
RETURNS INT AS $$
BEGIN
  RETURN CEIL(palabras::FLOAT / 200.0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ========================================
-- COMENTARIOS
-- ========================================

COMMENT ON TABLE books IS 'Libros de usuarias - Modo privado o público';
COMMENT ON TABLE chapters IS 'Capítulos de cada libro con contenido';
COMMENT ON TABLE chapter_versions IS 'Historial de versiones de capítulos (autosave)';
COMMENT ON TABLE book_publications IS 'Publicaciones en feed público con slug';
COMMENT ON TABLE reactions IS 'Reacciones heart/hug/sparkle a capítulos';
COMMENT ON TABLE ratings IS 'Calificaciones 1-5 estrellas a libros';
COMMENT ON TABLE ebook_orders IS 'Pedidos de ebook $199 con datos editoriales';
COMMENT ON TABLE moderation_logs IS 'Logs de moderación AL-E (futuro)';
