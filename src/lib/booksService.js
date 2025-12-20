// src/lib/booksService.js
// Servicio para gestionar libros, capítulos y pedidos de ebook

import supabase from './customSupabaseClient';

// ========================================
// LIBROS
// ========================================

/**
 * Obtener todos los libros de la usuaria actual
 */
export async function getMisLibros() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Crear un nuevo libro
 */
export async function crearLibro({ titulo, descripcion, categoria, anon_mode, alias_nombre }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('books')
    .insert({
      user_id: user.id,
      titulo,
      descripcion,
      categoria,
      anon_mode,
      alias_nombre: anon_mode === 'alias' ? alias_nombre : null,
      estado: 'draft'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un libro
 */
export async function actualizarLibro(bookId, updates) {
  const { data, error } = await supabase
    .from('books')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un libro (y todos sus capítulos en cascada)
 */
export async function eliminarLibro(bookId) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) throw error;
}

/**
 * Publicar libro (cambiar estado a published)
 */
export async function publicarLibro(bookId, publicacionTipo, extractoCapitulos = []) {
  // Primero actualizar el libro
  const { data: book, error: bookError } = await supabase
    .from('books')
    .update({
      estado: 'published',
      published_at: new Date().toISOString(),
      publicacion_tipo: publicacionTipo,
      extracto_capitulos: extractoCapitulos
    })
    .eq('id', bookId)
    .select()
    .single();

  if (bookError) throw bookError;

  // Crear o actualizar publicación
  const slug = generarSlug(book.titulo, bookId);
  const anonToken = book.anon_mode === 'anonimo' ? generarAnonToken() : null;

  const { data: publication, error: pubError } = await supabase
    .from('book_publications')
    .upsert({
      book_id: bookId,
      slug,
      anon_token: anonToken,
      visibility: 'public'
    })
    .select()
    .single();

  if (pubError) throw pubError;

  return { book, publication };
}

// ========================================
// CAPÍTULOS
// ========================================

/**
 * Obtener capítulos de un libro
 */
export async function getCapitulos(bookId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('book_id', bookId)
    .order('orden', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Crear un nuevo capítulo
 */
export async function crearCapitulo(bookId, { titulo, contenido, orden }) {
  const palabras = contarPalabras(contenido);
  const tiempoLectura = calcularTiempoLectura(palabras);

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      book_id: bookId,
      titulo,
      contenido,
      orden,
      palabras_count: palabras,
      tiempo_lectura_min: tiempoLectura,
      estado: 'draft'
    })
    .select()
    .single();

  if (error) throw error;

  // Actualizar contador de capítulos del libro
  await actualizarEstadisticasLibro(bookId);

  return data;
}

/**
 * Actualizar capítulo (con autosave)
 */
export async function actualizarCapitulo(chapterId, { titulo, contenido }) {
  const palabras = contarPalabras(contenido);
  const tiempoLectura = calcularTiempoLectura(palabras);

  const { data, error } = await supabase
    .from('chapters')
    .update({
      titulo,
      contenido,
      palabras_count: palabras,
      tiempo_lectura_min: tiempoLectura,
      updated_at: new Date().toISOString()
    })
    .eq('id', chapterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Guardar versión del capítulo (historial)
 */
export async function guardarVersion(chapterId, contenido, nota = null) {
  // Obtener último número de versión
  const { data: lastVersion } = await supabase
    .from('chapter_versions')
    .select('version_number')
    .eq('chapter_id', chapterId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  const versionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

  const { data, error } = await supabase
    .from('chapter_versions')
    .insert({
      chapter_id: chapterId,
      contenido,
      version_number: versionNumber,
      nota
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener versiones de un capítulo
 */
export async function getVersiones(chapterId) {
  const { data, error } = await supabase
    .from('chapter_versions')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Eliminar capítulo
 */
export async function eliminarCapitulo(chapterId, bookId) {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) throw error;

  // Actualizar estadísticas del libro
  await actualizarEstadisticasLibro(bookId);
}

/**
 * Publicar capítulo
 */
export async function publicarCapitulo(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .update({
      estado: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', chapterId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========================================
// REACCIONES Y CALIFICACIONES
// ========================================

/**
 * Dar reacción a un capítulo
 */
export async function darReaccion(chapterId, type) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('reactions')
    .upsert({
      chapter_id: chapterId,
      user_id: user.id,
      type
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Quitar reacción
 */
export async function quitarReaccion(chapterId, type) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('chapter_id', chapterId)
    .eq('user_id', user.id)
    .eq('type', type);

  if (error) throw error;
}

/**
 * Obtener reacciones de un capítulo
 */
export async function getReacciones(chapterId) {
  const { data, error } = await supabase
    .from('reactions')
    .select('type, user_id')
    .eq('chapter_id', chapterId);

  if (error) throw error;

  // Agrupar por tipo
  const grouped = {
    heart: data.filter(r => r.type === 'heart').length,
    hug: data.filter(r => r.type === 'hug').length,
    sparkle: data.filter(r => r.type === 'sparkle').length
  };

  return grouped;
}

/**
 * Calificar libro
 */
export async function calificarLibro(bookId, stars, readTimeSeconds, chaptersRead) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('ratings')
    .upsert({
      book_id: bookId,
      user_id: user.id,
      stars,
      read_time_seconds: readTimeSeconds,
      chapters_read: chaptersRead
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener calificación promedio de un libro
 */
export async function getPromedioCalificacion(bookId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('stars')
    .eq('book_id', bookId);

  if (error) throw error;

  if (data.length === 0) return { promedio: 0, total: 0 };

  const suma = data.reduce((acc, r) => acc + r.stars, 0);
  const promedio = suma / data.length;

  return { promedio: promedio.toFixed(1), total: data.length };
}

// ========================================
// EBOOK ORDERS
// ========================================

/**
 * Crear pedido de ebook
 */
export async function crearPedidoEbook(bookId, datosEditoriales) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('ebook_orders')
    .insert({
      user_id: user.id,
      book_id: bookId,
      ...datosEditoriales,
      estado: 'pending',
      estado_pago: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener pedidos de ebook de la usuaria
 */
export async function getMisPedidosEbook() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado');

  const { data, error } = await supabase
    .from('ebook_orders')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ========================================
// UTILIDADES
// ========================================

function contarPalabras(texto) {
  if (!texto) return 0;
  return texto.trim().split(/\s+/).length;
}

function calcularTiempoLectura(palabras) {
  // 200 palabras por minuto promedio
  return Math.ceil(palabras / 200);
}

function generarSlug(titulo, bookId) {
  const slug = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Agregar parte del UUID para unicidad
  const shortId = bookId.split('-')[0];
  return `${slug}-${shortId}`;
}

function generarAnonToken() {
  return 'anon_' + Math.random().toString(36).substr(2, 16);
}

async function actualizarEstadisticasLibro(bookId) {
  // Obtener capítulos del libro
  const { data: chapters } = await supabase
    .from('chapters')
    .select('palabras_count')
    .eq('book_id', bookId);

  if (!chapters) return;

  const totalPalabras = chapters.reduce((acc, ch) => acc + (ch.palabras_count || 0), 0);
  const totalCapitulos = chapters.length;

  await supabase
    .from('books')
    .update({
      total_palabras: totalPalabras,
      total_capitulos: totalCapitulos
    })
    .eq('id', bookId);
}

export default {
  // Libros
  getMisLibros,
  crearLibro,
  actualizarLibro,
  eliminarLibro,
  publicarLibro,
  
  // Capítulos
  getCapitulos,
  crearCapitulo,
  actualizarCapitulo,
  eliminarCapitulo,
  publicarCapitulo,
  guardarVersion,
  getVersiones,
  
  // Reacciones
  darReaccion,
  quitarReaccion,
  getReacciones,
  calificarLibro,
  getPromedioCalificacion,
  
  // Ebook
  crearPedidoEbook,
  getMisPedidosEbook
};
