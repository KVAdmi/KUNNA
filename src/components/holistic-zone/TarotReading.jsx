import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TarotCard = ({ card, isFlipped }) => (
  <div className="relative w-full h-full perspective-1000">
    <motion.div
      className="relative w-full h-full preserve-3d"
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-lg flex items-center justify-center p-2 border-2 border-brand-accent/50">
        <img alt="Zinha Logo on Tarot Card Back" className="w-2/3" src="https://storage.googleapis.com/hostinger-horizons-assets-prod/ce6b3f33-5fa3-4c63-a670-0869d616221b/e06e2bcdf5d60a2e1710c9041e2f62b6.jpg" />
      </div>
      <div className="absolute w-full h-full backface-hidden bg-brand-background rounded-2xl shadow-lg flex flex-col items-center justify-center p-2 border-2 border-brand-primary/50 transform-rotate-y-180 overflow-hidden">
        <img alt={card?.nombre} className="w-full h-full object-cover" src={card?.imagen_url} />
      </div>
    </motion.div>
  </div>
);

const TarotReading = () => {
  const [step, setStep] = useState("choose_spread");
  const [spread, setSpread] = useState(null);
  const [revealedCards, setRevealedCards] = useState([]);

const arcanos = [
  {
    "nombre": "03-La Emperatriz",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//03-La%20Emperatriz.jpg",
    "pasado": "Abundancia, creatividad, madre",
    "presente": "Fertilidad de ideas, proyectos floreciendo",
    "futuro": "Crecimiento, prosperidad",
    "obstaculo": "Exceso de complacencia",
    "mensaje_final": "Permite que la abundancia llegue a ti",
    "respuesta": "Sí",
    "resultado_si_o_no": "Fertilidad, creación, avance con gozo."
  },
  {
    "nombre": "04-El Emperador",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//04-El%20Emperador.jpg",
    "pasado": "Estructura, figura paterna, disciplina",
    "presente": "Necesidad de orden o liderazgo",
    "futuro": "Estabilidad y control",
    "obstaculo": "Rigidez, autoritarismo",
    "mensaje_final": "Toma control de tu vida con sabiduría",
    "respuesta": "Sí",
    "resultado_si_o_no": "Estabilidad total. Toma el control."
  },
  {
    "nombre": "05-Sumo Sacerdote",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//05-Sumo%20Sacerdote.jpg",
    "pasado": "Tradiciones, educación, guía espiritual",
    "presente": "Búsqueda de consejo, comunidad",
    "futuro": "Enseñanza, compromiso espiritual",
    "obstaculo": "Conformismo, dogma",
    "mensaje_final": "Conecta con tus valores y aprendizaje",
    "respuesta": "Tal vez",
    "resultado_si_o_no": "Necesitas guía o consejo. Tradición importa."
  },
  {
    "nombre": "06-Los Enamorados",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//06-Los%20Enamorados.jpg",
    "pasado": "Decisiones importantes en relaciones",
    "presente": "Elección entre caminos o valores",
    "futuro": "Unión significativa, decisión importante",
    "obstaculo": "Indecisión, conflicto de valores",
    "mensaje_final": "Elige con el corazón y la conciencia",
    "respuesta": "Tal vez",
    "resultado_si_o_no": "Depende de tu elección. Escoge con el corazón."
  },
  {
    "nombre": "07-El Carro",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//07-El%20Carro.jpg",
    "pasado": "Triunfo, superar obstáculos",
    "presente": "Avance, disciplina, enfoque",
    "futuro": "Victoria si mantienes dirección",
    "obstaculo": "Impaciencia, falta de control",
    "mensaje_final": "Confía en tu fuerza de voluntad",
    "respuesta": "Sí rotundo",
    "resultado_si_o_no": "Ve por ello con decisión."
  },
  {
    "nombre": "08-La Fuerza",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//08-La%20Fuerza.jpg",
    "pasado": "Superación de dificultades con calma",
    "presente": "Fortaleza interna, paciencia",
    "futuro": "Control interno, éxito mediante suavidad",
    "obstaculo": "Falta de autocontrol o coraje",
    "mensaje_final": "La verdadera fuerza es interna",
    "respuesta": "Sí",
    "resultado_si_o_no": "Lo lograrás con paciencia y corazón."
  },
  {
    "nombre": "09-El Ermitano",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//09-El%20Ermitano.jpg",
    "pasado": "Retiro, introspección",
    "presente": "Búsqueda interior, soledad elegida",
    "futuro": "Sabiduría obtenida tras reflexión",
    "obstaculo": "Aislamiento excesivo",
    "mensaje_final": "Encuentra tu luz interior antes de actuar",
    "respuesta": "No por ahora",
    "resultado_si_o_no": "Aún no es tiempo, falta claridad."
  },
  {
    "nombre": "10-La Rueda de la Fortuna",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//10-La%20Rueda%20de%20la%20Fortuna.jpg",
    "pasado": "Cambios de destino, ciclos de vida",
    "presente": "Momento de cambio, flujo",
    "futuro": "Suerte, nuevos ciclos",
    "obstaculo": "Resistencia al cambio",
    "mensaje_final": "Acepta los ciclos y fluye con ellos",
    "respuesta": "Sí",
    "resultado_si_o_no": "Cambios positivos en camino."
  },
  {
    "nombre": "11-La Justicia",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//11-La%20Justicia.jpg",
    "pasado": "Consecuencias de decisiones",
    "presente": "Necesidad de equilibrio y responsabilidad",
    "futuro": "Resultados justos",
    "obstaculo": "Injusticia, falta de claridad",
    "mensaje_final": "Actúa con integridad",
    "respuesta": "Tal vez",
    "resultado_si_o_no": "Todo depende de tus actos pasados."
  },
  {
    "nombre": "12-El Colgado",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//12-El%20Colgado.jpg",
    "pasado": "Periodo de pausa o sacrificio",
    "presente": "Necesidad de soltar o cambiar perspectiva",
    "futuro": "Claridad tras la espera",
    "obstaculo": "Estancamiento",
    "mensaje_final": "Acepta el momento, confía en el proceso",
    "respuesta": "Tal vez no",
    "resultado_si_o_no": "Espera. Todo está en pausa por una razón."
  },
  {
    "nombre": "13-La Muerte",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//13-La%20Muerte.jpg",
    "pasado": "Transformación profunda",
    "presente": "Fin de una etapa",
    "futuro": "Renacimiento",
    "obstaculo": "Resistencia a dejar ir",
    "mensaje_final": "Acepta los cierres para renacer",
    "respuesta": "No definitivo",
    "resultado_si_o_no": "Esto debe terminar. Haz espacio."
  },
  {
    "nombre": "14-La Templanza",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//14-La%20Templanza.jpg",
    "pasado": "Sanación, equilibrio logrado",
    "presente": "Moderación, paciencia",
    "futuro": "Armonía, integración",
    "obstaculo": "Desequilibrio emocional",
    "mensaje_final": "Busca la armonía interior",
    "respuesta": "Tal vez",
    "resultado_si_o_no": "Necesitas equilibrio y tiempo."
  },
  {
    "nombre": "15-El Diablo",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//15-El%20Diablo.jpg",
    "pasado": "Apegos, excesos",
    "presente": "Dependencias, tentaciones",
    "futuro": "Liberación si se reconoce el problema",
    "obstaculo": "Miedos internos, adicciones",
    "mensaje_final": "Reconoce y libera tus cadenas",
    "respuesta": "No por tu bien",
    "resultado_si_o_no": "Tentación o engaño. No te conviene."
  },
  {
    "nombre": "16-La Torre",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//16-La%20Torre.jpg",
    "pasado": "Cambio repentino, ruptura",
    "presente": "Crisis, verdad revelada",
    "futuro": "Caída de estructuras falsas",
    "obstaculo": "Negación de cambios necesarios",
    "mensaje_final": "Deja que se derrumbe lo que no es auténtico",
    "respuesta": "No rotundo",
    "resultado_si_o_no": "Ruptura necesaria. Caída liberadora."
  },
  {
    "nombre": "17-La Estrella",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//17-La%20Estrella.jpg",
    "pasado": "Esperanza tras tiempos difíciles",
    "presente": "Fe, inspiración",
    "futuro": "Renovación, guía espiritual",
    "obstaculo": "Falta de esperanza",
    "mensaje_final": "Confía, lo mejor está llegando",
    "respuesta": "Sí",
    "resultado_si_o_no": "Hay esperanza. Confía en el futuro."
  },
  {
    "nombre": "18-La Luna",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//18-La%20Luna.jpg",
    "pasado": "Confusión, ilusiones",
    "presente": "Intuición y miedos",
    "futuro": "Claridad tras confusión",
    "obstaculo": "Engaños, inseguridad",
    "mensaje_final": "Escucha tus sueños, pero distingue la realidad",
    "respuesta": "Tal vez no",
    "resultado_si_o_no": "Hay confusión. No todo es lo que parece."
  },
  {
    "nombre": "19-El Sol",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//19-El%20Sol.jpg",
    "pasado": "Alegría, éxito",
    "presente": "Vitalidad, claridad",
    "futuro": "Éxito y gozo",
    "obstaculo": "Ego, orgullo",
    "mensaje_final": "Abraza la alegría y la claridad",
    "respuesta": "Sí claro",
    "resultado_si_o_no": "Éxito, claridad, buena fortuna."
  },
  {
    "nombre": "20-El Juicio",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//20-El%20Juicio.jpg",
    "pasado": "Llamado a despertar",
    "presente": "Momento de evaluación y perdón",
    "futuro": "Renacimiento, claridad",
    "obstaculo": "Juicio propio o ajeno excesivo",
    "mensaje_final": "Acepta el renacer de tu alma",
    "respuesta": "Tal vez sí",
    "resultado_si_o_no": "Resurge algo del pasado. Evalúa bien."
  },
  {
    "nombre": "21-El Mundo",
    "imagen_url": "https://wpsysctbaxbtzyebcjlb.supabase.co/storage/v1/object/public/cartas-tarot//21-El%20Mundo.jpg",
    "pasado": "Culminación de un ciclo",
    "presente": "Integración, plenitud",
    "futuro": "Éxito y logro de metas",
    "obstaculo": "Incompletitud, miedo a cerrar ciclos",
    "mensaje_final": "Estás por lograr una gran realización",
    "respuesta": "Sí absoluto",
    "resultado_si_o_no": "Cierre perfecto. Todo se alinea."
  }
];

const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performReading = (type) => {
    const deck = shuffleArray(arcanos);
    if (type === 'yes_no') {
      const selected = deck[0];
      setRevealedCards([selected]);
      setSpread('yes_no');
    } else {
      const selected = deck.slice(0, 5).map((card, i) => {
        const posMap = ['pasado', 'presente', 'futuro', 'obstaculo', 'mensaje_final'];
        return {
          ...card,
          posicion: posMap[i],
          mensaje: card[posMap[i]]
        };
      });
      setRevealedCards(selected);
      setSpread('five');
    }
    setStep('result');
  };

  const resetReading = () => {
    setRevealedCards([]);
    setStep('choose_spread');
    setSpread(null);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {step === 'choose_spread' && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center w-full max-w-md"
          >
            <motion.h1 
              className="text-3xl font-bold font-serif mb-2"
              style={{
                background: 'linear-gradient(135deg, #f5e6ff, #c1d43a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(245, 230, 255, 0.5)'
              }}
            >
              Elige tu Tirada
            </motion.h1>
            <p 
              className="mb-8 text-lg leading-relaxed"
              style={{ color: '#f5e6ff', textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)' }}
            >
              Conecta con tu intención y elige cómo deseas que el Tarot te acompañe hoy.
            </p>
            <div className="space-y-6">
              <motion.button 
                onClick={() => performReading('five')} 
                className="relative w-full h-16 text-lg font-bold rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #382a3c, #263152)',
                  border: '2px solid rgba(245, 230, 255, 0.3)',
                  boxShadow: '0 8px 25px rgba(56, 42, 60, 0.4)'
                }}
                whileHover={{ 
                  boxShadow: '0 12px 35px rgba(56, 42, 60, 0.6)',
                  y: -3
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>

                {/* Decoración esotérica izquierda */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#c1d43a] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  ✦
                </div>

                {/* Decoración esotérica derecha */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#f5e6ff] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  ✧
                </div>

                <span className="relative z-10 text-[#f5e6ff] group-hover:text-white transition-colors duration-300">
                  Tirada de 5 cartas
                </span>
              </motion.button>

              <motion.button 
                onClick={() => performReading('yes_no')} 
                className="relative w-full h-16 text-lg font-bold rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #c1d43a, #f5e6ff)',
                  border: '2px solid rgba(193, 212, 58, 0.5)',
                  boxShadow: '0 8px 25px rgba(193, 212, 58, 0.4)'
                }}
                whileHover={{ 
                  boxShadow: '0 12px 35px rgba(193, 212, 58, 0.6)',
                  y: -3
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </div>

                {/* Decoración esotérica izquierda */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#382a3c] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  ✧
                </div>

                {/* Decoración esotérica derecha */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#263152] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                  ✦
                </div>

                <span className="relative z-10 text-[#382a3c] group-hover:text-[#263152] transition-colors duration-300">
                  Tirada Sí o No
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl text-center"
          >
            <motion.h2 
              className="text-3xl font-bold font-serif mb-6"
              style={{
                background: 'linear-gradient(135deg, #f5e6ff, #c1d43a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 20px rgba(245, 230, 255, 0.5)'
              }}
            >
              {spread === 'yes_no' ? ' Respuesta del Tarot' : ' Tu Tirada de 5 Cartas'}
            </motion.h2>

            <div className={`grid gap-4 ${spread === 'five' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-1 max-w-xs mx-auto'}`}>
              {revealedCards.map((card, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-32 h-48 sm:w-40 sm:h-64 mx-auto mb-3">
                    <TarotCard card={card} isFlipped={true} />
                  </div>
                  <p 
                    className="font-bold text-sm sm:text-base mb-2"
                    style={{ 
                      color: '#f5e6ff',
                      textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {card.posicion ? `${card.posicion.toUpperCase()}: ${card.nombre}` : card.nombre}
                  </p>
                  <p 
                    className="italic text-xs sm:text-sm leading-relaxed"
                    style={{ 
                      color: '#c1d43a',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)',
                      fontWeight: '500'
                    }}
                  >
                    "{card.mensaje || card.resultado_si_o_no}"
                  </p>
                  {spread === 'yes_no' && (
                    <p 
                      className="mt-2 text-base font-semibold"
                      style={{ color: '#f5e6ff', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}
                    >
                      Respuesta: <span style={{ color: '#c1d43a' }}>{card.respuesta}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            <motion.button 
              onClick={resetReading} 
              className="mt-8 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 mx-auto transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #c8a6a6, #8d7583)',
                color: '#f5e6ff',
                border: '2px solid rgba(245, 230, 255, 0.3)',
                boxShadow: '0 8px 25px rgba(200, 166, 166, 0.4)'
              }}
              whileHover={{ 
                boxShadow: '0 12px 35px rgba(200, 166, 166, 0.6)',
                y: -3
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Shuffle className="w-5 h-5" />
              Hacer otra tirada
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TarotReading;