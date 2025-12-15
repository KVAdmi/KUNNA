import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import MenstrualCycleCalculator from '@/components/MenstrualCycleCalculator';
import supabase from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import jsPDF from 'jspdf';
import { Sparkles, Heart, Star, Lock } from 'lucide-react';

// Frases inspiracionales para la tarjeta diaria
const FRASES_INSPIRACIONALES = [
  "Respira, mujer. No tienes que correr para llegar a ti misma.",
  "No eres lo que te pasó, eres lo que decides ser hoy.",
  "Tu valor no se mide en aplausos, sino en tu paz.",
  "Está bien descansar, incluso las flores necesitan pausa para florecer.",
  "La calma también es fuerza.",
  "Eres suficiente, incluso en tus días más grises.",
  "Tu suavidad no te hace débil, te hace mágica.",
  "A veces, el paso más valiente es permitirte sanar.",
  "No todo en ti necesita arreglo, hay partes perfectas tal como están.",
  "No tienes que cargar con todo, suelta lo que no es tuyo.",
  "Mujer, el mundo necesita tu voz, no tu silencio.",
  "Lo que hoy parece montaña, mañana será tu paisaje favorito.",
  "No subestimes lo que eres capaz de lograr con fe y determinación.",
  "Brilla, aunque a otros les moleste la luz.",
  "Tus sueños no son demasiado grandes, solo esperan a que tú te lo creas.",
  "Rompe el molde, no naciste para encajar.",
  "Cada paso que das con valentía, abre camino para otras mujeres.",
  "Si tiemblas, que sea de emoción, no de miedo.",
  "Hay fuego en tu alma, no lo apagues por complacer a otros.",
  "La mujer que serás mañana te agradecerá por no rendirte hoy.",
  "Eres la obra maestra de un Creador que no comete errores.",
  "Basta mirarte al espejo para recordar la belleza que Dios puso en ti.",
  "No caminas sola, Él va delante de ti.",
  "Eres hija del Rey, no olvides enderezar tu corona.",
  "Cuando sientas que no puedes, recuerda quién te sostiene.",
  "Tus lágrimas no caen en vano, son vistas y guardadas en el cielo.",
  "Tu propósito fue escrito mucho antes de que nacieras.",
  "Cada cicatriz es testimonio de la gracia que te sostiene.",
  "La fe no te quita problemas, pero te da alas para sobrevolarlos.",
  "No hay nada que el amor de Dios no pueda restaurar en ti.",
  "No eres frágil, eres dinamita en calma.",
  "Si alguien duda de ti, que lo haga… mientras tú avanzas.",
  "Tu mejor venganza es tu propia superación.",
  "No necesitas aprobación para ser grandiosa.",
  "La fuerza que buscas está en tus propias manos.",
  "Eres capaz de escribir un nuevo capítulo en cualquier momento.",
  "No te detengas hasta que estés orgullosa.",
  "Ser mujer es llevar un huracán en el pecho y aún así sonreír.",
  "Si no encuentras la puerta, construye una.",
  "La vida no espera a que tengas miedo, así que muévete con él.",
  "Caer no es fracasar, fracasar es no levantarse.",
  "No dejes que una página mala arruine todo tu libro.",
  "Todo lo que perdiste dejó espacio para lo que mereces.",
  "Las tormentas también limpian el aire.",
  "Lo que hoy duele, mañana será tu fuerza.",
  "Aprende a bailar bajo la lluvia, no solo a esperar el sol.",
  "No eres la misma de antes, y eso es un regalo.",
  "Las heridas enseñan más que los triunfos fáciles.",
  "No te quedes mirando la puerta cerrada, busca la que se está abriendo.",
  "Cada final es una oportunidad disfrazada.",
  "No naciste para ser sombra, naciste para ser luz.",
  "No dejes que nadie te haga sentir pequeña, ni siquiera tú misma.",
  "Tu historia inspira más de lo que crees.",
  "Eres más fuerte de lo que imaginas y más hermosa de lo que ves.",
  "No te disculpes por ser intensa, el fuego no pide perdón por arder.",
  "La mujer que se conoce a sí misma es imparable.",
  "No tienes que ser perfecta para ser poderosa.",
  "Eres la arquitecta de tu vida, no la inquilina.",
  "No necesitas permiso para brillar.",
  "Cuando una mujer despierta, todo su mundo cambia.",
  "Basta de esperar el momento perfecto, empieza ahora.",
  "No más excusas, mujer, tus sueños no se cumplen solos.",
  "Mírate al espejo y recuerda: eres un milagro en movimiento.",
  "Si sigues dudando, el miedo ganará.",
  "No busques validación, busca acción.",
  "No eres un borrador, eres la versión final.",
  "Si no lo intentas, el 'qué hubiera pasado' te perseguirá.",
  "Deja de pedir permiso para ser tú.",
  "No vivas en automático, despierta.",
  "Tu reflejo es la prueba de que Dios hizo algo increíble.",
  "Trátate como tratarías a la persona que más amas.",
  "No cambies para que te amen, ámate y lo demás llegará.",
  "No necesitas que nadie te salve, ya te tienes a ti.",
  "Tu cuerpo no es tu enemigo, es tu casa.",
  "Quiérete tanto que no quepa nada menos.",
  "No compares tu capítulo 1 con el capítulo 20 de otra.",
  "Hablarte bonito también es sanación.",
  "Ámate lo suficiente para alejarte de lo que te apaga.",
  "La belleza comienza cuando decides ser tú misma.",
  "La mujer más atractiva es la que se ama sin reservas.",
  "Lidera con el ejemplo, no con la perfección.",
  "No sigas caminos, constrúyelos.",
  "Tus ideas pueden mover montañas si tú te lo crees.",
  "El mundo necesita más mujeres que se atrevan.",
  "Tu visión vale más que la opinión de otros.",
  "No te conformes con una silla en la mesa, diseña tu propia mesa.",
  "Un paso firme vale más que mil dudas.",
  "La grandeza empieza con una decisión.",
  "Si no ves la oportunidad, créala.",
  "No esperes a sentirte lista, actúa y lo estarás.",
  "Vive de forma que tu historia inspire.",
  "Deja huellas, no cicatrices en otros.",
  "No importa cuán lento vayas, lo importante es no detenerte.",
  "El propósito es más grande que cualquier obstáculo.",
  "Lo que siembres hoy, lo cosecharán otras mujeres mañana.",
  "Tu vida es el mensaje que dejas al mundo.",
  "Haz que tu existencia cuente.",
  "La pasión mueve más que el miedo.",
  "Un corazón valiente deja un legado eterno.",
  "Eres la respuesta a las oraciones de muchas que vinieron antes."
];

