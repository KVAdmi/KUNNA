import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Campos incompletos', description: 'Por favor, introduce tu correo y contraseña.' });
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al iniciar sesión', description: 'Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.' });
      setLoading(false);
    } else {
      toast({ title: '¡Bienvenida de nuevo!', description: 'Has iniciado sesión con éxito.' });
      // Navigation is handled by the App component after profile check
    }
    // Don't setLoading(false) here, as the app will navigate away
  };
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ variant: 'destructive', title: 'Error con Google', description: error.message });
      setLoading(false);
    }
    // Navigation will be handled by onAuthStateChange and App component
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ variant: 'destructive', title: 'Campo requerido', description: 'Por favor, ingresa tu correo electrónico.' });
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(resetEmail);
    setLoading(false);
    if (!error) {
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center bg-brand-primary p-4">
      {/* Botón de navegación reutilizable */}
      <BackButton fallbackRoute="/landing" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm mx-auto text-center glass-effect rounded-3xl p-8 shadow-2xl shadow-brand-accent/10"
      >
        <img
          src="/images/logo_kunna.png"
          alt="KUNNA Logo"
          className="h-20 mx-auto mb-4"
        />
        <h1 className="text-2xl font-serif text-white mb-6">Inicia Sesión</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-white text-white rounded-2xl border-2 border-gray-200 focus:border-brand-accent focus:ring-0 shadow-sm transition-all duration-300"
              style={{ 
                fontSize: '16px',
                backgroundColor: '#ffffff',
                color: 'white'
              }}
              disabled={loading}
              autoComplete="email"
            />
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-white text-white rounded-2xl border-2 border-gray-200 focus:border-brand-accent focus:ring-0 shadow-sm transition-all duration-300"
              style={{ 
                fontSize: '16px',
                backgroundColor: '#ffffff'
              }}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <Button type="submit" className="w-full bg-brand-accent hover:bg-brand-secondary text-white rounded-full text-lg py-6" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        
        {/* Enlace para recuperar contraseña */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-brand-accent hover:text-brand-secondary underline"
            disabled={loading}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-accent/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-brand-primary text-brand-secondary">o</span>
          </div>
        </div>
        <Button onClick={handleGoogleLogin} variant="outline" className="w-full bg-transparent border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white rounded-full text-lg py-6 flex items-center justify-center space-x-2" disabled={loading}>
          <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.618-3.229-11.127-7.71h-6.693C8.951,35.596,15.931,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
          <span>Continuar con Google</span>
        </Button>
        <p className="mt-6 text-sm text-brand-secondary">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-semibold text-brand-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </motion.div>

      {/* Modal para recuperar contraseña */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm glass-effect rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-xl font-serif text-white mb-4 text-center">Recuperar Contraseña</h2>
            <p className="text-sm text-brand-secondary mb-6 text-center">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 bg-white text-white rounded-2xl border-2 border-gray-200 focus:border-brand-accent focus:ring-0 shadow-sm transition-all duration-300"
                  style={{ fontSize: '16px', backgroundColor: '#ffffff' }}
                  disabled={loading}
                  autoComplete="email"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline" 
                  className="flex-1 bg-transparent border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white rounded-full"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-brand-accent hover:bg-brand-secondary text-white rounded-full" 
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;