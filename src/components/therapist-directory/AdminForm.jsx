
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '../../contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const AdminForm = ({ fetchTherapists, therapistToEdit, setTherapistToEdit }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    ciudad: '',
    telefono: '',
    whatsapp: '',
    contacto: '',
    visible: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (therapistToEdit) {
      setFormData({
        nombre: therapistToEdit.nombre || '',
        especialidad: therapistToEdit.especialidad || '',
        ciudad: therapistToEdit.ciudad || '',
        telefono: therapistToEdit.telefono || '',
        whatsapp: therapistToEdit.whatsapp || '',
        contacto: therapistToEdit.contacto || '',
        visible: therapistToEdit.visible,
      });
    } else {
      resetForm();
    }
  }, [therapistToEdit]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      especialidad: '',
      ciudad: '',
      telefono: '',
      whatsapp: '',
      contacto: '',
      visible: true,
    });
    setTherapistToEdit(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, visible: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const dataToSubmit = {
      ...formData,
      created_by: user.id,
    };

    let error;
    if (therapistToEdit) {
      const { error: updateError } = await supabase
        .from('directorio_terapeutas')
        .update(dataToSubmit)
        .eq('id', therapistToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('directorio_terapeutas')
        .insert(dataToSubmit);
      error = insertError;
    }

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Éxito', description: `Terapeuta ${therapistToEdit ? 'actualizado' : 'agregado'} correctamente.` });
      resetForm();
      fetchTherapists();
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-lg mb-12"
    >
      <h2 className="text-2xl font-bold text-brand-primary mb-6">{therapistToEdit ? 'Editar Terapeuta' : 'Agregar Nuevo Terapeuta'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" required />
          <input type="text" name="especialidad" placeholder="Especialidad" value={formData.especialidad} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" />
          <input type="text" name="ciudad" placeholder="Ciudad" value={formData.ciudad} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" />
          <input type="text" name="telefono" placeholder="Teléfono (ej. +521234567890)" value={formData.telefono} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" />
          <input type="text" name="whatsapp" placeholder="WhatsApp (ej. 521234567890)" value={formData.whatsapp} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" />
          <input type="text" name="contacto" placeholder="Contacto (email, etc.)" value={formData.contacto} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-accent" />
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="visible" checked={formData.visible} onCheckedChange={handleCheckboxChange} />
          <Label htmlFor="visible">Visible para usuarias</Label>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          {therapistToEdit && <Button type="button" variant="outline" onClick={resetForm}>Cancelar Edición</Button>}
          <Button type="submit" disabled={loading} className="bg-brand-accent hover:bg-brand-accent/80 text-white">
            {loading ? 'Guardando...' : (therapistToEdit ? 'Actualizar Terapeuta' : 'Agregar Terapeuta')}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default AdminForm;
