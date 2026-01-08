import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Save, Clock, FileText, AlertCircle } from 'lucide-react';

/**
 * EDITOR DE CAPÍTULOS
 * 
 * Features:
 * - Auto-save cada 10 segundos
 * - Word count en tiempo real
 * - Tiempo de lectura estimado (200 palabras/min)
 * - Versiones automáticas (historial)
 * - Formato básico (párrafos, saltos de línea)
 */

const ChapterEditor = ({ chapter, bookTitle, onBack, onSave }) => {
  const [titulo, setTitulo] = useState(chapter.titulo);
  const [contenido, setContenido] = useState(chapter.contenido);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const autoSaveTimer = useRef(null);

  useEffect(() => {
    // Calcular palabras y tiempo de lectura
    const words = countWords(contenido);
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 palabras/min
  }, [contenido]);

  useEffect(() => {
    // Auto-save cada 10 segundos
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(() => {
      if (contenido !== chapter.contenido || titulo !== chapter.titulo) {
        saveChapter();
      }
    }, 10000);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [contenido, titulo]);

  const countWords = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).length;
  };

  const saveChapter = async () => {
    try {
      setSaving(true);

      // Guardar versión en historial si hay cambios significativos
      const wordsDiff = Math.abs(countWords(contenido) - chapter.palabras_count);
      if (wordsDiff > 50) {
        await supabase.from('chapter_versions').insert([{
          chapter_id: chapter.id,
          contenido: chapter.contenido,
          version_number: Date.now()
        }]);
      }

      // Actualizar capítulo
      const { data, error } = await supabase
        .from('chapters')
        .update({
          titulo,
          contenido,
          palabras_count: wordCount,
          tiempo_lectura_min: readingTime
        })
        .eq('id', chapter.id)
        .select()
        .single();

      if (error) throw error;

      setLastSaved(new Date());
      onSave(data);
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    await saveChapter();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Volver a capítulos
            </button>
            <button
              onClick={handleManualSave}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>

          <div className="text-sm text-gray-500 mb-2">
            {bookTitle}
          </div>

          {/* Título del capítulo */}
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título del capítulo"
            className="w-full text-2xl font-bold text-gray-800 border-none focus:outline-none focus:ring-0 bg-transparent"
          />

          {/* Estadísticas */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{wordCount} palabras</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min lectura</span>
            </div>
            {lastSaved && (
              <div className="flex items-center gap-1 text-green-600">
                <Save className="w-4 h-4" />
                <span>
                  Guardado {lastSaved.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
            {saving && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[600px]">
          <textarea
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            placeholder="Comienza a escribir tu historia aquí..."
            className="w-full h-full min-h-[500px] text-lg text-gray-800 leading-relaxed border-none focus:outline-none focus:ring-0 resize-none"
            style={{
              fontFamily: 'Georgia, serif'
            }}
          />
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Tips de escritura:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Escribe sin juzgar, déjalo fluir</li>
                <li>Tus cambios se guardan automáticamente cada 10 segundos</li>
                <li>Puedes publicar cuando estés lista</li>
                <li>Tu identidad está protegida según tu configuración</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterEditor;
