# Dashboard de Guardias - Sevilla

Dashboard manual para gestión de guardias y descansos de técnicos.

## Características

- ✅ Dashboard de calendario interactivo
- ✅ Gestión manual de guardias (semana completa)
- ✅ Gestión de días libres individuales
- ✅ Incremento/decremento manual de días pendientes
- ✅ Eliminar guardias y descansos asignados
- ✅ Integración con Supabase
- ✅ Serverless functions para Vercel

## Tecnologías

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Base de datos**: Supabase (PostgreSQL)

## Despliegue en Vercel

### 1. Preparar el repositorio

```bash
# Clonar y navegar al proyecto
cd frontend/

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno en Vercel

En tu proyecto de Vercel, configura estas variables de entorno:

```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
NEXT_PUBLIC_API_URL=/api
```

### 3. Desplegar

```bash
# Opción 1: Deploy directo desde CLI
npx vercel

# Opción 2: Conectar repositorio en vercel.com
# - Crear nuevo proyecto en vercel.com
# - Conectar repositorio de GitHub
# - Configurar variables de entorno
# - Deploy automático
```

## Estructura del proyecto

```
frontend/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Dashboard principal
│   ├── layout.tsx         # Layout base
│   └── globals.css        # Estilos globales
├── api/                   # Serverless Functions
│   ├── tecnicos/          # API técnicos
│   ├── guardias.ts        # API guardias
│   └── descansos.ts       # API descansos
├── lib/
│   └── supabase.ts        # Cliente Supabase
└── public/                # Archivos estáticos
```

## API Endpoints

### Técnicos
- `GET /api/tecnicos` - Obtener todos los técnicos
- `PUT /api/tecnicos/[id]/dias-pendientes` - Actualizar días pendientes

### Guardias
- `GET /api/guardias` - Obtener todas las guardias
- `POST /api/guardias` - Crear nueva guardia
- `DELETE /api/guardias/[id]` - Eliminar guardia

### Descansos
- `GET /api/descansos` - Obtener todos los descansos
- `POST /api/descansos` - Crear nuevo descanso
- `DELETE /api/descansos/[id]` - Eliminar descanso

## Funcionalidades del Dashboard

### Gestión de Técnicos
- Ver lista de técnicos activos
- Incrementar/decrementar días pendientes manualmente
- Botones +1/-1 día para ajustes rápidos

### Calendario Interactivo
- Vista mensual con eventos
- Click en día para asignar guardia o descanso
- Colores diferenciados:
  - 🔵 Azul: Guardias (semana completa)
  - 🟢 Verde: Descansos (un día)

### Eliminación de Eventos
- Botón ❌ en cada evento para eliminar
- Confirmación antes de eliminar
- Actualización automática de días pendientes

## Base de Datos (Supabase)

### Tablas requeridas:

```sql
-- Técnicos
CREATE TABLE tecnicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  dias_pendientes INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Guardias
CREATE TABLE guardias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id UUID REFERENCES tecnicos(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Descansos
CREATE TABLE descansos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id UUID REFERENCES tecnicos(id),
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

## Notas de Producción

- ✅ Serverless functions optimizadas para Vercel
- ✅ CORS configurado para producción
- ✅ Variables de entorno seguras
- ✅ TypeScript para mejor mantenibilidad
- ✅ Error handling completo
- ✅ Validación de datos en API