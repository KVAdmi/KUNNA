
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Gift, Copy, Check, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient';

const ReferralPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user) return;
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('codigo_invitacion')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching referral code:", profileError);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo obtener tu código de invitación.' });
      } else {
        setReferralCode(profileData.codigo_invitacion);
      }

      const { data: referralsData, error: referralsError } = await supabase
        .from('referidos')
        .select('referido_id, creado_en, profiles(username, email)')
        .eq('invitador_id', user.id);

      if (referralsError) {
        console.error("Error fetching referred users:", referralsError);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar la lista de referidos.' });
      } else {
        setReferredUsers(referralsData);
      }
      
      setLoading(false);
    };

    fetchReferralData();
  }, [user, toast]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({ title: '¡Copiado!', description: 'Tu código de invitación ha sido copiado al portapapeles.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 overflow-y-auto">
      <Helmet>
        <title>Invita y Gana - KUNNA</title>
        <meta name="description" content="Comparte tu código de invitación y ayuda a crecer la comunidad de KUNNA." />
      </Helmet>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8">
        <Gift className="mx-auto h-12 w-12 text-brand-accent" />
        <h1 className="text-4xl font-bold font-serif text-brand-primary mt-2">Invita y Gana</h1>
        <p className="text-lg text-brand-secondary max-w-md mx-auto">Comparte la magia de KUNNA con tus amigas.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 card-hover text-center mb-6">
        <h2 className="text-xl font-bold font-serif text-brand-primary mb-2">Tu Código de Invitación</h2>
        {loading ? (
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-primary" />
        ) : (
          <>
            <div className="bg-brand-background border-2 border-dashed border-brand-accent rounded-lg p-4 flex items-center justify-center my-4">
              <p className="text-2xl font-bold text-brand-dark-blue tracking-widest">{referralCode}</p>
            </div>
            <Button onClick={handleCopy} className="w-full bg-brand-accent hover:bg-brand-accent/80">
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? '¡Copiado!' : 'Copiar Código'}
            </Button>
          </>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-3xl p-6 card-hover">
        <h2 className="text-xl font-bold font-serif text-brand-primary mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Amigas que has invitado ({referredUsers.length})
        </h2>
        {loading ? (
             <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-primary" />
        ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
            {referredUsers.length > 0 ? referredUsers.map(ref => (
                <div key={ref.referido_id} className="bg-brand-background p-3 rounded-lg flex justify-between items-center">
                    <p className="text-brand-secondary font-medium">{ref.profiles?.username || ref.profiles?.email || 'Amiga KUNNA'}</p>
                    <p className="text-xs text-brand-secondary/80">{new Date(ref.creado_en).toLocaleDateString()}</p>
                </div>
            )) : (
                <p className="text-center text-brand-secondary py-4">Aún no has invitado a nadie. ¡Comparte tu código!</p>
            )}
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReferralPage;
