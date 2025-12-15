import React from 'react';

const RevistaVista = () => {
  return (
    <section className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      {/* Encabezado */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Alimentación Consciente</h1>
        <p className="text-sm text-gray-500">El arte de nutrir tu alma 🌱</p>
      </header>

      {/* Bloque editorial */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Columna 1 - Imagen destacada */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img 
            src="/img/nutricion01.jpg" 
            alt="Nutrición consciente"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Columna 2 - Texto editorial */}
        <div className="space-y-6">
          <p className="text-lg leading-relaxed">
            Como psicoterapeuta especializada, he identificado los patrones emocionales más profundos que sabotean nuestra relación con la comida:
          </p>
          <ul className="list-decimal list-inside space-y-2">
            <li><strong>Herida del Abandono:</strong> La comida llena el vacío emocional cuando nos sentimos solas.</li>
            <li><strong>Herida del Rechazo:</strong> Comer como autocastigo por no sentirnos “suficientes”.</li>
            <li><strong>Herida de la Humillación:</strong> Atracones como rebelión contra el control externo.</li>
          </ul>
        </div>
      </div>

      {/* Sección de recomendación en globo */}
      <div className="my-12 text-center">
        <div className="inline-block bg-emerald-100 text-emerald-800 text-md font-semibold px-6 py-4 rounded-full shadow-md">
          Para una mejor organización de tu vida, te invito a <span className="underline">planificar sobre papel</span>.
        </div>
      </div>

      {/* Tres columnas tipo "tips" */}
      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            img: "/img/nutricion_tip1.jpg",
            title: "Limpieza energética",
            text: "Tu espacio limpio, tu mente libre. Haz una limpieza semanal profunda."
          },
          {
            img: "/img/nutricion_tip2.jpg",
            title: "Zona de trabajo",
            text: "Dedica un rincón a tu desarrollo personal, con luz natural y sin distracciones."
          },
          {
            img: "/img/nutricion_tip3.jpg",
            title: "Mochila emocional",
            text: "Deshazte de lo que pesa. No cargues lo que ya no te nutre."
          }
        ].map((tip, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img src={tip.img} alt={tip.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h3 className="font-bold mb-2 text-lg">{tip.title}</h3>
              <p className="text-sm text-gray-600">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RevistaVista;
