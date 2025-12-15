import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Apple, 
  Heart, 
  Flower, 
  Sprout, 
  Brain, 
  ClipboardList, 
  Search, 
  BookmarkPlus, 
  Share2, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  Download,
  Calendar,
  Users,
  Shield,
  BookOpen,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import InteractiveTest from '@/components/InteractiveTest.jsx';
import ArticleViewer from '@/components/ArticleViewer.jsx';

const BienestarCompleto = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteArticles, setFavoriteArticles] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isRelationCollapsed, setIsRelationCollapsed] = useState(true);
  const [isTipsCollapsed, setIsTipsCollapsed] = useState(true);

  // Categorías principales del módulo con paleta actualizada
  const categories = [
    {
      id: 'nutricion',
      title: 'Nutrición y Dietas',
      icon: Apple,
      color: '#c1d43a', // Lime de la paleta oficial
      description: 'Alimentación consciente para energía y bienestar',
      intro: 'Lo que comes es la gasolina de tu cuerpo y la chispa de tu energía. Aquí no hay dietas de castigo, solo caminos inteligentes para que tu cuerpo y mente rindan al 100%. Como tu psicóloga nutricional, te acompaño en cada decisión alimentaria.'
    },
    {
      id: 'sexualidad',
      title: 'Sexualidad Consciente',
      icon: Heart,
      color: '#c8a6a6', // Mauve de la paleta oficial
      description: 'Autoconocimiento y placer sin tabúes',
      intro: 'La sexualidad no es solo placer, es energía vital, conexión contigo misma y expresión de tu feminidad. Conócete, cuídate y disfrútate sin tabúes. Soy tu espacio seguro para explorar sin juicios.'
    },
    {
      id: 'menopausia',
      title: 'Menopausia',
      icon: Flower,
      color: '#8d7583', // Gray Purple de la paleta oficial
      description: 'Una nueva etapa con energía y plenitud',
      intro: 'La menopausia no es el fin, es una nueva temporada de tu vida que puedes vivir con energía, plenitud y autocuidado. Como tu compañera en este viaje, te ayudo a navegar cada cambio con sabiduría y amor.'
    },
    {
      id: 'fertilidad',
      title: 'Fertilidad',
      icon: Sprout,
      color: '#f5e6ff', // Light Lavender Background de la paleta oficial
      description: 'Conoce y respeta tu ciclo natural',
      intro: 'Tu fertilidad es única, y cuidarla no siempre significa buscar un embarazo, sino conocer y respetar tu ciclo. Te acompaño en el autoconocimiento de tu cuerpo y sus ritmos naturales.'
    },
    {
      id: 'emocional',
      title: 'Salud Emocional',
      icon: Brain,
      color: '#382a3c', // Deep Purple de la paleta oficial
      description: 'Herramientas para tu bienestar mental',
      intro: 'Cuidar tu mente es tan importante como cuidar tu cuerpo. Como tu psicóloga de cabecera, te ofrezco herramientas profesionales para construir resiliencia, calma y bienestar emocional duradero.'
    },
    {
      id: 'test',
      title: 'Test y Herramientas',
      icon: ClipboardList,
      color: '#263152', // Dark Blue de la paleta oficial
      description: 'Autoevaluaciones para conocerte mejor',
      intro: 'Conócete mejor para cuidarte mejor. Como profesional de la psicología, he diseñado estos test para darte pistas precisas y caminos claros para mejorar tu calidad de vida.'
    }
  ];

  // Contenido expandido para cada categoría - Como tu psicóloga de cabecera
  const categoryContent = {
    nutricion: {
      articles: [
        {
          id: 1,
          title: 'Alimentación Consciente: El Arte de Nutrir tu Alma',
          summary: 'Transformación integral a través del mindful eating: sanación emocional, reconexión corporal y elevación espiritual',
          content: `
            <div className="relative min-h-screen bg-gradient-to-br from-brand-background/5 via-transparent to-brand-secondary/5 p-4 sm:p-6 lg:p-8">
              <!-- Hero Glass Container -->
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary">Alimentación Consciente</h1>
                    <p className="text-brand-secondary text-base sm:text-lg">El Arte Sagrado de Nutrir tu Alma</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-accent/15 to-transparent p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-brand-accent/30">
                    <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-2"> Neurociencia</h3>
                    <p className="text-brand-secondary text-sm sm:text-base">Rewiring cerebral para nuevos patrones alimentarios</p>
                  </div>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-secondary/15 to-transparent p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-brand-secondary/30">
                    <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-2"> Terapia Somática</h3>
                    <p className="text-brand-secondary text-sm sm:text-base">Reconexión con la sabiduría corporal</p>
                  </div>
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-background/15 to-transparent p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-brand-background/30 sm:col-span-2 lg:col-span-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-2"> Mindfulness</h3>
                    <p className="text-brand-secondary text-sm sm:text-base">Presencia sagrada en cada bocado</p>
                  </div>
                </div>
                
                <blockquote className="text-lg sm:text-xl italic text-brand-primary text-center py-4 sm:py-6 border-l-4 border-brand-accent pl-4 sm:pl-6 bg-gradient-to-r from-brand-accent/5 to-transparent rounded-r-xl">
                  "La alimentación consciente no es solo nutrir el cuerpo, es un acto de amor propio que sana heridas emocionales profundas y eleva tu vibración energética."
                  <cite className="block text-xs sm:text-sm text-brand-secondary mt-2">— Dra. Especialista en Psicología Nutricional</cite>
                </blockquote>
              </div>

              <!-- Sección Terapéutica - Sanación Emocional -->
              <div className="backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-primary mb-4 sm:mb-6">
                  Protocolo de Sanación Emocional
                </h2>
                
                <div className="mb-6 sm:mb-8">
                  <div className="backdrop-blur-lg bg-gradient-to-r from-brand-accent/15 to-brand-secondary/15 p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-white/30">
                    <h3 className="text-xl sm:text-2xl font-semibold text-brand-primary mb-3 sm:mb-4"> Las 7 Heridas Alimentarias del Alma</h3>
                    <p className="text-brand-secondary mb-4 sm:mb-6 text-sm sm:text-base">Como psicoterapeuta especializada, he identificado los patrones emocionales más profundos que sabotean nuestra relación con la comida:</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">1.  Herida del Abandono</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">La comida llena el vacío emocional cuando nos sentimos solas</p>
                          <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Práctica de auto-acompañamiento consciente</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">2.  Herida del Rechazo</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">Comer como autocastigo por no sentirnos "suficientes"</p>
                          <div className="bg-brand-secondary/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Afirmaciones de autoaceptación radical</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">3.  Herida de la Humillación</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">Atracones como forma de rebelión contra el control externo</p>
                          <div className="bg-brand-background/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Recuperación del poder personal</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">4.  Herida de la Traición</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">Pérdida de confianza en nuestro propio cuerpo</p>
                          <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Rebuilding de la confianza corporal</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">5.  Herida de la Injusticia</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">Perfeccionismo alimentario que lleva al todo o nada</p>
                          <div className="bg-brand-secondary/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Flexibilidad compasiva</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">6.  Herida del Desvalor</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">No creernos merecedoras de nutrición de calidad</p>
                          <div className="bg-brand-background/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Rituales de auto-valoración</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                          <h4 className="text-brand-primary font-semibold mb-2 text-sm sm:text-base">7.  Herida del Control</h4>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-3">Necesidad de controlar cada bocado por miedo al "fracaso"</p>
                          <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Sanación:</strong> Soltar y confiar en la sabiduría corporal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Protocolo EFT para Alimentación -->
                <div className="backdrop-blur-lg bg-gradient-to-br from-brand-primary/10 to-transparent p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-brand-primary/20 mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-4 sm:mb-6 flex items-center gap-3">
                    <span className="text-xl sm:text-2xl"></span>
                    <span>Técnica EFT: Liberación Emocional Alimentaria</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                      <h4 className="font-semibold text-brand-primary mb-3 text-sm sm:text-base">Paso 1: Preparación</h4>
                      <p className="text-brand-secondary text-xs sm:text-sm mb-3">Identifica el antojo o emoción (escala 1-10)</p>
                      <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-brand-primary">"Aunque tengo este antojo intenso, me acepto profunda y completamente"</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                      <h4 className="font-semibold text-brand-primary mb-3 text-sm sm:text-base">Paso 2: Secuencia</h4>
                      <div className="space-y-1 sm:space-y-2 text-xs text-brand-secondary">
                        <p>• Coronilla: "Este antojo"</p>
                        <p>• Ceja: "Esta ansiedad"</p>
                        <p>• Ojo: "Esta necesidad"</p>
                        <p>• Nariz: "Esta emoción"</p>
                        <p>• Mentón: "En mi cuerpo"</p>
                        <p>• Clavícula: "Lo libero"</p>
                        <p>• Brazo: "Con amor"</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 p-4 sm:p-5 rounded-xl border border-white/20">
                      <h4 className="font-semibold text-brand-primary mb-3 text-sm sm:text-base">Paso 3: Integración</h4>
                      <p className="text-brand-secondary text-xs sm:text-sm mb-3">Respira profundo y evalúa la intensidad</p>
                      <div className="bg-brand-secondary/20 p-2 sm:p-3 rounded-lg">
                        <p className="text-xs text-brand-primary">Repite hasta llegar a 2-3 en la escala</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección Espiritual - Elevación Vibracional -->
              <div className="backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-primary mb-4 sm:mb-6">
                  Dimensión Espiritual: Alimento como Medicina Sagrada
                </h2>
                
                <div className="mb-6 sm:mb-8">
                  <div className="backdrop-blur-lg bg-gradient-to-r from-brand-background/15 to-brand-secondary/15 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-white/30">
                    <h3 className="text-xl sm:text-2xl font-semibold text-brand-primary mb-4 sm:mb-6"> Los 7 Chakras y la Alimentación Consciente</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">1° Chakra - Muladhara (Raíz)</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Seguridad alimentaria, conexión con la tierra</p>
                          <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Raíces, tubérculos, proteínas de calidad</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Gratitud antes de comer</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">2° Chakra - Svadhisthana (Sacro)</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Creatividad, placer culinario sin culpa</p>
                          <div className="bg-brand-secondary/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Frutas dulces, especias, líquidos</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Saboreo mindful</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">3° Chakra - Manipura (Plexo)</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Poder personal, digestión, metabolismo</p>
                          <div className="bg-brand-background/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Cereales integrales, amarillos</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Respiración en el abdomen</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">4° Chakra - Anahata (Corazón)</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Amor propio, compasión alimentaria</p>
                          <div className="bg-brand-accent/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Verdes, té verde, vegetales de hoja</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Comer con amor, no restricción</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">5° Chakra - Vishuddha (Garganta)</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Expresión auténtica, comunicación de necesidades</p>
                          <div className="bg-brand-secondary/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Líquidos, sopas, frutas jugosas</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Expresar hambre y saciedad</p>
                          </div>
                        </div>
                        
                        <div className="backdrop-blur-lg bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20">
                          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-500 rounded-full flex-shrink-0"></div>
                            <h4 className="font-semibold text-brand-primary text-sm sm:text-base">6°-7° Chakras - Intuición y Conexión</h4>
                          </div>
                          <p className="text-brand-secondary text-xs sm:text-sm mb-2 sm:mb-3">Sabiduría corporal, conexión universal</p>
                          <div className="bg-brand-background/20 p-2 sm:p-3 rounded-lg">
                            <p className="text-xs text-brand-primary"><strong>Alimentos:</strong> Morados, ayuno consciente</p>
                            <p className="text-xs text-brand-primary"><strong>Práctica:</strong> Meditación antes de comer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Rituales Sagrados de Alimentación -->
                <div className="backdrop-blur-lg bg-gradient-to-br from-brand-accent/10 to-transparent p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-brand-accent/20">
                  <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <span className="text-lg sm:text-2xl"></span>
                    <span>Rituales Sagrados de Alimentación</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-3 sm:mb-4 text-sm sm:text-base"> Ritual de Amanecer</h4>
                      <div className="space-y-2 sm:space-y-3 text-brand-secondary text-xs sm:text-sm">
                        <p>1. Al despertar, coloca las manos en tu abdomen</p>
                        <p>2. Pregunta: "¿Qué necesita mi cuerpo para florecer hoy?"</p>
                        <p>3. Escucha la respuesta sin juzgar</p>
                        <p>4. Agradece a tu cuerpo por la noche de sanación</p>
                        <p>5. Hidrata con intención consciente</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-3 sm:mb-4 text-sm sm:text-base"> Ritual de Luna Llena</h4>
                      <div className="space-y-2 sm:space-y-3 text-brand-secondary text-xs sm:text-sm">
                        <p>1. Prepara una comida especial bajo la luna</p>
                        <p>2. Enciende una vela blanca</p>
                        <p>3. Agradece cada ingrediente por su sacrificio</p>
                        <p>4. Come en silencio, honrando cada bocado</p>
                        <p>5. Libera patrones alimentarios que no sirven</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Protocolo Práctico Integral -->
              <div className="backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl">
                <h2 className="text-xl sm:text-2xl font-bold text-brand-primary mb-4 sm:mb-6">
                  Protocolo de Transformación: 12 Semanas
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <!-- Fase 1: Despertar -->
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-accent/15 to-transparent p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-brand-accent/30">
                    <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-3 sm:mb-4"> Fase 1: Despertar (Semanas 1-4)</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 1: Observación</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Diario alimentario sin juicio</li>
                          <li>• Identificación de triggers emocionales</li>
                          <li>• Práctica de respiración pre-comida</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 2: Conciencia Corporal</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Escala de hambre 1-10</li>
                          <li>• Body scan antes de comer</li>
                          <li>• Identificación de saciedad</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semanas 3-4: Mindfulness</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Meditación de la pasa</li>
                          <li>• Comidas de 5 sentidos</li>
                          <li>• Gratitud alimentaria</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fase 2: Sanación -->
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-secondary/15 to-transparent p-6 rounded-2xl border border-brand-secondary/30">
                    <h3 className="text-xl font-semibold text-brand-primary mb-4"> Fase 2: Sanación (Semanas 5-8)</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 5: Heridas Emocionales</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Identificación de herida principal</li>
                          <li>• EFT para liberación emocional</li>
                          <li>• Carta de perdón al cuerpo</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 6: Reprogramación</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Afirmaciones personalizadas</li>
                          <li>• Visualización de autocuidado</li>
                          <li>• Nuevos rituales nutritivos</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semanas 7-8: Autocompasión</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Práctica de loving-kindness</li>
                          <li>• Diálogo interno amoroso</li>
                          <li>• Flexibilidad sin culpa</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Fase 3: Integración -->
                  <div className="backdrop-blur-lg bg-gradient-to-br from-brand-background/15 to-transparent p-6 rounded-2xl border border-brand-background/30">
                    <h3 className="text-xl font-semibold text-brand-primary mb-4"> Fase 3: Maestría (Semanas 9-12)</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 9: Intuición Alimentaria</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Conexión con sabiduría corporal</li>
                          <li>• Elecciones desde el corazón</li>
                          <li>• Confianza en las señales</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semana 10: Rituales Sagrados</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Creación de altar alimentario</li>
                          <li>• Ceremonias de gratitud</li>
                          <li>• Conexión con ciclos lunares</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                        <h4 className="font-medium text-brand-primary mb-2">Semanas 11-12: Integración</h4>
                        <ul className="text-xs text-brand-secondary space-y-1">
                          <li>• Lifestyle design consciente</li>
                          <li>• Plan de mantenimiento</li>
                          <li>• Celebración de logros</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Mantra Final -->
                <div className="mt-8 backdrop-blur-lg bg-gradient-to-r from-brand-accent/10 via-brand-secondary/10 to-brand-background/10 p-8 rounded-2xl border border-white/30 text-center">
                  <h3 className="text-2xl font-bold text-brand-primary mb-4"> Mantra de Transformación</h3>
                  <blockquote className="text-xl italic text-brand-primary mb-4">
                    "Mi cuerpo es un templo sagrado. Cada bocado es un acto de amor propio. Confío en mi sabiduría interior para nutrir mi ser completo: cuerpo, mente y alma."
                  </blockquote>
                  <div className="flex justify-center gap-4 text-brand-secondary">
                    <span>Amor Propio</span>
                    <span>Sabiduría</span>
                    <span>Transformación</span>
                  </div>
                </div>
              </div>
            </div>
          `,
          type: 'Terapia Nutricional',
          slug: 'alimentacion-consciente'
        },
        {
          id: 2,
          title: 'Dietas Energéticas: Combustible para tu Vida',
          summary: 'Planes nutricionales que potencian tu energía vital, claridad mental y estabilidad emocional',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Nutrición Energética: Alimenta tu Vitalidad</h2>
              
              <p className="text-lg leading-relaxed">Como especialista en nutrición funcional, he diseñado estos protocolos alimentarios para maximizar tu energía celular, equilibrar tu sistema nervioso y optimizar tu rendimiento mental y físico. No son dietas restrictivas, son mapas nutricionales hacia tu mejor versión.</p>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 4 Pilares de la Alimentación Energética</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-2">1. Estabilización de Glucosa</h4>
                  <p className="text-brand-secondary">Combina proteínas + fibra + grasas saludables en cada comida para evitar picos y caídas de azúcar que agotan tu energía.</p>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-2">2. Mitocondrias Saludables</h4>
                  <p className="text-brand-secondary">Nutrientes específicos que alimentan las "centrales energéticas" de tus células: CoQ10, magnesio, vitaminas B.</p>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-2">3. Hidratación Inteligente</h4>
                  <p className="text-brand-primary">No solo agua: electrolitos, timing de hidratación y líquidos que realmente nutren tus células.</p>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-2">4. Cronobiología Nutricional</h4>
                  <p className="text-brand-secondary">Come según tu ritmo circadiano: carbohidratos en la mañana, proteínas al mediodía, grasas en la noche.</p>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Plan Energético de 21 Días</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Días 1-7: Detox Energético</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Desayuno:</strong>
                      <p>Smoothie verde + proteína + semillas chía</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Almuerzo:</strong>
                      <p>Ensalada arcoíris + quinoa + salmón</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Cena:</strong>
                      <p>Vegetales al vapor + aguacate + té herbal</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Días 8-14: Construcción Mitocondrial</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Desayuno:</strong>
                      <p>Avena + nueces + berries + colágeno</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Almuerzo:</strong>
                      <p>Bowl de proteína + vegetales + granos integrales</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Cena:</strong>
                      <p>Proteína magra + vegetales de hoja verde</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Días 15-21: Optimización Total</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-primary">Desayuno:</strong>
                      <p>Huevos + vegetales + grasas saludables</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Almuerzo:</strong>
                      <p>Proteína + carbohidratos complejos + vegetales</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Cena:</strong>
                      <p>Proteína ligera + vegetales + infusión adaptógena</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Superalimentos Energéticos Esenciales</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Energía Inmediata</h5>
                  <p className="text-brand-secondary text-sm">Plátano, dátiles, miel cruda, cacao</p>
                </div>
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Energía Sostenida</h5>
                  <p className="text-brand-secondary text-sm">Quinoa, batata, avena, almendras</p>
                </div>
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Energía Celular</h5>
                  <p className="text-brand-secondary text-sm">Espinaca, brócoli, sardinas, semillas</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Protocolo de Energía de Emergencia:</h4>
                <p className="text-brand-primary">Cuando te sientes agotada: 1 vaso de agua + 1 cucharadita de sal marina + jugo de 1/2 limón + 1 cucharadita de miel. Toma lentamente y siente cómo tu energía se restaura en 15 minutos.</p>
              </div>
            </div>
          `,
          type: 'Plan Personalizado',
          slug: 'dietas-energeticas'
        },
        {
          id: 3,
          title: 'Control de Peso Sin Tortura Mental',
          summary: 'Estrategias psicológicas para alcanzar tu peso ideal sin dañar tu autoestima',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Liberándote de las Dietas Tóxicas</h2>
              
              <p className="text-lg leading-relaxed">Como psicóloga especializada en trastornos alimentarios y nutrióloga holística, te enseño que el control de peso saludable no se trata de restricción o castigo, sino de crear una relación amorosa y sostenible con tu cuerpo y la comida.</p>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border-l-4 border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-2">Desmitificando el Control de Peso:</h4>
                <p className="text-brand-secondary italic">"Tu peso ideal no es el que dicta la sociedad, es el peso en el que tu cuerpo funciona óptimamente y te sientes vibrante, energética y en paz."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 7 Pilares del Control de Peso Consciente</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">1. Metabolismo Inteligente</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• No hagas dietas extremas - destruyen tu metabolismo</li>
                    <li>• Come cada 3-4 horas para mantener fuego metabólico</li>
                    <li>• Incluye proteína en cada comida (acelera metabolismo 30%)</li>
                    <li>• Bebe agua fría (quema 23% más calorías)</li>
                    <li>• Duerme 7-9 horas (leptina y grelina equilibradas)</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">2. Psicología Alimentaria</h4>
                  <ul className="text-brand-primary space-y-2 text-sm">
                    <li>• Identifica triggers emocionales de sobrealimentación</li>
                    <li>• Practica mindful eating en cada comida</li>
                    <li>• Diferencia hambre física vs. emocional</li>
                    <li>• Usa técnica de "pausa de 20 minutos"</li>
                    <li>• Elimina la mentalidad de "todo o nada"</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">3. Movimiento Joyful</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Encuentra ejercicio que AMES, no que toleres</li>
                    <li>• 150 min/semana actividad moderada</li>
                    <li>• Incluye fuerza 2-3x/semana (músculo quema grasa)</li>
                    <li>• Camina 8,000-10,000 pasos diarios</li>
                    <li>• Ejercicio es medicina, no castigo</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">4. Manejo del Estrés</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Cortisol elevado = acumulación grasa abdominal</li>
                    <li>• Practica meditación 10 min/día</li>
                    <li>• Técnicas de respiración profunda</li>
                    <li>• Yoga o tai chi para reducir cortisol</li>
                    <li>• Establece límites saludables</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Plan de 12 Semanas: Transformación Sostenible</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semanas 1-3: Fundamentos</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Nutrición:</strong>
                      <p className="text-brand-secondary">Eliminar dietas. Comer intuitivamente. Hidratación óptima.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Movimiento:</strong>
                      <p className="text-brand-secondary">Caminar diario. Encontrar ejercicio que disfrutes.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Mental:</strong>
                      <p className="text-brand-secondary">Diario alimentario emocional. Identificar patrones.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semanas 4-6: Construcción</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-primary">Nutrición:</strong>
                      <p className="text-brand-accent">Meal prep saludable. Porciones conscientes. Snacks inteligentes.</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Movimiento:</strong>
                      <p className="text-brand-accent">Rutina ejercicio 4x/semana. Añadir entrenamiento fuerza.</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Mental:</strong>
                      <p className="text-brand-accent">Técnicas manejo estrés. Mindfulness alimentario.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semanas 7-9: Aceleración</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Nutrición:</strong>
                      <p className="text-brand-primary">Optimizar macros. Timing nutricional. Suplementación.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Movimiento:</strong>
                      <p className="text-brand-primary">HIIT 2x/semana. Aumentar intensidad progresivamente.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Mental:</strong>
                      <p className="text-brand-primary">Visualización objetivos. Reforzar autoestima.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semanas 10-12: Mantenimiento</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Nutrición:</strong>
                      <p className="text-brand-accent">Flexibilidad 80/20. Comer social sin culpa.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Movimiento:</strong>
                      <p className="text-brand-accent">Rutina sostenible. Variedad para no aburrirse.</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Mental:</strong>
                      <p className="text-brand-accent">Plan mantenimiento largo plazo. Celebrar logros.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Estrategias Anti-Sabotaje</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3">Cuando Sientes que "Fracasaste":</h4>
                <ul className="text-brand-secondary space-y-2">
                  <li><strong>1. Pausa y Respira:</strong> No entres en espiral de culpa</li>
                  <li><strong>2. Analiza sin Juzgar:</strong> ¿Qué emoción llevó a esta decisión?</li>
                  <li><strong>3. Aprende:</strong> Cada "error" es información valiosa</li>
                  <li><strong>4. Siguiente Comida:</strong> Retoma inmediatamente, no esperes "lunes"</li>
                  <li><strong>5. Autocompasión:</strong> Háblate como le hablarías a tu mejor amiga</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Métricas Más Importantes que la Báscula</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Energía</h5>
                  <p className="text-brand-secondary text-sm">¿Te sientes vibrante?</p>
                </div>
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Sueño</h5>
                  <p className="text-brand-primary text-sm">¿Duermes profundamente?</p>
                </div>
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Estado de Ánimo</h5>
                  <p className="text-brand-secondary text-sm">¿Te sientes estable emocionalmente?</p>
                </div>
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary">Confianza</h5>
                  <p className="text-brand-secondary text-sm">¿Te sientes cómoda en tu cuerpo?</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación Diaria:</h4>
                <p className="italic text-lg text-brand-primary">"Mi cuerpo es mi aliado, no mi enemigo. Cada día tomo decisiones desde el amor, no desde el miedo. Mi peso ideal es donde me siento fuerte, saludable y en paz."</p>
              </div>
            </div>
          `,
          type: 'Coaching Psicológico',
          slug: 'control-peso-saludable'
        },
        {
          id: 4,
          title: 'Fortalece tu Sistema Inmunológico',
          summary: 'Nutrición específica para fortalecer tus defensas naturales y resistir el estrés',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Tu Sistema Inmune: El Ejército Interior</h2>
              
              <p className="text-lg leading-relaxed">Como inmunóloga nutricional, te enseño que tu sistema inmune no es solo defensa contra virus y bacterias, es tu sistema de comunicación celular más sofisticado. Fortalecerlo es una inversión en tu vitalidad de por vida.</p>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border-l-4 border-brand-accent">
                <h4 className="font-semibold text-brand-primary mb-2">Principio Fundamental:</h4>
                <p className="text-brand-primary italic">"Un sistema inmune fuerte no es uno hiperactivo, es uno equilibrado que responde apropiadamente a amenazas reales sin atacar tu propio cuerpo."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 5 Nutrientes Inmuno-Potenciadores</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">1. Vitamina C Super-Absorbible</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>Dosis:</strong> 1000-2000mg dividido en el día</li>
                    <li>• <strong>Fuentes:</strong> Acerola, camu camu, chiles rojos</li>
                    <li>• <strong>Tip:</strong> Con bioflavonoides para mejor absorción</li>
                    <li>• <strong>Función:</strong> Antioxidante + producción colágeno</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">2. Vitamina D3 Solar</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>Dosis:</strong> 2000-4000 UI diarios</li>
                    <li>• <strong>Meta:</strong> Nivel sérico >40ng/ml</li>
                    <li>• <strong>Co-factor:</strong> Vitamina K2 para sinergia</li>
                    <li>• <strong>Función:</strong> Regula 200+ genes inmunes</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">3. Zinc Quelado</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>Dosis:</strong> 15-30mg al día</li>
                    <li>• <strong>Fuentes:</strong> Ostras, semillas calabaza, carne</li>
                    <li>• <strong>Timing:</strong> Estómago vacío o con comida ligera</li>
                    <li>• <strong>Función:</strong> Desarrollo células T y NK</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">4. Selenio Orgánico</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>Dosis:</strong> 200mcg diarios</li>
                    <li>• <strong>Fuentes:</strong> Nueces Brasil (2-3 diarias)</li>
                    <li>• <strong>Función:</strong> Antioxidante celular poderoso</li>
                    <li>• <strong>Especial:</strong> Protege tiroides y reduce inflamación</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Superalimentos Inmuno-Moduladores</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🍄 Hongos Medicinales</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Reishi (Hongo de la Inmortalidad)</h5>
                      <ul className="text-brand-primary space-y-1 text-xs">
                        <li>• Modula respuesta inmune</li>
                        <li>• Reduce estrés y cortisol</li>
                        <li>• Mejora calidad del sueño</li>
                        <li>• Dosis: 500-1000mg</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Shiitake</h5>
                      <ul className="text-brand-accent space-y-1 text-xs">
                        <li>• Rico en lentinanos</li>
                        <li>• Estimula células NK</li>
                        <li>• Antiviral natural</li>
                        <li>• Dosis: 3-4 frescos/día</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Cordyceps</h5>
                      <ul className="text-brand-accent space-y-1 text-xs">
                        <li>• Aumenta energía celular</li>
                        <li>• Mejora función pulmonar</li>
                        <li>• Adaptógeno potente</li>
                        <li>• Dosis: 1000-2000mg</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🌿 Hierbas Inmuno-Adaptógenas</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Equinácea (Echinacea purpurea)</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• <strong>Uso:</strong> Primeros síntomas de resfriado</li>
                        <li>• <strong>Protocolo:</strong> 300mg 3x/día por 7-10 días</li>
                        <li>• <strong>Función:</strong> Estimula fagocitosis</li>
                        <li>• <strong>Precaución:</strong> No usar continuo >2 semanas</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Astrágalo (Astragalus membranaceus)</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• <strong>Uso:</strong> Prevención a largo plazo</li>
                        <li>• <strong>Protocolo:</strong> 500mg 2x/día continuo</li>
                        <li>• <strong>Función:</strong> Tonifica sistema inmune</li>
                        <li>• <strong>Bonus:</strong> Protege contra estrés</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de 30 Días: Inmunidad de Acero</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semana 1: Limpieza y Preparación</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-primary mb-2">Eliminar:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Azúcar refinado (debilita glóbulos blancos)</li>
                        <li>• Alcohol (altera microbioma)</li>
                        <li>• Alimentos procesados</li>
                        <li>• Grasas trans e hidrogenadas</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-primary mb-2">Añadir:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Agua con limón en ayunas</li>
                        <li>• Vegetales crucíferos diarios</li>
                        <li>• Caldo de huesos casero</li>
                        <li>• Probióticos naturales</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semana 2-3: Construcción Activa</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-3 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary text-sm">Suplementación:</h5>
                      <ul className="text-brand-secondary text-xs space-y-1">
                        <li>• Vitamina C + bioflavonoides</li>
                        <li>• Vitamina D3 + K2</li>
                        <li>• Zinc quelado</li>
                        <li>• Probióticos 50+ billones</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-3 rounded-lg">
                      <h5 className="font-semibold text-brand-primary text-sm">Alimentación:</h5>
                      <ul className="text-brand-secondary text-xs space-y-1">
                        <li>• 8-10 porciones vegetales/día</li>
                        <li>• Proteína en cada comida</li>
                        <li>• Grasas omega-3 diarias</li>
                        <li>• Ajo y cebolla crudos</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-3 rounded-lg">
                      <h5 className="font-semibold text-brand-primary text-sm">Estilo de Vida:</h5>
                      <ul className="text-brand-secondary text-xs space-y-1">
                        <li>• Ejercicio moderado 30 min</li>
                        <li>• Sueño 7-9 horas calidad</li>
                        <li>• Meditación 10-15 min</li>
                        <li>• Tiempo en naturaleza</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Semana 4: Optimización y Mantenimiento</h4>
                  <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary mb-2">Evaluación y Ajustes:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• ¿Te has enfermado menos? ¿Tienes más energía?</li>
                      <li>• ¿Tu digestión ha mejorado? ¿Duermes mejor?</li>
                      <li>• ¿Tu estado de ánimo es más estable?</li>
                      <li>• Ajusta suplementos según resultados</li>
                      <li>• Crea plan de mantenimiento personalizado</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas Inmuno-Potenciadoras</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🍵 Té Inmune Dorado</h4>
                  <div className="text-brand-secondary text-sm space-y-2">
                    <p><strong>Ingredientes:</strong></p>
                    <ul className="space-y-1">
                      <li>• 1 taza leche coco</li>
                      <li>• 1 cdta cúrcuma en polvo</li>
                      <li>• 1/2 cdta jengibre fresco</li>
                      <li>• Pizca pimienta negra</li>
                      <li>• 1 cdta miel cruda</li>
                      <li>• Canela al gusto</li>
                    </ul>
                    <p><strong>Preparación:</strong> Calienta, mezcla y toma 1-2 veces al día</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🥗 Ensalada Inmuno-Boost</h4>
                  <div className="text-brand-secondary text-sm space-y-2">
                    <p><strong>Base:</strong></p>
                    <ul className="space-y-1">
                      <li>• Espinacas baby + rúcula</li>
                      <li>• Brócoli crudo picado</li>
                      <li>• Zanahoria rallada</li>
                      <li>• Chiles rojos</li>
                      <li>• Semillas calabaza</li>
                    </ul>
                    <p><strong>Aderezo:</strong> Aceite oliva + limón + ajo + jengibre</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo SOS: Cuando Sientes que te Enfermas</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Primeras 24 Horas - Acción Inmediata:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Suplementos Choque:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• Vitamina C: 2000mg cada 2 horas</li>
                      <li>• Zinc: 30mg 3 veces al día</li>
                      <li>• Equinácea: 300mg 4 veces</li>
                      <li>• Ajo crudo: 2-3 dientes</li>
                      <li>• Probióticos: doble dosis</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Acciones Inmediatas:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• Reposo absoluto y sueño extra</li>
                      <li>• Hidratación: agua + electrolitos</li>
                      <li>• Gárgaras agua sal tibia</li>
                      <li>• Inhalaciones vapor eucalipto</li>
                      <li>• Ayuno intermitente ligero</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación de Inmunidad:</h4>
                <p className="italic text-lg text-brand-primary">"Mi sistema inmune es inteligente, fuerte y equilibrado. Mi cuerpo sabe defenderse naturalmente. Cada célula de mi ser vibra con salud perfecta y vitalidad radiante."</p>
              </div>
            </div>
          `,
          type: 'Medicina Preventiva',
          slug: 'sistema-inmune'
        },
        {
          id: 5,
          title: 'Nutrición en la Menopausia',
          summary: 'Alimentos que equilibran tus hormonas y alivian los síntomas menopáusicos naturalmente',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Nutrición Menopáusica: Tu Nueva Aliada</h2>
              
              <p className="text-lg leading-relaxed">Como ginecóloga especializada en medicina nutricional, entiendo que la menopausia no es una enfermedad, es una transición. Con la alimentación correcta, puedes transformar esta etapa en la más plena y poderosa de tu vida.</p>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                <h4 className="font-semibold text-brand-primary mb-2">Verdad Hormonal:</h4>
                <p className="text-brand-secondary italic">"Cuando los ovarios reducen la producción de estrógenos, tus glándulas suprarrenales y tejido adiposo pueden tomar el relevo. La nutrición es la clave para que funcionen óptimamente."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Síntomas y Soluciones Nutricionales</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg border-l-4 border-brand-primary">
                  <h4 className="font-semibold text-brand-primary mb-3">🔥 Sofocos y Sudoraciones</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Causa:</strong> Desregulación del centro termorregulador</p>
                    <p><strong>Alimentación sanadora:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Evitar:</strong> Cafeína, alcohol, azúcar, especias picantes</li>
                      <li>• <strong>Incluir:</strong> Soja fermentada, linaza, sage tea</li>
                      <li>• <strong>Suplementos:</strong> Black cohosh 40mg, Vitamina E 400UI</li>
                      <li>• <strong>Hidratación:</strong> Agua fría con menta y pepino</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">😴 Insomnio y Fatiga</h4>
                  <div className="text-brand-primary space-y-2 text-sm">
                    <p><strong>Causa:</strong> Disminución de progesterona y melatonina</p>
                    <p><strong>Alimentación reparadora:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Cena:</strong> Proteína ligera + carbohidratos complejos</li>
                      <li>• <strong>Pre-dormir:</strong> Leche dorada con ashwagandha</li>
                      <li>• <strong>Magnesio:</strong> 400-600mg antes de dormir</li>
                      <li>• <strong>Triptófano:</strong> Pavo, semillas calabaza, plátano</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">🧠 Niebla Mental</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Causa:</strong> Fluctuaciones hormonales afectan neurotransmisores</p>
                    <p><strong>Alimentación neuroneuroprotectora:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Omega-3:</strong> Pescados grasos, nueces, chía</li>
                      <li>• <strong>Antioxidantes:</strong> Berries, cacao, té verde</li>
                      <li>• <strong>Colina:</strong> Huevos, lecitina de soja</li>
                      <li>• <strong>Ginkgo biloba:</strong> 120mg para circulación cerebral</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">⚖️ Aumento de Peso</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Causa:</strong> Metabolismo más lento + redistribución grasa</p>
                    <p><strong>Estrategia metabólica:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Proteína:</strong> 1.2-1.6g por kg peso corporal</li>
                      <li>• <strong>Fibra:</strong> 35-40g diarios para saciedad</li>
                      <li>• <strong>Ayuno intermitente:</strong> 14-16 horas</li>
                      <li>• <strong>Té oolong:</strong> Acelera metabolismo 10%</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Fitoestrógenos: Hormonas Vegetales</h3>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-4">Alimentos Hormonalmente Activos</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary mb-2">🌱 Isoflavonas (Estrógeno-like)</h5>
                    <ul className="text-brand-secondary space-y-1 text-sm">
                      <li>• <strong>Soja fermentada:</strong> Tempeh, miso, natto</li>
                      <li>• <strong>Tofu orgánico:</strong> 100-150g diarios</li>
                      <li>• <strong>Edamame:</strong> 1/2 taza diaria</li>
                      <li>• <strong>Efecto:</strong> Reduce sofocos 45%</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">🌾 Lignanos (Progesterona-like)</h5>
                    <ul className="text-brand-secondary space-y-1 text-sm">
                      <li>• <strong>Linaza molida:</strong> 1-2 cdas diarias</li>
                      <li>• <strong>Semillas sésamo:</strong> Tahini, gomasio</li>
                      <li>• <strong>Cereales integrales:</strong> Centeno, cebada</li>
                      <li>• <strong>Efecto:</strong> Estabiliza estado ánimo</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">🥕 Coumestanos (Moduladores)</h5>
                    <ul className="text-brand-secondary space-y-1 text-sm">
                      <li>• <strong>Brotes alfalfa:</strong> En ensaladas</li>
                      <li>• <strong>Frijoles mungo:</strong> Germinados</li>
                      <li>• <strong>Trébol rojo:</strong> Infusión 2x/día</li>
                      <li>• <strong>Efecto:</strong> Protege huesos y corazón</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Plan Nutricional Menopáusico de 28 Días</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 1: Estabilización Hormonal</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">Desayuno Base:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Batido verde con proteína de cáñamo</li>
                        <li>• 1 cda linaza molida</li>
                        <li>• 1/2 taza berries antioxidantes</li>
                        <li>• Té verde matcha</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">Almuerzo Equilibrante:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Ensalada masiva con vegetales crudos</li>
                        <li>• 100g tempeh o tofu grillado</li>
                        <li>• Aguacate y nueces</li>
                        <li>• Aderezo tahini-limón</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">Cena Tranquilizante:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Sopa miso con algas wakame</li>
                        <li>• Pescado al vapor con jengibre</li>
                        <li>• Verduras al vapor</li>
                        <li>• Infusión pasiflora antes dormir</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">Snacks Inteligentes:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Hummus con bastones verduras</li>
                        <li>• Almendras + datil medjool</li>
                        <li>• Té rooibos con canela</li>
                        <li>• Yogur coco con semillas chía</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 2-4: Optimización Metabólica</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-3">Protocolo de Ayuno:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Ayuno 14-16 horas (7pm-11am)</li>
                        <li>• Primera comida: Grasa saludable + proteína</li>
                        <li>• Hidratación: Agua con limón y sal</li>
                        <li>• Rompe ayuno suavemente</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-primary/15 to-brand-primary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-3">Cycling Carbohidratos:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Lunes-Miércoles: Bajo en carbos</li>
                        <li>• Jueves: Carga moderada quinoa/batata</li>
                        <li>• Viernes-Domingo: Mantenimiento</li>
                        <li>• Siempre carbos complejos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Suplementos Específicos para Menopausia</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">💊 Protocolo Básico Diario</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Mañana con desayuno:</strong></p>
                    <ul className="space-y-1">
                      <li>• Complejo B activado</li>
                      <li>• Vitamina D3 2000 UI + K2</li>
                      <li>• Omega-3 2000mg EPA/DHA</li>
                      <li>• Probióticos 50B CFU</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Tarde con almuerzo:</strong></p>
                    <ul className="space-y-1">
                      <li>• Magnesio glicinato 400mg</li>
                      <li>• Calcio + Vitamina K2</li>
                      <li>• Black cohosh 40mg</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/15 to-brand-background/25 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🌿 Adaptógenos Hormonales</h4>
                  <div className="text-brand-primary space-y-2 text-sm">
                    <p><strong>Para estrés y cortisol:</strong></p>
                    <ul className="space-y-1">
                      <li>• Ashwagandha KSM-66: 300mg 2x/día</li>
                      <li>• Rhodiola rosea: 200mg mañana</li>
                      <li>• Schisandra: 500mg tarde</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Para sofocos y sueño:</strong></p>
                    <ul className="space-y-1">
                      <li>• Dong quai: 500mg 2x/día</li>
                      <li>• Sauzgatillo: 400mg mañana</li>
                      <li>• Magnolia bark: 200mg noche</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas Especiales Anti-Sofocos</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🥤 Elixir Hormonal Matutino</h4>
                  <div className="text-brand-primary text-sm space-y-2">
                    <p><strong>Ingredientes:</strong></p>
                    <ul className="space-y-1">
                      <li>• 1 taza leche almendras sin azúcar</li>
                      <li>• 1 cda mantequilla almendra</li>
                      <li>• 1 cdta cacao raw</li>
                      <li>• 1 cda proteína cáñamo</li>
                      <li>• 1 cdta linaza molida</li>
                      <li>• Pizca canela</li>
                      <li>• 1 cdta aceite coco</li>
                    </ul>
                    <p><strong>Licúa y toma:</strong> Primera hora del día</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🍵 Té Tranquilidad Nocturno</h4>
                  <div className="text-brand-primary text-sm space-y-2">
                    <p><strong>Mezcla de hierbas:</strong></p>
                    <ul className="space-y-1">
                      <li>• 1 cdta salvia seca</li>
                      <li>• 1 cdta pasiflora</li>
                      <li>• 1/2 cdta trébol rojo</li>
                      <li>• 1/2 cdta raíz valeriana</li>
                      <li>• Miel manuka (opcional)</li>
                    </ul>
                    <p><strong>Preparación:</strong> Infusión 10 min, colar</p>
                    <p><strong>Tomar:</strong> 1 hora antes de dormir</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación de Transición Sagrada:</h4>
                <p className="italic text-lg text-brand-primary">"Abrazo esta nueva fase de mi vida con sabiduría y gracia. Mi cuerpo se adapta perfectamente a cada cambio. Nutro mi templo con amor y respeto, floreciendo en mi poder femenino maduro."</p>
              </div>
            </div>
          `,
          type: 'Especialización',
          slug: 'nutricion-menopausia'
        },
        {
          id: 6,
          title: 'Alimentación Vegana Inteligente',
          summary: 'Cómo obtener todos los nutrientes en una dieta plant-based sin deficiencias',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Veganismo Nutricional: Ciencia y Corazón</h2>
              
              <p className="text-lg leading-relaxed">Como nutrióloga especializada en alimentación plant-based, entiendo que elegir el veganismo es un acto de amor: hacia los animales, el planeta y tu salud. Mi misión es asegurar que tu elección ética sea también nutricionalmente perfecta.</p>
              
              <div className="p-6 rounded-lg border-l-4" style="background-color: rgba(193, 212, 58, 0.1); border-color: #c1d43a;">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Principio Fundamental:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"Una dieta vegana bien planificada no solo es nutricionalmente completa, puede ser superior a una dieta omnívora en prevención de enfermedades crónicas."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 8 Nutrientes Críticos del Veganismo</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(200, 166, 166, 0.1); border-color: #c8a6a6;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">💊 Vitamina B12: No Negociable</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Por qué es crítica:</strong> Solo se encuentra en productos animales y bacterias</p>
                    <p><strong>Deficiencia causa:</strong> Anemia megaloblástica, daño neurológico irreversible</p>
                    <ul className="space-y-1 mt-2">
                      <li>• <strong>Suplementación:</strong> 2000-2500mcg semanal o 250mcg diario</li>
                      <li>• <strong>Forma recomendada:</strong> Cianocobalamina (más estable)</li>
                      <li>• <strong>Absorción:</strong> Mejorar con calcio y evitar cafeína</li>
                      <li>• <strong>Monitoreo:</strong> Análisis cada 6 meses los primeros 2 años</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(245, 230, 255, 0.2); border-color: #f5e6ff;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">⚡ Hierro: Maximiza la Absorción</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Diferencia clave:</strong> Hierro no-hemo (vegetal) vs hemo (animal)</p>
                    <p><strong>Absorción vegetal:</strong> 2-5% vs 15-25% animal</p>
                    <ul className="space-y-1 mt-2">
                      <li>• <strong>Fuentes ricas:</strong> Lentejas, espinacas, tofu, semillas calabaza</li>
                      <li>• <strong>Potenciadores:</strong> Vitamina C, beta-caroteno, ácidos orgánicos</li>
                      <li>• <strong>Inhibidores:</strong> Café, té, lácteos, calcio suplementario</li>
                      <li>• <strong>Estrategia:</strong> Combinar siempre con cítricos o chiles</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(193, 212, 58, 0.1); border-color: #c1d43a;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🦴 Calcio: Más Allá de los Lácteos</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Mito derribado:</strong> Los vegetales pueden proveer calcio altamente biodisponible</p>
                    <ul className="space-y-1 mt-2">
                      <li>• <strong>Superiores a lácteos:</strong> Bok choy, brócoli, kale (absorción 40-60%)</li>
                      <li>• <strong>Enriquecidos:</strong> Leches vegetales fortificadas, tofu con sulfato cálcico</li>
                      <li>• <strong>Semillas y frutos secos:</strong> Tahini, almendras, higos secos</li>
                      <li>• <strong>Cofactores esenciales:</strong> Vitamina D, K2, magnesio</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(141, 117, 131, 0.1); border-color: #8d7583;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🐟 Omega-3: EPA y DHA Vegetal</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Desafío:</strong> ALA vegetal debe convertirse a EPA/DHA</p>
                    <p><strong>Conversión limitada:</strong> Solo 5-15% en mujeres</p>
                    <ul className="space-y-1 mt-2">
                      <li>• <strong>Fuentes ALA:</strong> Linaza molida, chía, nueces, aceite algal</li>
                      <li>• <strong>Suplemento directo:</strong> Algas EPA/DHA 300-600mg diarios</li>
                      <li>• <strong>Optimizar conversión:</strong> Evitar aceites omega-6 en exceso</li>
                      <li>• <strong>Ratio ideal:</strong> 1:1 a 4:1 omega-6:omega-3</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Planificación de Comidas: 7 Días Perfectos</h3>
              
              <div className="space-y-6">
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(193, 212, 58, 0.1), rgba(193, 212, 58, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Día Tipo: Optimización Nutricional</h4>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 rounded-lg" style="background-color: rgba(200, 166, 166, 0.2);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">🌅 Desayuno Power</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• <strong>Base:</strong> Avena fortificada con B12</li>
                        <li>• <strong>Proteína:</strong> 2 cdas proteína de guisante</li>
                        <li>• <strong>Grasas:</strong> 1 cda mantequilla almendra</li>
                        <li>• <strong>Antioxidantes:</strong> Berries mixtos</li>
                        <li>• <strong>Hierro:</strong> 1 cda melaza blackstrap</li>
                        <li>• <strong>B12:</strong> Levadura nutricional fortificada</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(245, 230, 255, 0.3);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">🥗 Almuerzo Completo</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• <strong>Base:</strong> Quinoa + lentejas rojas</li>
                        <li>• <strong>Vegetales:</strong> Espinacas, chiles, brócoli</li>
                        <li>• <strong>Calcio:</strong> Tahini como aderezo</li>
                        <li>• <strong>Vitamina C:</strong> Jugo limón fresco</li>
                        <li>• <strong>Zinc:</strong> Semillas calabaza tostadas</li>
                        <li>• <strong>Omega-3:</strong> 1 cda chía remojada</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(141, 117, 131, 0.2);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">🌙 Cena Ligera</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• <strong>Proteína:</strong> Tofu marinado con tempeh</li>
                        <li>• <strong>Vegetales:</strong> Kale salteado con ajo</li>
                        <li>• <strong>Almidón:</strong> Batata asada</li>
                        <li>• <strong>Digestión:</strong> Jengibre fresco</li>
                        <li>• <strong>Magnesio:</strong> Almendras activadas</li>
                        <li>• <strong>Hidratación:</strong> Té verde matcha</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(200, 166, 166, 0.1), rgba(200, 166, 166, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Protocolo de Suplementación Inteligente</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Diarios Obligatorios:</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• <strong>B12:</strong> 250mcg cianocobalamina</li>
                        <li>• <strong>Vitamina D3:</strong> 2000-4000 UI (vegana)</li>
                        <li>• <strong>Algas EPA/DHA:</strong> 300mg</li>
                        <li>• <strong>Yodo:</strong> 150mcg (algas kelp)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Según Análisis Sanguíneo:</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• <strong>Hierro:</strong> Si ferritina <30ng/ml</li>
                        <li>• <strong>Zinc:</strong> Si niveles séricos bajos</li>
                        <li>• <strong>Vitamina K2:</strong> MK-7 para huesos</li>
                        <li>• <strong>Creatina:</strong> 3g para vegetarianas activas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Combinaciones Sinérgicas: Ciencia Aplicada</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg" style="background-color: rgba(193, 212, 58, 0.1);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🔥 Potenciadores de Absorción</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Hierro + Vitamina C:</strong></p>
                    <ul className="space-y-1">
                      <li>• Lentejas + chiles rojos</li>
                      <li>• Espinacas + fresas</li>
                      <li>• Tofu + brócoli</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Calcio + Vitamina D + K2:</strong></p>
                    <ul className="space-y-1">
                      <li>• Kale + hongos UV + natto</li>
                      <li>• Tahini + almendras + sauerkraut</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Proteína Completa:</strong></p>
                    <ul className="space-y-1">
                      <li>• Legumbres + cereales integrales</li>
                      <li>• Quinoa + hemp hearts</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg" style="background-color: rgba(200, 166, 166, 0.1);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">⚠️ Inhibidores a Evitar</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Hierro se inhibe con:</strong></p>
                    <ul className="space-y-1">
                      <li>• Café/té dentro de 1 hora</li>
                      <li>• Calcio suplementario simultáneo</li>
                      <li>• Cereales integrales sin remojar</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Zinc compite con:</strong></p>
                    <ul className="space-y-1">
                      <li>• Hierro en dosis altas</li>
                      <li>• Calcio en exceso</li>
                      <li>• Fitatos sin neutralizar</li>
                    </ul>
                    
                    <p className="mt-3"><strong>B12 se degrada con:</strong></p>
                    <ul className="space-y-1">
                      <li>• Vitamina C en mismo momento</li>
                      <li>• Alcohol regular</li>
                      <li>• Antibióticos frecuentes</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Monitoreo Médico: Tu Análisis Anual</h3>
              
              <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(245, 230, 255, 0.2), rgba(245, 230, 255, 0.3));">
                <h4 className="font-semibold mb-4" style="color: #382a3c;">📋 Panel Vegano Completo</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-semibold mb-2" style="color: #382a3c;">Básicos Anuales:</h5>
                    <ul className="space-y-1 text-xs" style="color: #8d7583;">
                      <li>• Vitamina B12 sérica</li>
                      <li>• Ácido metilmalónico</li>
                      <li>• Homocisteína</li>
                      <li>• Ferritina y hierro sérico</li>
                      <li>• Vitamina D (25-OH)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2" style="color: #382a3c;">Minerales Clave:</h5>
                    <ul className="space-y-1 text-xs" style="color: #8d7583;">
                      <li>• Zinc sérico</li>
                      <li>• Calcio y PTH</li>
                      <li>• Magnesio en eritrocitos</li>
                      <li>• Yodo urinario</li>
                      <li>• Selenio</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-2" style="color: #382a3c;">Proteínas y Grasas:</h5>
                    <ul className="space-y-1 text-xs" style="color: #8d7583;">
                      <li>• Proteínas totales</li>
                      <li>• Albúmina</li>
                      <li>• Perfil lipídico completo</li>
                      <li>• Omega-3 index</li>
                      <li>• Aminograma si déficit</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg" style="background-color: rgba(193, 212, 58, 0.2);">
                  <h5 className="font-semibold mb-2" style="color: #382a3c;">🎯 Valores Óptimos para Veganas:</h5>
                  <ul className="space-y-1 text-sm" style="color: #8d7583;">
                    <li>• <strong>B12:</strong> >400 pg/ml (no <200)</li>
                    <li>• <strong>Ferritina:</strong> 30-200 ng/ml (mujeres)</li>
                    <li>• <strong>Vitamina D:</strong> 40-60 ng/ml</li>
                    <li>• <strong>Zinc:</strong> 70-120 µg/dl</li>
                    <li>• <strong>Omega-3 Index:</strong> >8%</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(141, 117, 131, 0.1), rgba(141, 117, 131, 0.2));">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Afirmación Vegana Poderosa:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"Mi elección de compasión nutre mi cuerpo, alma y planeta. Cada comida vegana es un acto de amor que me llena de vitalidad, energía y conexión con toda la vida. Soy salud radiante en armonía con mis valores."</p>
              </div>
            </div>
          `,
          type: 'Estilo de Vida',
          slug: 'alimentacion-vegana'
        },
        {
          id: 7,
          title: 'Sanar la Relación con la Comida',
          summary: 'Protocolo psicológico para superar atracones, culpa alimentaria y patrones restrictivos',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Liberándote de la Guerra Interna</h2>
              
              <p className="text-lg leading-relaxed">Como psicóloga especializada en trastornos alimentarios, entiendo que tu relación con la comida refleja tu relación contigo misma. Sanar esta conexión no es solo sobre nutrición, es sobre amor propio, autocompasión y paz interior.</p>
              
              <div className="p-6 rounded-lg border-l-4" style="background-color: rgba(200, 166, 166, 0.1); border-color: #c8a6a6;">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Verdad Sanadora:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"La comida no es tu enemiga, es tu aliada. El problema no está en lo que comes, sino en cómo te relacionas emocionalmente con el acto de comer."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Identificando los Patrones Tóxicos</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(245, 230, 255, 0.2); border-color: #f5e6ff;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🔄 El Ciclo de Restricción-Atracón</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Fase 1: Restricción Mental</strong></p>
                    <ul className="space-y-1">
                      <li>• "No puedo comer eso"</li>
                      <li>• Categorizar alimentos como "buenos/malos"</li>
                      <li>• Reglas rígidas autoimpuestas</li>
                      <li>• Culpa anticipatoria</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Fase 2: Privación Física</strong></p>
                    <ul className="space-y-1">
                      <li>• Hambre extrema por restricción</li>
                      <li>• Bajos niveles de glucosa</li>
                      <li>• Obsesión mental con comida</li>
                      <li>• Pérdida de control inminente</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Fase 3: Atracón Emocional</strong></p>
                    <ul className="space-y-1">
                      <li>• Comer compulsivo sin conciencia</li>
                      <li>• Sensación de estar "fuera de control"</li>
                      <li>• Comer más allá de la saciedad</li>
                      <li>• Desconexión cuerpo-mente</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Fase 4: Culpa y Vergüenza</strong></p>
                    <ul className="space-y-1">
                      <li>• Autocastigo mental severo</li>
                      <li>• Promesas de "empezar el lunes"</li>
                      <li>• Mayor restricción como "compensación"</li>
                      <li>• Perpetuación del ciclo</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(141, 117, 131, 0.1); border-color: #8d7583;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🧠 Los Triggers Emocionales</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <p><strong>Emociones que Impulsan:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Estrés:</strong> Cortisol aumenta antojos de azúcar</li>
                      <li>• <strong>Ansiedad:</strong> Comer como forma de auto-calmarse</li>
                      <li>• <strong>Soledad:</strong> Comida como compañía emocional</li>
                      <li>• <strong>Aburrimiento:</strong> Estimulación sensorial a través del sabor</li>
                      <li>• <strong>Tristeza:</strong> Búsqueda de dopamina temporal</li>
                      <li>• <strong>Enojo:</strong> Comer como acto de rebeldía interna</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Situaciones Detonantes:</strong></p>
                    <ul className="space-y-1">
                      <li>• Conflictos familiares o de pareja</li>
                      <li>• Presión laboral o académica</li>
                      <li>• Comparación social (redes sociales)</li>
                      <li>• Comentarios sobre peso/apariencia</li>
                      <li>• Eventos sociales centrados en comida</li>
                      <li>• Cambios hormonales menstruales</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de Sanación en 12 Semanas</h3>
              
              <div className="space-y-6">
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(193, 212, 58, 0.1), rgba(193, 212, 58, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Semanas 1-3: Conciencia y Observación</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg" style="background-color: rgba(200, 166, 166, 0.2);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">📝 Diario Emocional-Alimentario</h5>
                      <div className="space-y-2 text-sm" style="color: #8d7583;">
                        <p><strong>Registra ANTES de comer:</strong></p>
                        <ul className="space-y-1">
                          <li>• Nivel de hambre física (1-10)</li>
                          <li>• Estado emocional presente</li>
                          <li>• Lugar y situación actual</li>
                          <li>• Pensamientos sobre la comida</li>
                        </ul>
                        
                        <p className="mt-3"><strong>Registra DESPUÉS de comer:</strong></p>
                        <ul className="space-y-1">
                          <li>• Nivel de saciedad (1-10)</li>
                          <li>• Cómo te sientes emocionalmente</li>
                          <li>• Si comiste con conciencia</li>
                          <li>• Presencia de culpa o satisfacción</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(245, 230, 255, 0.3);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">🧘‍♀️ Mindfulness Alimentario</h5>
                      <div className="space-y-2 text-sm" style="color: #8d7583;">
                        <p><strong>Ejercicio de la Uva Pasa:</strong></p>
                        <ul className="space-y-1">
                          <li>• Observa una uva pasa por 2 minutos</li>
                          <li>• Nota textura, color, aroma</li>
                          <li>• Mastica lentamente 30 veces</li>
                          <li>• Siente cada sabor en tu boca</li>
                        </ul>
                        
                        <p className="mt-3"><strong>Aplicación diaria:</strong></p>
                        <ul className="space-y-1">
                          <li>• Una comida al día sin distracciones</li>
                          <li>• Mastica cada bocado 20 veces</li>
                          <li>• Pausa a medio plato, evalúa saciedad</li>
                          <li>• Agradece al alimento y tu cuerpo</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(200, 166, 166, 0.1), rgba(200, 166, 166, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Semanas 4-6: Desafío de Creencias</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg" style="background-color: rgba(193, 212, 58, 0.2);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">❌ Creencia Tóxica</h5>
                      <p className="text-sm italic" style="color: #8d7583;">"Hay alimentos prohibidos"</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(245, 230, 255, 0.3);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">🔄 Reestructuración</h5>
                      <p className="text-sm" style="color: #8d7583;">Cuestiona: ¿Es realmente dañino? ¿Basado en qué evidencia?</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(141, 117, 131, 0.2);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">✅ Nueva Creencia</h5>
                      <p className="text-sm" style="color: #8d7583;">"Todos los alimentos pueden formar parte de una alimentación equilibrada"</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-lg" style="background-color: rgba(200, 166, 166, 0.2);">
                    <h5 className="font-semibold mb-2" style="color: #382a3c;">🍫 Ejercicio de Exposición Gradual</h5>
                    <div className="text-sm" style="color: #8d7583;">
                      <p><strong>Semana 4:</strong> Incluye 1 alimento "prohibido" diariamente</p>
                      <p><strong>Semana 5:</strong> Come este alimento con total atención y sin culpa</p>
                      <p><strong>Semana 6:</strong> Observa que al no ser prohibido, pierde su poder compulsivo</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(245, 230, 255, 0.2), rgba(245, 230, 255, 0.3));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Semanas 7-9: Regulación Emocional</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg" style="background-color: rgba(193, 212, 58, 0.2);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">🛠️ Kit de Herramientas Emocionales</h5>
                      <div className="space-y-2 text-sm" style="color: #8d7583;">
                        <p><strong>Para Ansiedad:</strong></p>
                        <ul className="space-y-1">
                          <li>• Respiración 4-7-8 (inhala 4, sostén 7, exhala 8)</li>
                          <li>• Caminar 10 minutos al aire libre</li>
                          <li>• Llamar a un amigo de confianza</li>
                          <li>• Escribir 3 páginas de flujo de conciencia</li>
                        </ul>
                        
                        <p className="mt-3"><strong>Para Tristeza:</strong></p>
                        <ul className="space-y-1">
                          <li>• Permitir llorar sin juzgarte</li>
                          <li>• Escuchar música que resuene contigo</li>
                          <li>• Crear arte: dibujar, pintar, bailar</li>
                          <li>• Baño relajante con sales y velas</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(141, 117, 131, 0.2);">
                      <h5 className="font-semibold mb-3" style="color: #382a3c;">⏰ Técnica STOP</h5>
                      <div className="space-y-2 text-sm" style="color: #8d7583;">
                        <p><strong>Cuando sientes impulso de comer emocionalmente:</strong></p>
                        <ul className="space-y-2 mt-2">
                          <li><strong>S - STOP:</strong> Para todo lo que estás haciendo</li>
                          <li><strong>T - TAKE A BREATH:</strong> Respira profundo 3 veces</li>
                          <li><strong>O - OBSERVE:</strong> ¿Qué estoy sintiendo? ¿Dónde lo siento en mi cuerpo?</li>
                          <li><strong>P - PROCEED:</strong> ¿Qué es lo que realmente necesito ahora?</li>
                        </ul>
                        
                        <div className="mt-3 p-2 rounded" style="background-color: rgba(200, 166, 166, 0.2);">
                          <p className="text-xs"><strong>Pregúntate:</strong> "¿Tengo hambre física o estoy buscando llenar un vacío emocional?"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(141, 117, 131, 0.1), rgba(141, 117, 131, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">Semanas 10-12: Integración y Mantenimiento</h4>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style="background-color: rgba(200, 166, 166, 0.2);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">🌱 Rituales de Autocuidado</h5>
                      <div className="text-sm" style="color: #8d7583;">
                        <p><strong>Mañana:</strong> 5 minutos de gratitud por tu cuerpo</p>
                        <p><strong>Comidas:</strong> Bendice tu alimento y come con presencia</p>
                        <p><strong>Noche:</strong> Perdona cualquier "error" del día y abraza tu humanidad</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(245, 230, 255, 0.3);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">🎯 Plan de Prevención de Recaídas</h5>
                      <div className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• Identifica tus señales de alerta temprana</li>
                        <li>• Ten un plan de acción específico para crisis</li>
                        <li>• Mantén conexión con tu red de apoyo</li>
                        <li>• Programa revisiones mensuales contigo misma</li>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Afirmaciones Sanadoras Diarias</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg" style="background-color: rgba(193, 212, 58, 0.1);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🌅 Afirmaciones Matutinas</h4>
                  <ul className="space-y-2 text-sm" style="color: #8d7583;">
                    <li>• "Mi cuerpo es sabio y conoce sus necesidades"</li>
                    <li>• "Merezco nutrir mi cuerpo con amor y respeto"</li>
                    <li>• "Soy más que mi peso, soy un ser integral"</li>
                    <li>• "Hoy elegiré alimentos que me hagan sentir bien"</li>
                    <li>• "Mi relación con la comida mejora cada día"</li>
                  </ul>
                </div>
                
                <div className="p-5 rounded-lg" style="background-color: rgba(200, 166, 166, 0.1);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🌙 Afirmaciones Nocturnas</h4>
                  <ul className="space-y-2 text-sm" style="color: #8d7583;">
                    <li>• "Perdono cualquier decisión alimentaria de hoy"</li>
                    <li>• "Mañana es una nueva oportunidad de autocuidado"</li>
                    <li>• "Soy suficiente tal como soy en este momento"</li>
                    <li>• "Mi valor no depende de lo que comí hoy"</li>
                    <li>• "Estoy en un proceso de sanación y crecimiento"</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(245, 230, 255, 0.2), rgba(245, 230, 255, 0.3));">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Mensaje Final de Tu Terapeuta:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"Sanar tu relación con la comida es un acto de valentía y amor propio. No busques perfección, busca paz. Tu cuerpo no es tu enemigo, es tu hogar. Trátalo con la compasión que darías a tu mejor amiga. Eres digna de una relación amorosa contigo misma."</p>
              </div>
            </div>
          `,
          type: 'Sanación Emocional',
          slug: 'sanar-relacion-comida'
        },
        {
          id: 8,
          title: 'Recetas que Curan: Cocina Medicina',
          summary: 'Platos deliciosos diseñados para nutrir cuerpo, mente y alma según la medicina integrativa',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Cocina como Medicina: El Arte de Sanar Comiendo</h2>
              
              <p className="text-lg leading-relaxed">Como chef especializada en medicina integrativa, entiendo que la cocina es tu farmacia más poderosa. Cada ingrediente que eliges es información que envías a tus células. Estas recetas están diseñadas para nutrir no solo tu cuerpo, sino tu alma.</p>
              
              <div className="p-6 rounded-lg border-l-4" style="background-color: rgba(193, 212, 58, 0.1); border-color: #c1d43a;">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Filosofía Culinaria:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"Que tu alimento sea tu medicina y tu medicina tu alimento. Cada plato que preparas con amor y conciencia tiene el poder de transformar tu bienestar desde adentro hacia afuera."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas para Equilibrar Hormonas</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(200, 166, 166, 0.1); border-color: #c8a6a6;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🌸 Golden Milk Hormonal</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Equilibrio hormonal, reducir inflamación, mejorar sueño</p>
                    
                    <div>
                      <p><strong>Ingredientes:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 taza leche coco cremosa</li>
                        <li>• 1 cdta cúrcuma orgánica</li>
                        <li>• 1/2 cdta jengibre fresco rallado</li>
                        <li>• 1/2 cdta canela Ceylon</li>
                        <li>• Pizca pimienta negra</li>
                        <li>• 1 cda ghee o aceite coco</li>
                        <li>• 1 cdta miel cruda (opcional)</li>
                        <li>• 1/4 cdta ashwagandha en polvo</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Preparación:</strong></p>
                      <ol className="space-y-1 ml-4">
                        <li>1. Calienta la leche de coco a fuego medio</li>
                        <li>2. Agrega todas las especias y bate bien</li>
                        <li>3. Cocina 3-5 minutos hasta aromático</li>
                        <li>4. Retira del fuego, añade miel si deseas</li>
                        <li>5. Toma 1 hora antes de dormir</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(193, 212, 58, 0.2);">
                      <p className="text-xs"><strong>Beneficios medicinales:</strong> La cúrcuma reduce cortisol, el ashwagandha equilibra tiroides y suprarrenales, el ghee aporta vitaminas liposolubles para síntesis hormonal.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(245, 230, 255, 0.2); border-color: #f5e6ff;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🥗 Ensalada Regeneradora de Estrógenos</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Menopausia, síndrome premenstrual, equilibrio estrogénico</p>
                    
                    <div>
                      <p><strong>Base verde:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 2 tazas rúcula orgánica</li>
                        <li>• 1 taza espinacas baby</li>
                        <li>• 1/2 taza brotes de alfalfa</li>
                        <li>• 1/4 taza perejil picado</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Proteínas fitoestrógenos:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1/2 taza edamame cocido</li>
                        <li>• 100g tempeh marinado y grillado</li>
                        <li>• 2 cdas semillas de linaza molidas</li>
                        <li>• 1/4 taza semillas de girasol</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Aderezo hormonal:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 3 cdas aceite oliva extra virgen</li>
                        <li>• 2 cdas vinagre manzana crudo</li>
                        <li>• 1 cdta tahini</li>
                        <li>• 1 diente ajo pequeño</li>
                        <li>• Sal marina y pimienta</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(200, 166, 166, 0.2);">
                      <p className="text-xs"><strong>Ciencia:</strong> Los fitoestrógenos de la soja y linaza se unen a receptores estrogénicos, ayudando a modular hormonas naturalmente. El tahini aporta lignanos adicionales.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas Anti-Inflamatorias</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(141, 117, 131, 0.1); border-color: #8d7583;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🍲 Caldo de Huesos Dorado</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Intestino permeable, artritis, recuperación muscular</p>
                    
                    <div>
                      <p><strong>Ingredientes base:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 2 kg huesos de res orgánica (con tuétano)</li>
                        <li>• 2 cdas vinagre manzana</li>
                        <li>• 1 cebolla grande cortada</li>
                        <li>• 2 zanahorias en trozos</li>
                        <li>• 3 tallos apio</li>
                        <li>• 1 cabeza ajo completa</li>
                        <li>• Agua filtrada para cubrir</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Boost anti-inflamatorio:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 trozo jengibre (5cm)</li>
                        <li>• 1 cdta cúrcuma en polvo</li>
                        <li>• 1 cdta pimienta negra molida</li>
                        <li>• 2 hojas laurel</li>
                        <li>• 1 cdas sal marina</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Método lento:</strong></p>
                      <ol className="space-y-1 ml-4">
                        <li>1. Asa huesos en horno 400°F por 30 min</li>
                        <li>2. Coloca en olla lenta con vinagre, deja 30 min</li>
                        <li>3. Añade vegetales y especias</li>
                        <li>4. Cubrir con agua, cocinar 24-48 horas</li>
                        <li>5. Colar y refrigerar, usar hasta 5 días</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(245, 230, 255, 0.2);">
                      <p className="text-xs"><strong>Medicina ancestral:</strong> Rico en colágeno, glicina, prolina y glutamina para reparar intestino. Los minerales son biodisponibles para huesos y articulaciones.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(193, 212, 58, 0.1); border-color: #c1d43a;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🥘 Curry Terapéutico de Coco</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Digestión, inmunidad, dolor articular</p>
                    
                    <div>
                      <p><strong>Proteína (elige una):</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 400g pollo orgánico en cubos</li>
                        <li>• 300g pescado blanco</li>
                        <li>• 200g tofu extra firme</li>
                        <li>• 1 taza lentejas rojas</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Vegetales curativos:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 cebolla morada</li>
                        <li>• 3 dientes ajo</li>
                        <li>• 1 trozo jengibre (3cm)</li>
                        <li>• 1 chile rojo</li>
                        <li>• 1 taza brócoli</li>
                        <li>• 1 taza espinacas</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Pasta de curry casera:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 2 cdtas cúrcuma fresca rallada</li>
                        <li>• 1 cdta comino molido</li>
                        <li>• 1 cdta coriandro molido</li>
                        <li>• 1/2 cdta pimienta cayena</li>
                        <li>• 1 lata leche coco completa</li>
                        <li>• 2 cdas aceite coco</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(200, 166, 166, 0.2);">
                      <p className="text-xs"><strong>Sinergia medicinal:</strong> La cúrcuma con pimienta negra aumenta absorción 2000%. Los ácidos grasos del coco potencian las especias antiinflamatorias.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas para Energía Sostenida</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(200, 166, 166, 0.1); border-color: #c8a6a6;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">⚡ Smoothie Bowl Adaptógeno</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Energía estable, concentración, resistencia al estrés</p>
                    
                    <div>
                      <p><strong>Base del smoothie:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 plátano congelado</li>
                        <li>• 1/2 taza berries mixtos</li>
                        <li>• 1 taza leche almendras sin azúcar</li>
                        <li>• 2 cdas proteína vegetal</li>
                        <li>• 1 cda mantequilla almendra</li>
                        <li>• 1 cdta aceite MCT</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Adaptógenos estrella:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1/2 cdta maca orgánica</li>
                        <li>• 1/2 cdta ashwagandha</li>
                        <li>• 1 cdta espirulina</li>
                        <li>• 1/2 cdta rhodiola (opcional)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Toppings energéticos:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• Cacao nibs</li>
                        <li>• Semillas chía</li>
                        <li>• Granola sin azúcar</li>
                        <li>• Coco rallado</li>
                        <li>• Almendras laminadas</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(193, 212, 58, 0.2);">
                      <p className="text-xs"><strong>Beneficios:</strong> Maca regula hormonas y energía, ashwagandha reduce cortisol, espirulina aporta proteína completa y hierro biodisponible.</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg border-l-4" style="background-color: rgba(245, 230, 255, 0.2); border-color: #f5e6ff;">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🥜 Energy Balls Mitocondrial</h4>
                  <div className="space-y-3 text-sm" style="color: #8d7583;">
                    <p><strong>Para:</strong> Pre-entreno, snack cerebral, energía sin crash</p>
                    
                    <div>
                      <p><strong>Base energética:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 taza dátiles Medjool deshuesados</li>
                        <li>• 1/2 taza almendras crudas</li>
                        <li>• 1/2 taza nueces</li>
                        <li>• 1/4 taza semillas calabaza</li>
                        <li>• 2 cdas cacao en polvo crudo</li>
                        <li>• 2 cdas aceite coco derretido</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Superfoods energéticos:</strong></p>
                      <ul className="space-y-1 ml-4">
                        <li>• 1 cdta espirulina</li>
                        <li>• 1 cdta maca</li>
                        <li>• 1/2 cdta canela</li>
                        <li>• Pizca sal marina</li>
                        <li>• 1 cdta extracto vainilla</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p><strong>Método:</strong></p>
                      <ol className="space-y-1 ml-4">
                        <li>1. Procesa frutos secos hasta formar harina</li>
                        <li>2. Añade dátiles y procesa hasta pasta</li>
                        <li>3. Agrega superfoods y aceite de coco</li>
                        <li>4. Forma bolitas de 2cm</li>
                        <li>5. Refrigera 30 min, guarda hasta 1 semana</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 rounded-lg mt-3" style="background-color: rgba(141, 117, 131, 0.2);">
                      <p className="text-xs"><strong>Ciencia:</strong> Magnesio de almendras + CoQ10 natural para función mitocondrial. Cacao crudo aporta teobromina para energía sin nerviosismo.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Recetas para Digestión y Microbioma</h3>
              
              <div className="space-y-6">
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(193, 212, 58, 0.1), rgba(193, 212, 58, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">🥬 Sauerkraut Curativo Casero</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Ingredientes:</h5>
                      <ul className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>• 1 repollo orgánico mediano (1kg)</li>
                        <li>• 1 cda sal marina sin refinar</li>
                        <li>• 1 cdta semillas comino (opcional)</li>
                        <li>• 1 cdta semillas eneldo</li>
                        <li>• 2 dientes ajo</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Proceso (7-14 días):</h5>
                      <ol className="space-y-1 text-sm" style="color: #8d7583;">
                        <li>1. Corta repollo fino, masajea con sal 10 min</li>
                        <li>2. Añade especias, presiona en frasco vidrio</li>
                        <li>3. Debe estar cubierto con su jugo</li>
                        <li>4. Fermenta a temperatura ambiente</li>
                        <li>5. Prueba diariamente hasta acidez deseada</li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-lg" style="background-color: rgba(200, 166, 166, 0.2);">
                    <p className="text-sm" style="color: #382a3c;"><strong>Dosis terapéutica:</strong> 2-3 cucharadas diarias con comidas. Rico en Lactobacillus plantarum, vitamina C y enzimas digestivas naturales.</p>
                  </div>
                </div>
                
                <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(200, 166, 166, 0.1), rgba(200, 166, 166, 0.2));">
                  <h4 className="text-xl font-semibold mb-4" style="color: #382a3c;">🫖 Té Digestivo Nocturno</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg" style="background-color: rgba(245, 230, 255, 0.3);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Mezcla base:</h5>
                      <ul className="space-y-1 text-xs" style="color: #8d7583;">
                        <li>• 1 cdta manzanilla seca</li>
                        <li>• 1/2 cdta hinojo molido</li>
                        <li>• 1/2 cdta jengibre seco</li>
                        <li>• 1/4 cdta menta</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(141, 117, 131, 0.2);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Preparación:</h5>
                      <ul className="space-y-1 text-xs" style="color: #8d7583;">
                        <li>• Hierve 1 taza agua</li>
                        <li>• Agrega hierbas</li>
                        <li>• Infusiona 10 minutos tapado</li>
                        <li>• Cuela y añade miel</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg" style="background-color: rgba(193, 212, 58, 0.2);">
                      <h5 className="font-semibold mb-2" style="color: #382a3c;">Beneficios:</h5>
                      <ul className="space-y-1 text-xs" style="color: #8d7583;">
                        <li>• Reduce hinchazón</li>
                        <li>• Calma acidez</li>
                        <li>• Mejora peristálsis</li>
                        <li>• Relaja sistema nervioso</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Kit de Medicina Culinaria</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 rounded-lg" style="background-color: rgba(245, 230, 255, 0.2);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🧂 Especias Medicinales Esenciales</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <ul className="space-y-1">
                      <li>• <strong>Cúrcuma:</strong> Antiinflamatorio, protección hepática</li>
                      <li>• <strong>Jengibre:</strong> Digestivo, anti-náusea, circulación</li>
                      <li>• <strong>Canela Ceylon:</strong> Regula azúcar, antimicrobiano</li>
                      <li>• <strong>Cardamomo:</strong> Digestivo, desintoxicante, respiratorio</li>
                      <li>• <strong>Comino:</strong> Digestión, absorción hierro</li>
                      <li>• <strong>Coriandro:</strong> Detox metales pesados, digestivo</li>
                      <li>• <strong>Fenogreco:</strong> Lactancia, control glucosa</li>
                      <li>• <strong>Ajo:</strong> Inmunidad, cardiovascular, antimicrobiano</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-5 rounded-lg" style="background-color: rgba(141, 117, 131, 0.1);">
                  <h4 className="font-semibold mb-3" style="color: #382a3c;">🫗 Aceites Terapéuticos</h4>
                  <div className="space-y-2 text-sm" style="color: #8d7583;">
                    <ul className="space-y-1">
                      <li>• <strong>Oliva extra virgen:</strong> Antioxidante, corazón</li>
                      <li>• <strong>Coco virgen:</strong> Antimicrobiano, función cerebral</li>
                      <li>• <strong>Aguacate:</strong> Omega-9, absorción vitaminas</li>
                      <li>• <strong>Sésamo:</strong> Calcio, lignanos, equilibrio hormonal</li>
                      <li>• <strong>Linaza:</strong> Omega-3, fibra, fitoestrógenos</li>
                      <li>• <strong>Hemp:</strong> Omega 3:6 perfecto, proteína</li>
                      <li>• <strong>MCT:</strong> Energía cerebral inmediata</li>
                      <li>• <strong>Ghee:</strong> Vitaminas A,D,E,K, butirato</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg" style="background: linear-gradient(135deg, rgba(193, 212, 58, 0.1), rgba(200, 166, 166, 0.1), rgba(245, 230, 255, 0.1));">
                <h4 className="font-semibold mb-2" style="color: #382a3c;">Bendición Culinaria:</h4>
                <p className="italic text-lg" style="color: #382a3c;">"Que cada ingrediente que elijo nutra mi cuerpo templo. Que cada plato que preparo sea un acto de amor propio. Que mi cocina sea mi farmacia y mi mesa mi altar de sanación. Cocino con gratitud, como con conciencia y me nutro con amor."</p>
              </div>
            </div>
          `,
          type: 'Cocina Medicinal',
          slug: 'recetas-medicina'
        }
      ],
      tips: [
        'Mastica cada bocado 20-30 veces para activar enzimas digestivas y mejorar absorción de nutrientes',
        'Come sin distracciones: apaga TV, celular y conecta conscientemente con tu comida',
        'Pregúntate antes de comer: "¿Tengo hambre física o emocional?" - diferencia real vs. antojo',
        'Hidrata tu cuerpo con 2-3 litros de agua pura al día, preferiblemente entre comidas',
        'Incluye colores del arcoíris en cada comida: cada color aporta antioxidantes únicos',
        'Respeta la cronobiología: desayuna como reina, almuerza como princesa, cena como plebeya',
        'Escucha las señales de saciedad: para cuando estés 80% llena, no completamente llena',
        'Bendice tu comida: agradecer cada alimento eleva la vibración nutricional',
        'Come proteína en cada comida para estabilizar glucosa y mantener energía constante',
        'Prioriza grasas saludables: aguacate, nueces, aceite de oliva, omega-3 de pescado',
        'Ayuna intermitentemente: 12-16 horas sin comer permite regeneración celular',
        'Escucha a tu cuerpo: si un alimento te sienta mal, tu cuerpo tiene la razón'
      ],
      mentalHealth: [
        'La comida emocional es una forma de automedicación - no eres débil, necesitas herramientas específicas para gestionar emociones',
        'Cada "falla" en tu alimentación es información valiosa sobre tus necesidades emocionales no atendidas - no te juzgues, aprende',
        'Tu peso no define tu valor como persona - eres valiosa independientemente de la báscula, tu peso no es tu identidad',
        'Sanar tu relación con la comida es sanar tu relación contigo misma - requiere paciencia, amor y apoyo profesional',
        'Los atracones no son falta de voluntad, son síntomas de restricción física o emocional - identifica la causa raíz',
        'Tu cuerpo tiene una sabiduría innata para autorregularse cuando confías en él y lo escuchas sin juicio',
        'La perfección alimentaria no existe - busca progreso, no perfección, y celebra cada pequeño avance',
        'Comer es un acto de amor propio cuando eliges desde la conciencia y no desde la culpa o el miedo'
      ]
    },
    sexualidad: {
      articles: [
        {
          id: 1,
          title: 'Autoconocimiento Corporal: Tu Mapa del Placer',
          summary: 'Guía psicológica para explorar tu cuerpo sin tabúes, conectar con tus sensaciones y honrar tu placer',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Reconectando con tu Cuerpo Sagrado</h2>
              
              <p className="text-lg leading-relaxed">Como terapeuta sexual especializada en empoderamiento femenino, te acompaño en el hermoso viaje de redescubrir tu cuerpo desde el amor, la curiosidad y el respeto. Tu cuerpo es tu templo sagrado, y conocerlo es tu derecho fundamental.</p>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                <h4 className="font-semibold text-brand-primary mb-2">Recuerda Siempre:</h4>
                <p className="text-brand-secondary italic">"Tu placer es tuyo. No necesita aprobación, validación o comparación. Es único, válido y sagrado."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Anatomía del Placer Femenino</h3>
              <p>El placer femenino va mucho más allá de lo que tradicionalmente se enseña. Tu cuerpo tiene múltiples zonas erógenas, cada una única en sus sensaciones:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Zonas Primarias</h4>
                  <ul className="space-y-2 text-brand-secondary">
                    <li>• Clítoris: 8,000 terminaciones nerviosas</li>
                    <li>• Punto G: Zona esponjosa en la pared anterior</li>
                    <li>• Labios externos e internos</li>
                    <li>• Entrada vaginal: zona más sensible</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Zonas Secundarias</h4>
                  <ul className="space-y-2 text-brand-primary">
                    <li>• Cuello: especialmente sensible</li>
                    <li>• Pechos y areolas</li>
                    <li>• Muslos internos</li>
                    <li>• Zona lumbar</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de Autoexploración Respetuosa</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-2">Paso 1: Preparación del Espacio Sagrado</h4>
                  <ul className="text-brand-secondary space-y-1">
                    <li>• Asegura privacidad total</li>
                    <li>• Limpia y corta tus uñas</li>
                    <li>• Crea ambiente relajante: velas, música suave</li>
                    <li>• Ten lubricante de alta calidad a mano</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-2">Paso 2: Conexión Mental</h4>
                  <ul className="text-brand-secondary space-y-1">
                    <li>• Respira profundamente por 5 minutos</li>
                    <li>• Libérate de juicios y expectativas</li>
                    <li>• Conecta con la intención de amor propio</li>
                    <li>• Recuerda: no hay metas, solo exploración</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-2">Paso 3: Exploración Gradual</h4>
                  <ul className="text-brand-secondary space-y-1">
                    <li>• Comienza con caricias suaves en todo tu cuerpo</li>
                    <li>• Observa qué zonas responden más</li>
                    <li>• Varía presión, velocidad y técnicas</li>
                    <li>• Escucha las respuestas de tu cuerpo</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Técnicas de Autoplacer Saludables</h3>
              
              <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3">Técnicas Recomendadas:</h4>
                <ul className="space-y-2 text-brand-secondary">
                  <li><strong>Circulos Concéntricos:</strong> Movimientos circulares alrededor del clítoris</li>
                  <li><strong>Presión Variable:</strong> Alterna entre presión suave y firme</li>
                  <li><strong>Respiración Consciente:</strong> Usa tu respiración para intensificar sensaciones</li>
                  <li><strong>Exploración de Ritmos:</strong> Encuentra tu tempo único</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Sanando Traumas y Bloqueos</h3>
              
              <p>Si durante la exploración surgen emociones difíciles, recuerda que es completamente normal. Tu cuerpo puede estar liberando memorias almacenadas.</p>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Si Aparecen Emociones Difíciles:</h4>
                <ul className="space-y-2 text-brand-secondary">
                  <li>• Para inmediatamente y respira profundo</li>
                  <li>• Abraza a tu niña interior con compasión</li>
                  <li>• Recuerda que mereces placer y amor</li>
                  <li>• Considera buscar apoyo terapéutico especializado</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación para el Autoconocimiento:</h4>
                <p className="italic text-lg text-brand-primary">"Mi cuerpo es sabio, hermoso y merece ser honrado. Explorarme con amor es un acto de empoderamiento y autocuidado."</p>
              </div>
            </div>
          `,
          type: 'Autoexploración',
          slug: 'autoconocimiento-corporal'
        },
        {
          id: 2,
          title: 'Placer Consciente y Mindfulness Sexual',
          summary: 'Técnicas de atención plena para disfrutar la intimidad, conectar con el presente y sanar traumas',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">El Arte del Placer Presente</h2>
              
              <p className="text-lg leading-relaxed">Como especialista en mindfulness y terapia sexual, te enseño que el placer consciente no es solo una técnica, es una revolución personal. Es la diferencia entre tener sexo y hacer el amor contigo misma y con otros desde la presencia total.</p>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                <h4 className="font-semibold text-brand-primary mb-2">Esencia del Mindfulness Sexual:</h4>
                <p className="text-brand-secondary italic">"Cuando estás completamente presente en tu cuerpo, cada sensación se amplifica, cada toque se convierte en medicina y cada momento de placer sana heridas del pasado."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 5 Niveles del Placer Consciente</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">Nivel 1: Presencia Corporal</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Técnicas Fundamentales:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Respiración abdominal profunda</li>
                        <li>• Escaneo corporal de pies a cabeza</li>
                        <li>• Observación sin juicio de sensaciones</li>
                        <li>• Conexión con el momento presente</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Práctica Diaria:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• 10 min meditación corporal matutina</li>
                        <li>• Duchas conscientes (sentir agua, temperatura)</li>
                        <li>• Caminatas descalza conectando con tierra</li>
                        <li>• Automasaje con aceites aromáticos</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">Nivel 2: Respiración Erótica</h4>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Técnica de Respiración Circular:</h5>
                      <ol className="text-brand-accent space-y-2 text-sm">
                        <li>1. Inhala por nariz llenando abdomen (4 segundos)</li>
                        <li>2. Continúa llenando pecho (2 segundos)</li>
                        <li>3. Exhala por boca relajadamente (6 segundos)</li>
                        <li>4. Sin pausa, inicia nuevo ciclo</li>
                        <li>5. Imagina energía sexual circulando por tu cuerpo</li>
                      </ol>
                    </div>
                    <p className="text-brand-primary text-sm"><strong>Beneficio:</strong> Oxigena tejidos, intensifica sensaciones, distribuye energía sexual por todo el cuerpo</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">Nivel 3: Atención Sensorial Total</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Los 5 Sentidos Eróticos:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li><strong>Vista:</strong> Observa tu cuerpo con amor y admiración</li>
                        <li><strong>Tacto:</strong> Varía presión, velocidad, textura</li>
                        <li><strong>Oído:</strong> Conecta con tu respiración y sonidos</li>
                        <li><strong>Olfato:</strong> Usa aceites, inciensos naturales</li>
                        <li><strong>Gusto:</strong> Explora sabores corporales propios</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Ejercicio de Mapeo Sensorial:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Toca cada zona de tu cuerpo 30 segundos</li>
                        <li>• Observa qué sensaciones surgen</li>
                        <li>• No busques excitación, busca presencia</li>
                        <li>• Anota en diario qué descubres</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">Nivel 4: Expansión Energética</h4>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Técnica de Energía Circular:</h5>
                      <ol className="text-brand-accent space-y-2 text-sm">
                        <li>1. Durante autoplacer, cuando sientes excitación aumentar</li>
                        <li>2. Respira profundo e imagina energía subiendo por columna</li>
                        <li>3. Lleva energía al corazón, luego a coronilla</li>
                        <li>4. Permite que circule por todo tu cuerpo</li>
                        <li>5. No busques orgasmo localizado, busca expansión total</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">Nivel 5: Orgasmo Consciente</h4>
                  <div className="space-y-4">
                    <p className="text-brand-secondary">El orgasmo consciente no es un evento, es un estado expandido de conciencia donde placer, amor y presencia se unifican.</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                        <h5 className="font-semibold text-brand-secondary mb-2">Características:</h5>
                        <ul className="text-brand-primary space-y-1 text-sm">
                          <li>• Ondas de placer en todo el cuerpo</li>
                          <li>• Conexión espiritual profunda</li>
                          <li>• Sanación emocional espontánea</li>
                          <li>• Sensación de unidad y paz</li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                        <h5 className="font-semibold text-brand-secondary mb-2">Cómo Cultivarlo:</h5>
                        <ul className="text-brand-primary space-y-1 text-sm">
                          <li>• Practica niveles anteriores consistentemente</li>
                          <li>• Suelta expectativas y metas</li>
                          <li>• Permite que tu cuerpo te guíe</li>
                          <li>• Abraza cualquier emoción que surja</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Sanando Traumas con Mindfulness Sexual</h3>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Si Aparecen Emociones Difíciles Durante la Práctica:</h4>
                <ul className="text-brand-secondary space-y-2">
                  <li><strong>1. No Huyas:</strong> La emoción contiene información de sanación</li>
                  <li><strong>2. Respira Conscientemente:</strong> Envía respiración a la zona de tensión</li>
                  <li><strong>3. Abraza con Compasión:</strong> "Bienvenida, emoción, tienes algo que enseñarme"</li>
                  <li><strong>4. Observa sin Cambiar:</strong> No trates de "arreglar", solo observa</li>
                  <li><strong>5. Busca Apoyo:</strong> Considera terapia especializada en trauma sexual</li>
                </ul>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Programa de 30 Días: Despertar Sexual Consciente</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary">Semana 1: Fundación</h5>
                    <ul className="text-brand-secondary text-sm space-y-1">
                      <li>• Día 1-2: Meditación corporal básica</li>
                      <li>• Día 3-4: Respiración consciente</li>
                      <li>• Día 5-7: Automasaje sin intención sexual</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary">Semana 2: Exploración</h5>
                    <ul className="text-brand-primary text-sm space-y-1">
                      <li>• Día 8-10: Mapeo sensorial completo</li>
                      <li>• Día 11-12: Respiración erótica</li>
                      <li>• Día 13-14: Atención en 5 sentidos</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary">Semana 3: Expansión</h5>
                    <ul className="text-brand-secondary text-sm space-y-1">
                      <li>• Día 15-17: Autoplacer consciente</li>
                      <li>• Día 18-19: Circulación energética</li>
                      <li>• Día 20-21: Integración emocional</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary">Semana 4: Maestría</h5>
                    <ul className="text-brand-secondary text-sm space-y-1">
                      <li>• Día 22-24: Orgasmo consciente</li>
                      <li>• Día 25-27: Sanación con placer</li>
                      <li>• Día 28-30: Integración y celebración</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Mantra del Placer Consciente:</h4>
                <p className="italic text-lg text-brand-primary">"Mi placer es sagrado. Mi cuerpo es sabio. En cada respiración encuentro más presencia, en cada toque encuentro más amor, en cada orgasmo encuentro más libertad."</p>
              </div>
            </div>
          `,
          type: 'Terapia Sexual',
          slug: 'placer-consciente'
        },
        {
          id: 3,
          title: 'Sanando Traumas Sexuales',
          summary: 'Protocolo terapéutico para sanar heridas del pasado y recuperar tu poder sexual',
          content: 'Proceso de sanación sexual...',
          type: 'Trauma Therapy',
          slug: 'sanacion-traumas'
        },
        {
          id: 4,
          title: 'Comunicación Erótica Sin Vergüenza',
          summary: 'Aprende a expresar tus deseos, establecer límites y comunicarte íntimamente sin miedo',
          content: 'Guía de comunicación sexual...',
          type: 'Habilidades Sociales',
          slug: 'comunicacion-erotica'
        },
        {
          id: 5,
          title: 'Sexualidad en Pareja: Reconectar la Intimidad',
          summary: 'Estrategias para reavivar la pasión, superar rutinas y crear conexión profunda',
          content: 'Terapia de pareja sexual...',
          type: 'Terapia de Pareja',
          slug: 'sexualidad-pareja'
        },
        {
          id: 6,
          title: 'Salud Sexual Integral',
          summary: 'Prevención, revisiones ginecológicas, higiene íntima y autocuidado sexual responsable',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Salud Sexual: Tu Derecho Fundamental</h2>
              
              <p className="text-lg leading-relaxed">Como ginecóloga especializada en salud sexual, entiendo que tu bienestar íntimo es integral: físico, emocional, mental y social. Una sexualidad saludable es la base de tu bienestar general y tu derecho humano fundamental.</p>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border-l-4 border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-2">Principio Fundamental:</h4>
                <p className="text-brand-secondary italic">"La salud sexual no es solo ausencia de enfermedad, es el estado de bienestar físico, emocional, mental y social relacionado con la sexualidad."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Revisiones Ginecológicas: Tu Calendario de Salud</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">🗓️ Calendario de Controles Regulares</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>18-21 años (Primera visita):</strong></p>
                    <ul className="space-y-1">
                      <li>• Consulta educativa sin examen invasivo</li>
                      <li>• Orientación sobre menstruación</li>
                      <li>• Vacunación VPH si no está vacunada</li>
                      <li>• Educación sexual integral</li>
                    </ul>
                    
                    <p className="mt-3"><strong>21-29 años:</strong></p>
                    <ul className="space-y-1">
                      <li>• Papanicolaou cada 3 años</li>
                      <li>• Examen pélvico anual</li>
                      <li>• Control de anticoncepción</li>
                      <li>• Screening ETS/ITS</li>
                    </ul>
                    
                    <p className="mt-3"><strong>30-65 años:</strong></p>
                    <ul className="space-y-1">
                      <li>• Papanicolaou + test VPH cada 5 años</li>
                      <li>• O Papanicolaou cada 3 años</li>
                      <li>• Mamografía desde los 40</li>
                      <li>• Evaluación salud ósea</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">🔍 Qué Esperar en Cada Visita</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Historia clínica completa:</strong></p>
                    <ul className="space-y-1">
                      <li>• Historial menstrual detallado</li>
                      <li>• Vida sexual activa y prácticas</li>
                      <li>• Métodos anticonceptivos actuales</li>
                      <li>• Síntomas o preocupaciones</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Examen físico:</strong></p>
                    <ul className="space-y-1">
                      <li>• Examen visual externo</li>
                      <li>• Examen con espéculo (Papanicolaou)</li>
                      <li>• Examen bimanual interno</li>
                      <li>• Palpación de mamas</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Educación personalizada:</strong></p>
                    <ul className="space-y-1">
                      <li>• Resolución de dudas sin juicio</li>
                      <li>• Consejos de autocuidado</li>
                      <li>• Planificación familiar</li>
                      <li>• Prevención de ITS</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Higiene Íntima: El Arte del Equilibrio</h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-4">La Microbiota Vaginal: Tu Ecosistema Protector</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">pH Óptimo: 3.8-4.5</h5>
                    <ul className="text-brand-accent space-y-1 text-xs">
                      <li>• Lactobacilos dominantes (95%)</li>
                      <li>• Producen ácido láctico</li>
                      <li>• Crean barrera protectora</li>
                      <li>• Previenen infecciones</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">Factores que Alteran:</h5>
                    <ul className="text-brand-accent space-y-1 text-xs">
                      <li>• Antibióticos sistémicos</li>
                      <li>• Duchas vaginales</li>
                      <li>• Ropa sintética ajustada</li>
                      <li>• Estrés y falta de sueño</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">Signos de Desequilibrio:</h5>
                    <ul className="text-brand-secondary space-y-1 text-xs">
                      <li>• Flujo con olor fuerte</li>
                      <li>• Picazón o ardor</li>
                      <li>• Color anormal (gris/verde)</li>
                      <li>• Dolor al orinar</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de Higiene Íntima Diaria</h3>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">✨ Rutina Matutina</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Limpieza Suave:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• <strong>Solo agua tibia</strong> para área vulvar</li>
                        <li>• <strong>Sin jabones</strong> dentro de labios</li>
                        <li>• <strong>De adelante hacia atrás</strong> siempre</li>
                        <li>• <strong>Secar suavemente</strong> con toalla limpia</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Productos Recomendados:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• <strong>Jabón íntimo pH 4.5:</strong> Solo zona externa</li>
                        <li>• <strong>Aceite coco virgen:</strong> Hidratación natural</li>
                        <li>• <strong>Probióticos vaginales:</strong> 1-2x/semana</li>
                        <li>• <strong>Ropa interior algodón:</strong> Transpirable</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">🌙 Rutina Nocturna</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Antes de Dormir:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• <strong>Ducha rápida</strong> si fue día activo</li>
                        <li>• <strong>Cambio de ropa interior</strong> siempre</li>
                        <li>• <strong>Dormir sin ropa interior</strong> ocasionalmente</li>
                        <li>• <strong>Evitar protectores</strong> diarios siempre</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Cuidados Especiales:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• <strong>Durante menstruación:</strong> Cambio frecuente</li>
                        <li>• <strong>Post-ejercicio:</strong> Ducha inmediata</li>
                        <li>• <strong>Post-relación sexual:</strong> Orinar + limpieza</li>
                        <li>• <strong>Viajes largos:</strong> Toallitas pH neutro</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Prevención de Infecciones de Transmisión Sexual</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg border-l-4 border-brand-primary">
                  <h4 className="font-semibold text-brand-primary mb-3">🛡️ Métodos de Barrera</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Condón masculino:</strong></p>
                    <ul className="space-y-1">
                      <li>• Eficacia 98% si se usa correctamente</li>
                      <li>• Protege contra VIH, gonorrea, clamidia</li>
                      <li>• Verificar fecha de vencimiento</li>
                      <li>• No usar con lubricantes oleosos</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Condón femenino:</strong></p>
                    <ul className="space-y-1">
                      <li>• Mayor control por parte de la mujer</li>
                      <li>• Protección similar al masculino</li>
                      <li>• Puede colocarse horas antes</li>
                      <li>• Compatible con lubricantes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">📋 Screening Regular</h4>
                  <div className="text-brand-primary space-y-2 text-sm">
                    <p><strong>Pruebas anuales recomendadas:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>VIH:</strong> Test de 4ta generación</li>
                      <li>• <strong>Sífilis:</strong> VDRL o RPR</li>
                      <li>• <strong>Hepatitis B y C:</strong> Antígenos y anticuerpos</li>
                      <li>• <strong>Gonorrea/Clamidia:</strong> PCR urinario</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Si eres sexualmente activa:</strong></p>
                    <ul className="space-y-1">
                      <li>• Screening cada 6-12 meses</li>
                      <li>• Antes de nueva pareja sexual</li>
                      <li>• Si hay síntomas sospechosos</li>
                      <li>• Comunicación abierta con pareja</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Salud Sexual en Diferentes Etapas</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Adolescencia (13-19 años)</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Educación Sexual Integral:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Anatomía y fisiología sexual</li>
                        <li>• Consentimiento y límites</li>
                        <li>• Métodos anticonceptivos</li>
                        <li>• Diversidad sexual y de género</li>
                        <li>• Comunicación asertiva</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Cuidados Especiales:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Primera consulta ginecológica</li>
                        <li>• Vacunación VPH (9-14 años)</li>
                        <li>• Apoyo emocional sin juicio</li>
                        <li>• Confidencialidad médica</li>
                        <li>• Recursos de apoyo peer</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Edad Reproductiva (20-40 años)</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Planificación Familiar:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Anticoncepción personalizada</li>
                        <li>• Preparación preconcepcional</li>
                        <li>• Fertilidad y ovulación</li>
                        <li>• Tratamiento de infertilidad</li>
                        <li>• Apoyo emocional de pareja</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-brand-primary/15 to-brand-primary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Salud Sexual Activa:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Lubricación y comodidad</li>
                        <li>• Disfunción sexual femenina</li>
                        <li>• Comunicación en pareja</li>
                        <li>• Sexualidad durante embarazo</li>
                        <li>• Recuperación postparto</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Perimenopausia y Menopausia (40+ años)</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Cambios Hormonales:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Sequedad vaginal y atrofia</li>
                        <li>• Disminución de la libido</li>
                        <li>• Terapia hormonal personalizada</li>
                        <li>• Lubricantes y humectantes</li>
                        <li>• Ejercicios del suelo pélvico</li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Nueva Sexualidad:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Redefinición del placer</li>
                        <li>• Intimidad emocional profunda</li>
                        <li>• Libertad de embarazo</li>
                        <li>• Tiempo para exploración</li>
                        <li>• Sabiduría y experiencia</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Kit de Emergencia Sexual</h3>
              
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-4">🆘 Para Situaciones Imprevistas</h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">Anticonceptivo de Emergencia:</h5>
                    <ul className="text-brand-secondary space-y-1 text-xs">
                      <li>• <strong>Hasta 72h:</strong> Levonorgestrel 1.5mg</li>
                      <li>• <strong>Hasta 120h:</strong> Ulipristal acetato</li>
                      <li>• <strong>DIU cobre:</strong> Hasta 5 días después</li>
                      <li>• <strong>Consulta médica:</strong> Siempre recomendada</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">Profilaxis Post-Exposición:</h5>
                    <ul className="text-brand-secondary space-y-1 text-xs">
                      <li>• <strong>PEP para VIH:</strong> Dentro de 72h</li>
                      <li>• <strong>Valoración médica:</strong> Urgente</li>
                      <li>• <strong>Seguimiento:</strong> 3-6 meses</li>
                      <li>• <strong>Apoyo psicológico:</strong> Disponible</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">Infecciones Agudas:</h5>
                    <ul className="text-brand-accent space-y-1 text-xs">
                      <li>• <strong>Candidiasis:</strong> Antifúngico tópico</li>
                      <li>• <strong>Cistitis:</strong> Antibiótico específico</li>
                      <li>• <strong>Vaginosis:</strong> Metronidazol</li>
                      <li>• <strong>Consulta:</strong> Diagnóstico certero</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación de Salud Sexual:</h4>
                <p className="italic text-lg text-brand-primary">"Mi salud sexual es una prioridad. Cuido mi cuerpo con amor y respeto. Tengo derecho al placer, a la información y a la atención médica sin juicio. Mi sexualidad es sagrada y merece ser protegida."</p>
              </div>
            </div>
          `,
          type: 'Medicina Preventiva',
          slug: 'salud-sexual'
        },
        {
          id: 7,
          title: 'Liberándote de la Culpa Sexual',
          summary: 'Deshazte de la culpa, vergüenza y condicionamientos que limitan tu expresión sexual',
          content: 'Terapia de liberación sexual...',
          type: 'Sanación Emocional',
          slug: 'liberacion-culpa'
        },
        {
          id: 8,
          title: 'Sexualidad Sagrada: Conectar con tu Diosa Interior',
          summary: 'Honra tu sexualidad como poder sagrado, energía creativa y conexión espiritual',
          content: 'Sexualidad sagrada femenina...',
          type: 'Espiritualidad',
          slug: 'sexualidad-sagrada'
        }
      ],
      downloads: [
        'Guía Completa de Autoplacer Femenino: Anatomía, Técnicas y Autoconocimiento (PDF Ilustrado)',
        'Checklist Anual de Salud Sexual: Revisiones Ginecológicas y Prevención (Lista Personalizable)',
        'Manual de Ejercicios de Mindfulness Sexual: 15 Técnicas para Conexión Íntima',
        'Protocolo Terapéutico para Sanación de Traumas Sexuales (Guía de Autoayuda)',
        'Guía de Comunicación Íntima: Cómo Expresar Deseos sin Vergüenza (Con Scripts)',
        'Manual de Sexualidad Sagrada Femenina: Honrando tu Poder Sexual (E-book)',
        'Registro de Ciclo Sexual: Conecta tu Libido con tu Ciclo Menstrual (Plantilla)',
        'Guía de Productos de Higiene Íntima Natural: Qué Usar y Qué Evitar',
        'Manual de Ejercicios de Kegel: Fortalece tu Suelo Pélvico (Con Rutinas)',
        'Cuestionario de Autoevaluación Sexual: Conoce tu Perfil de Satisfacción'
      ],
      psychologicalSupport: [
        'Tu sexualidad es tuya y solo tuya - nadie tiene derecho a juzgarla',
        'Sanar traumas sexuales requiere tiempo, paciencia y amor propio',
        'El placer es tu derecho fundamental como mujer y ser humano',
        'No existe sexualidad "normal" - solo existe TU sexualidad única y válida'
      ]
    },
    menopausia: {
      articles: [
        {
          id: 1,
          title: 'Navegando las Fases de la Menopausia',
          summary: 'Comprende premenopausia, menopausia y posmenopausia desde una perspectiva psicológica integral',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">La Menopausia: Tu Renacimiento Hormonal</h2>
              
              <p className="text-lg leading-relaxed">Como ginecóloga especializada en medicina integrativa y psicología de la menopausia, te acompaño a entender que esta etapa no es el final de tu feminidad, sino el inicio de tu poder más auténtico. Es tu segunda primavera, llena de sabiduría y libertad.</p>
              
              <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-6 rounded-lg border-l-4 border-brand-background">
                <h4 className="font-semibold text-brand-primary mb-2">Redefine tu Menopausia:</h4>
                <p className="text-brand-secondary italic">"No es una enfermedad que curar, sino una transición que honrar. Es tu metamorfosis hacia la mujer sabia que siempre estuviste destinada a ser."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Las 3 Fases de tu Transición</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">1. Premenopausia (35-45 años)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Cambios Físicos:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Ciclos menstruales irregulares</li>
                        <li>• Cambios en el flujo menstrual</li>
                        <li>• Primeros sofocos esporádicos</li>
                        <li>• Cambios en la libido</li>
                        <li>• Sequedad vaginal ocasional</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Cambios Emocionales:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Irritabilidad ocasional</li>
                        <li>• Cambios de humor más frecuentes</li>
                        <li>• Ansiedad sobre el futuro</li>
                        <li>• Reflexión sobre la identidad</li>
                        <li>• Sensación de "algo está cambiando"</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <strong className="text-brand-primary">Tu Enfoque:</strong> Esta es tu fase de preparación. Comienza a nutrir tu cuerpo con alimentación antiinflamatoria, ejercicio regular y práticas de mindfulness.
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">2. Perimenopausia (45-55 años)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Cambios Físicos:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Sofocos más frecuentes e intensos</li>
                        <li>• Sudoraciones nocturnas</li>
                        <li>• Insomnio o sueño fragmentado</li>
                        <li>• Cambios en peso corporal</li>
                        <li>• Sequedad en piel y cabello</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Cambios Emocionales:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• "Montaña rusa" emocional</li>
                        <li>• Período de duelo por la juventud</li>
                        <li>• Búsqueda de propósito</li>
                        <li>• Necesidad de autenticidad</li>
                        <li>• Liberación de patrones antiguos</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                    <strong className="text-brand-primary">Tu Enfoque:</strong> Abraza la transformación. Es momento de soltar lo que no te sirve y reclamar tu poder auténtico. Considera terapia hormonal natural si es necesario.
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">3. Posmenopausia (55+ años)</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Estabilización Física:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Fin de los sofocos</li>
                        <li>• Nuevo equilibrio hormonal</li>
                        <li>• Energía más estable</li>
                        <li>• Claridad mental renovada</li>
                        <li>• Adaptación corporal completa</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Florecimiento Emocional:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Sabiduría interior profunda</li>
                        <li>• Libertad de expectativas sociales</li>
                        <li>• Autenticidad total</li>
                        <li>• Poder personal consolidado</li>
                        <li>• Paz con el proceso de vida</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                    <strong className="text-brand-primary">Tu Enfoque:</strong> Celebra tu sabiduría. Esta es tu era dorada para compartir tu conocimiento, disfrutar tu libertad y vivir según tus propios términos.
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de Bienestar Integral por Fases</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Nutrición por Fases</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Premenopausia:</strong>
                      <p className="text-brand-secondary">Fitoestrógenos, omega-3, calcio</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Perimenopausia:</strong>
                      <p className="text-brand-secondary">Adaptógenos, magnesio, vitamina D</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Posmenopausia:</strong>
                      <p className="text-brand-secondary">Antioxidantes, proteína, colágeno</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Ejercicio por Fases</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-brand-primary">Premenopausia:</strong>
                      <p className="text-brand-accent">Cardio moderado, yoga, pilates</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Perimenopausia:</strong>
                      <p className="text-brand-accent">Fuerza, resistencia, flexibilidad</p>
                    </div>
                    <div>
                      <strong className="text-brand-primary">Posmenopausia:</strong>
                      <p className="text-brand-accent">Mantenimiento óseo, equilibrio</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Apoyo Emocional</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-brand-secondary">Premenopausia:</strong>
                      <p className="text-brand-secondary">Autoconocimiento, preparación</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Perimenopausia:</strong>
                      <p className="text-brand-secondary">Terapia, grupos de apoyo</p>
                    </div>
                    <div>
                      <strong className="text-brand-secondary">Posmenopausia:</strong>
                      <p className="text-brand-secondary">Celebración, mentoring</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Mantra para tu Menopausia:</h4>
                <p className="italic text-lg text-brand-primary">"No estoy perdiendo mi juventud, estoy ganando mi sabiduría. No estoy terminando, estoy comenzando mi era más poderosa."</p>
              </div>
            </div>
          `,
          type: 'Educación Hormonal',
          slug: 'fases-menopausia'
        },
        {
          id: 2,
          title: 'Manejando los Síntomas con Sabiduría',
          summary: 'Estrategias naturales y psicológicas para sofocos, insomnio, cambios de humor y sequedad',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Síntomas Menopáusicos: De Enemigos a Maestros</h2>
              
              <p className="text-lg leading-relaxed">Como ginecóloga especializada en medicina integrativa y manejo natural de la menopausia, te enseño que cada síntoma es un mensaje de tu cuerpo pidiendo atención específica. Con las herramientas correctas, puedes transformar esta etapa en una experiencia empoderada.</p>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border-l-4 border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-2">Perspectiva Sanadora:</h4>
                <p className="text-brand-secondary italic">"Tus síntomas no son castigos, son invitaciones a cuidarte más profundamente. Cada molestia es tu cuerpo pidiendo amor, atención y cuidado específico."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo Integral para Síntomas Principales</h3>
              
              <div className="space-y-8">
                <!-- SOFOCOS -->
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🔥 Sofocos y Sudoraciones Nocturnas</h4>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Manejo Inmediato:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Respiración 4-7-8 al primer signo</li>
                        <li>• Compresa fría en muñecas y cuello</li>
                        <li>• Ropa de capas fácil de quitar</li>
                        <li>• Ventilador personal portátil</li>
                        <li>• Agua helada con limón</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Prevención Natural:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Evita triggers: alcohol, cafeína, picante</li>
                        <li>• Suplementa: Cohosh Negro, Trébol Rojo</li>
                        <li>• Yoga restaurativo diario</li>
                        <li>• Acupuntura 2x/semana</li>
                        <li>• Meditación mindfulness 15 min/día</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Estilo de Vida:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Ejercicio regular (no intenso)</li>
                        <li>• Peso saludable (grasa = más estrógeno)</li>
                        <li>• Fibras naturales en ropa</li>
                        <li>• Ambiente fresco para dormir</li>
                        <li>• Manejo del estrés prioritario</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <!-- INSOMNIO -->
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🌙 Insomnio y Trastornos del Sueño</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Higiene del Sueño Menopáusica:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Rutina de relajación 1 hora antes</li>
                        <li>• Temperatura habitación 16-18°C</li>
                        <li>• Sin pantallas 2 horas antes</li>
                        <li>• Baño tibio con sales de magnesio</li>
                        <li>• Lectura o música suave</li>
                        <li>• Misma hora para acostarse y levantarse</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Suplementación Natural:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Melatonina 1-3mg 30min antes</li>
                        <li>• Magnesio glicinato 200-400mg</li>
                        <li>• L-teanina 100-200mg</li>
                        <li>• Valeriana 300-600mg</li>
                        <li>• Manzanilla té 1 hora antes</li>
                        <li>• CBD oil 10-25mg (si es legal)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-primary/15 to-brand-primary/25 p-4 rounded-lg mt-4">
                    <h5 className="font-semibold text-brand-primary mb-2">Técnica de Relajación Progresiva:</h5>
                    <ol className="text-brand-secondary space-y-1 text-sm">
                      <li>1. Acuéstate cómodamente y cierra los ojos</li>
                      <li>2. Tensa músculos de pies por 5 segundos, luego relaja</li>
                      <li>3. Sube gradualmente: pantorrillas, muslos, abdomen...</li>
                      <li>4. Continúa hasta llegar a músculos faciales</li>
                      <li>5. Permanece en relajación total 10 minutos</li>
                    </ol>
                  </div>
                </div>
                
                <!-- CAMBIOS DE HUMOR -->
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🎭 Cambios de Humor y Ansiedad</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Entendiendo la Montaña Rusa Emocional:</h5>
                      <p className="text-brand-secondary text-sm">Las fluctuaciones hormonales afectan directamente neurotransmisores como serotonina y GABA. No estás "loca", tu cerebro está adaptándose a nuevos niveles hormonales.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                        <h5 className="font-semibold text-brand-primary mb-2">Estabilización Natural:</h5>
                        <ul className="text-brand-secondary space-y-1 text-sm">
                          <li>• Omega-3: 2000mg EPA/DHA diarios</li>
                          <li>• Vitaminas B complex para estrés</li>
                          <li>• Ejercicio regular (endorfinas naturales)</li>
                          <li>• Exposición solar matutina 15 min</li>
                          <li>• Práctica de gratitud diaria</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                        <h5 className="font-semibold text-brand-primary mb-2">Técnicas de Regulación:</h5>
                        <ul className="text-brand-accent space-y-1 text-sm">
                          <li>• Respiración cuadrada: 4-4-4-4</li>
                          <li>• Técnica 5-4-3-2-1 para ansiedad</li>
                          <li>• Journaling emocional 10 min/día</li>
                          <li>• Mindfulness del momento presente</li>
                          <li>• Contacto con naturaleza diario</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- SEQUEDAD VAGINAL -->
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">🌸 Sequedad Vaginal y Cambios Íntimos</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Cuidado Íntimo Natural:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Lubricantes base agua o coco para intimidad</li>
                        <li>• Hidratantes vaginales 3x/semana</li>
                        <li>• Evita jabones perfumados/duchas vaginales</li>
                        <li>• Ropa interior de algodón transpirable</li>
                        <li>• Probióticos específicos para flora vaginal</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Ejercicios de Fortalecimiento:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Kegels diarios: 3 series x 10 repeticiones</li>
                        <li>• Yoga para suelo pélvico</li>
                        <li>• Estiramientos de cadera y pelvis</li>
                        <li>• Masaje perineal con aceite vitamina E</li>
                        <li>• Actividad sexual regular (con pareja o sola)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg mt-4">
                    <h5 className="font-semibold text-brand-secondary mb-2">Cuándo Buscar Ayuda Médica:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• Dolor severo durante relaciones sexuales</li>
                      <li>• Sangrado inusual o infecciones recurrentes</li>
                      <li>• Síntomas que interfieren significativamente con vida diaria</li>
                      <li>• Depresión o ansiedad severa que no mejora</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Plan de Acción Diario: Protocolo 360°</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Rutina Matutina (20 min)</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>7:00 AM:</strong> Agua tibia con limón + suplementos</li>
                    <li>• <strong>7:10 AM:</strong> Ejercicios de respiración profunda</li>
                    <li>• <strong>7:15 AM:</strong> Estiramientos suaves o yoga</li>
                    <li>• <strong>7:20 AM:</strong> Afirmaciones positivas en espejo</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Rutina Nocturna (30 min)</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>8:30 PM:</strong> Baño relajante con sales</li>
                    <li>• <strong>9:00 PM:</strong> Journaling de gratitud y emociones</li>
                    <li>• <strong>9:15 PM:</strong> Meditación o música relajante</li>
                    <li>• <strong>9:30 PM:</strong> Preparación ambiente para dormir</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Kit de Emergencia para Crisis Sintomática</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Para Crisis Aguda (sofocos intensos, ansiedad, insomnio severo):</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary text-sm">Físico:</h5>
                    <ul className="text-brand-primary text-xs space-y-1">
                      <li>• Compresa fría inmediata</li>
                      <li>• Respiración 4-7-8 x 4 ciclos</li>
                      <li>• Ducha tibia (no caliente)</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-3 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary text-sm">Mental:</h5>
                    <ul className="text-brand-accent text-xs space-y-1">
                      <li>• "Esto es temporal y pasará"</li>
                      <li>• Técnica grounding 5-4-3-2-1</li>
                      <li>• Llamar a persona de apoyo</li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-3 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary text-sm">Emocional:</h5>
                    <ul className="text-brand-accent text-xs space-y-1">
                      <li>• Autocompasión radical</li>
                      <li>• Música que te calme</li>
                      <li>• Visualización lugar seguro</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Mantra para Síntomas Difíciles:</h4>
                <p className="italic text-lg text-brand-primary">"Mi cuerpo está transformándose y necesita mi paciencia y amor. Cada síntoma es temporal. Estoy cuidándome con sabiduría y compasión. Esto también pasará."</p>
              </div>
            </div>
          `,
          type: 'Manejo Sintomático',
          slug: 'manejo-sintomas'
        },
        {
          id: 3,
          title: 'Tu Nueva Identidad: Redescubrirte en la Menopausia',
          summary: 'Proceso psicológico para abrazar esta etapa como renacimiento y empoderamiento personal',
          content: 'Trabajo de identidad menopáusica...',
          type: 'Desarrollo Personal',
          slug: 'identidad-menopausia'
        },
        {
          id: 4,
          title: 'Sexualidad en la Menopausia: Renovar el Deseo',
          summary: 'Mantén y renueva tu vida sexual durante y después de la menopausia',
          content: 'Sexualidad madura empoderada...',
          type: 'Sexualidad Madura',
          slug: 'sexualidad-menopausia'
        },
        {
          id: 5,
          title: 'Nutrición Hormonal para la Menopausia',
          summary: 'Alimentos que equilibran naturalmente tus hormonas y alivian síntomas',
          content: 'Protocolo nutricional menopáusico...',
          type: 'Nutrición Terapéutica',
          slug: 'nutricion-hormonal'
        },
        {
          id: 6,
          title: 'Manejo del Estrés y Ansiedad Menopáusica',
          summary: 'Técnicas especializadas para la montaña rusa emocional de la menopausia',
          content: 'Manejo emocional menopáusico...',
          type: 'Salud Mental',
          slug: 'estres-menopausia'
        },
        {
          id: 7,
          title: 'Fortaleciendo Huesos y Músculos Naturalmente',
          summary: 'Ejercicios y nutrición para mantener fuerza y densidad ósea sin medicamentos',
          content: 'Protocolo de fortalecimiento...',
          type: 'Salud Física',
          slug: 'fortalecimiento-natural'
        },
        {
          id: 8,
          title: 'Remedios Naturales que Realmente Funcionan',
          summary: 'Fitoterapia, adaptógenos y medicina natural validada científicamente',
          content: 'Medicina natural menopáusica...',
          type: 'Medicina Natural',
          slug: 'remedios-naturales'
        }
      ],
      psychologicalSupport: [
        'La menopausia no es enfermedad - es una transición natural y poderosa',
        'Tus cambios emocionales son válidos y temporales - esto también pasará',
        'Mereces comprensión, apoyo y cuidado durante este proceso',
        'Esta etapa puede ser la más liberadora y auténtica de tu vida'
      ]
    },
    fertilidad: {
      articles: [
        {
          id: 1,
          title: 'Decodificando tu Ciclo Menstrual',
          summary: 'Comprende las señales de tu cuerpo, hormonas y cómo optimizar cada fase del ciclo',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Tu Ciclo: El Mapa de tu Poder Femenino</h2>
              
              <p className="text-lg leading-relaxed">Como ginecóloga especializada en salud reproductiva y endocrinología, te enseño que tu ciclo menstrual es más que sangrado mensual. Es un indicador perfecto de tu salud general, tu guía para optimizar energía, productividad, sexualidad y bienestar emocional.</p>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                <h4 className="font-semibold text-brand-primary mb-2">Cambio de Perspectiva:</h4>
                <p className="text-brand-secondary italic">"Tu ciclo no es una carga que soportar, es tu superpoder femenino que te conecta con los ritmos naturales de creación y renovación."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Anatomía Hormonal: Tus Directoras de Orquesta</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Hormonas Principales</h4>
                  <div className="space-y-3 text-brand-secondary">
                    <div>
                      <strong>Estrógeno:</strong>
                      <p className="text-sm">Tu hormona de vitalidad, claridad mental y energía</p>
                    </div>
                    <div>
                      <strong>Progesterona:</strong>
                      <p className="text-sm">Tu hormona de calma, sueño reparador y estabilidad</p>
                    </div>
                    <div>
                      <strong>FSH y LH:</strong>
                      <p className="text-sm">Tus mensajeras cerebrales que orquestan todo</p>
                    </div>
                    <div>
                      <strong>Testosterona:</strong>
                      <p className="text-sm">Tu hormona de deseo, fuerza y motivación</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Señales de Salud Hormonal</h4>
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• Ciclo regular de 25-35 días</li>
                    <li>• Ovulación clara y detectable</li>
                    <li>• Sangrado de 3-7 días</li>
                    <li>• Color rojo brillante sin coágulos grandes</li>
                    <li>• Mínimos síntomas premenstruales</li>
                    <li>• Energía estable durante el ciclo</li>
                    <li>• Libido presente en fase fértil</li>
                    <li>• Sueño reparador</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Las 4 Estaciones de tu Ciclo</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">🌱 FASE MENSTRUAL (Días 1-5) - Tu Invierno Interior</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Hormonas:</h5>
                      <p className="text-brand-secondary text-sm">Todas las hormonas en su punto más bajo. Tu útero se renueva completamente.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Energía:</h5>
                      <p className="text-brand-secondary text-sm">Introspectiva, reflexiva, contemplativa. Necesitas descanso y cuidado.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Superpoder:</h5>
                      <p className="text-brand-secondary text-sm">Intuición elevada, capacidad de análisis profundo, renovación.</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <strong className="text-brand-primary">Cómo Optimizar:</strong>
                    <ul className="text-brand-secondary text-sm mt-2 space-y-1">
                      <li>• Prioriza descanso y sueño de calidad</li>
                      <li>• Nutrición rica en hierro y vitamina C</li>
                      <li>• Movimiento suave: yoga, caminatas</li>
                      <li>• Reflexión, escritura, meditación</li>
                      <li>• Planifica el próximo ciclo</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">🌸 FASE FOLICULAR (Días 6-12) - Tu Primavera Interior</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Hormonas:</h5>
                      <p className="text-brand-accent text-sm">Estrógeno asciende gradualmente. FSH estimula crecimiento folicular.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Energía:</h5>
                      <p className="text-brand-accent text-sm">Renovada, optimista, creativa. Ganas de comenzar proyectos nuevos.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Superpoder:</h5>
                      <p className="text-brand-accent text-sm">Creatividad, iniciativa, aprendizaje, comunicación fluida.</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                    <strong className="text-brand-primary">Cómo Optimizar:</strong>
                    <ul className="text-brand-secondary text-sm mt-2 space-y-1">
                      <li>• Inicia proyectos nuevos</li>
                      <li>• Ejercicio dinámico: cardio, baile</li>
                      <li>• Socialización y networking</li>
                      <li>• Alimentación ligera y alcalina</li>
                      <li>• Brainstorming y planificación</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">🔥 FASE OVULATORIA (Días 13-17) - Tu Verano Interior</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Hormonas:</h5>
                      <p className="text-brand-primary text-sm">Pico de estrógeno y LH. Testosterona elevada. Momento de máxima fertilidad.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Energía:</h5>
                      <p className="text-brand-primary text-sm">Magnética, confiada, sociable. Tu libido en su punto máximo.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Superpoder:</h5>
                      <p className="text-brand-primary text-sm">Carisma, persuasión, atractivo natural, comunicación brillante.</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                    <strong className="text-brand-primary">Cómo Optimizar:</strong>
                    <ul className="text-brand-secondary text-sm mt-2 space-y-1">
                      <li>• Presentaciones importantes, negociaciones</li>
                      <li>• Citas románticas, intimidad</li>
                      <li>• Ejercicio intenso: HIIT, fuerza</li>
                      <li>• Eventos sociales, networking</li>
                      <li>• Decisiones importantes</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-3">🍂 FASE LÚTEA (Días 18-28) - Tu Otoño Interior</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Hormonas:</h5>
                      <p className="text-brand-accent text-sm">Progesterona dominante. Si no hay embarazo, ambas hormonas descienden.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Energía:</h5>
                      <p className="text-brand-accent text-sm">Enfocada, perfeccionista, analítica. Necesitas más nutrición y descanso.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Superpoder:</h5>
                      <p className="text-brand-accent text-sm">Atención al detalle, organización, finalización de proyectos.</p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                    <strong className="text-brand-primary">Cómo Optimizar:</strong>
                    <ul className="text-brand-secondary text-sm mt-2 space-y-1">
                      <li>• Finaliza proyectos pendientes</li>
                      <li>• Organización y limpieza profunda</li>
                      <li>• Ejercicio moderado: yoga, pilates</li>
                      <li>• Autocuidado intensivo</li>
                      <li>• Preparación para la menstruación</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Señales de Alerta en tu Ciclo</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Consulta a tu ginecóloga si experimentas:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• Ciclos menores a 21 días o mayores a 35</li>
                    <li>• Ausencia de menstruación por 3+ meses</li>
                    <li>• Sangrado muy abundante (cambias toalla cada hora)</li>
                    <li>• Dolor incapacitante durante la menstruación</li>
                  </ul>
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• Sangrado entre períodos</li>
                    <li>• Síndrome premenstrual severo</li>
                    <li>• Cambios drásticos en tu patrón normal</li>
                    <li>• Síntomas que interfieren con tu vida diaria</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación para tu Ciclo:</h4>
                <p className="italic text-lg text-brand-primary">"Mi ciclo es mi aliado. Honro cada fase, escucho a mi cuerpo y fluyo con mi sabiduría natural. Soy una mujer cíclica y eso es mi poder."</p>
              </div>
            </div>
          `,
          type: 'Educación Reproductiva',
          slug: 'ciclo-menstrual'
        },
        {
          id: 2,
          title: 'Optimizando tu Fertilidad Naturalmente',
          summary: 'Hábitos de vida, nutrición y prácticas que potencian tu fertilidad de forma integral',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Fertilidad Natural: Tu Cuerpo Sabe Crear Vida</h2>
              
              <p className="text-lg leading-relaxed">Como especialista en medicina reproductiva integrativa, te enseño que la fertilidad óptima no es solo sobre ovulación, es sobre crear el ambiente interno más nutritivo para que la vida florezca. Tu cuerpo tiene una sabiduría ancestral para concebir cuando las condiciones son ideales.</p>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                <h4 className="font-semibold text-brand-primary mb-2">Perspectiva Holística:</h4>
                <p className="text-brand-secondary italic">"La fertilidad es el reflejo de tu salud integral. Cuando nutres todo tu ser - cuerpo, mente, alma - creas las condiciones perfectas para que la vida se manifieste."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 7 Pilares de la Fertilidad Natural</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">1. Nutrición Reproductiva</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• <strong>Ácido fólico:</strong> 400-800mcg diarios (espina bífida)</li>
                    <li>• <strong>Omega-3:</strong> DHA para desarrollo cerebral fetal</li>
                    <li>• <strong>CoQ10:</strong> 200mg para calidad ovular</li>
                    <li>• <strong>Vitamina D:</strong> >30ng/ml para implantación</li>
                    <li>• <strong>Hierro:</strong> Previene anemia y apoya ovulación</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">2. Equilibrio Hormonal</h4>
                  <ul className="text-brand-primary space-y-2 text-sm">
                    <li>• Ratio estrógeno/progesterona balanceado</li>
                    <li>• Insulina estable (evita resistencia)</li>
                    <li>• Cortisol controlado (estrés crónico inhibe ovulación)</li>
                    <li>• Tiroides optimizada (T3, T4, TSH)</li>
                    <li>• Testosterona en rango femenino saludable</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">3. Desintoxicación Celular</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Eliminar disruptores endocrinos (plásticos, pesticidas)</li>
                    <li>• Filtrar agua potable (cloro, fluoruro, metales)</li>
                    <li>• Productos limpieza y cosmética naturales</li>
                    <li>• Minimizar exposición radiación (WiFi, celular)</li>
                    <li>• Apoyo hepático para metabolizar hormonas</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">4. Movimiento Inteligente</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Ejercicio moderado (exceso reduce fertilidad)</li>
                    <li>• Yoga para fertilidad (posturas específicas)</li>
                    <li>• Caminatas en naturaleza (tierra, sol, aire)</li>
                    <li>• Evitar ejercicio intenso en fase lútea</li>
                    <li>• Pilates para core y suelo pélvico</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de 3 Meses: Preparación Preconcepcional</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Mes 1: Fundación y Limpieza</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Nutrición:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Eliminar alcohol, cafeína, azúcar refinado</li>
                        <li>• Dieta antiinflamatoria mediterranea</li>
                        <li>• Suplementación básica: prenatal + omega-3</li>
                        <li>• Hidratación: 2-3L agua filtrada</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Desintoxicación:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Cambiar productos químicos por naturales</li>
                        <li>• Filtro agua y aire en casa</li>
                        <li>• Orgánicos para dirty dozen</li>
                        <li>• Saunas o baños detox 2x/semana</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/15 to-brand-secondary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Exámenes:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Panel hormonal completo</li>
                        <li>• Perfil nutricional (vitaminas, minerales)</li>
                        <li>• Función tiroidea completa</li>
                        <li>• Marcadores inflamatorios</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Mes 2: Optimización y Fortalecimiento</h4>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Suplementación Avanzada:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• CoQ10 ubiquinol 200-400mg</li>
                        <li>• Vitamina D3 2000-4000 UI</li>
                        <li>• Magnesio glicinato 400mg</li>
                        <li>• Probióticos específicos</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Ciclo Tracking:</h5>
                      <ul className="text-brand-accent space-y-1 text-sm">
                        <li>• Temperatura basal corporal</li>
                        <li>• Moco cervical diario</li>
                        <li>• Apps de fertilidad precisas</li>
                        <li>• Tests ovulación LH</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-primary/15 to-brand-primary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-2">Estrés Management:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Meditación fertilidad 20 min/día</li>
                        <li>• Yoga específico para reproducción</li>
                        <li>• Masajes para relajación profunda</li>
                        <li>• Técnicas respiración consciente</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Mes 3: Sincronización y Concepción</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Timing Perfecto:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Relaciones cada 1-2 días en ventana fértil</li>
                        <li>• Posiciones que favorecen concepción</li>
                        <li>• Ambiente relajado y conectado</li>
                        <li>• Evitar lubricantes que dañen esperma</li>
                        <li>• Descanso post-relación 20-30 min</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-2">Rituales de Fertilidad:</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm">
                        <li>• Visualizaciones de concepción</li>
                        <li>• Afirmaciones de fertilidad</li>
                        <li>• Conexión con luna y ciclos naturales</li>
                        <li>• Creación de altar de fertilidad</li>
                        <li>• Prácticas de gratitud al útero</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Alimentos Superpotenciadores de Fertilidad</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Antioxidantes Poderosos</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>• Berries (arándanos, frambuesas)</li>
                    <li>• Granadas y cerezas</li>
                    <li>• Espinacas y kale</li>
                    <li>• Nueces y almendras</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Grasas Reproductivas</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>• Aguacates (ácido oleico)</li>
                    <li>• Salmón salvaje (omega-3)</li>
                    <li>• Aceite oliva extra virgen</li>
                    <li>• Semillas chía y lino</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Proteínas Completas</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>• Huevos pastoriles (colina)</li>
                    <li>• Quinoa y legumbres</li>
                    <li>• Carne grass-fed</li>
                    <li>• Yogurt griego natural</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Carbohidratos Inteligentes</h5>
                  <ul className="text-brand-primary text-sm space-y-1">
                    <li>• Batatas (betacaroteno)</li>
                    <li>• Avena integral</li>
                    <li>• Calabaza y zanahoria</li>
                    <li>• Arroz integral</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Factores que Bloquean la Fertilidad</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Evita Completamente:</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Tóxicos Reproductivos:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• Alcohol (afecta implantación)</li>
                      <li>• Cigarrillos (reduce reserva ovárica)</li>
                      <li>• Drogas recreativas</li>
                      <li>• Exceso cafeína (>200mg/día)</li>
                      <li>• Mercurio en pescados grandes</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Disruptores Hormonales:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm">
                      <li>• Plásticos con BPA/ftalatos</li>
                      <li>• Pesticidas y herbicidas</li>
                      <li>• Productos limpieza químicos</li>
                      <li>• Cosméticos con parabenos</li>
                      <li>• Medicamentos no esenciales</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Visualización de Fertilidad: El Útero Florido</h3>
              
              <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3">Práctica Diaria (10 minutos):</h4>
                <ol className="text-brand-secondary space-y-2 text-sm">
                  <li>1. <strong>Posición:</strong> Acuéstate cómodamente con manos en vientre bajo</li>
                  <li>2. <strong>Respiración:</strong> Inhala enviando amor y luz a tu útero</li>
                  <li>3. <strong>Visualización:</strong> Imagina tu útero como un jardín fértil floreciendo</li>
                  <li>4. <strong>Conexión:</strong> Habla con tu futuro bebé con amor</li>
                  <li>5. <strong>Gratitud:</strong> Agradece a tu cuerpo su sabiduría reproductiva</li>
                  <li>6. <strong>Afirmación:</strong> "Soy fértil, soy creadora, la vida fluye a través de mí"</li>
                </ol>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Señales de Fertilidad Óptima</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Indicadores Físicos:</h4>
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• Ciclos regulares 25-35 días</li>
                    <li>• Ovulación clara y detectible</li>
                    <li>• Moco cervical abundante en días fértiles</li>
                    <li>• Energía estable durante todo el ciclo</li>
                    <li>• Libido presente en fase ovulatoria</li>
                    <li>• Sueño reparador y profundo</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Indicadores Emocionales:</h4>
                  <ul className="text-brand-primary space-y-1 text-sm">
                    <li>• Sensación de calma y confianza</li>
                    <li>• Conexión profunda con feminidad</li>
                    <li>• Optimismo sobre el futuro</li>
                    <li>• Relación amorosa con tu cuerpo</li>
                    <li>• Capacidad de recibir apoyo</li>
                    <li>• Intuición y creatividad fluidas</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación de Fertilidad:</h4>
                <p className="italic text-lg text-brand-primary">"Mi cuerpo es un templo sagrado de creación. Confío en su sabiduría ancestral para concebir en el momento perfecto. Soy fértil, soy poderosa, soy creadora de vida."</p>
              </div>
            </div>
          `,
          type: 'Medicina Integrativa',
          slug: 'fertilidad-natural'
        },
        {
          id: 3,
          title: 'Fertilidad después de los 35: Tu Poder Reproductivo',
          summary: 'Estrategias específicas para potenciar fertilidad en la madurez reproductiva',
          content: 'Fertilidad madura especializada...',
          type: 'Especialización Edad',
          slug: 'fertilidad-35'
        },
        {
          id: 4,
          title: 'Sanando Infertilidad: El Aspecto Emocional',
          summary: 'Apoyo psicológico para el dolor de la infertilidad y técnicas de sanación emocional',
          content: 'Terapia para infertilidad...',
          type: 'Apoyo Emocional',
          slug: 'sanacion-infertilidad'
        },
        {
          id: 5,
          title: 'Preparando tu Cuerpo para el Embarazo',
          summary: 'Protocolo integral de preparación física, mental y emocional para la concepción',
          content: 'Preparación preconcepcional...',
          type: 'Preparación Integral',
          slug: 'preparacion-embarazo'
        },
        {
          id: 6,
          title: 'Factores que Afectan tu Fertilidad',
          summary: 'Identifica y modifica factores de estilo de vida que pueden estar limitando tu fertilidad',
          content: 'Análisis de factores fertiles...',
          type: 'Evaluación Diagnóstica',
          slug: 'factores-fertilidad'
        },
        {
          id: 7,
          title: 'Técnicas de Relajación para la Concepción',
          summary: 'Manejo del estrés, ansiedad y técnicas específicas que favorecen la concepción',
          content: 'Relajación para fertilidad...',
          type: 'Terapias Complementarias',
          slug: 'relajacion-concepcion'
        },
        {
          id: 8,
          title: 'Cálculo Inteligente de Días Fértiles',
          summary: 'Métodos precisos para identificar tu ventana fértil y optimizar las oportunidades',
          content: 'Cálculo de fertilidad preciso...',
          type: 'Herramientas Prácticas',
          slug: 'calculo-fertilidad'
        }
      ],
      psychologicalSupport: [
        'Tu valor como mujer no depende de tu capacidad reproductiva',
        'La fertilidad es un viaje, no un destino - honra cada paso del proceso',
        'Mereces apoyo, comprensión y cuidado en este camino tan personal',
        'Tu cuerpo está haciendo lo mejor que puede - confía en su sabiduría'
      ]
    },
    emocional: {
      articles: [
        {
          id: 1,
          title: 'Dominando la Ansiedad: Tu Kit de Supervivencia',
          summary: 'Técnicas psicológicas profesionales para gestionar crisis de ansiedad y vivir en calma',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Ansiedad: De Enemiga a Aliada</h2>
              
              <p className="text-lg leading-relaxed">Como psicóloga clínica especializada en trastornos de ansiedad, te enseño que la ansiedad no es tu enemiga, es tu sistema de alarma interno que necesita ser recalibrado. Con las herramientas correctas, puedes transformar la ansiedad de una limitación en una fuente de información valiosa.</p>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border-l-4 border-brand-accent">
                <h4 className="font-semibold text-brand-primary mb-2">Verdad Fundamental:</h4>
                <p className="text-brand-primary italic">"La ansiedad no define quién eres. Es una experiencia temporal que puedes aprender a gestionar con maestría y compasión."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Entendiendo tu Ansiedad</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Síntomas Físicos</h4>
                  <ul className="text-brand-secondary space-y-1">
                    <li>• Taquicardia y palpitaciones</li>
                    <li>• Respiración superficial o hiperventilación</li>
                    <li>• Tensión muscular</li>
                    <li>• Sudoración excesiva</li>
                    <li>• Mareos o sensación de irrealidad</li>
                    <li>• Problemas digestivos</li>
                    <li>• Fatiga o inquietud</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Síntomas Mentales</h4>
                  <ul className="text-brand-secondary space-y-1">
                    <li>• Pensamientos catastrofistas</li>
                    <li>• Preocupación excesiva</li>
                    <li>• Dificultad para concentrarse</li>
                    <li>• Sensación de pérdida de control</li>
                    <li>• Pensamientos repetitivos (rumia)</li>
                    <li>• Evitación de situaciones</li>
                    <li>• Hipervigilancia</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Kit de Supervivencia: Técnicas de Emergencia</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">1. Técnica 5-4-3-2-1 (Para Crisis Inmediata)</h4>
                  <div className="space-y-2 text-brand-secondary">
                    <p><strong>5 cosas que PUEDES VER:</strong> Nombra 5 objetos a tu alrededor</p>
                    <p><strong>4 cosas que PUEDES TOCAR:</strong> Siente 4 texturas diferentes</p>
                    <p><strong>3 cosas que PUEDES ESCUCHAR:</strong> Identifica 3 sonidos distintos</p>
                    <p><strong>2 cosas que PUEDES OLER:</strong> Nota 2 aromas</p>
                    <p><strong>1 cosa que PUEDES SABOREAR:</strong> Identifica 1 sabor en tu boca</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-6 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">2. Respiración 4-7-8 (Para Calmar el Sistema Nervioso)</h4>
                  <div className="space-y-3 text-brand-secondary">
                    <p><strong>Paso 1:</strong> Inhala por la nariz durante 4 segundos</p>
                    <p><strong>Paso 2:</strong> Retén la respiración durante 7 segundos</p>
                    <p><strong>Paso 3:</strong> Exhala por la boca durante 8 segundos</p>
                    <p><strong>Repite:</strong> 4 ciclos completos, máximo 3 veces al día</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">3. Técnica del Hielo (Para Ataques de Pánico)</h4>
                  <div className="space-y-2 text-brand-secondary">
                    <p>• Sostén un cubo de hielo en cada mano</p>
                    <p>• Concéntrate en la sensación de frío</p>
                    <p>• Respira profundamente mientras el hielo se derrite</p>
                    <p>• La intensidad del frío "resetea" tu sistema nervioso</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de Prevención Diaria</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Mañana (7-9 AM)</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>Meditación 10 min</li>
                    <li>Ejercicio suave</li>
                    <li>Desayuno nutritivo</li>
                    <li>Afirmaciones positivas</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Mediodía (12-2 PM)</h5>
                  <ul className="text-brand-primary text-sm space-y-1">
                    <li>Check-in emocional</li>
                    <li>Respiración consciente</li>
                    <li>Pausa de 5 minutos</li>
                    <li>Hidratación</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Tarde (5-7 PM)</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>Actividad física</li>
                    <li>Conexión social</li>
                    <li>Técnica de grounding</li>
                    <li>Cena temprana</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-4 rounded-lg text-center">
                  <h5 className="font-semibold text-brand-primary mb-2">Noche (9-10 PM)</h5>
                  <ul className="text-brand-secondary text-sm space-y-1">
                    <li>Rutina de relajación</li>
                    <li>Diario de gratitud</li>
                    <li>Desconexión digital</li>
                    <li>Preparación del sueño</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Reestructuración Cognitiva</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-3">Transformando Pensamientos Ansiosos</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Pensamiento Ansioso:</h5>
                    <p className="text-brand-primary italic">"Algo terrible va a pasar"</p>
                    <p className="text-brand-primary italic">"No puedo manejar esto"</p>
                    <p className="text-brand-primary italic">"Todo saldrá mal"</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-brand-secondary mb-2">Pensamiento Balanceado:</h5>
                    <p className="text-brand-secondary italic">"He superado desafíos antes"</p>
                    <p className="text-brand-secondary italic">"Tengo recursos para manejar esto"</p>
                    <p className="text-brand-secondary italic">"Puedo tomar las cosas paso a paso"</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Cuándo Buscar Ayuda Profesional</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Señales de Alerta - Busca ayuda si:</h4>
                <ul className="text-brand-secondary space-y-1">
                  <li>• La ansiedad interfiere con tu trabajo, estudios o relaciones</li>
                  <li>• Evitas situaciones importantes de tu vida</li>
                  <li>• Tienes ataques de pánico frecuentes</li>
                  <li>• Usas alcohol o sustancias para calmar la ansiedad</li>
                  <li>• Sientes que no puedes controlar tus preocupaciones</li>
                  <li>• Experimentas pensamientos de autolesión</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación Diaria para la Ansiedad:</h4>
                <p className="italic text-lg text-brand-primary">"Soy más fuerte que mi ansiedad. Cada respiración me trae calma, cada momento me acerca a la paz. Estoy segura en este momento presente."</p>
              </div>
            </div>
          `,
          type: 'Terapia Cognitivo-Conductual',
          slug: 'dominar-ansiedad'
        },
        {
          id: 2,
          title: 'Construyendo Autoestima Inquebrantable',
          summary: 'Proceso terapéutico para sanar heridas profundas y construir amor propio duradero',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">De la Autocrítica al Amor Propio Radical</h2>
              
              <p className="text-lg leading-relaxed">Como psicóloga especializada en autoestima y trauma emocional, te acompaño en el viaje más importante de tu vida: aprender a amarte incondicionalmente. La autoestima no es arrogancia ni narcisismo, es la base sólida desde donde construyes toda tu vida.</p>
              
              <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-6 rounded-lg border-l-4 border-brand-background">
                <h4 className="font-semibold text-brand-primary mb-2">Verdad Fundamental sobre la Autoestima:</h4>
                <p className="text-brand-secondary italic">"Tu valor no se basa en lo que haces, tienes o logras. Tu valor es inherente, incondicional e inquebrantable desde el momento en que llegaste a este mundo."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 4 Pilares de la Autoestima Saludable</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">1. Autoconocimiento Profundo</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Conoce tus valores fundamentales</li>
                    <li>• Identifica tus fortalezas únicas</li>
                    <li>• Acepta tus áreas de crecimiento sin juicio</li>
                    <li>• Comprende tu historia sin ser víctima de ella</li>
                    <li>• Conecta con tu esencia más allá de roles sociales</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">2. Autocompasión Radical</h4>
                  <ul className="text-brand-primary space-y-2 text-sm">
                    <li>• Habla contigo como le hablarías a tu mejor amiga</li>
                    <li>• Practica perdón hacia tus errores pasados</li>
                    <li>• Reconoce tu humanidad e imperfección</li>
                    <li>• Abraza tus emociones sin resistencia</li>
                    <li>• Ofrécete consuelo en momentos difíciles</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">3. Autenticidad Valiente</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Vive según tus valores, no expectativas ajenas</li>
                    <li>• Expresa tu verdad con respeto y firmeza</li>
                    <li>• Establece límites saludables sin culpa</li>
                    <li>• Toma decisiones desde tu centro, no desde el miedo</li>
                    <li>• Celebra tu unicidad sin compararte</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-primary">
                  <h4 className="font-semibold text-brand-primary mb-3">4. Autorrespeto Inquebrantable</h4>
                  <ul className="text-brand-secondary space-y-2 text-sm">
                    <li>• Honra tus necesidades físicas y emocionales</li>
                    <li>• No toleres maltrato de otros ni de ti misma</li>
                    <li>• Invierte en tu crecimiento y bienestar</li>
                    <li>• Rodéate de relaciones que te nutren</li>
                    <li>• Defiende tu dignidad en todas las situaciones</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Identificando y Sanando Heridas de Autoestima</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Síntomas de Autoestima Herida:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Internos:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Autocrítica constante y severa</li>
                        <li>• Miedo al rechazo y abandono</li>
                        <li>• Perfeccionismo paralizante</li>
                        <li>• Comparación compulsiva con otros</li>
                        <li>• Sentimientos de no ser suficiente</li>
                        <li>• Negación de logros y cualidades</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-brand-secondary mb-2">Externos:</h5>
                      <ul className="text-brand-primary space-y-1 text-sm">
                        <li>• Buscar validación externa constantemente</li>
                        <li>• Dificultad para decir "no"</li>
                        <li>• Relaciones tóxicas o codependientes</li>
                        <li>• Evitar desafíos por miedo al fracaso</li>
                        <li>• Autosabotaje cuando las cosas van bien</li>
                        <li>• Aislamiento social y evitación</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-6 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Protocolo de Sanación de 8 Semanas:</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary">Semanas 1-2: Conciencia y Aceptación</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm mt-2">
                        <li>• Identifica tu crítico interno y sus mensajes</li>
                        <li>• Practica observación sin juicio de pensamientos</li>
                        <li>• Comienza diario de autocompasión</li>
                        <li>• Ritual matutino de afirmaciones personalizadas</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary">Semanas 3-4: Reestructuración Cognitiva</h5>
                      <ul className="text-brand-accent space-y-1 text-sm mt-2">
                        <li>• Desafía pensamientos negativos automáticos</li>
                        <li>• Crea evidencia de tu valor y logros</li>
                        <li>• Practica técnica de "mejor amiga interior"</li>
                        <li>• Trabajo con trauma de origen (niñez/adolescencia)</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary">Semanas 5-6: Construcción Activa</h5>
                      <ul className="text-brand-primary space-y-1 text-sm mt-2">
                        <li>• Establece límites en relaciones tóxicas</li>
                        <li>• Practica asertividad en situaciones seguras</li>
                        <li>• Desarrolla rituales de autocuidado profundo</li>
                        <li>• Explora y honra tus valores fundamentales</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary">Semanas 7-8: Integración y Fortalecimiento</h5>
                      <ul className="text-brand-secondary space-y-1 text-sm mt-2">
                        <li>• Toma decisiones valientes desde tu autenticidad</li>
                        <li>• Celebra progreso y crecimiento conseguido</li>
                        <li>• Crea plan de mantenimiento a largo plazo</li>
                        <li>• Comparte tu historia para ayudar a otras</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Herramientas Diarias para Fortalecer Autoestima</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Ritual Matutino (10 minutos)</h4>
                  <ol className="text-brand-secondary space-y-2 text-sm">
                    <li>1. <strong>Gratitud hacia ti misma:</strong> "Gracias, cuerpo, por...  Gracias, mente, por..."</li>
                    <li>2. <strong>Afirmación personalizada:</strong> "Soy valiosa porque..." (3 razones diferentes cada día)</li>
                    <li>3. <strong>Intención del día:</strong> "Hoy me comprometo a tratarme con..."</li>
                    <li>4. <strong>Visualización:</strong> Imagínate actuando desde amor propio</li>
                  </ol>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Ritual Nocturno (10 minutos)</h4>
                  <ol className="text-brand-primary space-y-2 text-sm">
                    <li>1. <strong>Celebración:</strong> "Hoy me siento orgullosa de..." (mínimo 3 cosas)</li>
                    <li>2. <strong>Perdón:</strong> "Me perdono por..." (si hubo autocrítica)</li>
                    <li>3. <strong>Aprendizaje:</strong> "Hoy aprendí sobre mí que..."</li>
                    <li>4. <strong>Amor incondicional:</strong> "Te amo [tu nombre] exactamente como eres"</li>
                  </ol>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Técnicas de Emergencia para Crisis de Autoestima</h3>
              
              <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-6 rounded-lg border border-brand-primary">
                <h4 className="font-semibold text-brand-primary mb-3">Cuando la Autocrítica Ataca:</h4>
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary">Técnica STOP:</h5>
                    <ul className="text-brand-primary space-y-1 text-sm mt-2">
                      <li><strong>S - Para:</strong> Detén inmediatamente el diálogo interno negativo</li>
                      <li><strong>T - Toma aire:</strong> Respira profundamente 3 veces</li>
                      <li><strong>O - Observa:</strong> "Esto es mi crítico interno, no la verdad"</li>
                      <li><strong>P - Procede con amor:</strong> "¿Qué me diría alguien que me ama?"</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-secondary">Técnica del Abrazo Interior:</h5>
                    <p className="text-brand-secondary text-sm">Físicamente abrázate y di: "Estoy aquí para ti. Te amo. Eres suficiente. Esto también pasará."</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Afirmaciones Poderosas Personalizadas</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Para la Autocrítica:</h4>
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• "Soy humana y eso incluye imperfecciones hermosas"</li>
                    <li>• "Mis errores son maestros, no fracasos"</li>
                    <li>• "Me hablo con la gentileza que merezco"</li>
                    <li>• "Soy más que mis errores y más que mis logros"</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">Para la Confianza:</h4>
                  <ul className="text-brand-secondary space-y-1 text-sm">
                    <li>• "Confío en mi sabiduría interior para guiarme"</li>
                    <li>• "Tengo derecho a ocupar espacio en este mundo"</li>
                    <li>• "Mi voz y opinión importan y merecen ser escuchadas"</li>
                    <li>• "Soy capaz de crear la vida que deseo"</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación Maestra de Autoestima:</h4>
                <p className="italic text-lg text-brand-primary">"Soy profundamente amada, infinitamente valiosa y completamente suficiente tal como soy en este momento. Mi valor no está en negociación y mi amor propio es inquebrantable."</p>
              </div>
            </div>
          `,
          type: 'Desarrollo Personal',
          slug: 'autoestima-inquebrantable'
        },
        {
          id: 3,
          title: 'Sanando el Trauma: De Superviviente a Guerrera',
          summary: 'Protocolo especializado para sanar traumas y convertir el dolor en poder personal',
          content: 'Terapia de trauma especializada...',
          type: 'Trauma Therapy',
          slug: 'sanacion-trauma'
        },
        {
          id: 4,
          title: 'Manejando la Depresión: Recuperar tu Luz',
          summary: 'Estrategias terapéuticas para salir de la depresión y reconectar con tu vitalidad',
          content: 'Protocolo anti-depresivo...',
          type: 'Salud Mental',
          slug: 'superar-depresion'
        },
        {
          id: 5,
          title: 'Límites Saludables: El Arte de Decir No',
          summary: 'Aprende a establecer límites firmes sin culpa y proteger tu energía emocional',
          content: `
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-primary">Límites: Tu Superpoder Emocional</h2>
              
              <p className="text-lg leading-relaxed">Como psicóloga especializada en relaciones saludables, entiendo que los límites no son muros que nos separan, son puentes que nos conectan auténticamente. Una mujer con límites claros es una mujer libre, respetada y en paz consigo misma.</p>
              
              <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-6 rounded-lg border-l-4 border-brand-accent">
                <h4 className="font-semibold text-brand-primary mb-2">Verdad Fundamental:</h4>
                <p className="text-brand-primary italic">"Los límites saludables no son egoísmo, son autocuidado. No es ser mala persona, es ser una persona íntegra que sabe lo que necesita para estar bien."</p>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">¿Por Qué las Mujeres Luchamos con los Límites?</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">🎭 Condicionamiento Social</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Mensajes tóxicos aprendidos:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>"Sé siempre amable"</strong> = Nunca digas no</li>
                      <li>• <strong>"No seas egoísta"</strong> = Pon a otros primero</li>
                      <li>• <strong>"Buenas niñas no se quejan"</strong> = Acepta todo</li>
                      <li>• <strong>"Mantén la paz"</strong> = Evita conflictos</li>
                      <li>• <strong>"Sé complaciente"</strong> = Tu valor depende de agradar</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Resultado:</strong> Pérdida de identidad, agotamiento emocional, resentimiento acumulado</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg border-l-4 border-brand-background">
                  <h4 className="font-semibold text-brand-primary mb-3">💔 Traumas y Heridas</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Experiencias que dañan los límites:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>Abandono emocional:</strong> "Si no complazco, me dejan"</li>
                      <li>• <strong>Invalidación constante:</strong> "Mis necesidades no importan"</li>
                      <li>• <strong>Culpa manipulativa:</strong> "Soy responsable de emociones ajenas"</li>
                      <li>• <strong>Amor condicional:</strong> "Solo soy valiosa si doy"</li>
                      <li>• <strong>Crítica persistente:</strong> "Nunca soy suficiente"</li>
                    </ul>
                    
                    <p className="mt-3"><strong>Sanación:</strong> Reconocer que estos patrones no son tu verdad, son heridas que puedes sanar</p>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Los 4 Tipos de Límites Esenciales</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg border-l-4 border-brand-secondary">
                  <h4 className="font-semibold text-brand-primary mb-3">🧠 Límites Emocionales</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Qué protegen:</strong> Tu estabilidad emocional, energía mental, paz interior</p>
                    
                    <p><strong>Ejemplos prácticos:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>"No soy responsable de tus emociones"</strong></li>
                      <li>• <strong>"No acepto gritos ni insultos"</strong></li>
                      <li>• <strong>"No puedo ser tu terapeuta emocional"</strong></li>
                      <li>• <strong>"Necesito espacio cuando me siento abrumada"</strong></li>
                    </ul>
                    
                    <p><strong>Señales de violación:</strong></p>
                    <ul className="space-y-1">
                      <li>• Te sientes emocionalmente drenada</li>
                      <li>• Cargas con problemas que no son tuyos</li>
                      <li>• Tus sentimientos son invalidados</li>
                      <li>• Te hacen sentir culpable por tus emociones</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-accent">
                  <h4 className="font-semibold text-brand-primary mb-3">⏰ Límites de Tiempo</h4>
                  <div className="text-brand-primary space-y-2 text-sm">
                    <p><strong>Qué protegen:</strong> Tu agenda, prioridades, descanso, tiempo personal</p>
                    
                    <p><strong>Ejemplos prácticos:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>"No estoy disponible después de las 9pm"</strong></li>
                      <li>• <strong>"Los domingos son para mi familia/descanso"</strong></li>
                      <li>• <strong>"No puedo quedarme tiempo extra sin previo aviso"</strong></li>
                      <li>• <strong>"Necesito 2 horas diarias solo para mí"</strong></li>
                    </ul>
                    
                    <p><strong>Señales de violación:</strong></p>
                    <ul className="space-y-1">
                      <li>• Tu agenda está controlada por otros</li>
                      <li>• No tienes tiempo para ti misma</li>
                      <li>• Te sientes culpable por descansar</li>
                      <li>• Siempre estás "disponible" para todos</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg border-l-4 border-brand-primary">
                  <h4 className="font-semibold text-brand-primary mb-3">💰 Límites Financieros</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Qué protegen:</strong> Tu seguridad económica, autonomía financiera, decisiones de gasto</p>
                    
                    <p><strong>Ejemplos prácticos:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>"No presto dinero que no puedo permitirme perder"</strong></li>
                      <li>• <strong>"No comparto mis ingresos si no quiero"</strong></li>
                      <li>• <strong>"No pago cuentas que no son mías"</strong></li>
                      <li>• <strong>"Mis decisiones financieras son solo mías"</strong></li>
                    </ul>
                    
                    <p><strong>Señales de violación:</strong></p>
                    <ul className="space-y-1">
                      <li>• Te presionan para gastar en lo que no quieres</li>
                      <li>• Otros controlan tu dinero</li>
                      <li>• Te hacen sentir culpable por tus gastos</li>
                      <li>• Siempre eres quien paga por otros</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg border-l-4 border-brand-primary">
                  <h4 className="font-semibold text-brand-primary mb-3">🤝 Límites Físicos</h4>
                  <div className="text-brand-secondary space-y-2 text-sm">
                    <p><strong>Qué protegen:</strong> Tu cuerpo, espacio personal, intimidad, seguridad física</p>
                    
                    <p><strong>Ejemplos prácticos:</strong></p>
                    <ul className="space-y-1">
                      <li>• <strong>"No tolero contacto físico no consensuado"</strong></li>
                      <li>• <strong>"Mi cuerpo, mis reglas"</strong></li>
                      <li>• <strong>"Necesito mi espacio físico respetado"</strong></li>
                      <li>• <strong>"No entres a mi habitación sin permiso"</strong></li>
                    </ul>
                    
                    <p><strong>Señales de violación:</strong></p>
                    <ul className="space-y-1">
                      <li>• Contacto físico que no deseas</li>
                      <li>• Invasión de tu espacio personal</li>
                      <li>• Presión sexual o romántica</li>
                      <li>• No respetan tu "no" físico</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Protocolo de 30 Días: Construyendo Límites Inquebrantables</h3>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 1: Autoconocimiento y Evaluación</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-accent/15 to-brand-accent/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">🔍 Auditoría de Límites</h5>
                      <div className="text-brand-accent space-y-2 text-sm">
                        <p><strong>Ejercicio diario:</strong> Identifica 3 momentos donde sentiste malestar</p>
                        <ul className="space-y-1">
                          <li>• ¿Qué límite fue violado?</li>
                          <li>• ¿Cómo reaccionaste?</li>
                          <li>• ¿Qué te hubiera gustado hacer?</li>
                          <li>• ¿Qué necesitabas en ese momento?</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Herramienta:</strong> Diario de límites para reconocer patrones</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">💡 Creencias Limitantes</h5>
                      <div className="text-brand-accent space-y-2 text-sm">
                        <p><strong>Identifica tus creencias saboteadoras:</strong></p>
                        <ul className="space-y-1">
                          <li>• "Si digo no, soy mala persona"</li>
                          <li>• "Necesito que todos me quieran"</li>
                          <li>• "No puedo decepcionar a nadie"</li>
                          <li>• "Mi valor depende de ayudar a otros"</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Nueva narrativa:</strong> Reescribe cada creencia con una versión empoderante</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 p-4 rounded-lg">
                    <h5 className="font-semibold text-brand-primary mb-2">⚠️ Señales de Alarma Corporal</h5>
                    <div className="text-brand-secondary text-sm">
                      <p className="mb-2">Aprende a reconocer cuando tu cuerpo te dice que un límite está siendo violado:</p>
                      <ul className="space-y-1">
                        <li>• <strong>Tensión física:</strong> Hombros, mandíbula, estómago</li>
                        <li>• <strong>Cambios respiratorios:</strong> Respiración corta o agitada</li>
                        <li>• <strong>Sensación de drenaje:</strong> Pérdida súbita de energía</li>
                        <li>• <strong>Incomodidad emocional:</strong> Ansiedad, irritación, vacío</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 2: Práctica con Límites Pequeños</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">🎯 Límites de Bajo Riesgo</h5>
                      <div className="text-brand-secondary space-y-2 text-sm">
                        <p><strong>Practica con personas "seguras":</strong></p>
                        <ul className="space-y-1">
                          <li>• Decline una invitación que no te emociona</li>
                          <li>• Di "necesito pensarlo" en lugar de "sí" automático</li>
                          <li>• Establece horarios para llamadas</li>
                          <li>• Pide espacio cuando te sientes abrumada</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Objetivo:</strong> Construir confianza sin confrontaciones mayores</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-3">💬 Frases de Transición</h5>
                      <div className="text-brand-secondary space-y-2 text-sm">
                        <p><strong>Reemplaza respuestas automáticas:</strong></p>
                        <ul className="space-y-1">
                          <li>• En lugar de "Está bien" → "Déjame revisar mi agenda"</li>
                          <li>• En lugar de "Como quieras" → "Prefiero esta opción"</li>
                          <li>• En lugar de "No importa" → "Para mí sí es importante"</li>
                          <li>• En lugar de "Perdón" → "Gracias por entender"</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Practica:</strong> 5 respuestas conscientes diarias</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 3: Límites Firmes y Claros</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-brand-accent/20 to-brand-accent/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-3">🎯 Técnica del "No Sandwich"</h5>
                      <div className="text-brand-accent space-y-2 text-sm">
                        <p><strong>Estructura de 3 partes:</strong></p>
                        <ol className="space-y-1">
                          <li>1. <strong>Validación/Empatía:</strong> "Entiendo que esto es importante para ti..."</li>
                          <li>2. <strong>Límite claro:</strong> "...y no puedo/no voy a..."</li>
                          <li>3. <strong>Alternativa (opcional):</strong> "...pero puedo ofrecerte..."</li>
                        </ol>
                        
                        <p className="mt-2"><strong>Ejemplo:</strong> "Entiendo que necesitas ayuda con la mudanza, y no puedo comprometerme este fin de semana porque tengo planes familiares, pero puedo ayudarte el sábado siguiente por la mañana."</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-primary/15 to-brand-primary/25 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-primary mb-3">🛡️ Manejo de la Culpa</h5>
                      <div className="text-brand-secondary space-y-2 text-sm">
                        <p><strong>Cuando aparece la culpa:</strong></p>
                        <ul className="space-y-1">
                          <li>• <strong>Reconócela:</strong> "Siento culpa, y eso es normal"</li>
                          <li>• <strong>Cuestiónala:</strong> "¿Es mi responsabilidad real?"</li>
                          <li>• <strong>Afirma tu derecho:</strong> "Tengo derecho a cuidarme"</li>
                          <li>• <strong>Actúa desde el amor propio:</strong> "Esto es lo mejor para mí"</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Afirmación:</strong> "La culpa es el precio de mi libertad, y vale la pena pagarlo"</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="text-xl font-semibold text-brand-primary mb-4">Semana 4: Límites Inquebrantables</h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-brand-background/25 to-brand-background/35 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">💎 Límites No Negociables</h5>
                      <div className="text-brand-primary space-y-2 text-sm">
                        <p><strong>Identifica tus 5 límites absolutos:</strong></p>
                        <ul className="space-y-1">
                          <li>• Valores fundamentales que no comprometes</li>
                          <li>• Comportamientos que jamás tolerarás</li>
                          <li>• Necesidades básicas innegociables</li>
                          <li>• Espacios sagrados que proteges</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Compromiso:</strong> Estos límites no se discuten, se respetan o la relación cambia</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/30 p-4 rounded-lg">
                      <h5 className="font-semibold text-brand-secondary mb-3">⚡ Consecuencias Naturales</h5>
                      <div className="text-brand-secondary space-y-2 text-sm">
                        <p><strong>Si tus límites no son respetados:</strong></p>
                        <ul className="space-y-1">
                          <li>• <strong>Primera vez:</strong> Comunicación clara y directa</li>
                          <li>• <strong>Segunda vez:</strong> Advertencia sobre consecuencias</li>
                          <li>• <strong>Tercera vez:</strong> Implementación de consecuencias</li>
                          <li>• <strong>Patrón repetitivo:</strong> Reevaluación de la relación</li>
                        </ul>
                        
                        <p className="mt-2"><strong>Recuerda:</strong> No eres responsable de cómo otros reaccionan a tus límites saludables</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-brand-primary">Scripts para Situaciones Difíciles</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">👨‍👩‍👧‍👦 Con Familia Invasiva</h4>
                  <div className="text-brand-secondary text-sm space-y-2">
                    <p><strong>Situación:</strong> "¿Cuándo vas a tener hijos?"</p>
                    <p><strong>Respuesta:</strong> "Es una decisión personal que no estoy dispuesta a discutir. Cambiemos de tema."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Visitas no anunciadas</p>
                    <p><strong>Respuesta:</strong> "Me encanta verte, y necesito que llames antes de venir. Hoy no puedo recibir visitas."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Críticas constantes</p>
                    <p><strong>Respuesta:</strong> "No voy a seguir escuchando comentarios negativos sobre mi vida. Si continúas, voy a retirarme."</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">💼 En el Trabajo</h4>
                  <div className="text-brand-primary text-sm space-y-2">
                    <p><strong>Situación:</strong> Trabajo extra sin compensación</p>
                    <p><strong>Respuesta:</strong> "Entiendo la urgencia. Mi horario actual está completo. ¿Podemos discutir prioridades o compensación adicional?"</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Acoso o comentarios inapropiados</p>
                    <p><strong>Respuesta:</strong> "Ese comentario es inapropiado. No tolero este tipo de comunicación."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Sobrecarga de responsabilidades</p>
                    <p><strong>Respuesta:</strong> "Quiero hacer un buen trabajo. Con mi carga actual, ¿cuál de estas tareas consideras más prioritaria?"</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/20 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">👥 Con Amistades Tóxicas</h4>
                  <div className="text-brand-secondary text-sm space-y-2">
                    <p><strong>Situación:</strong> Drama constante</p>
                    <p><strong>Respuesta:</strong> "Noto que nuestras conversaciones siempre giran en torno a problemas. Necesito un equilibrio más positivo en nuestras charlas."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Demandas excesivas de tiempo</p>
                    <p><strong>Respuesta:</strong> "Valoro nuestra amistad y tengo otros compromisos también. Podemos planear vernos [frecuencia específica]."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Chantaje emocional</p>
                    <p><strong>Respuesta:</strong> "Entiendo que estás molesta, y no voy a cambiar mi decisión por eso. ¿Podemos encontrar otra solución?"</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-brand-background/20 to-brand-background/30 p-5 rounded-lg">
                  <h4 className="font-semibold text-brand-primary mb-3">💕 En Relaciones de Pareja</h4>
                  <div className="text-brand-secondary text-sm space-y-2">
                    <p><strong>Situación:</strong> Control sobre decisiones personales</p>
                    <p><strong>Respuesta:</strong> "Aprecio tu opinión y esta decisión es mía. Espero que respetes mi autonomía."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Presión sexual</p>
                    <p><strong>Respuesta:</strong> "No me siento cómoda ahora. Mi 'no' necesita ser respetado sin cuestionamientos."</p>
                    
                    <p className="mt-3"><strong>Situación:</strong> Aislamiento de seres queridos</p>
                    <p><strong>Respuesta:</strong> "Mis relaciones con familia/amigos son importantes para mí. No voy a alejarme de ellos."</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-brand-accent/10 to-brand-secondary/10 p-6 rounded-lg">
                <h4 className="font-semibold text-brand-primary mb-2">Afirmación de Límites Poderosos:</h4>
                <p className="italic text-lg text-brand-primary">"Mis límites son actos de amor propio. Tengo el derecho divino de proteger mi energía, tiempo y paz. Cuando digo no a lo que no me sirve, digo sí a mi bienestar. Soy una mujer con límites claros y corazón abierto."</p>
              </div>
            </div>
          `,
          type: 'Habilidades Sociales',
          slug: 'limites-saludables'
        },
        {
          id: 6,
          title: 'Perdón y Liberación: Soltar para Sanar',
          summary: 'Proceso terapéutico para perdonar genuinamente y liberarte de cargas emocionales',
          content: 'Terapia del perdón...',
          type: 'Sanación Emocional',
          slug: 'perdon-liberacion'
        },
        {
          id: 7,
          title: 'Relaciones Tóxicas: Identificar y Sanar',
          summary: 'Guía para reconocer patrones tóxicos, salir de relaciones dañinas y sanar',
          content: 'Protocolo relaciones tóxicas...',
          type: 'Terapia Relacional',
          slug: 'relaciones-toxicas'
        },
        {
          id: 8,
          title: 'Inteligencia Emocional: Maestría Interior',
          summary: 'Desarrolla habilidades emocionales avanzadas para navegar la vida con sabiduría',
          content: 'Entrenamiento emocional...',
          type: 'Desarrollo de Habilidades',
          slug: 'inteligencia-emocional'
        }
      ],
      meditations: [
        'Meditación SOS para Crisis de Ansiedad - 5 min (Técnica de emergencia con respiración 4-7-8)',
        'Respiración Coherente para Calmar el Sistema Nervioso - 10 min (Sincroniza corazón y mente)',
        'Meditación de Autocompasión y Perdón hacia Ti Misma - 15 min (Sana la autocrítica interna)',
        'Visualización Guiada para Sanar Traumas del Pasado - 20 min (Técnica EMDR adaptada)',
        'Meditación de Amor Propio y Fortalecimiento de Autoestima - 12 min (Afirmaciones profundas)',
        'Relajación Progresiva Jacobson para Insomnio - 25 min (Tensión-relajación muscular)',
        'Meditación Ho\'oponopono para Soltar Resentimientos - 18 min (Perdón hawaiano)',
        'Conexión con tu Niña Interior Herida - 22 min (Sanación del trauma infantil)',
        'Meditación Mindfulness para Pensamientos Obsesivos - 15 min (Técnica de observación)',
        'Visualización de Refugio Seguro para TEPT - 20 min (Creación de espacio interno)',
        'Meditación Metta (Bondad Amorosa) para Relaciones - 16 min (Compasión hacia otros)',
        'Técnica de Grounding 5-4-3-2-1 Guiada - 8 min (Conexión con el presente)'
      ],
      podcasts: [
        'Historias Reales de Superación: Mujeres que Sanaron sus Traumas y Reconstruyeron su Vida',
        'Técnicas Diarias Respaldadas por Ciencia para Manejar la Ansiedad y Vivir en Calma',
        'Construyendo Resiliencia Emocional: Herramientas Prácticas para Tiempos Difíciles',
        'El Poder Transformador del Perdón: Cómo Liberarte del Pasado sin Minimizar el Dolor',
        'De la Autocrítica al Amor Propio: Revoluciona tu Diálogo Interno en 30 Días',
        'Navegando las Crisis Emocionales: Guía de Supervivencia con Sabiduría Psicológica',
        'Sanando la Codependencia: Aprende a Amarte sin Perderte en Otros',
        'Límites Saludables: El Arte de Decir No sin Culpa y Proteger tu Energía',
        'Inteligencia Emocional Femenina: Usa tus Emociones como Superpoder',
        'Trauma Generacional: Cómo Romper Patrones Familiares y Sanar Linajes'
      ],
      psychologicalSupport: [
        'Tus emociones son válidas - no necesitas "arreglarlas", necesitas comprenderlas',
        'Sanar no es lineal - los retrocesos son parte normal del proceso de crecimiento',
        'Mereces amor, compasión y cuidado - especialmente de ti misma',
        'Tu pasado no define tu futuro - tienes el poder de escribir una nueva historia'
      ]
    },
    test: {
      tests: [
        {
          id: 1,
          title: 'Evaluación Integral de Relaciones Tóxicas',
          description: 'Test psicológico profesional para identificar patrones de manipulación, codependencia y abuso emocional',
          questions: 25,
          duration: '12-15 min',
          category: 'Relaciones'
        },
        {
          id: 2,
          title: 'Análisis Completo de Bienestar Emocional',
          description: 'Evaluación profunda de tu estado mental, niveles de estrés, ansiedad, depresión y recursos de afrontamiento',
          questions: 30,
          duration: '15-20 min',
          category: 'Salud Mental'
        },
        {
          id: 3,
          title: 'Test de Hábitos Alimenticios y Relación con la Comida',
          description: 'Detecta patrones alimentarios, emociones asociadas a la comida y posibles trastornos alimentarios',
          questions: 22,
          duration: '10-15 min',
          category: 'Nutrición'
        },
        {
          id: 4,
          title: 'Evaluación de Salud Sexual y Bienestar Íntimo',
          description: 'Análisis de tu relación con la sexualidad, traumas, satisfacción y salud sexual integral',
          questions: 18,
          duration: '8-12 min',
          category: 'Sexualidad'
        },
        {
          id: 5,
          title: 'Test de Autoestima y Amor Propio',
          description: 'Mide tu nivel de autoestima, patrones de autocrítica y capacidad de autocompasión',
          questions: 20,
          duration: '10-12 min',
          category: 'Autoestima'
        },
        {
          id: 6,
          title: 'Evaluación de Trauma y Estrés Post-Traumático',
          description: 'Identifica síntomas de trauma, nivel de impacto y necesidad de intervención terapéutica',
          questions: 28,
          duration: '15-18 min',
          category: 'Trauma'
        },
        {
          id: 7,
          title: 'Test de Fertilidad Emocional y Reproductiva',
          description: 'Evalúa factores emocionales que pueden estar afectando tu fertilidad y bienestar reproductivo',
          questions: 16,
          duration: '8-10 min',
          category: 'Fertilidad'
        },
        {
          id: 8,
          title: 'Análisis de Síntomas Menopáusicos y Calidad de Vida',
          description: 'Evaluación completa de síntomas menopáusicos y su impacto en tu bienestar general',
          questions: 24,
          duration: '12-15 min',
          category: 'Menopausia'
        }
      ],
      psychologicalSupport: [
        'Los tests son herramientas de autoconocimiento, no etiquetas que te definen',
        'Tus resultados son información valiosa para tu crecimiento personal',
        'No existe respuesta "correcta" - solo existe tu verdad única',
        'Estos tests fueron diseñados con amor y respeto por tu proceso de sanación'
      ]
    }
  };

  // Funciones de manejo
  const handleBookmark = (articleId) => {
    setFavoriteArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleTestComplete = (results) => {
    // Aquí podrías guardar los resultados en Supabase
    console.log('Test completado:', results);
    setSelectedTest(null);
  };

  // Función para renderizar el contenido home
  const renderHome = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(200, 166, 166, 0.15), rgba(245, 230, 255, 0.25), rgba(141, 117, 131, 0.15))'
           }}>
        <div className="absolute inset-0 opacity-30">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#c8a6a6" fillOpacity="0.1">
                <circle cx="30" cy="30" r="2"/>
              </g>
            </g>
          </svg>
        </div>
        
        <div className="relative p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{
                background: 'linear-gradient(135deg, #c8a6a6 0%, #f5e6ff 25%, #8d7583 50%, #c1d43a 75%, #382a3c 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(2px 4px 8px rgba(200, 166, 166, 0.3))',
              }}
            >
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  background: 'linear-gradient(135deg, #c8a6a6 0%, #f5e6ff 25%, #8d7583 50%, #c1d43a 75%, #382a3c 100%)',
                  backgroundSize: '300% 300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Tu Bienestar
              </motion.span>
              
              {/* Efecto de brillo detrás del texto */}
              <motion.div
                className="absolute inset-0 blur-2xl opacity-30 -z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(200, 166, 166, 0.4), rgba(245, 230, 255, 0.4), rgba(141, 117, 131, 0.4))',
                  backgroundSize: '300% 300%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              
              {/* Partículas flotantes alrededor del texto */}
              <motion.div
                className="absolute -top-2 -right-2 w-2 h-2 rounded-full opacity-60"
                style={{ backgroundColor: '#f5e6ff' }}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                  y: [-5, 5, -5]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
              
              <motion.div
                className="absolute -bottom-2 -left-2 w-1.5 h-1.5 rounded-full opacity-60"
                style={{ backgroundColor: '#c8a6a6' }}
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.5, 0.9, 0.5],
                  x: [-3, 3, -3]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
            </motion.h1>
            <p className="text-lg text-brand-secondary/90 max-w-3xl mx-auto leading-relaxed">
              Cuidarte no es egoísmo, es amor propio. Como tu psicóloga de cabecera, aquí encuentras información clara, práctica y verificada para cada etapa de tu vida.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Heart className="w-5 h-5" style={{ color: '#c8a6a6' }} />
                <span className="text-sm font-medium text-brand-primary">
                  Tu acompañante profesional en el viaje del autocuidado
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Galería Decorativa de Imágenes con Efecto Cristal */}
      <motion.div 
        className="relative py-12"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Imagen Nutrición */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative group cursor-pointer"
          >
            <div className="relative max-w-[180px] sm:max-w-[270px] md:max-w-[340px] lg:max-w-sm">
              <img 
                src="/images/Nutricion.jpg" 
                alt="Nutrición Consciente"
                className="w-auto h-auto max-h-44 sm:max-h-68 md:max-h-84 lg:max-h-80 rounded-2xl sm:rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>

          {/* Imagen Emocional (Centro) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative group cursor-pointer"
          >
            <div className="relative max-w-[180px] sm:max-w-[270px] md:max-w-[340px] lg:max-w-sm">
              <img 
                src="/images/Emocional.jpg" 
                alt="Bienestar Emocional"
                className="w-auto h-auto max-h-44 sm:max-h-68 md:max-h-84 lg:max-h-80 rounded-2xl sm:rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>

          {/* Imagen Sexualidad */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative group cursor-pointer"
          >
            <div className="relative max-w-[180px] sm:max-w-[270px] md:max-w-[340px] lg:max-w-sm">
              <img 
                src="/images/Sexual.jpg" 
                alt="Sexualidad Consciente"
                className="w-auto h-auto max-h-44 sm:max-h-68 md:max-h-84 lg:max-h-80 rounded-2xl sm:rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
              />
            </div>
          </motion.div>
        </div>

        {/* Elementos decorativos flotantes alrededor de las imágenes */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 left-4 w-3 h-3 bg-brand-accent/30 rounded-full blur-sm"
        ></motion.div>
        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-8 right-8 w-2 h-2 bg-brand-secondary/30 rounded-full blur-sm"
        ></motion.div>
        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-12 w-4 h-4 bg-brand-primary/20 rounded-full blur-sm"
        ></motion.div>
      </motion.div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={() => setActiveSection(category.id)}
            className="group cursor-pointer relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/40 shadow-2xl shadow-green-500/5 hover:shadow-green-500/15 hover:shadow-3xl transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${category.color}15, rgba(193, 212, 58, 0.1), ${category.color}10)`,
            }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/10 group-hover:scale-110 group-hover:shadow-green-500/20 transition-all duration-300"
                  style={{ backgroundColor: category.color }}
                >
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-brand-secondary/60 group-hover:text-brand-accent group-hover:translate-x-1 transition-all duration-300" />
              </div>
              
              <h3 className="text-lg font-bold text-brand-primary mb-2 group-hover:text-brand-accent transition-colors duration-300">
                {category.title}
              </h3>
              
              <p className="text-sm text-brand-secondary/80 leading-relaxed">
                {category.description}
              </p>
            </div>
            
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Frase motivadora */}
      <div className="text-center bg-gradient-to-r from-brand-accent/10 via-brand-background/20 to-brand-secondary/10 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-lg font-medium text-brand-primary italic"
        >
          "Estás a un paso de sentirte más fuerte, más consciente y más libre. KUNNA es tu aliada en este viaje."
        </motion.p>
      </div>
    </div>
  );

  // Función para renderizar el contenido de una categoría
  const renderCategoryContent = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    const content = categoryContent[categoryId];
    
    if (!category || !content) return null;

    return (
      <div className="space-y-8">
        {/* Header de la categoría */}
        <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl"
             style={{
               background: `linear-gradient(135deg, ${category.color}15, ${category.color}25, ${category.color}10)`,
             }}>
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button
                onClick={() => setActiveSection('home')}
                variant="outline"
                size="sm"
                className="bg-white/20 backdrop-blur-sm border-white/30 text-brand-primary hover:bg-white/30"
              >
                ← Volver
              </Button>
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-brand-primary font-serif mb-4">
              {category.title}
            </h1>
            
            <p className="text-brand-secondary/90 leading-relaxed text-lg">
              {category.intro}
            </p>
          </div>
        </div>

        {/* Contenido específico por categoría */}
        {content.articles && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-primary font-serif">
              Artículos y Guías
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.articles.map((article) => (
                <div 
                  key={article.id} 
                  onClick={() => {
                    setSelectedArticle({ ...article, id: article.slug || article.id });
                    setSelectedCategory(category);
                  }}
                  className="relative backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(145deg, rgba(193, 212, 58, 0.08), rgba(141, 117, 131, 0.06), rgba(200, 166, 166, 0.05))',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-accent/5 via-transparent to-brand-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-brand-primary group-hover:text-brand-accent transition-colors duration-300">
                        {article.title}
                      </h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmark(article.id);
                          }}
                          className="p-1 hover:bg-brand-accent/20 rounded-lg transition-colors duration-300"
                        >
                          <BookmarkPlus className="w-4 h-4 text-brand-secondary hover:text-brand-accent" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(article);
                          }}
                          className="p-1 hover:bg-brand-accent/20 rounded-lg transition-colors duration-300"
                        >
                        <Share2 className="w-4 h-4 text-brand-secondary" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-brand-secondary/80 text-sm leading-relaxed mb-4">
                    {article.summary}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-brand-accent/20 text-brand-primary px-3 py-1 rounded-full font-medium">
                      {article.type}
                    </span>
                    <ChevronRight className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apoyo psicológico específico por categoría */}
        {content.psychologicalSupport && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/20 via-green-50/30 to-lime-50/20 rounded-3xl p-6 border border-white/30 shadow-2xl shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-500">
            <h3 className="text-lg font-semibold text-brand-primary mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
              Tu Psicóloga de Cabecera te Recuerda
            </h3>
            <div className="space-y-3">
              {content.psychologicalSupport.map((message, index) => (
                <div key={index} className="flex items-start p-4 backdrop-blur-md bg-gradient-to-r from-white/10 via-green-50/20 to-white/10 rounded-xl border border-white/20 shadow-lg">
                  <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#c1d43a' }}></span>
                  <p className="text-brand-primary font-medium italic leading-relaxed">
                    {message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Apoyo emocional para nutrición */}
        {content.mentalHealth && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-100/30 via-emerald-50/40 to-lime-100/30 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-green-500/15 hover:shadow-green-500/25 transition-all duration-500">
            <button
              onClick={() => setIsRelationCollapsed(!isRelationCollapsed)}
              className="w-full flex items-center justify-between text-left focus:outline-none group"
            >
              <h3 className="text-lg font-semibold text-brand-primary flex items-center group-hover:text-brand-accent transition-colors duration-200">
                <Brain className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
                Sanando tu Relación con la Comida
              </h3>
              <motion.div
                animate={{ rotate: isRelationCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-brand-secondary" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {!isRelationCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 mt-4">
                    {content.mentalHealth.map((insight, index) => (
                      <div key={index} className="flex items-start">
                        <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#c1d43a' }}></span>
                        <p className="text-brand-primary font-medium leading-relaxed">
                          {insight}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tips específicos para nutrición */}
        {content.tips && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-lime-50/30 via-green-100/40 to-emerald-50/30 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-lime-500/15 hover:shadow-lime-500/25 transition-all duration-500">
            <button
              onClick={() => setIsTipsCollapsed(!isTipsCollapsed)}
              className="w-full flex items-center justify-between text-left focus:outline-none group"
            >
              <h3 className="text-lg font-semibold text-brand-primary flex items-center group-hover:text-brand-accent transition-colors duration-200">
                <Apple className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
                Tips Esenciales de tu Nutrióloga
              </h3>
              <motion.div
                animate={{ rotate: isTipsCollapsed ? 0 : 180 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5 text-brand-secondary" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {!isTipsCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2 mt-4">
                    {content.tips.map((tip, index) => (
                      <li key={index} className="flex items-start text-brand-secondary/90">
                        <span className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: '#c1d43a' }}></span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Descargas para sexualidad */}
        {content.downloads && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-100/25 via-green-50/35 to-teal-50/25 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-500">
            <h3 className="text-lg font-semibold text-brand-primary mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
              Recursos Terapéuticos Descargables
            </h3>
            <div className="space-y-3">
              {content.downloads.map((download, index) => (
                <button key={index} className="w-full flex items-center justify-between p-4 backdrop-blur-md bg-gradient-to-r from-white/15 via-green-50/25 to-white/15 rounded-xl border border-white/25 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-white/25 hover:via-green-50/35 hover:to-white/25 transition-all duration-300 group">
                  <span className="text-brand-primary font-medium">{download}</span>
                  <Download className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meditaciones para salud emocional */}
        {content.meditations && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-green-50/25 via-emerald-100/35 to-lime-50/25 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-green-500/15 hover:shadow-green-500/25 transition-all duration-500">
            <h3 className="text-lg font-semibold text-brand-primary mb-4 flex items-center">
              <Play className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
              Sesiones de Terapia Audio
            </h3>
            <div className="space-y-3">
              {content.meditations.map((meditation, index) => (
                <button key={index} className="w-full flex items-center justify-between p-4 backdrop-blur-md bg-gradient-to-r from-white/15 via-green-50/25 to-white/15 rounded-xl border border-white/25 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-white/25 hover:via-green-50/35 hover:to-white/25 transition-all duration-300 group">
                  <span className="text-brand-primary font-medium">{meditation}</span>
                  <Play className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Podcasts para salud emocional */}
        {content.podcasts && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/25 via-green-100/35 to-teal-100/25 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-emerald-500/15 hover:shadow-emerald-500/25 transition-all duration-500">
            <h3 className="text-lg font-semibold text-brand-primary mb-4 flex items-center">
              <Volume2 className="w-5 h-5 mr-2" style={{ color: '#c1d43a' }} />
              Podcasts de Crecimiento Personal
            </h3>
            <div className="space-y-3">
              {content.podcasts.map((podcast, index) => (
                <button key={index} className="w-full flex items-center justify-between p-4 backdrop-blur-md bg-gradient-to-r from-white/15 via-green-50/25 to-white/15 rounded-xl border border-white/25 shadow-lg hover:shadow-xl hover:bg-gradient-to-r hover:from-white/25 hover:via-green-50/35 hover:to-white/25 transition-all duration-300 group">
                  <span className="text-brand-primary font-medium">{podcast}</span>
                  <Play className="w-4 h-4 text-brand-secondary group-hover:text-brand-accent transition-colors duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tests interactivos */}
        {content.tests && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-primary font-serif">
              Evaluaciones Psicológicas Profesionales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.tests.map((test) => (
                <div 
                  key={test.id} 
                  onClick={() => setSelectedTest(test)}
                  className="backdrop-blur-xl bg-gradient-to-br from-green-50/25 via-emerald-100/35 to-lime-100/25 rounded-3xl p-6 border border-white/40 shadow-2xl shadow-green-500/15 hover:shadow-green-500/25 transition-all duration-500 group cursor-pointer hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <ClipboardList className="w-8 h-8 flex-shrink-0" style={{ color: '#c1d43a' }} />
                    <div className="flex flex-col items-end text-xs text-brand-secondary/70">
                      <div className="flex items-center space-x-2">
                        <span>{test.questions} preguntas</span>
                        <span>•</span>
                        <span>{test.duration}</span>
                      </div>
                      <span className="mt-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-green-100/30 border border-white/20"
                            style={{ color: '#c1d43a' }}>
                        {test.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-brand-primary mb-2 group-hover:text-brand-accent transition-colors duration-300">
                    {test.title}
                  </h3>
                  
                  <p className="text-brand-secondary/80 text-sm leading-relaxed mb-4">
                    {test.description}
                  </p>
                  
                  <Button 
                    className="w-full font-medium text-white transition-all duration-300"
                    style={{ 
                      backgroundColor: '#8d75838',
                      borderColor: '#8d75838'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#7a6575';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#8d75838';
                    }}
                  >
                    Comenzar Evaluación
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-4"
         style={{
           background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.12) 0%, rgba(200, 166, 166, 0.08) 25%, rgba(255, 255, 255, 0.15) 50%, rgba(141, 117, 131, 0.06) 75%, rgba(193, 212, 58, 0.05) 100%)'
         }}>
      
      {/* Efectos de fondo decorativos sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orbes flotantes de colores */}
        <motion.div
          className="absolute top-20 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(245, 230, 255, 0.6), transparent 70%)' }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(200, 166, 166, 0.5), transparent 70%)' }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(193, 212, 58, 0.3), transparent 70%)' }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.03, 0.12, 0.03]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        {/* Partículas flotantes muy sutiles */}
        <motion.div
          className="absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full opacity-20"
          style={{ backgroundColor: '#f5e6ff' }}
          animate={{ 
            y: [-8, 8, -8],
            x: [-3, 3, -3],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div
          className="absolute top-2/3 right-1/5 w-1 h-1 rounded-full opacity-20"
          style={{ backgroundColor: '#c8a6a6' }}
          animate={{ 
            y: [6, -6, 6],
            x: [2, -2, 2],
            opacity: [0.15, 0.4, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>
      <Helmet>
        <title>Tu Bienestar - KUNNA</title>
        <meta name="description" content="Módulo integral de salud femenina: nutrición, sexualidad, menopausia, fertilidad, salud emocional y test interactivos." />
      </Helmet>

      <div className="relative z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {activeSection === 'home' ? renderHome() : renderCategoryContent(activeSection)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {selectedTest && (
          <InteractiveTest
            test={selectedTest}
            onComplete={handleTestComplete}
            onClose={() => setSelectedTest(null)}
          />
        )}
        
        {selectedArticle && selectedCategory && (
          <ArticleViewer
            article={selectedArticle}
            category={selectedCategory}
            onClose={() => {
              setSelectedArticle(null);
              setSelectedCategory(null);
            }}
            onBookmark={handleBookmark}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BienestarCompleto;
