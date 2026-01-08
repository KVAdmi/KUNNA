import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  BookOpen, Plus, Edit3, Trash2, Eye, EyeOff, 
  Save, Upload, ChevronRight, FileText, Lock, Globe, User 
} from 'lucide-react';
import ChapterEditor from '../components/escribir/ChapterEditor';
import BookMetadata from '../components/escribir/BookMetadata';

/**
 * ESCRIBE TU LIBRO - Módulo completo de escritura
 * 
 * Features:
 * - CRUD de libros (crear, listar, editar, eliminar)
 * - CRUD de capítulos (crear, reordenar, eliminar)
 * - Editor de texto enriquecido con autosave
 * - Modos de anonimato (anónimo/alias/público)
 * - Draft/Published workflow
 * - Publicar extracto o libro completo
 * - Portada custom o generada
 * - Protección anti-copia
 */

const EscribeTuLibro = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('books'); // 'books' | 'edit-book' | 'edit-chapter'
  const [showMetadata, setShowMetadata] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      loadChapters(selectedBook.id);
    }
  }, [selectedBook]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('orden', { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const createBook = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('books')
        .insert([{
          user_id: user.id,
          titulo: 'Nuevo Libro',
          descripcion: '',
          categoria: 'Mi vida para contar',
          estado: 'draft',
          anon_mode: 'anonimo'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setBooks([data, ...books]);
      setSelectedBook(data);
      setShowMetadata(true);
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  const deleteBook = async (bookId) => {
    if (!confirm('¿Eliminar este libro y todos sus capítulos?')) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      setBooks(books.filter(b => b.id !== bookId));
      if (selectedBook?.id === bookId) {
        setSelectedBook(null);
        setView('books');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const createChapter = async () => {
    if (!selectedBook) return;

    try {
      const maxOrden = chapters.length > 0 
        ? Math.max(...chapters.map(c => c.orden)) 
        : 0;

      const { data, error } = await supabase
        .from('chapters')
        .insert([{
          book_id: selectedBook.id,
          titulo: `Capítulo ${chapters.length + 1}`,
          contenido: '',
          orden: maxOrden + 1,
          estado: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      setChapters([...chapters, data]);
      setSelectedChapter(data);
      setView('edit-chapter');
    } catch (error) {
      console.error('Error creating chapter:', error);
    }
  };

  const deleteChapter = async (chapterId) => {
    if (!confirm('¿Eliminar este capítulo?')) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      setChapters(chapters.filter(c => c.id !== chapterId));
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter(null);
        setView('edit-book');
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const publishBook = async () => {
    if (!selectedBook) return;
    if (chapters.length === 0) {
      alert('Agrega al menos un capítulo antes de publicar');
      return;
    }

    try {
      const { error } = await supabase
        .from('books')
        .update({ 
          estado: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', selectedBook.id);

      if (error) throw error;

      // Crear publicación en feed público
      const slug = generateSlug(selectedBook.titulo);
      await supabase.from('book_publications').insert([{
        book_id: selectedBook.id,
        slug,
        anon_token: selectedBook.anon_mode === 'anonimo' 
          ? crypto.randomUUID() 
          : null,
        visibility: 'public'
      }]);

      alert('✨ ¡Libro publicado en la biblioteca!');
      loadBooks();
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('Error al publicar');
    }
  };

  const generateSlug = (titulo) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 50);
  };

  const getAnonIcon = (mode) => {
    switch (mode) {
      case 'anonimo': return <EyeOff className="w-4 h-4" />;
      case 'alias': return <User className="w-4 h-4" />;
      case 'publico': return <Globe className="w-4 h-4" />;
      default: return null;
    }
  };

  // VISTA: Lista de libros
  if (view === 'books') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-purple-600" />
                Escribe Tu Libro
              </h1>
              <p className="text-gray-600 mt-1">
                Tu espacio seguro para escribir y compartir tu historia
              </p>
            </div>
            <button
              onClick={createBook}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Plus className="w-5 h-5" />
              Nuevo Libro
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aún no tienes libros
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza a escribir tu historia
              </p>
              <button
                onClick={createBook}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Crear mi primer libro
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {books.map(book => (
                <div
                  key={book.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
                  onClick={() => {
                    setSelectedBook(book);
                    setView('edit-book');
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {book.titulo}
                        </h3>
                        {getAnonIcon(book.anon_mode)}
                        {book.estado === 'published' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Publicado
                          </span>
                        )}
                        {book.estado === 'draft' && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Borrador
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {book.descripcion || 'Sin descripción'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{book.total_capitulos || 0} capítulos</span>
                        <span>{book.total_palabras || 0} palabras</span>
                        <span>
                          {new Date(book.updated_at).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBook(book.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA: Editar libro (lista de capítulos)
  if (view === 'edit-book' && selectedBook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => {
              setSelectedBook(null);
              setView('books');
            }}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
          >
            ← Volver a mis libros
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedBook.titulo}
                </h2>
                <p className="text-gray-600">{selectedBook.descripcion}</p>
              </div>
              <button
                onClick={() => setShowMetadata(true)}
                className="text-purple-600 hover:text-purple-700 p-2"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createChapter}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-5 h-5" />
                Nuevo Capítulo
              </button>
              {selectedBook.estado === 'draft' && chapters.length > 0 && (
                <button
                  onClick={publishBook}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  <Upload className="w-5 h-5" />
                  Publicar en Biblioteca
                </button>
              )}
            </div>
          </div>

          {chapters.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Sin capítulos
              </h3>
              <p className="text-gray-500">
                Comienza escribiendo tu primer capítulo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter, idx) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition cursor-pointer"
                  onClick={() => {
                    setSelectedChapter(chapter);
                    setView('edit-chapter');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl font-bold text-gray-400">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {chapter.titulo}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {chapter.palabras_count || 0} palabras · 
                          {chapter.tiempo_lectura_min || 0} min lectura
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChapter(chapter.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showMetadata && (
          <BookMetadata
            book={selectedBook}
            onClose={() => setShowMetadata(false)}
            onSave={(updated) => {
              setSelectedBook(updated);
              setShowMetadata(false);
              loadBooks();
            }}
          />
        )}
      </div>
    );
  }

  // VISTA: Editar capítulo
  if (view === 'edit-chapter' && selectedChapter) {
    return (
      <ChapterEditor
        chapter={selectedChapter}
        bookTitle={selectedBook?.titulo}
        onBack={() => {
          setSelectedChapter(null);
          setView('edit-book');
          loadChapters(selectedBook.id);
        }}
        onSave={(updated) => {
          setSelectedChapter(updated);
          loadChapters(selectedBook.id);
        }}
      />
    );
  }

  return null;
};

export default EscribeTuLibro;
