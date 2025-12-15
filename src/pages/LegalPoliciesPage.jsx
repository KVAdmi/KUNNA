import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { FileText, Loader2 } from 'lucide-react';
import supabase from '@/lib/customSupabaseClient'
import { useToast } from '@/components/ui/use-toast';

const LegalPoliciesPage = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('politicas_legales')
        .select('*')
        .order('publicada_en', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las políticas legales.' });
        console.error(error);
      } else {
        setPolicy(data);
      }
      setLoading(false);
    };

    fetchPolicy();
  }, [toast]);

  return (
    <div className="min-h-screen bg-brand-background p-4 sm:p-6 md:p-8">
      <Helmet>
        <title>Políticas Legales - KUNNA</title>
        <meta name="description" content="Términos de Uso y Políticas de Privacidad de KUNNA." />
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <FileText className="mx-auto h-12 w-12 text-brand-accent" />
          <h1 className="text-4xl font-bold font-serif text-brand-primary mt-2">Documentos Legales</h1>
          <p className="text-lg text-brand-secondary">Términos, condiciones y políticas de privacidad.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
            </div>
          ) : policy ? (
            <article className="prose max-w-none">
              <h2 className="text-2xl font-bold text-brand-primary">{policy.titulo}</h2>
              <div className="text-sm text-brand-secondary mb-4">
                <p>Versión: {policy.version}</p>
                <p>Última actualización: {new Date(policy.publicada_en).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="whitespace-pre-wrap text-brand-primary/80" dangerouslySetInnerHTML={{ __html: policy.contenido }}></div>
            </article>
          ) : (
            <p className="text-center text-brand-secondary py-20">No se encontró ninguna política legal publicada.</p>
          )}
        </div>
        
        <footer className="text-center mt-8 text-sm text-brand-secondary">
          <p>&copy; {new Date().getFullYear()} Kódigo Vivo S.A.S.</p>
          <p>Todos los derechos reservados.</p>
        </footer>
      </motion.div>
    </div>
  );
};

export default LegalPoliciesPage;