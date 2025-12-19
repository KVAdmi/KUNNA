#!/bin/bash

# Script de verificación rápida - KUNNA Backend MP

echo "🔍 VERIFICACIÓN CONFIGURACIÓN MERCADO PAGO"
echo "=========================================="
echo ""

# Verificar archivos
echo "📁 Verificando archivos..."
if [ -f "backend/.env" ]; then
  echo "  ✅ backend/.env existe"
else
  echo "  ❌ backend/.env NO EXISTE"
fi

if [ -f "backend/server.js" ]; then
  echo "  ✅ backend/server.js existe"
else
  echo "  ❌ backend/server.js NO EXISTE"
fi

if [ -f "src/lib/mercadoPago.js" ]; then
  echo "  ✅ src/lib/mercadoPago.js existe"
else
  echo "  ❌ src/lib/mercadoPago.js NO EXISTE"
fi

echo ""
echo "🔑 Verificando variables de entorno..."

# Verificar que no haya claves privadas en .env del frontend
if grep -q "VITE_MERCADOPAGO_ACCESS_TOKEN" .env 2>/dev/null; then
  echo "  ❌ ALERTA: VITE_MERCADOPAGO_ACCESS_TOKEN encontrado en .env (NO DEBERÍA ESTAR)"
else
  echo "  ✅ No hay claves privadas de MP en .env del frontend"
fi

# Verificar backend/.env
if grep -q "MP_ACCESS_TOKEN=" backend/.env 2>/dev/null; then
  echo "  ✅ MP_ACCESS_TOKEN presente en backend/.env"
  if grep -q "MP_ACCESS_TOKEN=$" backend/.env; then
    echo "     ⚠️  ADVERTENCIA: MP_ACCESS_TOKEN está vacío (necesitas pegar tu clave)"
  fi
else
  echo "  ❌ MP_ACCESS_TOKEN NO presente en backend/.env"
fi

if grep -q "MP_KUNNA_PREMIUM_PLAN_ID=" backend/.env 2>/dev/null; then
  echo "  ✅ MP_KUNNA_PREMIUM_PLAN_ID presente en backend/.env"
  if grep -q "MP_KUNNA_PREMIUM_PLAN_ID=04da2b31975e4f568660e31c13b91aeb" backend/.env; then
    echo "     ✅ Plan ID correcto: 04da2b31975e4f568660e31c13b91aeb"
  fi
else
  echo "  ❌ MP_KUNNA_PREMIUM_PLAN_ID NO presente en backend/.env"
fi

echo ""
echo "📦 Verificando dependencias..."

cd backend
if npm list axios &>/dev/null; then
  echo "  ✅ axios instalado en backend"
else
  echo "  ❌ axios NO instalado en backend"
fi

if npm list mercadopago &>/dev/null; then
  echo "  ✅ mercadopago instalado en backend"
else
  echo "  ❌ mercadopago NO instalado en backend"
fi

cd ..

if npm list mercadopago &>/dev/null; then
  echo "  ⚠️  ADVERTENCIA: mercadopago está instalado en frontend (debería eliminarse)"
else
  echo "  ✅ mercadopago NO está en frontend"
fi

echo ""
echo "🧪 RESUMEN"
echo "=========================================="
echo "✅ = Correcto"
echo "⚠️  = Advertencia (revisar)"
echo "❌ = Error (requiere acción)"
echo ""
echo "📄 Para más detalles, lee: SETUP_MERCADOPAGO_KUNNA.md"
echo ""
