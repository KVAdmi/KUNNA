
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Podcast, Headphones, Play, Library, ListMusic, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PodcastPage = () => {
    const { toast } = useToast();
    const [latestEpisode, setLatestEpisode] = useState(null);
    const [recentEpisodes, setRecentEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const showToast = (title, description) => toast({ title, description });

    const fetchEpisodes = useCallback(async () => {
        setLoading(true);
        try {
            const { data: latest, error: latestError } = await supabase
                .from('podcast')
                .select('*')
                .order('fecha_creacion', { ascending: false })
                .limit(1)
                .single();

            if (latestError && latestError.code !== 'PGRST116') throw latestError;
            setLatestEpisode(latest);

            const { data: recent, error: recentError } = await supabase
                .from('podcast')
                .select('*')
                .order('fecha_creacion', { ascending: false })
                .limit(10);

            if (recentError) throw recentError;
            setRecentEpisodes(recent);

        } catch (error) {
            showToast('Error al cargar el podcast', 'No se pudieron obtener los episodios. Inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchEpisodes();
    }, [fetchEpisodes]);

    const playLatest = () => {
        if (latestEpisode?.url_audio) {
            window.open(latestEpisode.url_audio, '_blank');
        } else {
            showToast("Episodio no disponible", "No se encontró el audio del último episodio.");
        }
    };
    
    return (
        <div className="min-h-screen p-4 md:p-8 bg-brand-background">
            <Helmet>
                <title>Escucha a KUNNA - Podcast</title>
                <meta name="description" content="Un espacio para sentirnos cerca, escucharnos y abrazarnos con palabras." />
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-block p-4 bg-brand-accent/20 rounded-full mb-4">
                    <Podcast className="h-12 w-12 text-brand-primary" />
                </div>
                <h1 className="text-4xl font-bold font-serif text-brand-primary mt-2">Escucha a KUNNA</h1>
                <p className="text-lg text-brand-secondary max-w-md mx-auto mt-2">
                    Un espacio para sentirnos cerca, escucharnos y abrazarnos con palabras.
                </p>
            </motion.div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                </div>
            ) : (
                <div className="max-w-md mx-auto space-y-8">
                    {latestEpisode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl shadow-lg p-6 text-center"
                        >
                            <div className="inline-block p-3 bg-brand-background rounded-full mb-4">
                                <Headphones className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h2 className="text-2xl font-bold font-serif text-brand-primary">Podcast "Sin miedo, sin permiso"</h2>
                            <p className="text-brand-secondary mt-2 mb-6">
                                Escucha cada semana nuevas reflexiones, historias y entrevistas que te abrazan el alma.
                            </p>
                            
                            <div className="space-y-3">
                                <Button onClick={playLatest} className="w-full h-12 bg-brand-primary text-white rounded-full text-base font-semibold shadow-lg hover:bg-brand-dark-blue">
                                    <Play className="w-5 h-5 mr-2" /> Reproducir episodio más reciente
                                </Button>
                                <Button onClick={() => showToast("Próximamente", "El archivo de episodios estará disponible muy pronto.")} variant="outline" className="w-full h-12 rounded-full text-base font-semibold border-brand-secondary text-brand-secondary hover:bg-brand-accent/20">
                                    <Library className="w-5 h-5 mr-2" /> Archivo de episodios
                                </Button>
                                <Button onClick={() => showToast("Próximamente", "Nuestra playlist musical llegará muy pronto.")} variant="outline" className="w-full h-12 rounded-full text-base font-semibold border-brand-secondary text-brand-secondary hover:bg-brand-accent/20">
                                    <ListMusic className="w-5 h-5 mr-2" /> Escucha nuestras canciones
                                </Button>
                            </div>

                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PodcastPage;
