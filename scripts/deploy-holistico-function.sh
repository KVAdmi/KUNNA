#!/bin/bash
# Script para deployar la Edge Function de Zona Holística

echo "🚀 DEPLOY DE EDGE FUNCTION: holistico-reading"
echo "=============================================="
echo ""

# Paso 1: Verificar que estás en el directorio correcto
if [ ! -d "supabase/functions/holistico-reading" ]; then
  echo "❌ Error: No se encuentra supabase/functions/holistico-reading"
  echo "   Ejecuta este script desde /Users/pg/Documents/KUNNA"
  exit 1
fi

echo "✅ Directorio correcto"
echo ""

# Paso 2: Login (si no lo has hecho)
echo "📝 PASO 1: Login en Supabase"
echo "   Ejecuta: supabase login"
echo "   Se abrirá tu navegador para autenticarte"
echo ""
read -p "Presiona Enter cuando hayas completado el login..." dummy

# Paso 3: Link del proyecto
echo ""
echo "📝 PASO 2: Linkear proyecto"
echo "   Project Ref: wpsysctbaxbtzyebcjlb"
echo ""
supabase link --project-ref wpsysctbaxbtzyebcjlb

if [ $? -ne 0 ]; then
  echo "❌ Error al linkear proyecto"
  exit 1
fi

echo "✅ Proyecto linkeado"
echo ""

# Paso 4: Verificar secretos
echo "📝 PASO 3: Verificar variables de entorno"
echo ""
echo "⚠️  IMPORTANTE: Antes de continuar, verifica que en tu Supabase Dashboard tengas:"
echo ""
echo "   🔐 Supabase Dashboard > Settings > Edge Functions > Secrets"
echo ""
echo "   Variable requerida:"
echo "   - RAPIDAPI_KEY = tu_clave_de_rapidapi"
echo ""
read -p "¿Ya configuraste RAPIDAPI_KEY en Supabase? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "⚠️  Por favor, ve a: https://supabase.com/dashboard/project/wpsysctbaxbtzyebcjlb/settings/functions"
  echo "   Y agrega la variable RAPIDAPI_KEY"
  echo ""
  exit 1
fi

# Paso 5: Deploy
echo ""
echo "📝 PASO 4: Deploy de la función"
echo ""
supabase functions deploy holistico-reading --no-verify-jwt

if [ $? -ne 0 ]; then
  echo "❌ Error al deployar función"
  exit 1
fi

echo ""
echo "✅ ¡DEPLOY EXITOSO!"
echo ""
echo "🎯 Tu función está disponible en:"
echo "   https://wpsysctbaxbtzyebcjlb.supabase.co/functions/v1/holistico-reading"
echo ""
echo "📋 SIGUIENTE PASO: Probar la función"
echo ""
echo "   Ejecuta: ./test-holistico-function.sh"
echo ""
