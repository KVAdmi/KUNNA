import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import supabase from "@/lib/customSupabaseClient";
import { useAuth } from "../contexts/SupabaseAuthContext.jsx";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar as DayPicker } from "@/components/ui/calendar";
import {
  Plus, Calendar as CalendarIcon, Clock, Trash2, Edit, Loader2, XCircle,
  Bell, Heart, Sparkles, Moon, Users, Zap, Star, MapPin, BarChart3
} from "lucide-react";
import { format, parseISO, startOfDay, isWithinInterval, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

// Estilos para animación de gradiente
const gradientAnimation = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = gradientAnimation;
  document.head.appendChild(style);
}

// ------- Config visual (Zinha palette)
const Z = {
  primary: "#382a3c",
  secondary: "#8d7583",
  accent: "#c8a6a6",
  lime: "#c1d43a"
};

// ------- Tipos de evento (minimal DB-friendly)
const EVENT_TYPES = {
  autocuidado: { icon: Heart, color: Z.accent, bg: "#fff1f2", label: "Autocuidado" },
  cita_medica: { icon: Plus,  color: Z.secondary, bg: "#f3e8ff", label: "Cita Médica" },
  trabajo:     { icon: Zap,   color: Z.lime,      bg: "#f7fee7", label: "Trabajo" },
  social:      { icon: Users, color: Z.primary,   bg: "#eef2ff", label: "Social" },
  ejercicio:   { icon: Sparkles, color: Z.accent, bg: "#fdf2f8", label: "Ejercicio" },
  creatividad: { icon: Star,  color: Z.secondary, bg: "#f5f3ff", label: "Creatividad" },
  descanso:    { icon: Moon,  color: Z.primary,   bg: "#f8fafc", label: "Descanso" },
  recordatorio:{ icon: Bell,  color: Z.lime,      bg: "#fef9c3", label: "Recordatorio" }
};

function cx(...classes){ return classes.filter(Boolean).join(" "); }
function toDateInput(d){ return format(d, "yyyy-MM-dd"); }

