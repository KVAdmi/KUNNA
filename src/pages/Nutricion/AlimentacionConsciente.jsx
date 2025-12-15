import React from 'react';
import VistaRevista from './RevistaVista';

const AlimentacionConscienceData = {
  intro: "La alimentación consciente trasciende el simple acto de nutrir el cuerpo. Es una práctica sagrada que conecta mente, cuerpo y alma en un ritual de amor propio y sanación profunda.",
  
  parrafos: [
    "Como especialista en psicología nutricional, he sido testigo de transformaciones extraordinarias cuando las personas abrazan esta filosofía. No se trata de restricciones o dietas, sino de una reconexión íntima con la sabiduría corporal que todos llevamos dentro.",
    "Este enfoque revoluciona no solo cómo comemos, sino cómo nos relacionamos con nosotras mismas, sanando heridas emocionales profundas y elevando nuestra vibración energética hacia un estado de plenitud y bienestar integral."
  ],
  
  quote: "Cada bocado es una oportunidad sagrada de honrar tu templo interior",
  quoteAutor: "Filosofía del Mindful Eating",
  
  secciones: [
    {
      emoji: "",
      titulo: "Las 7 Heridas Alimentarias del Alma",
      descripcion: "Como psicoterapeuta especializada, he identificado los patrones emocionales más profundos que sabotean nuestra relación con la comida",
      items: [
        {
          emoji: "",
          titulo: "Herida del Abandono",
          descripcion: "La comida llena el vacío emocional cuando nos sentimos solas, creando una dependencia emocional que perpetúa ciclos de soledad.",
          sanacion: "Práctica de auto-acompañamiento consciente y rituales de conexión interior"
        },
        {
          emoji: "",
          titulo: "Herida del Rechazo",
          descripcion: "Comer como autocastigo por no sentirnos 'suficientes', perpetuando ciclos de autorechazo y baja autoestima.",
          sanacion: "Afirmaciones de autoaceptación radical y trabajo de autocompasión"
        },
        {
          emoji: "",
          titulo: "Herida del Miedo",
          descripcion: "Restricción extrema por terror a 'perder el control', creando una relación ansiosa y controladora con la alimentación.",
          sanacion: "Trabajo gradual de confianza corporal y técnicas de regulación nerviosa"
        },
        {
          emoji: "",
          titulo: "Herida de la Ira",
          descripcion: "Atracones como expresión de rabia no procesada, usando la comida como válvula de escape emocional.",
          sanacion: "Técnicas de expresión emocional saludable y canalización creativa"
        },
        {
          emoji: "",
          titulo: "Herida de la Vergüenza",
          descripcion: "Comer a escondidas por sentir que 'no deberíamos', perpetuando ciclos de secretismo y culpa alimentaria.",
          sanacion: "Compasión y perdón hacia una misma, liberación de juicios"
        },
        {
          emoji: "",
          titulo: "Herida del Control",
          descripcion: "Necesidad obsesiva de controlar cada bocado por miedo al 'fracaso', creando rigidez y pérdida de espontaneidad.",
          sanacion: "Soltar y confiar en la sabiduría corporal innata"
        }
      ]
    }
  ],
  
  protocolo: {
    titulo: "Protocolo de Transformación Integral",
    descripcion: "Un viaje de 12 semanas hacia la libertad alimentaria y el bienestar emocional",
    fases: [
      {
        emoji: "",
        titulo: "Fase 1: Despertar",
        descripcion: "Conciencia corporal, identificación de patrones y reconexión con señales internas de hambre y saciedad.",
        duracion: "Semanas 1-4"
      },
      {
        emoji: "",
        titulo: "Fase 2: Sanación",
        descripcion: "Trabajo emocional profundo, liberación de heridas del alma y restructuración de creencias limitantes.",
        duracion: "Semanas 5-8"
      },
      {
        emoji: "",
        titulo: "Fase 3: Integración",
        descripcion: "Maestría en alimentación intuitiva, creación de nuevos hábitos y sostenibilidad a largo plazo.",
        duracion: "Semanas 9-12"
      }
    ]
  },
  
  mensajeFinal: "Sanar tu relación con la comida es sanar tu relación contigo misma",
  autorFinal: "Mensaje de tu psicóloga nutricional de cabecera",
  tags: ["Amor Propio", "Sabiduría Interior", "Transformación"]
};

const AlimentacionConsciente = () => {
  return (
    <VistaRevista
      titulo="Alimentación Consciente:"
      subtitulo="El Arte de Nutrir tu Alma"
      categoria="TERAPIA NUTRICIONAL"
      lecturaMin={8}
      contenido={AlimentacionConscienceData}
    />
  );
};

export default AlimentacionConsciente;
