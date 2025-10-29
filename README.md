# MCP Guardias Sevilla 🏥

Sistema completo de gestión de guardias y descansos para equipos técnicos, con integración a Google Calendar y base de datos Supabase.

## 🚀 Características

- **MCP Server**: Servidor Model Context Protocol para automatización
- **Google Calendar**: Integración completa para eventos de guardias y descansos
- **Supabase**: Base de datos robusta con validaciones y triggers
- **Dashboard Web**: Interfaz moderna con Next.js y TailwindCSS
- **API REST**: Backend completo con Express.js
- **TypeScript**: Tipado fuerte en todo el frontend

## 📁 Estructura del Proyecto

```
mcp-guardias-sevilla/
├── 📄 mcp.json                    # Configuración MCP
├── 📄 package.json               # MCP Server dependencies
├── 📄 index.js                   # MCP Server principal
├── 📄 supabase-schema.sql        # Esquema de base de datos
├── 📄 .env.example               # Variables de entorno
├── 📁 services/                  # Servicios del MCP
│   ├── googleCalendarService.js  # Google Calendar API
│   ├── supabaseService.js       # Supabase database
│   └── guardiasService.js       # Lógica principal
├── 📁 backend/                   # API REST
│   ├── server.js                # Servidor Express
│   ├── package.json
│   └── routes/                  # Rutas de la API
│       ├── tecnicos.js
│       ├── guardias.js
│       ├── descansos.js
│       └── estadisticas.js
└── 📁 frontend/                  # Dashboard Next.js
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── app/                     # App Router
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

## ⚙️ Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y completa:

```bash
cp .env.example .env
```

```env
# Google Calendar API
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=tu_redirect_uri
GOOGLE_ACCESS_TOKEN=tu_access_token
GOOGLE_REFRESH_TOKEN=tu_refresh_token

# Supabase
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key

# MCP Server
MCP_SERVER_PORT=3001
```

### 2. Configurar Google Calendar API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google Calendar API**
4. Crea credenciales OAuth 2.0
5. Configura las URLs de redirección
6. Obtén tus tokens de acceso y refresh

### 3. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta el script `supabase-schema.sql` en el SQL Editor
3. Obtén tu URL y claves del proyecto
4. Configura las políticas RLS según tus necesidades

## 🛠️ Instalación y Ejecución

### MCP Server

```bash
# Instalar dependencias
npm install

# Ejecutar MCP Server
npm start

# Desarrollo con auto-restart
npm run dev
```

### Backend API

```bash
cd backend
npm install
npm run dev
```

### Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

## 📊 Base de Datos

### Tablas Principales

- **tecnicos**: Información de técnicos y días pendientes
- **guardias**: Registro de semanas de guardia asignadas
- **descansos**: Registro de días de descanso tomados

### Funciones y Triggers

- Validación automática de fechas
- Prevención de solapamientos
- Actualización de timestamps
- Estadísticas rápidas

## 🔧 Comandos MCP Disponibles

### `asignar_guardia`
Asigna una semana de guardia a un técnico
```json
{
  "tecnico": "Juan Martínez",
  "fecha_inicio": "2024-10-21",
  "fecha_fin": "2024-10-27"
}
```

### `asignar_descanso`
Asigna un día de descanso a un técnico
```json
{
  "tecnico": "Juan Martínez",
  "fecha": "2024-10-28"
}
```

### `listar_pendientes`
Lista técnicos con días de descanso pendientes
```json
{}
```

### `crear_tecnico`
Crea un nuevo técnico en el sistema
```json
{
  "nombre": "Ana García",
  "email": "ana.garcia@empresa.com",
  "dias_pendientes": 0
}
```

## 🌐 API REST Endpoints

### Técnicos
- `GET /api/tecnicos` - Listar técnicos
- `GET /api/tecnicos/:nombre` - Obtener técnico
- `POST /api/tecnicos` - Crear técnico
- `PUT /api/tecnicos/:id/dias-pendientes` - Actualizar días pendientes

### Guardias
- `GET /api/guardias` - Listar guardias
- `POST /api/guardias` - Asignar guardia
- `PUT /api/guardias/:id/estado` - Cambiar estado
- `DELETE /api/guardias/:id` - Cancelar guardia

### Descansos
- `GET /api/descansos` - Listar descansos
- `POST /api/descansos` - Asignar descanso
- `GET /api/descansos/pendientes/todos` - Ver pendientes

### Estadísticas
- `GET /api/estadisticas` - Estadísticas generales
- `GET /api/estadisticas/dashboard` - Dashboard principal
- `GET /api/estadisticas/tecnicos` - Por técnico
- `GET /api/estadisticas/tendencias` - Análisis temporal

## 🎯 Funcionalidades Principales

### ✅ Gestión de Guardias
- Asignación automática con validación de conflictos
- Creación de eventos en Google Calendar
- Control de estados (programada/completada/cancelada)
- Sugerencias de fechas disponibles

### ✅ Gestión de Descansos
- Asignación basada en días pendientes
- Validación de disponibilidad
- Seguimiento de descansos tomados vs. pendientes
- Integración con calendario

### ✅ Control de Días Pendientes
- Suma automática por guardia asignada
- Resta automática por descanso tomado
- Visualización de técnicos con más pendientes
- Alertas por acumulación excesiva

### ✅ Estadísticas y Reportes
- Dashboard con métricas principales
- Análisis por técnico y período
- Tendencias temporales
- Exportación de datos

## 🚨 Alertas y Validaciones

- **Fechas pasadas**: No permite asignar en fechas anteriores
- **Solapamientos**: Detecta conflictos de calendario
- **Días pendientes**: Valida disponibilidad antes de asignar descansos
- **Técnicos inexistentes**: Verificación antes de asignaciones

## 🔄 Flujo de Trabajo Típico

1. **Crear técnicos** con días pendientes iniciales
2. **Asignar guardias** semanales (+1 día pendiente)
3. **Programar descansos** usando días pendientes (-1 día)
4. **Monitorear** estadísticas y pendientes
5. **Ajustar** según necesidades del equipo

## 📈 Monitoreo

- Health check: `GET /api/health`
- Logs detallados en consola
- Métricas en tiempo real
- Alertas automáticas por acumulación

## 🔐 Seguridad

- Rate limiting en API
- Validaciones de entrada
- Sanitización de datos
- Headers de seguridad (Helmet.js)

## 🚀 Producción

### Despliegue Recomendado

- **MCP Server**: PM2 o Docker
- **Backend**: Heroku, Railway, o VPS
- **Frontend**: Vercel, Netlify, o Cloudflare Pages
- **Base de datos**: Supabase (gestionado)

### Variables de Entorno Adicionales

```env
NODE_ENV=production
FRONTEND_URL=https://tu-frontend.com
PORT=3001
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

MIT License - ver archivo `LICENSE` para detalles.

## 👤 Autor

**Juanma** - Sistema MCP Guardias Sevilla

## 🙏 Agradecimientos

- Google Calendar API
- Supabase
- Model Context Protocol
- Next.js y TailwindCSS
- Comunidad de desarrolladores

---

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 Email: tu-email@empresa.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: README.md (este archivo)

¡Gracias por usar el sistema MCP Guardias Sevilla! 🎉