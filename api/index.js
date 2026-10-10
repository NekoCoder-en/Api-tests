/**
 * ============================================================================
 * ENTRYPOINT SERVERLESS PARA VERCEL (api/index.js)
 * ============================================================================
 * 
 * Vercel trata cualquier archivo dentro del directorio `/api` como una
 * Serverless Function (función lambda sin servidor).
 * 
 * Al exportar directamente la instancia de Express (`module.exports = app`),
 * Vercel se encarga automáticamente de adaptar las peticiones HTTP entrantes
 * (Request y Response) al ciclo de vida de la Serverless Function.
 * 
 * En combinación con la regla de reescritura de `vercel.json`, todas las rutas:
 *   /api/auth/*, /api/user/*, etc.
 * son canalizadas hacia esta única función serverless.
 */

const app = require('../src/app');

module.exports = app;
