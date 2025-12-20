// src/pages/NuevoLibro.jsx
// Formulario para crear un nuevo libro

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { crearLibro } from '@/lib/booksService';
import { Button } from '@/components/ui/button';

const CATEGORIAS = [
  'Mi vida para contar',
  'Superación',
  'Duelo',
  'Violencia',
  'Autoestima',
  'Otro'
];

const NuevoLibro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Mi vida para contar',
    anon_mode: 'anonimo',
    alias_nombre: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast({
        title: '❌ Error',
        description: 'El título es obligatorio',
        variant: 'destructive'
      });
      return;
    }

    if (formData.anon_mode === 'alias' && !formData.alias_nombre.trim()) {
      toast({
        title: '❌ Error',
        description: 'Debes escribir tu alias',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const libro = await crearLibro(formData);
      
      toast({
        title: '✅ Libro creado',
        description: 'Ya puedes empezar a escribir'
      });

      navigate(`/editor/${libro.id}`);
    } catch (error) {
      console.error('Error creando libro:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo crear el libro',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#263152] via-[#382a3c] to-[#8d7583] relative overflow-hidden">
      <Helmet>
        <title>Nuevo Libro - KUNNA</title>
      </Helmet>

      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-[#c1d43a]/20 to-[#f5e6ff]/10 rounded-full blur-xl animate-pulse"></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/mis-libros')}
            className="text-[#f5e6ff] mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <h1 
            className="text-4xl font-bold font-serif mb-2"
            style={{
              background: 'linear-gradient(135deg, #f5e6ff, #c1d43a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            📖 Nuevo Libro
          </h1>
          <p className="text-[#f5e6ff]/70 text-sm">
            Dale vida a tu historia
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6 p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.15), rgba(193, 212, 58, 0.10))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(245, 230, 255, 0.2)'
          }}
        >
          {/* Título */}
          <div>
            <label className="block text-[#f5e6ff] font-semibold mb-2">
              Título del libro *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Mi historia de superación"
              className="w-full px-4 py-3 rounded-xl bg-[#263152]/50 border border-[#f5e6ff]/20 text-[#f5e6ff] placeholder:text-[#f5e6ff]/40 focus:outline-none focus:border-[#c1d43a]"
              maxLength={100}
              required
            />
            <p className="text-xs text-[#f5e6ff]/50 mt-1">
              {formData.titulo.length}/100 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[#f5e6ff] font-semibold mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Breve descripción de tu libro..."
              className="w-full px-4 py-3 rounded-xl bg-[#263152]/50 border border-[#f5e6ff]/20 text-[#f5e6ff] placeholder:text-[#f5e6ff]/40 focus:outline-none focus:border-[#c1d43a] resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-[#f5e6ff]/50 mt-1">
              {formData.descripcion.length}/500 caracteres
            </p>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-[#f5e6ff] font-semibold mb-2">
              Categoría *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#263152]/50 border border-[#f5e6ff]/20 text-[#f5e6ff] focus:outline-none focus:border-[#c1d43a]"
              required
            >
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Modo de publicación */}
          <div>
            <label className="block text-[#f5e6ff] font-semibold mb-3">
              ¿Cómo quieres publicar?
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-xl bg-[#263152]/30 border border-[#f5e6ff]/10 cursor-pointer hover:border-[#c1d43a]/50 transition-colors">
                <input
                  type="radio"
                  name="anon_mode"
                  value="anonimo"
                  checked={formData.anon_mode === 'anonimo'}
                  onChange={(e) => setFormData({ ...formData, anon_mode: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-[#f5e6ff]">Anónimo</div>
                  <div className="text-sm text-[#f5e6ff]/70">
                    Tu nombre nunca aparecerá. Nadie sabrá quién eres.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-[#263152]/30 border border-[#f5e6ff]/10 cursor-pointer hover:border-[#c1d43a]/50 transition-colors">
                <input
                  type="radio"
                  name="anon_mode"
                  value="alias"
                  checked={formData.anon_mode === 'alias'}
                  onChange={(e) => setFormData({ ...formData, anon_mode: e.target.value })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-semibold text-[#f5e6ff]">Con Alias</div>
                  <div className="text-sm text-[#f5e6ff]/70 mb-2">
                    Aparecerás con un nombre ficticio que elijas.
                  </div>
                  {formData.anon_mode === 'alias' && (
                    <input
                      type="text"
                      value={formData.alias_nombre}
                      onChange={(e) => setFormData({ ...formData, alias_nombre: e.target.value })}
                      placeholder="Ej: Luna, Mariposa, etc."
                      className="w-full px-3 py-2 rounded-lg bg-[#263152]/50 border border-[#f5e6ff]/20 text-[#f5e6ff] placeholder:text-[#f5e6ff]/40 focus:outline-none focus:border-[#c1d43a] text-sm"
                      maxLength={30}
                    />
                  )}
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-[#263152]/30 border border-[#f5e6ff]/10 cursor-pointer hover:border-[#c1d43a]/50 transition-colors">
                <input
                  type="radio"
                  name="anon_mode"
                  value="publico"
                  checked={formData.anon_mode === 'publico'}
                  onChange={(e) => setFormData({ ...formData, anon_mode: e.target.value })}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-[#f5e6ff]">Público</div>
                  <div className="text-sm text-[#f5e6ff]/70">
                    Tu nombre real aparecerá como autor.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/mis-libros')}
              className="flex-1 border-[#f5e6ff]/30 text-[#f5e6ff]"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#c1d43a] to-[#f5e6ff] text-[#263152] font-bold hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Crear Libro
                </>
              )}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default NuevoLibro;