// Componente de la tarjeta inspiracional
const TarjetaInspiracional = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [fraseDelDia, setFraseDelDia] = useState('');

  useEffect(() => {
    // Obtener frase del día basada en la fecha actual
    const hoy = new Date();
    const seed = hoy.getFullYear() * 10000 + (hoy.getMonth() + 1) * 100 + hoy.getDate();
    const indice = seed % FRASES_INSPIRACIONALES.length;
    setFraseDelDia(FRASES_INSPIRACIONALES[indice]);
  }, []);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full h-64 perspective-1000 mb-6">
      <motion.div
        className="relative w-full h-full tarjeta-container cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 120, damping: 15 }}
        onClick={handleFlip}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Parte trasera - Mensaje inicial */}
        <div 
          className={`tarjeta-face tarjeta-back glass-inspirational backdrop-blur-xl bg-gradient-to-br from-brand-background/40 via-white/20 to-brand-accent/20 border-2 border-white/40 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 text-center ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-4"
          >
            <Sparkles className="w-12 h-12 text-brand-accent" />
          </motion.div>
          <h3 className="text-lg font-bold text-brand-primary mb-2">
            Mensaje del Universo
          </h3>
          <p className="text-sm text-brand-primary/80 leading-relaxed">
            Descubre lo que el universo quiere decirte hoy
          </p>
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-4 flex gap-2"
          >
            <Star className="w-4 h-4 text-brand-highlight" />
            <Heart className="w-4 h-4 text-brand-accent" />
            <Star className="w-4 h-4 text-brand-highlight" />
          </motion.div>
          <p className="text-xs text-brand-secondary/70 mt-3">Toca para revelar</p>
        </div>

        {/* Parte delantera - Frase inspiracional */}
        <div 
          className={`tarjeta-face tarjeta-front glass-inspirational backdrop-blur-xl bg-gradient-to-br from-brand-accent/30 via-brand-background/20 to-brand-secondary/15 border-2 border-white/40 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 text-center ${!isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isFlipped ? 1 : 0, opacity: isFlipped ? 1 : 0 }}
            transition={{ delay: isFlipped ? 0.4 : 0, duration: 0.6 }}
            className="mb-4"
          >
            <Heart className="w-8 h-8 text-brand-accent" />
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ 
              y: isFlipped ? 0 : 20, 
              opacity: isFlipped ? 1 : 0 
            }}
            transition={{ delay: isFlipped ? 0.6 : 0, duration: 0.8 }}
            className="text-sm md:text-base font-medium text-brand-primary leading-relaxed italic"
          >
            "{fraseDelDia}"
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ delay: isFlipped ? 1 : 0, duration: 0.5 }}
            className="mt-4 flex gap-1"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: isFlipped ? [0.3, 1, 0.3] : 0 }}
                transition={{ 
                  duration: 1.5, 
                  repeat: isFlipped ? Infinity : 0, 
                  delay: i * 0.2 
                }}
              >
                <Sparkles className="w-3 h-3 text-brand-secondary" />
              </motion.div>
            ))}
          </motion.div>
          <p className="text-xs text-brand-secondary/70 mt-3">Toca para volver</p>
        </div>
      </motion.div>
    </div>
  );
};

