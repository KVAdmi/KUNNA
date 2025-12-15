require('dotenv').config();

const API_KEY = process.env.GOOGLE_API_KEY;

async function run() {
  console.log('🔑 API Key:', API_KEY ? 'Configurada' : 'No configurada');
  
  try {
    console.log('📡 Enviando solicitud a Gemini...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hola Gemini desde Node.js 🚀" }] }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('📨 Estado de la respuesta:', res.status, res.statusText);
    console.log('🔍 Headers de respuesta:', Object.fromEntries(res.headers));

    const data = await res.json();
    console.log('\n📦 Respuesta completa:');
    console.log(JSON.stringify(data, null, 2));

    if (!res.ok) {
      throw new Error(`Error de API: ${data.error?.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.cause) {
      console.error('Causa:', error.cause);
    }
    throw error;
  }
}

run().catch(error => {
  console.error('\n💥 Error fatal:', error);
  process.exit(1);
});
