import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno PRIMERO
dotenv.config();

// Importar rutas DESPUÉS de cargar las variables
import tecnicosRoutes from './routes/tecnicos.js';
import guardiasRoutes from './routes/guardias.js';
import descansosRoutes from './routes/descansos.js';
import cronRoutes, { processDueDescansos } from './routes/cron.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/guardias', guardiasRoutes);
app.use('/api/descansos', descansosRoutes);
app.use('/api/cron', cronRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.originalUrl}`,
    message: 'Verifica la URL y el método HTTP'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🩺 API Health: http://localhost:${PORT}/health`);
  // Ejecutar el job de procesado de descansos al iniciar (no bloqueante)
  processDueDescansos()
    .then(res => console.log('[startup] Job de procesado de descansos finalizado', res))
    .catch(err => console.warn('[startup] Job de procesado de descansos falló (ver detalles):', err?.message || err));
});
