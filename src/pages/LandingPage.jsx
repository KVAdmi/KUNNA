import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, Heart, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';


const FeatureCard = ({ icon, title, description, delay }) => {
  const Icon = icon;
  return (
    <motion.div
      className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-brand-accent/20 card-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-brand-accent/20 rounded-full">
          <Icon className="w-6 h-6 text-brand-accent" />
        </div>
        <h3 className="text-xl font-bold text-brand-primary">{title}</h3>
      </div>
      <p className="text-brand-secondary">{description}</p>
    </motion.div>
  )
};

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Botones de auxilio, acompañamiento en tiempo real, red de apoyo para que te sientas segura 24/7.',
    },
    {
      icon: Heart,
      title: 'Bienestar',
      description: 'Herramientas de gestión emocional, diario, meditaciones y mucho más.',
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Conecta con otras mujeres en un espacio de confianza, comparte experiencias y crece en tribu.',
    },
    {
      icon: BookOpen,
      title: 'Aprendizaje',
      description: 'Contenido curado sobre sexualidad, finanzas, maternidad y más para tu empoderamiento.',
    },
  ];

  return (
<div
  className="min-h-screen"
  style={{
    /* eslint-disable-next-line */
backgroundImage: `url('/images/imagen_landing.png')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  }}
>
      <div className="relative w-full max-w-7xl mx-auto bg-white/50 backdrop-blur-md">
        <header className="absolute top-0 left-0 right-0 z-10 p-6">
          {/* Header vacío - botones movidos al centro */}
        </header>

        <main>
          <section className="relative min-h-screen flex items-center justify-center text-center px-6 overflow-hidden">
            {/* Efectos de fondo sutiles con colores de la marca */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-background/30 via-white/20 to-brand-accent/10"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 max-w-4xl mx-auto"
            >
              {/* Logo grande centrado */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <img 
                  src="/images/logo_kunna.png" 
                  alt="KUNNA Logo" 
                  className="h-32 md:h-40 mx-auto mb-4 drop-shadow-lg" 
                />
                <span className="font-bold text-4xl md:text-5xl font-serif text-brand-primary block">KUNNA</span>
              </motion.div>

              <motion.h1 
                className="text-4xl md:text-6xl font-extrabold mb-6 font-serif leading-tight text-brand-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Tu espacio de <span className="text-brand-accent">confianza</span>
              </motion.h1>
              
              <motion.p 
                className="max-w-2xl mx-auto text-lg md:text-xl text-brand-secondary mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                KUNNA es la primera app de bienestar + seguridad + acompañamiento para mujeres. Conéctate, aprende y siéntete segura, todo en un mismo lugar.
              </motion.p>
              
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link to="/register">
                  <Button size="lg" className="text-lg py-7 px-12 group bg-brand-accent hover:bg-brand-accent/90 text-white rounded-full transition-all duration-300 shadow-lg">
                    Únete a la comunidad
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                {/* Botón de iniciar sesión centrado */}
                <div className="flex justify-center items-center mt-6">
                  <Link to="/login">
                    <Button 
                      size="lg" 
                      className="min-w-[200px] bg-brand-primary hover:bg-brand-primary/90 text-white rounded-full transition-all duration-300"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </section>

          <section id="features" className="py-24 px-6 bg-white/60 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-brand-primary">
                  Un refugio para cada momento de tu vida
                </h2>
                <p className="text-xl text-brand-secondary mb-4 max-w-4xl mx-auto leading-relaxed">
                  Diseñamos cada herramienta pensando en ti, para acompañarte en tu camino de autodescubrimiento y empoderamiento.
                </p>
                <div className="w-24 h-1 bg-brand-accent mx-auto rounded-full"></div>
              </motion.div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <FeatureCard key={index} {...feature} delay={index * 0.2} />
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 px-6 bg-brand-background/30">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/60 backdrop-blur-lg p-12 rounded-2xl shadow-lg border border-brand-accent/20"
              >
                <div className="mb-6">
                  <Sparkles className="w-16 h-16 mx-auto text-brand-accent mb-4" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-brand-primary">
                  Conecta con tu Zona Holística
                </h2>
                <p className="text-xl text-brand-secondary mb-10 max-w-3xl mx-auto leading-relaxed">
                  Descubre rituales, tarot, meditaciones y más herramientas para nutrir tu espíritu y encontrar balance.
                </p>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg py-6 px-10 border-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white rounded-full transition-all duration-300 shadow-lg"
                  >
                    Explorar KUNNA
                  </Button>
                </Link>
              </motion.div>
            </div>
          </section>
        </main>

        <footer className="bg-white/60 backdrop-blur-lg p-8 border-t border-brand-accent/20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-4">
              <span className="font-bold text-2xl font-serif text-brand-primary">KUNNA</span>
              <p className="text-brand-secondary mt-2">Tu espacio de confianza</p>
            </div>
            <div className="text-brand-secondary">
              <p>&copy; {new Date().getFullYear()} KUNNA by Kódigo Vivo. Todos los derechos reservados.</p>
              <div className="mt-4">
                <Link to="/legal" className="text-sm hover:text-brand-primary underline transition-colors duration-300">
                  Políticas de Privacidad y Términos de Uso
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;