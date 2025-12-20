-- Agregar más categorías a books
ALTER TABLE books 
  DROP CONSTRAINT IF EXISTS books_categoria_check;

ALTER TABLE books
  ADD CONSTRAINT books_categoria_check 
  CHECK (categoria IN (
    'Mi vida para contar',
    'Superación',
    'Duelo',
    'Violencia',
    'Autoestima',
    'Otro'
  ));

-- Actualizar comentario
COMMENT ON COLUMN books.categoria IS 'Categoría del libro: Mi vida para contar, Superación, Duelo, Violencia, Autoestima, Otro';