const EventForm = ({ onSaved, eventToEdit, clearEdit, selectedDate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    tipo: "autocuidado",
    fecha: toDateInput(selectedDate || new Date()),
    hora: "",
    notificar: true
  });

  // Cargar en edición
  useEffect(() => {
    if (eventToEdit) {
      setForm({
        titulo: eventToEdit.titulo || "",
        tipo: eventToEdit.tipo || "autocuidado",
        fecha: eventToEdit.fecha || toDateInput(new Date()),
        hora: eventToEdit.hora || "",
        notificar: !!eventToEdit.notificar
      });
    } else {
      setForm(prev => ({ ...prev, fecha: toDateInput(selectedDate || new Date()) }));
    }
  }, [eventToEdit, selectedDate]);

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Notificación local simple (demo web)
  const scheduleBrowserNotification = () => {
    try {
      if (!form.notificar || !form.hora) return;
      if (!("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      const when = new Date(`${form.fecha}T${form.hora}:00`);
      const delta = when.getTime() - Date.now() - 15 * 60 * 1000; // 15 min antes (fijo)
      if (delta > 0) {
        setTimeout(() => {
          new Notification(`📅 ${form.titulo}`, {
            body: "Tu evento es en 15 minutos",
            icon: "/favicon.ico",
            tag: `ag-${form.fecha}-${form.hora}`
          });
        }, delta);
      }
    } catch {}
  };

  const save = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!form.titulo || !form.fecha) {
      toast({ variant: "destructive", title: "Falta info", description: "Título y fecha son obligatorios." });
      return;
    }

    setLoading(true);
    try {
      // Usa RPC segura si existe; si no, inserta directo
      let error = null;
      if (eventToEdit) {
        const { error: upErr } = await supabase
          .from("agenda_personal")
          .update({ titulo: form.titulo, tipo: form.tipo, fecha: form.fecha, hora: form.hora || null, notificar: form.notificar })
          .eq("id", eventToEdit.id)
          .eq("user_id", user.id);
        error = upErr;
      } else {
        // Intenta RPC primero
        const { error: rpcErr } = await supabase.rpc("agenda_personal_upsert_me", {
          _id: null,
          _titulo: form.titulo,
          _tipo: form.tipo,
          _fecha: form.fecha,
          _hora: form.hora || null,
          _notificar: form.notificar
        });
        if (rpcErr) {
          // fallback directo
          const { error: insErr } = await supabase.from("agenda_personal").insert({
            user_id: user.id, titulo: form.titulo, tipo: form.tipo,
            fecha: form.fecha, hora: form.hora || null, notificar: form.notificar
          });
          error = insErr;
        }
      }
      if (error) throw error;

      scheduleBrowserNotification();
      toast({ title: "Listo", description: eventToEdit ? "Evento actualizado." : "Evento creado." });
      clearEdit();
      onSaved();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const TypeIcon = (EVENT_TYPES[form.tipo] || EVENT_TYPES.autocuidado).icon;

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-6">
      <div className="bg-gradient-to-r from-[#c8a6a6]/10 to-[#8d7583]/10 rounded-3xl p-6 border border-[#c8a6a6]/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                 style={{background:`linear-gradient(90deg, ${Z.accent}, ${Z.secondary})`}}>
              <TypeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{color:Z.primary}}>
                {eventToEdit ? "Editar evento" : "Nuevo evento"}
              </h3>
              <p className="text-sm" style={{color:Z.secondary}}>
                Organiza tu tiempo con intención
              </p>
            </div>
          </div>
          {eventToEdit && (
            <Button variant="ghost" size="icon" onClick={clearEdit} className="text-[#8d7583] hover:bg-[#8d7583]/10">
              <XCircle className="w-5 h-5" />
            </Button>
          )}
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block font-semibold mb-2" style={{color:Z.primary}}>¿Qué tienes planeado? *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e)=>handle("titulo", e.target.value)}
              placeholder="Ej: Cita con terapeuta, lectura…"
              className="w-full p-4 rounded-2xl border-2 border-[#c8a6a6]/20 focus:border-[#c8a6a6] focus:ring-0 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-3" style={{color:Z.primary}}>Tipo</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(EVENT_TYPES).map(([key, t])=>{
                const Icon = t.icon;
                const selected = form.tipo===key;
                return (
                  <button type="button" key={key}
                    onClick={()=>handle("tipo", key)}
                    className={cx(
                      "p-3 rounded-xl border-2 transition-all duration-200",
                      selected ? "shadow-lg scale-105" : "bg-white hover:border-[#c8a6a6]/50"
                    )}
                    style={{borderColor: selected ? t.color : "rgba(0,0,0,0.1)", backgroundColor: selected ? t.bg : "white"}}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{color: selected ? t.color : "#9ca3af"}} />
                    <p className="text-xs font-medium" style={{color: selected ? t.color : "#475569"}}>{t.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-2" style={{color:Z.primary}}>Fecha *</label>
              <input type="date" value={form.fecha}
                     onChange={(e)=>handle("fecha", e.target.value)}
                     className="w-full p-3 rounded-xl border-2 border-[#c8a6a6]/20 focus:border-[#c8a6a6] focus:ring-0" required />
            </div>
            <div>
              <label className="block font-semibold mb-2" style={{color:Z.primary}}>Hora</label>
              <input type="time" value={form.hora}
                     onChange={(e)=>handle("hora", e.target.value)}
                     className="w-full p-3 rounded-xl border-2 border-[#c8a6a6]/20 focus:border-[#c8a6a6] focus:ring-0" />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.notificar} onChange={(e)=>handle("notificar", e.target.checked)} />
                <span className="font-medium" style={{color:Z.primary}}>Recordarme</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}
                    className="flex-1 text-white font-semibold py-3 rounded-xl"
                    style={{background:`linear-gradient(90deg, ${Z.accent}, ${Z.secondary})`}}>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (eventToEdit ? <Edit className="w-5 h-5 mr-2"/> : <Plus className="w-5 h-5 mr-2"/>)}
              {loading ? "Guardando..." : (eventToEdit ? "Actualizar" : "Crear evento")}
            </Button>
            {eventToEdit && (
              <Button type="button" variant="outline" onClick={clearEdit}
                      className="px-6" style={{borderColor:Z.secondary, color:Z.secondary}}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const PersonalAgendaPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventToEdit, setEventToEdit] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("agenda_personal")
      .select("*")
      .eq("user_id", user.id)
      .order("fecha", { ascending: true })
      .order("hora", { ascending: true });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los eventos." });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Eventos marcados en calendario & del día
  const eventDays = useMemo(() => events.map(e => parseISO(e.fecha)), [events]);
  const eventsOfDay = useMemo(() => {
    const s = startOfDay(selectedDate);
    return events.filter(e => startOfDay(parseISO(e.fecha)).getTime() === s.getTime());
  }, [events, selectedDate]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar evento?")) return;
    const { error } = await supabase.from("agenda_personal").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Éxito", description: "Evento eliminado." });
      fetchEvents();
    }
  };

  return (
    <div className="min-h-screen pb-24"
      style={{
        background: 'linear-gradient(135deg, #f8f6f4 0%, #faf9f7 50%, #f5f3f1 100%)'
      }}
    >
      <Helmet>
        <title>Mi Agenda Personal - KUNNA</title>
        <meta name="description" content="Organiza tu tiempo con la agenda inteligente de KUNNA." />
      </Helmet>

      {/* Hero rediseñado para app nativa - compacto */}
      <div className="relative overflow-hidden">
        {/* Background atmosférico */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f6f4] via-[#faf9f7] to-[#f5f3f1]"></div>
        
        {/* Efectos flotantes de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-5 w-20 h-20 bg-gradient-to-br from-[#c8a6a6]/15 to-[#8d7583]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/4 right-10 w-16 h-16 bg-gradient-to-br from-[#f5e6ff]/20 to-[#c1d43a]/10 rounded-full blur-xl animate-pulse delay-700"></div>
          <div className="absolute bottom-10 left-1/3 w-18 h-18 bg-gradient-to-br from-[#382a3c]/10 to-[#263152]/8 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 p-4 pt-6 pb-8"
        >
          {/* Encabezado compacto para móvil */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center py-6">
              
              {/* Contenedor de imagen (más pequeño) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group cursor-pointer flex justify-center md:justify-start order-2 md:order-1"
              >
                <div className="relative max-w-[200px] md:max-w-[250px]">
                  <img 
                    src="/images/Agenda.png" 
                    alt="Mi Agenda Personal"
                    className="w-auto h-auto max-h-48 md:max-h-56 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  
                  {/* Efecto de cristal */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 backdrop-blur-[0.5px] rounded-2xl border border-white/5 shadow-xl z-10 group-hover:shadow-2xl transition-all duration-500"></div>
                  
                  {/* Efecto de luz flotante más pequeño */}
                  <motion.div
                    className="absolute top-2 right-2 w-4 h-4 rounded-full"
                    style={{ 
                      background: 'radial-gradient(circle, #c8a6a6 0%, #8d75838 40%, #382a3c 80%, transparent 100%)',
                      boxShadow: '0 0 15px rgba(200, 166, 166, 0.6), 0 0 25px rgba(141, 117, 131, 0.4)',
                      filter: 'brightness(1.2)'
                    }}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  ></motion.div>
                </div>
              </motion.div>

              {/* Contenedor de título compacto */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-center md:text-left order-1 md:order-2"
              >
                <div className="mb-4">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 tracking-wide leading-tight">
                    <span 
                      className="bg-gradient-to-r from-[#382a3c] via-[#8d7583] to-[#c8a6a6] bg-clip-text text-transparent block"
                      style={{
                        backgroundSize: '200% 200%',
                        animation: 'gradient 6s ease infinite'
                      }}
                    >
                      Mi Agenda
                    </span>
                    <span 
                      className="bg-gradient-to-r from-[#c8a6a6] via-[#c1d43a] to-[#8d7583] bg-clip-text text-transparent block"
                      style={{
                        backgroundSize: '200% 200%',
                        animation: 'gradient 6s ease infinite 1s'
                      }}
                    >
                      Personal
                    </span>
                  </h1>
                  
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-[#c8a6a6] rounded-full"></div>
                    <div className="mx-3 w-1.5 h-1.5 bg-[#c1d43a] rounded-full animate-pulse"></div>
                    <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-[#c8a6a6] rounded-full"></div>
                  </div>
                  
                  <p className="text-lg md:text-xl text-[#8d7583] leading-relaxed mb-4 font-medium">
                    Planifica, recuerda y vive cada día con propósito
                  </p>
                </div>
                
                {/* Mensaje inspiracional compacto */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="relative overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-[#c8a6a6]/20"
                >
                  <div className="relative z-10">
                    <p className="text-[#382a3c] font-bold text-base mb-2">
                      Organiza tu tiempo con intención
                    </p>
                    <p className="text-[#8d7583] leading-relaxed text-sm">
                      Cada momento que planificas es un regalo que te das a ti misma.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            <EventForm
              onSaved={fetchEvents}
              eventToEdit={eventToEdit}
              clearEdit={()=>setEventToEdit(null)}
              selectedDate={selectedDate}
            />

            {/* Lista del día */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              className="bg-white rounded-3xl shadow-xl p-6 border border-[#c8a6a6]/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center" style={{color:Z.primary}}>
                  <CalendarIcon className="w-6 h-6 mr-3" style={{color:Z.accent}}/>
                  {format(selectedDate, "d MMMM yyyy", { locale: es })}
                </h2>
                <div className="text-sm px-3 py-1 rounded-full" style={{color:Z.secondary, background:`${Z.accent}20`}}>
                  {eventsOfDay.length} evento{eventsOfDay.length!==1?"s":""}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin" style={{color:Z.accent}}/>
                </div>
              ) : eventsOfDay.length>0 ? (
                <div className="space-y-3">
                  {eventsOfDay.map((e, i)=>{
                    const t = EVENT_TYPES[e.tipo] || EVENT_TYPES.autocuidado;
                    const Icon = t.icon;
                    return (
                      <motion.div key={e.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}}
                        transition={{delay:i*0.05}}
                        className="group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor:t.bg, borderColor:`${t.color}4D` }}>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:t.bg}}>
                                  <Icon className="w-5 h-5" style={{color:t.color}}/>
                                </div>
                                <div>
                                  <h3 className="font-bold" style={{color:Z.primary}}>{e.titulo}</h3>
                                  <div className="flex items-center gap-3 text-sm" style={{color:Z.secondary}}>
                                    {e.hora && (
                                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/>{e.hora}</span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                                          style={{background:`${t.color}1a`, color:t.color}}>
                                      {t.label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon"
                                      onClick={()=>setEventToEdit(e)}
                                      className="h-8 w-8 hover:bg-[#8d7583]/10"
                                      style={{color:Z.secondary}}>
                                <Edit className="w-4 h-4"/>
                              </Button>
                              <Button variant="ghost" size="icon"
                                      onClick={()=>handleDelete(e.id)}
                                      className="h-8 w-8 hover:bg-red-50 text-red-500">
                                <Trash2 className="w-4 h-4"/>
                              </Button>
                            </div>
                          </div>

                          {e.notificar && (
                            <div className="mt-3 pt-3 border-t" style={{borderColor:`${Z.secondary}1a`}}>
                              <div className="flex items-center text-xs" style={{color:Z.secondary}}>
                                <Bell className="w-3 h-3 mr-1" />
                                Recordatorio activado
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                       style={{background:`${Z.accent}1a`}}>
                    <CalendarIcon className="w-8 h-8" style={{color:Z.accent}}/>
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{color:Z.primary}}>No hay eventos planeados</h3>
                  <p className="mb-4" style={{color:Z.secondary}}>Buen momento para crear algo bonito para ti.</p>
                  <Button onClick={()=>window.scrollTo({top:0, behavior:"smooth"})}
                          variant="outline"
                          className="border"
                          style={{borderColor:Z.accent, color:Z.accent}}>
                    <Plus className="w-4 h-4 mr-2"/> Crear primer evento
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendario */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              className="bg-white rounded-3xl shadow-xl p-6 border border-[#c8a6a6]/10">
              <h3 className="text-lg font-bold mb-4 flex items-center" style={{color:Z.primary}}>
                <CalendarIcon className="w-5 h-5 mr-2" style={{color:Z.accent}}/> Calendario
              </h3>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d)=>d && setSelectedDate(d)}
                modifiers={{ hasEvent: eventDays }}
                modifiersStyles={{ hasEvent:{ fontWeight:"bold", color:Z.accent } }}
                locale={es}
                className="rounded-xl"
              />
            </motion.div>

            {/* Stats */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              className="rounded-3xl p-6 border"
              style={{background:`linear-gradient(135deg, ${Z.accent}0D, ${Z.secondary}0D)`, borderColor:`${Z.accent}1a`}}>
              <h3 className="text-lg font-bold mb-4 flex items-center" style={{color:Z.primary}}>
                <BarChart3 className="w-5 h-5 mr-2" style={{color:Z.accent}}/> Resumen del mes
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span style={{color:Z.secondary}}>Total de eventos</span>
                  <span className="font-bold text-lg" style={{color:Z.primary}}>{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{color:Z.secondary}}>Esta semana</span>
                  <span className="font-bold" style={{color:Z.primary}}>
                    {events.filter(ev=>{
                      const d = parseISO(ev.fecha);
                      const now = new Date();
                      return isWithinInterval(d, { start: startOfWeek(now, {locale:es}), end: endOfWeek(now, {locale:es}) });
                    }).length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Próximos */}
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              className="bg-white rounded-3xl shadow-xl p-6 border border-[#c8a6a6]/10">
              <h3 className="text-lg font-bold mb-4 flex items-center" style={{color:Z.primary}}>
                <Clock className="w-5 h-5 mr-2" style={{color:Z.accent}}/> Próximos eventos
              </h3>
              <div className="space-y-3">
                {events
                  .filter(e => parseISO(e.fecha) >= startOfDay(new Date()))
                  .slice(0,3)
                  .map(e=>{
                    const t = EVENT_TYPES[e.tipo] || EVENT_TYPES.autocuidado;
                    const Icon = t.icon;
                    return (
                      <div key={e.id}
                           className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#c8a6a6]/5 transition-colors cursor-pointer"
                           onClick={()=>setSelectedDate(parseISO(e.fecha))}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:t.bg}}>
                          <Icon className="w-4 h-4" style={{color:t.color}}/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate" style={{color:Z.primary}}>{e.titulo}</p>
                          <p className="text-xs" style={{color:Z.secondary}}>
                            {format(parseISO(e.fecha), "d MMM", {locale:es})}{e.hora && ` • ${e.hora}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {events.filter(e => parseISO(e.fecha) >= startOfDay(new Date())).length===0 && (
                  <p className="text-sm text-center py-2" style={{color:Z.secondary}}>No hay eventos próximos</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAgendaPage;
