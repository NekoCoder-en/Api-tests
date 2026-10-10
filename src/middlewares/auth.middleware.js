/**
 * ============================================================================
 * MIDDLEWARE DE AUTENTICACIÓN (src/middlewares/auth.middleware.js)
 * ============================================================================
 * 
 * Este middleware intercepta las peticiones dirigidas a rutas protegidas.
 * Su responsabilidad es:
 * 1. Extraer el JWT del encabezado HTTP 'Authorization'.
 * 2. Validar que el token sea genuino y no haya expirado usando Supabase Auth.
 * 3. Inyectar la información del usuario autenticado en el objeto `req.user`.
 * 4. Permitir el paso al siguiente controlador con `next()`, o responder con 401 si falla.
 */

const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  try {
    // 1. Obtener el encabezado 'Authorization' de la petición HTTP
    const authHeader = req.headers['authorization'];

    // Si el cliente (.NET MAUI) no envió el encabezado, rechazamos la petición
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado: No se proporcionó el encabezado Authorization.',
      });
    }

    // 2. Comprobar que el formato siga la convención estándar 'Bearer <token>'
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({
        success: false,
        error: 'Formato de autorización inválido. Debe ser: Bearer <token>',
      });
    }

    const token = parts[1];

    /**
     * 3. Validar el token con Supabase Auth.
     * 
     * ¿POR QUÉ USAR `supabase.auth.getUser(token)` EN LUGAR DE SOLO DECODIFICAR EL JWT?
     * Como buena práctica Senior:
     * Si solo verificas la firma matemática del JWT con una librería local,
     * no te enteras si el usuario fue eliminado, suspendido, o si su sesión fue revocada
     * desde el panel de Supabase. Al llamar a `getUser(token)`, Supabase valida tanto
     * la firma criptográfica como el estado real y actual del usuario en la base de datos.
     */
    const { data: { user }, error } = await supabase.auth.getUser(token);

    // Si Supabase devuelve un error (token expirado, alterado o usuario inexistente)
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado.',
        details: error ? error.message : null,
      });
    }

    // 4. Inyectar los datos del usuario en la petición para que los controladores posteriores puedan consumirlos
    req.user = user;

    // Cedemos el control al siguiente middleware o controlador de la ruta
    return next();
  } catch (err) {
    // Manejo de errores imprevistos
    console.error('Error inesperado en auth.middleware:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor durante la verificación de identidad.',
    });
  }
};

module.exports = {
  authenticateToken,
};
