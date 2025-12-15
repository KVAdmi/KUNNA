import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lightbulb, Home, Briefcase, Clock, DollarSign, ChevronDown, ChevronUp, 
  Mail, Send, Sparkles, Search, Wallet, Timer, Crown, Gift 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// NOTE: Datos mock. El dev podrá sustituir por Supabase más tarde.
const IDEAS = [
  {
    id: "packs-plantillas",
    titulo: "Packs de plantillas (Canva / Docs)",
    inversion: 0,
    tiempo: "2h/día",
    skills: ["creatividad", "ventas"],
    roi: "Alto",
    pasos: ["Detecta nicho", "Diseña 10–20 plantillas", "Vende en IG y marketplaces"],
    descripcion: "Crea packs de plantillas digitales para redes sociales, presentaciones o documentos. Es una excelente forma de monetizar tu creatividad sin inversión inicial.",
    detalles: [
      "Investiga nichos rentables en Pinterest y Etsy",
      "Usa Canva Pro o Figma para crear diseños únicos",
      "Organiza en packs temáticos (bodas, negocios, fitness)",
      "Vende en Etsy, Gumroad o tu propio Instagram",
      "Automatiza entregas con enlaces de descarga"
    ],
    ingresoPromedio: "$5,100-13,600 MXN/mes",
    dificultad: "Principiante"
  },
  {
    id: "asistente-ia",
    titulo: "Asistente virtual con IA para negocios",
    inversion: 500,
    tiempo: "3h/día",
    skills: ["ops", "tech", "ventas"],
    roi: "Medio–Alto",
    pasos: ["Define paquetes", "Configura flujos y prompts", "Cierra por WhatsApp"],
    descripcion: "Ofrece servicios de asistencia virtual potenciados con IA para automatizar tareas de pequeños negocios y emprendedores.",
    detalles: [
      "Aprende herramientas como ChatGPT, Zapier, Make",
      "Crea templates para respuestas automáticas",
      "Ofrece servicios: gestión de redes, emails, scheduling",
      "Cobra por horas o paquetes mensuales",
      "Escala contratando más asistentes virtuales"
    ],
    ingresoPromedio: "$8,500-25,500 MXN/mes",
    dificultad: "Intermedio"
  },
  {
    id: "edicion-corta",
    titulo: "Edición de video corto para marcas",
    inversion: 1500,
    tiempo: "4h/día",
    skills: ["creatividad", "edición"],
    roi: "Alto",
    pasos: ["Define estilo", "Crea 5 demos", "Plan mensual por cliente"],
    descripcion: "Especialízate en crear contenido viral para TikTok, Instagram Reels y YouTube Shorts. El video corto es el futuro del marketing digital.",
    detalles: [
      "Domina CapCut, Premiere Pro o DaVinci Resolve",
      "Estudia tendencias virales y hooks efectivos",
      "Crea un portfolio con diferentes estilos",
      "Ofrece paquetes de 10-30 videos por mes",
      "Cobra entre $850-3,400 MXN por video según complejidad"
    ],
    ingresoPromedio: "$17,000-51,000 MXN/mes",
    dificultad: "Intermedio-Avanzado"
  },
  {
    id: "balsamos-naturales",
    titulo: "Bálsamos y cremas naturales",
    inversion: 800,
    tiempo: "3h/día",
    skills: ["creatividad", "salud", "ventas"],
    roi: "Alto",
    pasos: ["Aprende formulación", "Consigue ingredientes", "Crea marca personal", "Vende online"],
    descripcion: "Crea productos de cuidado personal naturales y orgánicos. El mercado de cosmética natural crece 8% anual y tiene márgenes excelentes.",
    detalles: [
      "Estudia formulación básica de cosmética natural",
      "Consigue proveedores de aceites, mantecas y esencias",
      "Desarrolla 5-10 productos base (labiales, cremas, exfoliantes)",
      "Obtén registros sanitarios básicos requeridos",
      "Crea packaging eco-friendly y marca personal",
      "Vende en mercados locales, ferias y redes sociales"
    ],
    ingresoPromedio: "$10,200-30,600 MXN/mes",
    dificultad: "Intermedio"
  },
  {
    id: "pan-keto",
    titulo: "Panadería keto especializada",
    inversion: 1200,
    tiempo: "4h/día",
    skills: ["repostería", "salud", "ventas"],
    roi: "Medio-Alto",
    pasos: ["Domina recetas keto", "Invierte en equipos", "Construye clientela", "Escala producción"],
    descripcion: "Especialízate en productos de panadería cetogénicos. Nicho en crecimiento con clientes dispuestos a pagar premium por alternativas saludables.",
    detalles: [
      "Perfecciona 15-20 recetas keto (panes, postres, snacks)",
      "Invierte en horno profesional y herramientas especializadas",
      "Calcula macros precisos para cada producto",
      "Construye marca en comunidades keto y fitness",
      "Ofrece suscripciones semanales y pedidos personalizados",
      "Expande a catering para eventos fitness y wellness"
    ],
    ingresoPromedio: "$13,600-37,400 MXN/mes",
    dificultad: "Intermedio-Avanzado"
  },
  {
    id: "velas-aromaticas",
    titulo: "Velas aromáticas artesanales",
    inversion: 600,
    tiempo: "2h/día",
    skills: ["creatividad", "artesanía", "ventas"],
    roi: "Alto",
    pasos: ["Aprende técnicas", "Crea diseños únicos", "Construye marca", "Vende online"],
    descripcion: "Crea velas aromáticas artesanales personalizadas. Mercado estable con alta demanda en decoración y regalos especiales.",
    detalles: [
      "Domina técnicas de velas de soja, parafina y cera de abeja",
      "Desarrolla fragancias signature únicas",
      "Crea diseños estacionales y temáticos",
      "Invierte en moldes profesionales y mechas de calidad",
      "Construye presencia en Instagram y Pinterest",
      "Ofrece talleres y experiencias de creación de velas"
    ],
    ingresoPromedio: "$8,500-23,800 MXN/mes",
    dificultad: "Principiante-Intermedio"
  },
  {
    id: "coaching-fitness",
    titulo: "Coaching fitness online",
    inversion: 300,
    tiempo: "3h/día",
    skills: ["fitness", "comunicación", "ventas"],
    roi: "Alto",
    pasos: ["Obtén certificación", "Crea contenido", "Construye audiencia", "Monetiza servicios"],
    descripcion: "Ofrece servicios de entrenamiento y nutrición online. El fitness digital creció 400% post-pandemia y sigue en expansión.",
    detalles: [
      "Obtén certificación en entrenamiento personal o nutrición",
      "Crea programas de entrenamiento escalables",
      "Desarrolla contenido educativo en TikTok e Instagram",
      "Ofrece consultoría 1-a-1 y programas grupales",
      "Crea app o plataforma para seguimiento de clientes",
      "Expande a productos digitales (ebooks, cursos)"
    ],
    ingresoPromedio: "$11,900-42,500 MXN/mes",
    dificultad: "Intermedio"
  },
];

