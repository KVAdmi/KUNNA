import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient'
import { PartyPopper, Heart, Loader2, AlertCircle, Check, ArrowRight, Sparkles } from 'lucide-react';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [status, setStatus] = useState('processing'); 

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const plan = query.get('plan');

    useEffect(() => {
        const updateProfilePlan = async () => {
            if (user && plan) {
                try {
                    console.log('✅ Actualizando estado de pago para usuario:', user.id);
                    console.log('📦 Plan seleccionado:', plan);

                    const { error } = await supabase
                        .from('profiles')
                        .update({ 
                            tipo_plan: plan,
                            has_paid: true,
                            payment_date: new Date().toISOString()
                        })
                        .eq('id', user.id);

                    if (error) {
                        console.error('❌ Error actualizando perfil:', error);
                        toast({
                            variant: 'destructive',
                            title: 'Error de actualización',
                            description: 'No pudimos actualizar tu plan. Por favor, contacta a soporte.',
                        });
                        setStatus('error');
                    } else {
                        console.log('✅ Perfil actualizado correctamente');
                        toast({
                            title: '¡Pago exitoso! ',
                            description: `Tu ${getPlanName(plan)} ha sido activado correctamente. ¡Bienvenida a KUNNA!`,
                            className: 'bg-green-100 border-green-400 text-green-800'
                        });
                        setStatus('success');
                        
                        // Redirigir al perfil después de 3 segundos
                        setTimeout(() => {
                            navigate('/perfil');
                        }, 3000);
                    }
                } catch (error) {
                    console.error(' Error procesando el pago exitoso:', error);
                    setStatus('error');
                }
            } else {
                setStatus('error');
            }
        };

        updateProfilePlan();
    }, [user, plan, toast, navigate]);

    const getPlanName = (plan) => {
        const plans = {
            mensual: 'Plan Mensual',
            trimestral: 'Plan Trimestral', 
            semestral: 'Plan Semestral',
            anual: 'Plan Anual'
        };
        return plans[plan] || 'Plan Premium';
    };

    const renderContent = () => {
        switch (status) {
            case 'processing':
                return (
                    <>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 mx-auto mb-8"
                        >
                            <Sparkles className="w-20 h-20 text-[#c1d43a]" />
                        </motion.div>
                        
                        <h1 className="text-3xl font-bold text-[#382a3c] mb-4">
                             Activando tu membresía
                        </h1>
                        
                        <p className="text-[#382a3c]/70 text-lg mb-6">
                            Estamos configurando tu cuenta premium...
                        </p>
                    </>
                );
            case 'success':
                return (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 mx-auto mb-8 bg-green-100 rounded-full flex items-center justify-center"
                        >
                            <Check className="w-12 h-12 text-green-600" />
                        </motion.div>
                        
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-bold text-[#382a3c] mb-4"
                        >
                             ¡Pago exitoso!
                        </motion.h1>
                        
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mb-8"
                        >
                            <p className="text-[#382a3c]/70 text-lg mb-4">
                                Tu <span className="font-semibold text-[#c1d43a]">{getPlanName(plan)}</span> ha sido activado correctamente
                            </p>
                            
                            <div className="flex items-center justify-center space-x-2 text-[#382a3c]/60">
                                <Heart className="w-5 h-5 text-red-400" />
                                <span>¡Bienvenida a KUNNA!</span>
                                <Heart className="w-5 h-5 text-red-400" />
                            </div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <p className="text-sm text-[#382a3c]/60">
                                Serás redirigida a tu perfil en unos segundos...
                            </p>
                            
                            <Button
                                onClick={() => navigate('/perfil')}
                                className="bg-gradient-to-r from-[#c1d43a] to-[#a8c139] hover:from-[#a8c139] hover:to-[#c1d43a] text-[#382a3c] rounded-2xl px-8 py-3 font-semibold shadow-xl border border-white/30 w-full"
                            >
                                Ir a mi perfil
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    </>
                );
            case 'error':
            default:
                return (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 mx-auto mb-8 bg-red-100 rounded-full flex items-center justify-center"
                        >
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </motion.div>
                        
                        <h1 className="text-3xl font-bold text-red-600 mb-4">
                            ❌ Hubo un problema
                        </h1>
                        
                        <p className="text-[#382a3c]/70 text-lg mb-8 max-w-md mx-auto">
                            No pudimos procesar tu suscripción en este momento. Por favor, intenta de nuevo o contacta a soporte.
                        </p>
                        
                        <Button
                            onClick={() => navigate('/perfil')}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl px-8 py-3 font-semibold shadow-xl w-full max-w-sm"
                        >
                            Volver al perfil
                        </Button>
                    </>
                );
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{ 
                fontFamily: 'Questrial, sans-serif',
                background: 'linear-gradient(135deg, #f5e6ff 0%, #c8a6a6 25%, #8d75838 50%, #c1d43a 75%, #382a3c 100%)'
            }}
        >
            <Helmet>
                <title>Pago Exitoso - KUNNA</title>
                <meta name="description" content="Confirmación de tu suscripción a KUNNA." />
            </Helmet>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-12 max-w-lg w-full text-center shadow-2xl border border-white/50"
            >
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default PaymentSuccessPage;