# 🚀 Script de instalación rápida para MCP Guardias Sevilla

echo "🏥 Instalando MCP Guardias Sevilla..."
echo "======================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js no está instalado. Por favor instala Node.js v18 o superior."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
log_success "Node.js $NODE_VERSION encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    log_error "npm no está instalado."
    exit 1
fi

# 1. Instalar dependencias del MCP Server
log_info "Instalando dependencias del MCP Server..."
npm install
if [ $? -eq 0 ]; then
    log_success "Dependencias del MCP Server instaladas"
else
    log_error "Error instalando dependencias del MCP Server"
    exit 1
fi

# 2. Instalar dependencias del Backend
log_info "Instalando dependencias del Backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    log_success "Dependencias del Backend instaladas"
else
    log_error "Error instalando dependencias del Backend"
    exit 1
fi
cd ..

# 3. Instalar dependencias del Frontend
log_info "Instalando dependencias del Frontend..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    log_success "Dependencias del Frontend instaladas"
else
    log_error "Error instalando dependencias del Frontend"
    exit 1
fi
cd ..

# 4. Crear archivo .env si no existe
if [ ! -f .env ]; then
    log_info "Creando archivo .env desde plantilla..."
    cp .env.example .env
    log_warning "Por favor configura las variables de entorno en el archivo .env"
else
    log_info "Archivo .env ya existe"
fi

# 5. Información de configuración
echo ""
echo "🎉 ¡Instalación completada!"
echo "========================="
echo ""
echo "📝 Próximos pasos:"
echo ""
echo "1. Configura las variables de entorno en .env:"
echo "   - Google Calendar API credentials"
echo "   - Supabase URL y keys"
echo ""
echo "2. Ejecuta el esquema SQL en Supabase:"
echo "   - Abre Supabase SQL Editor"
echo "   - Ejecuta el contenido de supabase-schema.sql"
echo ""
echo "3. Ejecutar los servicios:"
echo ""
echo "   🔧 MCP Server:"
echo "   npm start"
echo ""
echo "   🌐 Backend API:"
echo "   cd backend && npm run dev"
echo ""
echo "   💻 Frontend Dashboard:"
echo "   cd frontend && npm run dev"
echo ""
echo "4. URLs de acceso:"
echo "   - Dashboard: http://localhost:3000"
echo "   - API: http://localhost:3001"
echo "   - Health Check: http://localhost:3001/api/health"
echo ""
echo "📚 Documentación completa en README.md"
echo ""
log_success "¡Sistema listo para usar! 🚀"