const Tag = ({ children, icon: Icon }) => (
  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-brand-accent/20 to-brand-secondary/20 text-brand-primary font-medium backdrop-blur-sm border border-white/20">
    {Icon && <Icon className="h-3 w-3" />}
    {children}
  </span>
);

const getInvestmentIcon = (inversion) => {
  if (inversion === 0) return Gift;
  if (inversion <= 500) return Wallet;
  if (inversion <= 2000) return DollarSign;
  return Crown;
};

const IdeaCard = ({ idea, onVer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative overflow-hidden rounded-3xl glass-effect backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col"
    >
      {/* Gradient overlay for glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-brand-accent/10 pointer-events-none" />
      
      {/* Floating sparkles effect */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles className="h-5 w-5 text-brand-accent animate-pulse" />
      </div>

      <div className="relative p-6 space-y-4 flex flex-col h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-brand-accent to-brand-secondary flex-shrink-0">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-brand-primary group-hover:text-brand-secondary transition-colors leading-tight line-clamp-2">
                {idea.titulo}
              </h3>
              <p className="text-sm text-brand-secondary/80 font-medium mt-1">
                {idea.dificultad} • {idea.ingresoPromedio}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-sm text-brand-primary/70 leading-relaxed line-clamp-3">
            {idea.descripcion}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[60px] items-start">
          <Tag icon={getInvestmentIcon(idea.inversion)}>
            {idea.inversion === 0 ? "Sin inversión" : `$${idea.inversion.toLocaleString()} MXN`}
          </Tag>
          <Tag icon={Clock}>
            {idea.tiempo}
          </Tag>
          <Tag icon={Sparkles}>
            {idea.roi}
          </Tag>
          {idea.skills.slice(0, 2).map(s => <Tag key={s}>{s}</Tag>)}
          {idea.skills.length > 2 && (
            <Tag>+{idea.skills.length - 2} más</Tag>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 border-t border-white/20 pt-4"
            >
              <div>
                <h4 className="font-semibold text-brand-primary mb-2">Pasos detallados:</h4>
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {idea.detalles.map((detalle, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm text-brand-primary/80"
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-accent text-white text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="flex-1">{detalle}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-2 mt-auto">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="flex-1 bg-white/20 border-white/30 hover:bg-white/30 text-brand-primary backdrop-blur-sm text-xs"
          >
            {isExpanded ? (
              <>Menos detalles <ChevronUp className="ml-1 h-3 w-3" /></>
            ) : (
              <>Ver guía completa <ChevronDown className="ml-1 h-3 w-3" /></>
            )}
          </Button>
          <Button 
            onClick={() => onVer(idea)}
            size="sm"
            className="bg-gradient-to-r from-brand-accent to-brand-secondary hover:from-brand-secondary hover:to-brand-accent text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs px-4"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Empezar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function EmprendeEnCasa() {
  const [filtroInversion, setFiltroInversion] = useState("todas");
  const [filtroTiempo, setFiltroTiempo] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const ideasFiltradas = useMemo(() => {
    return IDEAS.filter(i => {
      const invOK =
        filtroInversion === "todas" ||
        (filtroInversion === "0" && i.inversion === 0) ||
        (filtroInversion === "500" && i.inversion > 0 && i.inversion <= 500) ||
        (filtroInversion === "2000" && i.inversion > 500 && i.inversion <= 2000) ||
        (filtroInversion === "2001" && i.inversion > 2000);

      const timeOK = filtroTiempo === "todas" || i.tiempo.startsWith(filtroTiempo);
      const searchOK =
        !busqueda ||
        i.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        i.descripcion.toLowerCase().includes(busqueda.toLowerCase());

      return invOK && timeOK && searchOK;
    });
  }, [filtroInversion, filtroTiempo, busqueda]);

  const verIdea = (idea) => {
    // TODO: abrir modal / navegar a detalle cuando esté listo
    console.log("verIdea", idea.id);
  };

  const enviarIdea = () => {
    const asunto = "Nueva idea de emprendimiento - KUNNA App";
    const cuerpo = `Hola equipo de KUNNA,

Me gustaría compartir una idea de emprendimiento:

[Describe tu idea aquí]

Información adicional:
- Inversión estimada: 
- Tiempo disponible: 
- Habilidades que tengo: 
- Mercado objetivo: 

¡Espero sus comentarios!

Saludos,
[Tu nombre]`;

    const mailtoLink = `mailto:soporte@kunna.app?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-white to-brand-accent/10 p-4 pb-24 space-y-8">
      <Helmet>
        <title>Emprende en Casa - KUNNA</title>
        <meta name="description" content="Microideas rentables, paso a paso y sin humo." />
      </Helmet>

      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-3 glass-effect px-6 py-4 rounded-full border border-white/30 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-lg bg-gradient-to-br from-brand-accent to-brand-secondary">
              <Home className="h-7 w-7 text-white" />
            </div>
          </div>
          <span className="text-brand-primary font-semibold">Emprende en Casa</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent leading-tight">
            Convierte tu talento en ingreso.
            <br />
            <span className="text-brand-highlight">Hoy.</span>
          </h1>
          <p className="text-brand-secondary/80 text-lg max-w-2xl mx-auto leading-relaxed">
            Ideas probadas, inversión baja y pasos claros para emprender desde casa.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button 
            size="lg"
            className="bg-gradient-to-r from-brand-accent to-brand-secondary hover:from-brand-secondary hover:to-brand-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-3"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Ver ideas
          </Button>
          
          <Button 
            onClick={enviarIdea}
            variant="outline" 
            size="lg"
            className="group glass-effect border-2 border-brand-accent/30 hover:border-brand-accent text-brand-primary hover:text-white hover:bg-brand-accent backdrop-blur-xl transition-all duration-300 px-8 py-3"
          >
            <Mail className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Enviar mi idea
            <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="relative">
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
            <Wallet className="h-5 w-5 text-brand-accent" />
          </div>
          <select
            className="w-full rounded-2xl border border-white/30 p-4 pr-14 glass-effect backdrop-blur-xl bg-white/10 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all duration-300 hover:border-brand-secondary text-brand-primary font-medium appearance-none"
            value={filtroInversion}
            onChange={(e) => setFiltroInversion(e.target.value)}
          >
            <option value="todas">Inversión (todas)</option>
            <option value="0">Sin inversión</option>
            <option value="500">Hasta $500</option>
            <option value="2000">$501–$2,000</option>
            <option value="2001">$2,001+</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
            <Timer className="h-5 w-5 text-brand-accent" />
          </div>
          <select
            className="w-full rounded-2xl border border-white/30 p-4 pr-14 glass-effect backdrop-blur-xl bg-white/10 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all duration-300 hover:border-brand-secondary text-brand-primary font-medium appearance-none"
            value={filtroTiempo}
            onChange={(e) => setFiltroTiempo(e.target.value)}
          >
            <option value="todas">Tiempo (todas)</option>
            <option value="2">2h/día</option>
            <option value="3">3h/día</option>
            <option value="4">4h/día</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
            <Search className="h-5 w-5 text-brand-accent" />
          </div>
          <input
            className="w-full rounded-2xl border border-white/30 p-4 pr-14 glass-effect backdrop-blur-xl bg-white/10 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition-all duration-300 hover:border-brand-secondary text-brand-primary font-medium placeholder-brand-secondary/60"
            placeholder="Buscar idea perfecta..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr"
      >
        {ideasFiltradas.map((idea, index) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.2 }}
            className="h-full"
          >
            <IdeaCard idea={idea} onVer={verIdea} />
          </motion.div>
        ))}
      </motion.div>

      {ideasFiltradas.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="glass-effect rounded-3xl p-8 border border-white/20 backdrop-blur-xl max-w-md mx-auto">
            <Lightbulb className="h-16 w-16 text-brand-accent mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-brand-primary mb-2">
              No encontramos ideas con esos filtros
            </h3>
            <p className="text-brand-secondary/70 mb-4">
              Intenta ajustar los filtros o envíanos tu propia idea
            </p>
            <Button 
              onClick={enviarIdea}
              className="bg-gradient-to-r from-brand-accent to-brand-secondary text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar mi idea
            </Button>
          </div>
        </motion.div>
      )}

      {/* TODO: mover Calendario Menstrual al Diario Personal (no se renderiza aquí) */}
    </div>
  );
}
