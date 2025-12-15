import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Verificar si tenemos los parámetros necesarios del enlace de reset
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!accessToken || !refreshToken) {
      toast({
        variant: 'destructive',
        title: 'Enlace inválido',
        description: 'Este enlace de recuperación no es válido o ha expirado.',
      });
      navigate('/login');
    }
  }, [searchParams, navigate, toast]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, completa ambos campos de contraseña.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Contraseñas no coinciden',
        description: 'Las contraseñas deben ser idénticas.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-brand-primary p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm mx-auto text-center glass-effect rounded-3xl p-8 shadow-2xl shadow-brand-accent/10"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-white mb-4">¡Contraseña actualizada!</h1>
          <p className="text-brand-secondary mb-6">
            Tu contraseña ha sido cambiada con éxito. Serás redirigida al login en unos segundos.
          </p>
          <Link to="/login">
            <Button className="w-full bg-brand-accent hover:bg-brand-secondary text-white rounded-full">
              Ir al login
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-brand-primary p-4">
      <BackButton fallbackRoute="/login" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto text-center glass-effect rounded-3xl p-8 shadow-2xl shadow-brand-accent/10"
      >
        <img
          src="/images/logo_kunna.png"
          alt="KUNNA Logo"
          className="h-20 mx-auto mb-4"
        />
        
        <h1 className="text-2xl font-serif text-white mb-2">Nueva Contraseña</h1>
        <p className="text-sm text-brand-secondary mb-6">
          Ingresa tu nueva contraseña para completar el proceso de recuperación.
        </p>
        
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" />
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-background/80 text-brand-primary rounded-full border-2 border-transparent focus:border-brand-accent focus:ring-0"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary" />
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-brand-background/80 text-brand-primary rounded-full border-2 border-transparent focus:border-brand-accent focus:ring-0"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-brand-accent hover:bg-brand-secondary text-white rounded-full text-lg py-6" 
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </form>
        
        <p className="mt-6 text-sm text-brand-secondary">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="font-semibold text-brand-accent hover:underline">
            Volver al login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