const DiarioPersonal = () => {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [contenido, setContenido] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipo, setTipo] = useState('texto');
  const [archivoUrl, setArchivoUrl] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [diasConEntrada, setDiasConEntrada] = useState([]);
  const [entradaGuardada, setEntradaGuardada] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

const generarPDF = async () => {
  const doc = new jsPDF('p', 'mm', 'a4');

  const fechaFormateada = new Date(fechaSeleccionada).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const img = new Image();
  img.src = '/images/formato_pdf_diario.png'; // Asegúrate que esté en public/images/

  img.onload = () => {
    doc.addImage(img, 'PNG', 0, 0, 210, 297); // Fondo en toda la hoja

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(56, 42, 60);
    doc.text(titulo || 'Sin título', 105, 45, { align: 'center' });

    // Fecha
    doc.setFont('courier', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text(`Fecha: ${fechaFormateada}`, 105, 55, { align: 'center' });

    // Contenido
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(33);
    const texto = doc.splitTextToSize(contenido, 170);
    doc.text(texto, 20, 75);

    // Pie
    doc.setFont('courier', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Gracias por escribir. Este espacio también es amor propio.', 105, 280, { align: 'center' });

    // Descargar
    const nombreArchivo = `${(titulo || 'diario').replace(/\s+/g, '_')}_${fechaFormateada}.pdf`;
    doc.save(nombreArchivo);
  };
};




  const obtenerFechasConContenido = async () => {
    if (!user) return;
    const inicioMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1);
    const finMes = new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth() + 1, 0);

    const { data } = await supabase
      .from('diario_personal')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', inicioMes.toISOString())
      .lte('created_at', finMes.toISOString());

    if (data) {
      const dias = data.map((item) => new Date(item.created_at).toDateString());
      setDiasConEntrada(dias);
    }
  };

  const fetchEntrada = async () => {
    setMensaje(null);
    const inicioDia = new Date(fechaSeleccionada);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaSeleccionada);
    finDia.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('diario_personal')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', inicioDia.toISOString())
      .lte('created_at', finDia.toISOString())
      .single();

    if (data) {
      setContenido(data.contenido || '');
      setTitulo(data.titulo || '');
      setTipo(data.tipo || 'texto');
      setArchivoUrl(data.archivo_url || '');
      setEntradaGuardada(true);
    } else {
      setContenido('');
      setTitulo('');
      setTipo('texto');
      setArchivoUrl('');
      setEntradaGuardada(false);
    }

    if (error && error.code !== 'PGRST116') {
      setMensaje('No se pudieron cargar las entradas.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchEntrada();
      obtenerFechasConContenido();
    }
  }, [fechaSeleccionada, user]);

  // Función para manejar la selección de fecha del calendario
  const handleDateSelect = (date) => {
    // Guardar la posición actual del scroll
    const currentScrollY = window.scrollY;
    
    setFechaSeleccionada(date);
    setMostrarFormulario(true);
    
    // Restaurar la posición del scroll inmediatamente
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 50);
    
    // Después hacer un scroll suave al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.formulario-diario');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }
    }, 150);
  };

  const guardarEntrada = async () => {
    if (!contenido.trim() && tipo === 'texto') return;

    const { error } = await supabase.from('diario_personal').upsert({
      user_id: user.id,
      created_at: fechaSeleccionada.toISOString(),
      contenido,
      titulo,
      tipo,
      archivo_url: archivoUrl || null,
      descargado: false,
    });

    if (!error) {
      setMensaje('Guardado solo para ti 💜');
      setEntradaGuardada(true);
      obtenerFechasConContenido();
      
      // Cerrar el formulario automáticamente después de guardar
      setTimeout(() => {
        setMostrarFormulario(false);
      }, 1500); // Espera 1.5 segundos para que vea el mensaje
    } else {
      setMensaje('Error al guardar');
    }
  };

  const subirArchivo = async (file) => {
    if (!file) return;

    const ext = file.name.split('.').pop();
    const isAudio = file.type.startsWith('audio');
    const isVideo = file.type.startsWith('video');

    const fileURL = URL.createObjectURL(file);
    const media = document.createElement(isAudio ? 'audio' : 'video');
    media.src = fileURL;

    await new Promise((resolve) => {
      media.onloadedmetadata = () => {
        const duracion = media.duration;
        URL.revokeObjectURL(fileURL);
        if (duracion > 60) {
          setMensaje('El archivo no debe durar más de 1 minuto ⏱️');
        } else {
          resolve();
        }
      };
    });

    if (mensaje) return;

    const filePath = `${user.id}/diario/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('diario-personal')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      setMensaje('Error al subir el archivo');
      return;
    }

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('diario-personal')
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 días

    if (signedUrlData?.signedUrl) {
      setArchivoUrl(signedUrlData.signedUrl);
      setMensaje('Archivo subido exitosamente 💾');
    } else {
      setMensaje('Error al obtener la URL del archivo');
    }
  };

  const marcarDias = (date) =>
    diasConEntrada.includes(date.toDateString()) ? 'dia-con-entrada' : undefined;

  return (
    <div className="min-h-screen relative overflow-hidden p-4"
         style={{
           background: 'linear-gradient(135deg, rgba(56, 42, 60, 0.08) 0%, rgba(200, 166, 166, 0.12) 20%, rgba(245, 230, 255, 0.18) 40%, rgba(141, 117, 131, 0.10) 60%, rgba(193, 212, 58, 0.06) 80%, rgba(245, 230, 255, 0.12) 100%)'
         }}>
      
      {/* Efectos de fondo vintage mejorados */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Papel vintage textura */}
        <div className="absolute inset-0 opacity-8"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.05'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23382a3c'/%3E%3C/g%3E%3C/svg%3E")`,
             }}
        ></div>
        
        {/* Orbes flotantes vintage mejorados */}
        <motion.div
          className="absolute top-20 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-12"
          style={{ background: 'radial-gradient(circle, rgba(200, 166, 166, 0.6), transparent 70%)' }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.08, 0.18, 0.08]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div
          className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(245, 230, 255, 0.8), transparent 70%)' }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.12, 0.22, 0.12]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div
          className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(141, 117, 131, 0.5), transparent 70%)' }}
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.06, 0.16, 0.06]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
      </div>
      
      {/* Contenedor principal con z-index */}
      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Imagen centrada con efecto cristal ultra sutil y máxima claridad */}
        <div className="flex justify-center mb-8">
          <div className="relative group cursor-pointer max-w-md">
            <img 
              src="/images/Diario.jpg"
              alt="Diario Personal - Tu refugio emocional"
              className="w-auto h-auto max-h-80 rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
              style={{ filter: 'sepia(10%) saturate(110%) contrast(95%) brightness(102%)' }}
            />
            {/* Efecto cristal ultra sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-[0.5px] rounded-3xl border border-white/5 shadow-2xl z-10 group-hover:shadow-3xl transition-all duration-700 pointer-events-none"></div>
            {/* Marco vintage decorativo */}
            <div className="absolute -inset-2 rounded-3xl border-2 border-white/5 opacity-10 pointer-events-none"></div>
          </div>
  </div>
        
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, rgba(200, 166, 166, 0.3), transparent 70%)' }}
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
      </div>



      {/* Contenedor principal con estilo vintage mejorado */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div 
          className="backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative border"
          style={{
            background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.28), rgba(200, 166, 166, 0.18), rgba(255, 255, 255, 0.25), rgba(141, 117, 131, 0.12))',
            borderColor: 'rgba(245, 230, 255, 0.4)',
            boxShadow: '0 25px 50px -12px rgba(200, 166, 166, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-center mb-3 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            style={{
              fontFamily: "'Questrial', serif",
              background: 'linear-gradient(135deg, #382a3c 0%, #8d7583 50%, #c8a6a6 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(1px 2px 4px rgba(56, 42, 60, 0.2))',
            }}
          >
            <motion.span
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'linear-gradient(135deg, #382a3c 0%, #8d7583 50%, #c8a6a6 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Tu Refugio Personal para Sentir
            </motion.span>
          </motion.h1>

          <motion.div 
            className="text-center mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-lg leading-relaxed font-medium" 
               style={{ 
                 color: '#382a3c',
                 fontFamily: "'Questrial', serif"
               }}>
              Aquí puedes escribir todo lo que sientes, sin filtros y sin juicios. Desahógate, canta, grita, ríe o llora… y si quieres, vuelve a escucharte después. Este es tu refugio emocional, un lugar para plasmar tus pensamientos más íntimos y liberar lo que llevas dentro.
            </p>
            
            <motion.div 
              className="flex items-center justify-center gap-4 rounded-2xl p-6 border shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(245, 230, 255, 0.2))',
                borderColor: 'rgba(245, 230, 255, 0.4)'
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Lock className="w-7 h-7" style={{ color: '#c8a6a6' }} />
              </motion.div>
              <div className="text-left">
                <p className="text-sm font-bold mb-1" style={{ color: '#382a3c' }}>
                  Privacidad Sagrada
                </p>
                <p className="text-sm leading-relaxed" style={{ color: '#8d7583' }}>
                  Tu información está cifrada y ni siquiera los administradores pueden verla. Lo que escribes aquí, se queda aquí.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Calendario Menstrual con estilo vintage */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="backdrop-blur-lg rounded-2xl p-6 border shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, rgba(245, 230, 255, 0.2), rgba(200, 166, 166, 0.1))',
                   borderColor: 'rgba(245, 230, 255, 0.3)'
                 }}>
              <MenstrualCycleCalculator />
            </div>
          </motion.div>

          {/* Layout responsivo: Calendario y Tarjeta Inspiracional */}
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            {/* Calendario del Diario con estilo vintage */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-lg rounded-2xl p-6 border shadow-lg"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(245, 230, 255, 0.2))',
                     borderColor: 'rgba(245, 230, 255, 0.4)'
                   }}>
                <Calendar
                  selected={fechaSeleccionada}
                  onSelect={handleDateSelect}
                  className="w-full"
                  modifiers={{ highlighted: (date) => diasConEntrada.includes(date.toDateString()) }}
                  modifiersClassNames={{ highlighted: 'dia-con-entrada' }}
                />
              </div>
            </div>

            {/* Tarjeta Inspiracional con efecto vintage */}
            <motion.div 
              className="lg:col-span-1 flex flex-col justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative p-6 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white/70 to-pink-50/60 backdrop-blur-sm border border-white/40 shadow-2xl">
                
                <TarjetaInspiracional />
                
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sección de entrada del diario con atmósfera vintage */}
        <AnimatePresence>
          {mostrarFormulario && (
            <motion.div 
              className="formulario-diario relative mt-8 p-8 rounded-3xl bg-gradient-to-br from-amber-50/70 via-white/80 to-pink-50/60 backdrop-blur-lg border border-white/50 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
            {/* Decoración vintage superior */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-12 h-6 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full opacity-60" />
            </div>

            {/* Botón para cerrar el formulario */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white/90 border border-amber-200/50 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-all duration-300"
              >
                ×
              </button>
            </div>

            <label
              className="block mb-4 text-lg font-['Questrial'] font-medium"
              style={{ color: '#382a3c' }}
            >
              Entrada para: <strong className="text-amber-700">
                {fechaSeleccionada?.toLocaleDateString?.()}
              </strong>
            </label>
            
            {!entradaGuardada ? (
              <div className="space-y-6">
                {/* Campo de título con estilo vintage */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Título de tu entrada..."
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-white/80 to-amber-50/60 text-black placeholder-zinc-500 border border-amber-200/50 shadow-lg focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300 transition-all duration-300 font-['Questrial']"
                  />
                </div>

                {/* Selector de tipo con estilo vintage */}
                <div className="flex items-center gap-4">
                  <label className="font-medium text-lg font-['Questrial']" style={{ color: '#382a3c' }}>
                    Tipo de entrada:
                  </label>
                  <select 
                    value={tipo} 
                    onChange={(e) => setTipo(e.target.value)} 
                    className="bg-gradient-to-r from-white/90 to-amber-50/70 text-black px-4 py-2 rounded-xl shadow-lg border border-amber-200/50 focus:ring-2 focus:ring-amber-300/50 transition-all duration-300 font-['Questrial']"
                  >
                    <option value="texto">Texto</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                {tipo === 'texto' ? (
                  <textarea
                    value={contenido}
                    onChange={(e) => setContenido(e.target.value)}
                    rows={6}
                    placeholder="¿Cómo te sientes hoy? Escribe aquí tu descarga emocional..."
                    className="w-full p-4 rounded-xl shadow bg-white/60 text-black placeholder-zinc-600 border border-white/40"
                  />
                ) : (
                  <div className="mt-4">
                    <label className="block mb-2" style={{ color: '#382a3c' }}>
                      {tipo === 'audio' ? 'Sube un audio (máx. 1 min)' : 'Sube un video (máx. 1 min)'}
                    </label>
                    <input
                      type="file"
                      accept={tipo === 'audio' ? 'audio/*' : 'video/*'}
                      onChange={(e) => subirArchivo(e.target.files[0])}
                      className="block w-full text-sm text-[#382a3c] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/80 file:text-[#382a3c] hover:file:bg-white transition"
                    />
                  </div>
                )}

                <button onClick={guardarEntrada} className="mt-6 bg-[#c8a6a6] hover:bg-[#b58c8c] text-white py-2 px-6 rounded-full shadow transition">
                  Guardar entrada
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold mt-4 mb-2">{titulo}</h2>
                {tipo === 'texto' && (
                  <>
                    <p className="text-black bg-white/60 p-4 rounded-xl whitespace-pre-wrap">{contenido}</p>
                    {contenido && (
                      <div className="text-center mt-4">
                        <button
                          onClick={generarPDF}
                          className="px-6 py-2 bg-[#c1d43a] hover:bg-[#b5ca33] text-white rounded-full shadow transition duration-300"
                        >
                          Descargar en PDF
                        </button>
                      </div>
                    )}
                  </>
                )}

                {tipo === 'audio' && archivoUrl && (
                  <audio controls src={archivoUrl} className="mt-4 w-full rounded-xl border border-white/50 bg-white/70" />
                )}
                {tipo === 'video' && archivoUrl && (
                  <video controls src={archivoUrl} className="mt-4 w-full rounded-xl border border-white/50 bg-white/70 max-h-[400px]" />
                )}
              </>
            )}

            {mensaje && (
              <p className="mt-4 text-sm italic text-center transition-all" style={{ color: '#382a3c' }}>
                {mensaje}
              </p>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiarioPersonal;











