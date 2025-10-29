# Despliegue en Vercel

Este proyecto está listo para desplegarse en Vercel con las siguientes configuraciones:

## Pasos para desplegar:

1. **Conectar repositorio en Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio GitHub
   - Selecciona el directorio `frontend` como root del proyecto

2. **Configurar variables de entorno:**
   En la configuración del proyecto en Vercel, añade estas variables:
   
   ```bash
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-anon-key
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   NEXT_PUBLIC_API_URL=/api
   ```

3. **Configuración automática:**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El archivo `vercel.json` ya está configurado
   - Las APIs serverless se desplegarán automáticamente

## Estructura del proyecto:

- **Frontend:** Next.js con TypeScript
- **APIs:** Serverless functions en `/api`
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** No requerida (dashboard interno)

## APIs disponibles:

- `GET /api/tecnicos` - Lista de técnicos
- `GET /api/guardias` - Lista de guardias
- `POST /api/guardias` - Crear guardia
- `DELETE /api/guardias/[id]` - Eliminar guardia
- `GET /api/descansos` - Lista de descansos
- `POST /api/descansos` - Crear descanso
- `DELETE /api/descansos/[id]` - Eliminar descanso
- `PUT /api/tecnicos/[id]/dias-pendientes` - Actualizar días pendientes

## Funcionalidades:

1. **Dashboard de guardias:** Calendario interactivo para asignar guardias semanales
2. **Gestión de descansos:** Asignar días libres individuales
3. **Días pendientes:** Sistema de incremento/decremento manual
4. **Eliminación:** Botones para eliminar guardias y descansos existentes

## Nota importante:

Este proyecto no incluye el sistema de procesamiento automático (cron jobs) ya que las serverless functions de Vercel no soportan procesos en background. Para el procesamiento automático, sería necesario usar Vercel Cron Jobs (plan Pro) o un servicio externo.