
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { HeartHandshake } from 'lucide-react';
import AdminForm from '@/components/therapist-directory/AdminForm';
import TherapistCard from '@/components/therapist-directory/TherapistCard';

const TherapistDirectoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [therapistToEdit, setTherapistToEdit] = useState(null);
  const [reviewsData, setReviewsData] = useState({});

  const isAdmin = user?.email === 'asistia24@gmail.com';

  const fetchReviewsForTherapist = useCallback(async (therapistId) => {
    const { data: reviews, error } = await supabase
        .from('reseñas_terapeutas')
        .select('id, comentario, puntuacion')
        .eq('terapeuta_id', therapistId);

    if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las reseñas.' });
        return;
    }

    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 ? reviews.reduce((acc, r) => acc + r.puntuacion, 0) / reviewCount : 0;

    setReviewsData(prev => ({
        ...prev,
        [therapistId]: {
            reviews,
            averageRating: Math.round(averageRating * 10) / 10,
            reviewCount,
        }
    }));
  }, [toast]);

  const fetchTherapists = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('directorio_terapeutas')
      .select('*, reseñas_terapeutas(count)')
      .order('nombre', { ascending: true });

    if (!isAdmin) {
      query = query.eq('visible', true);
    }

    const { data, error } = await query;

    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el directorio.' });
      setTherapists([]);
    } else {
      setTherapists(data);
      // Pre-calculate average ratings
      const { data: allReviews, error: reviewsError } = await supabase.from('reseñas_terapeutas').select('terapeuta_id, puntuacion');
      if (!reviewsError) {
          const reviewsByTherapist = allReviews.reduce((acc, review) => {
              if (!acc[review.terapeuta_id]) {
                  acc[review.terapeuta_id] = [];
              }
              acc[review.terapeuta_id].push(review.puntuacion);
              return acc;
          }, {});

          const initialReviewsData = data.reduce((acc, therapist) => {
              const ratings = reviewsByTherapist[therapist.id] || [];
              const reviewCount = ratings.length;
              const averageRating = reviewCount > 0 ? ratings.reduce((sum, r) => sum + r, 0) / reviewCount : 0;
              acc[therapist.id] = {
                  reviews: [],
                  averageRating: Math.round(averageRating * 10) / 10,
                  reviewCount,
              };
              return acc;
          }, {});
          setReviewsData(initialReviewsData);
      }
    }
    setLoading(false);
  }, [isAdmin, toast]);

  useEffect(() => {
    fetchTherapists();
  }, [fetchTherapists]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás segura de que quieres eliminar este terapeuta?')) {
      const { error } = await supabase.from('directorio_terapeutas').delete().eq('id', id);
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } else {
        toast({ title: 'Éxito', description: 'Terapeuta eliminado.' });
        fetchTherapists();
      }
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-[100dvh] flex flex-col">
      <Helmet>
        <title>Directorio de Terapeutas - KUNNA</title>
        <meta name="description" content="Encuentra apoyo profesional en nuestro directorio de terapeutas de confianza." />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <HeartHandshake className="mx-auto h-16 w-16 text-brand-accent" />
          <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mt-4">Directorio de Terapeutas</h1>
          <p className="text-lg text-brand-secondary mt-2">Un espacio seguro para encontrar apoyo profesional.</p>
        </motion.div>

        {isAdmin && <AdminForm fetchTherapists={fetchTherapists} therapistToEdit={therapistToEdit} setTherapistToEdit={setTherapistToEdit} />}

        {loading ? (
          <div className="text-center text-brand-secondary">Cargando terapeutas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapists.length > 0 ? (
              therapists.map(therapist => (
                <TherapistCard 
                    key={therapist.id} 
                    therapist={therapist} 
                    isAdmin={isAdmin} 
                    onEdit={setTherapistToEdit} 
                    onDelete={handleDelete}
                    reviewsData={reviewsData}
                    fetchReviews={fetchReviewsForTherapist}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-brand-secondary">No hay terapeutas disponibles en este momento.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistDirectoryPage;
