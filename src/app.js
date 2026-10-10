/**
 * ============================================================================
 * CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN EXPRESS (src/app.js)
 * ============================================================================
 * 
 * En este archivo se configuran los middlewares globales, se enlazan las rutas
 * y se definen los manejadores de rutas no encontradas (404) y errores globales.
 * 
 * NOTA DE ARQUITECTURA:
 * Este archivo NO ejecuta `app.listen()`. Solo exporta la instancia de `app`.
 * Esto permite que:
 * 1. Vercel Serverless importe la app directamente en `api/index.js`.
 * 2. El entorno local ejecute el servidor en `src/server.js`.
 * 3. Se puedan escribir tests automatizados (ej: Supertest/Jest) sin abrir puertos de red.
 */

const express = require('express');
const cors = require('cors');

// Importación de módulos de rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

/**
 * ----------------------------------------------------------------------------
 * 1. MIDDLEWARES GLOBALES
 * ----------------------------------------------------------------------------
 */

// Habilitar CORS (Cross-Origin Resource Sharing).
// Esencial para que clientes móviles (.NET MAUI) o clientes web no sean bloqueados por políticas de origen cruzado.
app.use(cors());

// Parser para interpretar el cuerpo de peticiones entrantes con formato JSON (Content-Type: application/json).
app.use(express.json());

// Parser para datos codificados en URL (formularios tradicionales)
app.use(express.urlencoded({ extended: true }));

/**
 * ----------------------------------------------------------------------------
 * 2. ENDPOINT DE ESTADO / HEALTH CHECK
 * ----------------------------------------------------------------------------
 * Útil para monitoreo y para verificar que la API está viva sin requerir autenticación.
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 API REST conectada a Supabase funcionando correctamente.',
    timestamp: new Date().toISOString(),
  });
});

/**
 * ----------------------------------------------------------------------------
 * 3. MONTAJE DE RUTAS MODULARES
 * ----------------------------------------------------------------------------
 */
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

/**
 * ----------------------------------------------------------------------------
 * 4. MANEJADOR DE RUTAS NO ENCONTRADAS (404 Not Found)
 * ----------------------------------------------------------------------------
 * Si una petición no coincide con ninguna ruta previa, responde con 404 estructurado.
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: [${req.method}] ${req.originalUrl}`,
  });
});

/**
 * ----------------------------------------------------------------------------
 * 5. MANEJADOR GLOBAL DE ERRORES (Error Handling Middleware)
 * ----------------------------------------------------------------------------
 * Captura cualquier error no controlado ocurrido en la cadena de middlewares.
 */
app.use((err, req, res, next) => {
  console.error('💥 Error global no capturado:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno no especificado en el servidor.',
  });
});

module.exports = app;
