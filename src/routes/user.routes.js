/**
 * ============================================================================
 * RUTAS DE USUARIO (src/routes/user.routes.js)
 * ============================================================================
 * 
 * Este módulo contiene las rutas protegidas del usuario.
 * Requieren un JWT válido en el encabezado 'Authorization: Bearer <token>'.
 * 
 * - GET /api/user/profile : Retorna los datos del usuario autenticado.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT: GET /api/user/profile (PROTEGIDO)
 * ----------------------------------------------------------------------------
 * Propósito: Obtener el perfil y metadatos del usuario autenticado.
 * Encabezado obligatorio:
 *   Authorization: Bearer <access_token>
 * 
 * Flujo:
 * 1. Se ejecuta el middleware `authenticateToken`.
 * 2. Si el token es inválido o no existe, el middleware corta la petición con 401.
 * 3. Si es válido, inyecta `req.user` y este controlador se ejecuta de inmediato.
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Obtenemos los datos del usuario que el middleware validó previamente con Supabase
    const user = req.user;

    // Retornamos un objeto limpio y estructurado para la aplicación móvil (.NET MAUI)
    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastSignInAt: user.last_sign_in_at,
        // Los user_metadata son campos personalizados que puedes adjuntar al usuario (ej: nombre, avatar, etc.)
        userMetadata: user.user_metadata || {},
        appMetadata: user.app_metadata || {},
      },
    });
  } catch (err) {
    console.error('Error no controlado en GET /profile:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener el perfil de usuario.',
    });
  }
});

module.exports = router;
