import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { X, Upload, Eye, EyeOff, User, Globe, Lock, Image } from 'lucide-react';

/**
 * METADATA DEL LIBRO
 * 
 * Modal para editar:
 * - Título y descripción
 * - Modo de anonimato (anónimo/alias/público)
 * - Tipo de publicación (extracto/completo)
 * - Portada (URL o upload)
 * - Protección anti-copia
 */

const BookMetadata = ({ book, onClose, onSave }) => {
  const [titulo, setTitulo] = useState(book.titulo);
  const [descripcion, setDescripcion] = useState(book.descripcion || '');
  const [anonMode, setAnonMode] = useState(book.anon_mode);
  const [aliasNombre, setAliasNombre] = useState(book.alias_nombre || '');
  const [publicacionTipo, setPublicacionTipo] = useState(book.publicacion_tipo);
  const [portadaUrl, setPortadaUrl] = useState(book.portada_url || '');
  const [proteccionActiva, setProteccionActiva] = useState(book.proteccion_activa !== false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUploadPortada = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB');
      return;
    }

    try {
      setUploading(true);

      // Upload a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${book.id}_${Date.now()}.${fileExt}`;
      const filePath = `portadas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('books')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('books')
        .getPublicUrl(filePath);

      setPortadaUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Error al subir la portada');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (anonMode === 'alias' && !aliasNombre.trim()) {
      alert('Ingresa tu alias/seudónimo');
      return;
    }

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('books')
        .update({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          anon_mode: anonMode,
          alias_nombre: anonMode === 'alias' ? aliasNombre.trim() : null,
          publicacion_tipo: publicacionTipo,
          portada_url: portadaUrl || null,
          proteccion_activa: proteccionActiva
        })
        .eq('id', book.id)
        .select()
        .single();

      if (error) throw error;

      onSave(data);
    } catch (error) {
      console.error('Error saving metadata:', error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            Configuración del Libro
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del libro *
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Mi historia de superación"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de tu libro..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Modo de Anonimato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cómo quieres aparecer?
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  name="anon_mode"
                  value="anonimo"
                  checked={anonMode === 'anonimo'}
                  onChange={(e) => setAnonMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    <EyeOff className="w-4 h-4" />
                    Anónimo
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Tu nombre no aparecerá. Autor: "Anónimo"
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  name="anon_mode"
                  value="alias"
                  checked={anonMode === 'alias'}
                  onChange={(e) => setAnonMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    <User className="w-4 h-4" />
                    Con Alias/Seudónimo
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Usa un nombre artístico o seudónimo
                  </p>
                  {anonMode === 'alias' && (
                    <input
                      type="text"
                      value={aliasNombre}
                      onChange={(e) => setAliasNombre(e.target.value)}
                      placeholder="Tu seudónimo"
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  name="anon_mode"
                  value="publico"
                  checked={anonMode === 'publico'}
                  onChange={(e) => setAnonMode(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 font-medium text-gray-800">
                    <Globe className="w-4 h-4" />
                    Con mi nombre real
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Tu nombre de perfil será visible
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Tipo de Publicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Qué quieres compartir?
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  name="publicacion_tipo"
                  value="extracto"
                  checked={publicacionTipo === 'extracto'}
                  onChange={(e) => setPublicacionTipo(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    Solo un extracto
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecciona algunos capítulos para compartir públicamente
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-300 transition">
                <input
                  type="radio"
                  name="publicacion_tipo"
                  value="completo"
                  checked={publicacionTipo === 'completo'}
                  onChange={(e) => setPublicacionTipo(e.target.value)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    Libro completo
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Todos los capítulos serán públicos
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Portada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portada del libro
            </label>
            <div className="flex items-center gap-4">
              {portadaUrl ? (
                <img
                  src={portadaUrl}
                  alt="Portada"
                  className="w-24 h-32 object-cover rounded-lg shadow"
                />
              ) : (
                <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer w-fit">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Subiendo...' : 'Subir imagen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPortada}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG o GIF. Máx 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Protección */}
          <div>
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={proteccionActiva}
                onChange={(e) => setProteccionActiva(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <Lock className="w-4 h-4" />
                  Activar protección anti-copia
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Bloquea copiar, pegar y capturas de pantalla en tu libro
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookMetadata;
