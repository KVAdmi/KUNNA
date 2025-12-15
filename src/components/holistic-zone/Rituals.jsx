
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../../contexts/SupabaseAuthContext.jsx';
import { Button } from '@/components/ui/button';

const Rituals = () => {
  const [rituals, setRituals] = useState([]);
  const [completedRituals, setCompletedRituals] = useState(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRituals = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from('rituales')
        .select('*')
        .eq('visible', true)
        .lte('fecha_inicio', today)
        .gte('fecha_fin', today);

      if (error) {
        console.error('Error fetching rituals:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los rituales.' });
      } else {
        setRituals(data);
      }
    };

    const fetchCompletedRituals = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('rituales_usuarios')
        .select('ritual_id')
        .eq('user_id', user.id)
        .eq('completado', true);

      if (error) {
        console.error('Error fetching completed rituals:', error);
      } else {
        setCompletedRituals(new Set(data.map(r => r.ritual_id)));
      }
    };

    fetchRituals();
    fetchCompletedRituals();
  }, [user, toast]);

  const handleCompleteRitual = async (ritualId) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para completar un ritual.' });
      return;
    }

    if (completedRituals.has(ritualId)) {
        toast({ title: 'Ya completado', description: 'Este ritual ya lo has marcado como completado.' });
        return;
    }

    const { error } = await supabase
      .from('rituales_usuarios')
      .insert({ user_id: user.id, ritual_id: ritualId, completado: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar tu progreso.' });
    } else {
      setCompletedRituals(prev => new Set(prev).add(ritualId));
      toast({ title: '¡Felicidades!', description: 'Has completado el ritual.' });
    }
  };

  return (
    <div className="space-y-4">
      {rituals.map((ritual, index) => (
        <motion.div
          key={ritual.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <img  class="w-full h-40 object-cover rounded-lg mb-4" alt={ritual.titulo} src="https://images.unsplash.com/photo-1612382873097-fbfca6a00bd3" />
          <h3 className="font-bold text-lg text-brand-primary">{ritual.titulo}</h3>
          <p className="text-sm text-brand-secondary mb-2">{ritual.categoria}</p>
          <p className="text-sm text-brand-primary/80 mb-4">{ritual.descripcion}</p>
          <Button 
            onClick={() => handleCompleteRitual(ritual.id)}
            disabled={completedRituals.has(ritual.id)}
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {completedRituals.has(ritual.id) ? 'Completado' : 'Marcar como completado'}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};

export default Rituals;
