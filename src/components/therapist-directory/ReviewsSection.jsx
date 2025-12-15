
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '../../contexts/SupabaseAuthContext.jsx';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import StarRating from '@/components/ui/StarRating';

const ReviewsSection = ({ therapistId, reviews, fetchReviews }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [newReview, setNewReview] = useState('');
    const [newRating, setNewRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user || newRating === 0 || !newReview.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, deja una puntuación y un comentario.' });
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('reseñas_terapeutas').insert({
            terapeuta_id: therapistId,
            user_id: user.id,
            comentario: newReview,
            puntuacion: newRating,
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar tu reseña. Es posible que ya hayas dejado una.' });
        } else {
            toast({ title: '¡Gracias!', description: 'Tu reseña ha sido publicada.' });
            setNewReview('');
            setNewRating(0);
            fetchReviews(therapistId);
        }
        setSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t overflow-hidden"
        >
            <h4 className="font-bold mb-4 text-brand-primary">Reseñas ({reviews.length})</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="bg-brand-background/50 p-3 rounded-lg">
                            <StarRating rating={review.puntuacion} isInteractive={false} size={4} />
                            <p className="text-sm text-brand-secondary mt-1">{review.comentario}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-brand-secondary">Todavía no hay reseñas. ¡Sé la primera!</p>
                )}
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
                <h5 className="font-semibold text-brand-primary">Deja tu reseña</h5>
                <StarRating rating={newRating} onRatingChange={setNewRating} />
                <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    placeholder="Comparte tu experiencia..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-accent"
                    rows="3"
                />
                <Button type="submit" disabled={submitting} className="w-full bg-brand-accent hover:bg-brand-accent/80 text-white">
                    {submitting ? 'Enviando...' : 'Publicar Reseña'}
                </Button>
            </form>
        </motion.div>
    );
};

export default ReviewsSection;
