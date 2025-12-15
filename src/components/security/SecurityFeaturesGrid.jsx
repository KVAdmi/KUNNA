// ...imports
import { getTrackingUrl } from '@/config/tracking';

// Utilidad para abrir WhatsApp con token y ubicación
function abrirWhatsConToken(token, lat, lng) {
  const track = getTrackingUrl(token);
  const texto = encodeURIComponent(
    `🚨 Acompáñame\nToken: ${token}\n${lat && lng ? `Inicio: ${lat},${lng}\n` : ''}Mapa: ${track}`
  );
  const urlScheme = `whatsapp://send?text=${texto}`;
  const urlWeb = `https://api.whatsapp.com/send?text=${texto}`;
  location.href = urlScheme;
  setTimeout(() => {
    if (document.visibilityState === 'visible') location.href = urlWeb;
  }, 600);
}
import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Share2, PhoneCall, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import supabase from '@/lib/customSupabaseClient'
import BotonAuxilio from './BotonAuxilio';

const SecurityFeaturesGrid = ({ isLocationSharing, toggleLocationSharing }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [audiosSeguridad, setAudiosSeguridad] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    if (user) {
      loadAudiosSeguridad();
    }
  }, [user]);

  const loadAudiosSeguridad = async () => {
    const { data, error } = await supabase
      .from('audios_seguridad')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error cargando audios de seguridad:', error.message);
    } else {
      setAudiosSeguridad(data);
    }
  };

  const toggleCard = (index) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };


  // Handler del botón Acompáñame con permisos, geolocalización y WhatsApp
  const pedirPosicion = () =>
    new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      })
    );

  async function startAcompanamiento() {
    try {
      // Revisa permisos primero
      // @ts-ignore
      const st = await navigator.permissions?.query?.({ name: 'geolocation' });
      if (st?.state === 'denied') {
        alert('Ubicación bloqueada. Ve a Ajustes del sitio → Ubicación → Permitir.');
        return;
      }

      // Esto dispara el prompt en Android
      const pos = await pedirPosicion();
      const { latitude, longitude } = pos.coords;

      // Guarda en Supabase (ajusta tu función real aquí)
      // TODO: reemplaza creaRegistroSupabase por tu función real
      const token = await creaRegistroSupabase({ lat: latitude, lng: longitude });

      // Abre WhatsApp
      abrirWhatsConToken(token, latitude, longitude);
    } catch (e) {
      const code = e?.code;
      const msg =
        code === 1
          ? 'Permiso denegado'
          : code === 2
          ? 'Ubicación no disponible (GPS)'
          : code === 3
          ? 'Timeout'
          : 'Error de geolocalización';
      alert(`${msg}. Revisa permisos del sitio y que el GPS esté activo.`);
    }
  }

  // Asigna el handler al botón (asegúrate de tener el id correcto en el botón)
  useEffect(() => {
    const btn = document.getElementById('btn-acompaname');
    if (btn) btn.addEventListener('click', startAcompanamiento);
    return () => {
      if (btn) btn.removeEventListener('click', startAcompanamiento);
    };
  }, []);


  const reproducirAudioSeguro = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '20%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -20%)';
    container.style.backgroundColor = '#f5e6ff';
    container.style.padding = '2rem';
    container.style.borderRadius = '2rem';
    container.style.boxShadow = '0 0 20px rgba(0,0,0,0.2)';
    container.style.zIndex = '9999';
    container.style.fontFamily = 'Questrial, sans-serif';
    container.innerHTML = '<h3 style="margin-bottom: 1rem; color: #382a3c;">Elige un audio para reproducir:</h3>';

    if (!audiosSeguridad || audiosSeguridad.length === 0) {
      const vacio = document.createElement('p');
      vacio.innerText = 'No hay audios disponibles.';
      vacio.style.color = '#382a3c';
      vacio.style.marginBottom = '1rem';
      container.appendChild(vacio);
    } else {
      audiosSeguridad.forEach((audio) => {
        const btn = document.createElement('button');
        btn.innerText = audio.etiqueta || 'Audio sin nombre';
        btn.style.backgroundColor = '#263152';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.margin = '0.25rem';
        btn.style.padding = '0.75rem 1.5rem';
        btn.style.borderRadius = '1rem';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '1rem';
        btn.onclick = () => {
          const player = new Audio(audio.url_audio);
          player.volume = 1;
          player.play().catch((err) => {
            console.error('No se pudo reproducir el audio:', err);
          });
          container.remove();
        };
        container.appendChild(btn);
      });
    }

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Cancelar';
    closeBtn.style.marginTop = '1rem';
    closeBtn.style.backgroundColor = '#c8a6a6';
    closeBtn.style.padding = '0.5rem 1rem';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '1rem';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => container.remove();

    container.appendChild(closeBtn);
    document.body.appendChild(container);
  };

  const grabarAudioYGuardar = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const fileName = `panico_${Date.now()}.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audios-panico')
          .upload(fileName, audioBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'audio/webm',
          });

        if (uploadError) {
          toast({ title: '❌ Error al guardar audio', description: uploadError.message, variant: 'destructive' });
          return;
        }

        const { data: publicUrlData } = supabase.storage.from('audios-panico').getPublicUrl(fileName);
        const publicUrl = publicUrlData.publicUrl;

        const location = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              resolve({ lat: latitude, lon: longitude });
            },
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });

        const insertResult = await supabase.from('grabaciones_panico').insert({
          usuario_id: user.id,
          url_audio: publicUrl,
          ubicacion: location ? `POINT(${location.lon} ${location.lat})` : null,
          fecha: new Date().toISOString(),
        });

        if (insertResult.error) {
          toast({ title: '❌ Error al guardar en base de datos', description: insertResult.error.message, variant: 'destructive' });
        } else {
          toast({ title: '🎤 Grabación guardada', description: 'El audio fue registrado y se notificará a tus contactos.' });

          if (location) {
            contacts.forEach((c) => {
              const tel = c.telefono.replace(/\D/g, '');
              const link = encodeURIComponent(
                `⚠️ ¡Ayuda! Esta persona está en peligro. Revisa este audio urgente: ${publicUrl} y ubicación: https://maps.google.com/?q=${location.lat},${location.lon}`
              );
              window.open(`https://wa.me/52${tel}?text=${link}`, '_blank');
            });
          }
        }
      };

      mediaRecorder.start();
      toast({ title: '🎙️ Grabando...', description: 'Tu voz está siendo registrada. Se detendrá automáticamente en 6 segundos.' });
      setTimeout(() => mediaRecorder.stop(), 6000);
    } catch (err) {
      toast({ title: '🎤 No se pudo acceder al micrófono', description: err.message, variant: 'destructive' });
    }
  };

  const securityFeatures = [
    {
      icon: AlertTriangle,
      title: 'Grabación Urgente',
      description: 'Graba automáticamente cuando necesites auxilio de emergencia.',
      color: '#490000',
      detailedExplanation: {
        whatIs: 'Es una función de emergencia que inicia una grabación automática de 6 segundos cuando te encuentras en peligro.',
        howToActivate: 'Toca el botón flotante rojo con el ícono de triángulo de advertencia que aparece en la esquina superior derecha de tu pantalla.',
        whatHappens: [
          'Se activa inmediatamente una grabación de audio de 6 segundos',
          'El audio se envía automáticamente a tus contactos de emergencia',
          'Se registra tu ubicación actual junto con la grabación',
          'Tus contactos de confianza reciben una alerta inmediata con tu ubicación y el audio'
        ],
        importantNote: 'Esta función está diseñada para situaciones de emergencia real. Úsala responsablemente.'
      }
    },
    {
      icon: Share2,
      title: 'Acompáñame',
      description: 'Comparte tu ubicación en tiempo real con personas de confianza.',
      color: '#1A1E3D',
      detailedExplanation: {
        whatIs: 'Una herramienta de seguimiento en tiempo real que permite a tus contactos de confianza conocer tu ubicación mientras te desplazas.',
        howToActivate: 'Toca el botón flotante morado oscuro con el ícono de compartir que aparece en tu pantalla.',
        whatHappens: [
          'Se activa el seguimiento GPS en tiempo real de tu ubicación',
          'Tus contactos de emergencia reciben un enlace para seguir tu ruta',
          'Se actualiza tu posición cada pocos segundos mientras esté activo',
          'Puedes desactivarlo en cualquier momento tocando el mismo botón'
        ],
        importantNote: 'Ideal para cuando caminas sola de noche, vas a una cita o cualquier situación donde quieras que alguien sepa dónde estás.'
      }
    },
    {
      icon: PhoneCall,
      title: 'Llamada Segura',
      description: 'Simula una llamada telefónica para disuadir posibles amenazas.',
      color: '#877086',
      detailedExplanation: {
        whatIs: 'Una función que simula una llamada telefónica real reproduciendo conversaciones pregrabadas para hacerte parecer acompañada.',
        howToActivate: 'Toca el botón flotante gris-morado con el ícono de teléfono en tu pantalla.',
        whatHappens: [
          'Se reproduce inmediatamente un audio de conversación telefónica realista',
          'El audio sale por el altavoz del teléfono para que otros puedan escucharlo',
          'Puedes elegir entre diferentes tipos de conversaciones pregrabadas',
          'La "llamada" continúa hasta que decidas terminarla'
        ],
        importantNote: 'Perfecto para cuando te sientes insegura caminando sola o en situaciones incómodas donde necesitas parecer acompañada.'
      }
    },
  ];

  return (
    <div className="space-y-8">
      {/* Imagen de Seguridad con efecto cristal - EXACTO como BienestarCompleto */}
      <motion.div 
        className="relative py-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.05, y: -10 }}
            className="relative group cursor-pointer"
          >
            <div className="relative max-w-xs">
              <img 
                src="/images/Seguridad.jpg" 
                alt="Seguridad Personal"
                className="w-auto h-auto max-h-80 rounded-3xl shadow-xl group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              
              {/* Efecto de cristal */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-[0.5px] rounded-3xl border border-white/5 shadow-2xl z-10 group-hover:shadow-3xl transition-all duration-500"></div>
              
              {/* Overlay con brillo */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Efecto de luz flotante */}
              <motion.div
                className="absolute top-4 right-4 w-4 h-4 rounded-full opacity-0 group-hover:opacity-80"
                style={{ backgroundColor: '#382a3c' }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-primary font-serif mb-4">Defensa Inteligente</h1>
        <p className="text-brand-secondary/80 max-w-2xl mx-auto">
          Cada herramienta aquí fue creada para protegerte en cualquier situación. Siempre contigo, siempre segura.
        </p>
      </div>

      {/* Tarjetas informativas de seguridad con efecto cristal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/30 shadow-2xl cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${feature.color}15, ${feature.color}25, ${feature.color}10)`,
              boxShadow: `
                0 8px 32px ${feature.color}20,
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `,
            }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
            onClick={() => toggleCard(index)}
          >
            {/* Header de la tarjeta */}
            <div className="p-6 flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: feature.color }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-brand-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-brand-secondary/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedCards[index] ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0 ml-2"
              >
                <ChevronDown className="w-5 h-5 text-brand-secondary" />
              </motion.div>
            </div>

            {/* Contenido expandible */}
            <AnimatePresence>
              {expandedCards[index] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="border-t border-white/20"
                >
                  <div className="p-6 pt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-2 text-sm">
                        ¿Qué es esta función?
                      </h4>
                      <p className="text-xs text-brand-secondary/90 leading-relaxed">
                        {feature.detailedExplanation.whatIs}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-primary mb-2 text-sm">
                        ¿Cómo activarlo?
                      </h4>
                      <p className="text-xs text-brand-secondary/90 leading-relaxed">
                        {feature.detailedExplanation.howToActivate}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-primary mb-2 text-sm">
                        ¿Qué sucede cuando lo actives?
                      </h4>
                      <ul className="space-y-1">
                        {feature.detailedExplanation.whatHappens.map((item, i) => (
                          <li key={i} className="text-xs text-brand-secondary/90 leading-relaxed flex items-start">
                            <span className="mr-2 mt-1 w-1 h-1 bg-brand-accent rounded-full flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-3">
                      <h4 className="font-semibold text-brand-primary mb-1 text-sm">
                        📌 Importante
                      </h4>
                      <p className="text-xs text-brand-secondary/90 leading-relaxed">
                        {feature.detailedExplanation.importantNote}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SecurityFeaturesGrid;


