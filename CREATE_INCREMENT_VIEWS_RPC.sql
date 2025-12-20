-- Función para incrementar views de un libro

CREATE OR REPLACE FUNCTION increment_views(book_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE book_publications
  SET 
    views_count = views_count + 1,
    last_viewed_at = NOW()
  WHERE book_id = book_id_param;
END;
$$;
