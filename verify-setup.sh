#!/bin/bash
# verify-setup.sh
# Script para verificar que todo el setup de AL-E esté correcto

echo "🔍 VERIFICACIÓN DE SETUP KUNNA AL-E"
echo "======================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Función para check exitoso
check_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

# Función para check fallido
check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

# Función para warning
check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

echo "📦 Verificando archivos del proyecto..."
echo ""

# Verificar archivos críticos
FILES=(
    "src/lib/aleCore.js"
    "src/services/aleObserver.js"
    "src/services/aleAnalyzer.js"
    "src/services/aleGuardian.js"
    "src/services/moderationService.js"
    "src/services/videoSOSService.js"
    "src/services/checkInMonitorService.js"
    "src/services/holisticALEIntegration.js"
    "src/hooks/useModeratedComments.js"
    "src/hooks/useModeratedChat.js"
    "src/pages/CirculoConfianza.jsx"
    "src/pages/SalidasProgramadas.jsx"
    "src/pages/ALEDashboard.jsx"
    "src/components/circulo/CirculoChat.jsx"
    "CREATE_ALE_COMPLETE_SCHEMA.sql"
    "CREATE_CIRCULO_MESSAGES_TABLE.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        check_ok "$file existe"
    else
        check_fail "$file NO ENCONTRADO"
    fi
done

echo ""
echo "🔧 Verificando configuración..."
echo ""

# Verificar .env
if [ -f ".env" ]; then
    check_ok ".env existe"
    
    # Verificar variables críticas
    if grep -q "VITE_ALE_CORE_BASE" .env; then
        check_ok "VITE_ALE_CORE_BASE configurada"
    else
        check_fail "VITE_ALE_CORE_BASE NO configurada"
    fi
    
    if grep -q "VITE_SUPABASE_URL" .env; then
        check_ok "VITE_SUPABASE_URL configurada"
    else
        check_fail "VITE_SUPABASE_URL NO configurada"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        check_ok "VITE_SUPABASE_ANON_KEY configurada"
    else
        check_fail "VITE_SUPABASE_ANON_KEY NO configurada"
    fi
    
else
    check_fail ".env NO ENCONTRADO"
fi

echo ""
echo "📚 Verificando dependencias..."
echo ""

# Verificar node_modules
if [ -d "node_modules" ]; then
    check_ok "node_modules existe"
else
    check_warn "node_modules no existe - ejecutar 'npm install'"
fi

# Verificar package.json
if [ -f "package.json" ]; then
    check_ok "package.json existe"
    
    # Verificar dependencias críticas
    if grep -q "\"@supabase/supabase-js\"" package.json; then
        check_ok "Supabase client instalado"
    else
        check_warn "Supabase client podría no estar instalado"
    fi
    
    if grep -q "\"react\"" package.json; then
        check_ok "React instalado"
    else
        check_fail "React NO instalado"
    fi
else
    check_fail "package.json NO ENCONTRADO"
fi

echo ""
echo "📄 Verificando documentación..."
echo ""

DOCS=(
    "IMPLEMENTACION_ALE_COMPLETA.md"
    "PROXIMOS_PASOS_DIA2.md"
    "RESUMEN_DIA1.md"
    "SETUP_RAPIDO_DIA2.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        check_ok "$doc existe"
    else
        check_warn "$doc no encontrado"
    fi
done

echo ""
echo "======================================"
echo "📊 RESUMEN"
echo "======================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ TODO CORRECTO${NC}"
    echo "El proyecto está listo para ejecutarse"
    echo ""
    echo "Próximos pasos:"
    echo "1. Ejecutar SQL: CREATE_CIRCULO_MESSAGES_TABLE.sql en Supabase"
    echo "2. Crear bucket 'videos-sos' en Supabase Storage"
    echo "3. Ejecutar: npm run dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS ADVERTENCIAS${NC}"
    echo "El proyecto debería funcionar pero revisa las advertencias"
    exit 0
else
    echo -e "${RED}✗ $ERRORS ERRORES, $WARNINGS ADVERTENCIAS${NC}"
    echo "Corrige los errores antes de continuar"
    echo ""
    echo "Ejecuta: ./verify-setup.sh después de corregir"
    exit 1
fi
