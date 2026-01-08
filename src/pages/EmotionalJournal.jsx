import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BookText, Calendar, Mic, Video, Type, Plus, Download, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { es } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';
import { kceEvents } from '@/core/kce';

const EmotionalJournal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [entryText, setEntryText] = useState('');

  const fetchEntries = useCallback(async (month) => {
    if (!user || !isValid(month)) return;
    setIsLoading(true);
    const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(month), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('diario_personal')
      .select('fecha, tipo, contenido, archivo_url')
      .eq('user_id', user.id)
      .gte('fecha', startDate)
      .lte('fecha', endDate);

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las entradas.' });
    } else {
      const fetchedEntries = data.reduce((acc, entry) => {
        acc[entry.fecha] = entry;
        return acc;
      }, {});
      setEntries(fetchedEntries);
    }
    setIsLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchEntries(currentMonth);
  }, [currentMonth, fetchEntries]);

  const selectedEntry = useMemo(() => {
    if (!selectedDate || !isValid(selectedDate)) return null;
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return entries[dateKey];
  }, [selectedDate, entries]);

  useEffect(() => {
    if (selectedEntry) {
      setEntryText(selectedEntry.contenido || '');
      setIsEditing(false);
    } else {
      setEntryText('');
      setIsEditing(true);
    }
  }, [selectedEntry, selectedDate]);
  
  const handleSaveEntry = async () => {
    if (!user || !selectedDate || !isValid(selectedDate) || !entryText.trim()) {
        toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Asegúrate de seleccionar una fecha y escribir algo.' });
        return;
    }
    
    setIsLoading(true);
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const entryData = {
        user_id: user.id,
        fecha: dateKey,
        tipo: 'texto',
        contenido: entryText.trim()
    };
    
    const { error } = await supabase
        .from('diario_personal')
        .upsert(entryData, { onConflict: 'user_id, fecha' });
    
    if (error) {
        toast({ variant: 'destructive', title: 'Error al guardar', description: 'No se pudo guardar la entrada. Inténtalo de nuevo.' });
    } else {
        toast({ title: 'Entrada guardada', description: `Tu diario para el ${format(selectedDate, 'PPP', { locale: es })} ha sido actualizado.` });
        setEntries(prev => ({...prev, [dateKey]: {...prev[dateKey], ...entryData}}));
        setIsEditing(false);
        
        // 🔥 INTEGRACIÓN KCE: Emitir evento de entrada de diario
        try {
          await kceEvents.diaryEntry(user.id, entryText.trim());
        } catch (kceError) {
          console.error('Error enviando evento al KCE:', kceError);
          // No mostrar error al usuario, es background
        }
    }
    setIsLoading(false);
  };
  
  const handleDeleteEntry = async () => {
     if (!user || !selectedDate || !isValid(selectedDate) || !selectedEntry) return;

     setIsLoading(true);
     const dateKey = format(selectedDate, 'yyyy-MM-dd');
     
     const { error } = await supabase
        .from('diario_personal')
        .delete()
        .match({ user_id: user.id, fecha: dateKey });

    if (error) {
        toast({ variant: 'destructive', title: 'Error al eliminar', description: 'No se pudo eliminar la entrada.' });
    } else {
        toast({ title: 'Entrada eliminada' });
        const newEntries = {...entries};
        delete newEntries[dateKey];
        setEntries(newEntries);
    }
     setIsLoading(false);
  };

  const downloadAsTxt = () => {
    if (!selectedEntry || !selectedEntry.contenido) return;
    const blob = new Blob([selectedEntry.contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diario-zinha-${selectedEntry.fecha}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showToast = () => toast({ title: "🚧 Función en desarrollo", description: "Pronto podrás añadir entradas de audio y video." });

  const entryDays = Object.keys(entries).map(dateStr => {
    const date = new Date(dateStr);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  }).filter(isValid);

  return (
    <div className="fixed inset-0 w-full h-full overflow-y-auto">
      <div className="min-h-full p-4 pb-24">
        <Helmet>
          <title>Diario Personal - Zinha</title>
          <meta name="description" content="Tu espacio privado para la descarga emocional y el autoconocimiento." />
        </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-6">
        <h1 className="text-4xl font-bold font-serif text-brand-primary">Diario Personal</h1>
        <p className="text-lg text-brand-secondary max-w-md mx-auto">Un refugio para tus pensamientos y sentimientos.</p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-4 card-hover mb-6">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          modifiers={{ hasEntry: entryDays }}
          modifiersStyles={{
            hasEntry: { fontWeight: 'bold', color: 'var(--brand-primary)', background: 'var(--brand-highlight)', borderRadius: '50%' }
          }}
          locale={es}
          className="flex justify-center"
          captionLayout="dropdown-buttons"
          fromYear={2020}
          toYear={new Date().getFullYear()}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 card-hover">
        <h3 className="text-xl font-bold font-serif text-brand-primary mb-4 flex justify-between items-center">
          {selectedDate && isValid(selectedDate) ? `Entrada para: ${format(selectedDate, 'PPP', { locale: es })}` : 'Selecciona una fecha'}
        </h3>
        <AnimatePresence mode="wait">
        {selectedEntry && !isEditing ? (
            <motion.div key="view" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <div className="w-full h-40 p-4 bg-brand-background/50 rounded-2xl overflow-y-auto whitespace-pre-wrap">
                    {selectedEntry.contenido}
                </div>
                <div className="flex items-center justify-between mt-4">
                    <Button onClick={() => setIsEditing(true)} size="icon" variant="outline" className="rounded-full">
                        <Edit className="w-5 h-5"/>
                    </Button>
                     <Button onClick={downloadAsTxt} size="icon" variant="outline" className="rounded-full">
                        <Download className="w-5 h-5"/>
                    </Button>
                    <Button onClick={handleDeleteEntry} size="icon" variant="destructive" className="rounded-full">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Trash2 className="w-5 h-5"/>}
                    </Button>
                </div>
            </motion.div>
        ) : (
             <motion.div key="edit" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="¿Cómo te sientes hoy? Escribe aquí tu descarga emocional..."
                  className="w-full h-40 p-4 bg-brand-background rounded-2xl border border-brand-accent/30 focus:ring-2 focus:ring-brand-accent focus:outline-none transition-shadow"
                  disabled={!selectedDate || !isValid(selectedDate) || isLoading}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2">
                    <Button onClick={showToast} size="icon" variant="outline" className="rounded-full border-brand-accent text-brand-secondary">
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button onClick={showToast} size="icon" variant="outline" className="rounded-full border-brand-accent text-brand-secondary">
                      <Video className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button onClick={handleSaveEntry} className="bg-brand-primary hover:bg-brand-dark-blue text-white rounded-full px-6" disabled={!selectedDate || !isValid(selectedDate) || isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Type className="w-4 h-4 mr-2" />}
                    Guardar
                  </Button>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default EmotionalJournal;