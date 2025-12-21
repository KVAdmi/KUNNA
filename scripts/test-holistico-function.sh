#!/bin/bash
# Script para probar la Edge Function después del deploy

echo "🧪 TEST DE EDGE FUNCTION: holistico-reading"
echo "==========================================="
echo ""

PROJECT_REF="wpsysctbaxbtzyebcjlb"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwc3lzY3RiYXhidHp5ZWJjamxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMzA5NDgsImV4cCI6MjA3NTkwNjk0OH0.wQjtzKvkGIWOylIRGjd_p1Cv_9_SU54dr-kpAtJuBIc"
URL="https://${PROJECT_REF}.supabase.co/functions/v1/holistico-reading"

echo "📍 Endpoint: $URL"
echo ""
echo "📤 Enviando request de prueba..."
echo ""

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "birthdate": "1990-05-15",
    "full_name": "María González",
    "includeNumerology": true,
    "includeTarot": true,
    "includeAstrology": false
  }' \
  -w "\n\n📊 Status Code: %{http_code}\n" \
  -s | jq '.'

echo ""
echo "✅ Si ves JSON con numerology y tarot, ¡FUNCIONA!"
echo "❌ Si ves 404 o error, revisa que la función esté deployada"
echo ""
