#!/bin/bash

# Script de prueba local para Netlify Function - Zona Holística

echo "🔮 PRUEBA LOCAL - FUNCIÓN HOLÍSTICA KUNNA"
echo "========================================"
echo ""

# Verificar que node-fetch está instalado
if ! npm list node-fetch &>/dev/null; then
  echo "❌ node-fetch no está instalado"
  echo "Ejecuta: npm install node-fetch@2"
  exit 1
fi

echo "✅ node-fetch instalado"
echo ""

# Simular variables de entorno (las reales están en Netlify)
export RAPIDAPI_KEY="dummy_key_for_local_test"
export RAPIDAPI_HOST="the-numerology-api.p.rapidapi.com"

# Crear archivo de test temporal
KUNNA_DIR=$(pwd)
cat > /tmp/test-holistico.js << EOF
const handler = require('${KUNNA_DIR}/netlify/functions/holistico-reading.cjs').handler;

const testEvent = {
  httpMethod: 'POST',
  body: JSON.stringify({
    fecha_nacimiento: '1990-05-15',
    pregunta: '¿Qué me depara el futuro?'
  })
};

const testContext = {};

handler(testEvent, testContext)
  .then(response => {
    console.log('\n📊 RESPUESTA:');
    console.log('Status:', response.statusCode);
    console.log('\n📝 Body:');
    const data = JSON.parse(response.body);
    console.log(JSON.stringify(data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n✅ FUNCIÓN FUNCIONANDO CORRECTAMENTE');
      console.log('\n🔮 Carta del Tarot:', data.tarot.carta);
      console.log('🔢 Número de Vida:', data.numerologia.numero_vida);
      console.log('⭐ Signo:', data.astrologia.signo);
    } else {
      console.log('\n❌ ERROR EN LA FUNCIÓN');
    }
  })
  .catch(error => {
    console.error('\n❌ ERROR EJECUTANDO FUNCIÓN:', error);
    process.exit(1);
  });
EOF

echo "🧪 Ejecutando función con fecha de prueba: 1990-05-15"
echo ""

node /tmp/test-holistico.js

# Limpiar
rm /tmp/test-holistico.js

echo ""
echo "✅ Prueba completada"
echo ""
echo "📌 NOTA: Esta es una prueba LOCAL."
echo "En producción, la función se llamará así:"
echo ""
echo "POST https://kunna.help/.netlify/functions/holistico-reading"
echo "Body: { \"fecha_nacimiento\": \"1990-05-15\", \"pregunta\": \"opcional\" }"
echo ""
