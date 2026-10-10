/**
 * ============================================================================
 * SERVIDOR LOCAL PARA DESARROLLO (src/server.js)
 * ============================================================================
 * 
 * Este archivo es el punto de entrada para levantar la API en tu máquina local.
 * Lee el puerto desde las variables de entorno (.env) e inicia el listener HTTP de Express.
 * 
 * Comando de ejecución:
 *   npm run dev   (con recarga automática mediante nodemon)
 *   npm start     (ejecución directa con node)
 */

require('dotenv').config();
const app = require('./app');

// Puerto por defecto 3000 o el que especifique la variable de entorno PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   - GET  http://localhost:${PORT}/api             (Health check)`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/api/auth/refresh`);
  console.log(`   - GET  http://localhost:${PORT}/api/user/profile (Protegido con JWT)`);
  console.log('================================================================');
});
