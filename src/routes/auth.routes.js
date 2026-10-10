/**
 * ============================================================================
 * RUTAS DE AUTENTICACIÓN (src/routes/auth.routes.js)
 * ============================================================================
 * 
 * Este módulo contiene los endpoints públicos relacionados con la gestión de sesiones:
 * - POST /api/auth/register : Registro de nuevos usuarios.
 * - POST /api/auth/login    : Inicio de sesión con email y contraseña.
 * - POST /api/auth/refresh  : Renovación de tokens vencidos mediante refresh_token.
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Middleware a nivel de router para validar que el cliente de Supabase esté disponible
router.use((req, res, next) => {
  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Error de configuración en el servidor: Las variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas en Vercel.',
      hint: 'Por favor, configura SUPABASE_URL y SUPABASE_ANON_KEY en las Environment Variables de tu proyecto en el panel de Vercel.',
    });
  }
  next();
});

/**
 * Función auxiliar para validar formato básico de correo electrónico.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
};

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT: POST /api/auth/register
 * ----------------------------------------------------------------------------
 * Propósito: Dar de alta un nuevo usuario en Supabase Auth.
 * Body esperado (JSON):
 *   {
 *     "email": "usuario@ejemplo.com",
 *     "password": "Password123!"
 *   }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDACIÓN PREVENTIVA DE ENTRADAS (Fail Early)
    // Evitamos llamadas innecesarias a la red si los datos requeridos no existen.
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Petición inválida: Tanto el campo "email" como "password" son obligatorios.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Petición inválida: El formato del correo electrónico no es válido.',
      });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Petición inválida: La contraseña debe tener al menos 6 caracteres.',
      });
    }

    // 2. EJECUCIÓN EN SUPABASE
    // supabase.auth.signUp crea el usuario en la tabla interna auth.users
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    // 3. MANEJO DE ERRORES DE SUPABASE (ej. Usuario ya existente o contraseña débil)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    /**
     * IMPORTANTE SOBRE CONFIRMACIÓN DE CORREO:
     * Si en tu panel de Supabase (Authentication -> Providers -> Email) tienes activado
     * "Confirm email", Supabase NO creará una sesión inmediata (`data.session` será null)
     * hasta que el usuario haga clic en el correo de verificación.
     * Si está desactivado, `data.session` devolverá el JWT de inmediato.
     */
    const requiresEmailConfirmation = !data.session;

    return res.status(201).json({
      success: true,
      message: requiresEmailConfirmation
        ? 'Usuario registrado exitosamente. Se ha enviado un correo de confirmación.'
        : 'Usuario registrado e iniciado sesión exitosamente.',
      user: {
        id: data.user.id,
        email: data.user.email,
        createdAt: data.user.created_at,
      },
      session: data.session
        ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresIn: data.session.expires_in,
            tokenType: data.session.token_type,
          }
        : null,
    });
  } catch (err) {
    // 4. MANEJO DE ERRORES INESPERADOS DEL SERVIDOR (Crash preventer)
    console.error('Error no controlado en /register:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar el registro.',
    });
  }
});

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT: POST /api/auth/login
 * ----------------------------------------------------------------------------
 * Propósito: Autenticar credenciales y generar tokens de sesión (Access Token + Refresh Token).
 * Body esperado (JSON):
 *   {
 *     "email": "usuario@ejemplo.com",
 *     "password": "Password123!"
 *   }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDACIÓN PREVENTIVA DE ENTRADAS
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Petición inválida: Se requieren "email" y "password".',
      });
    }

    // 2. INICIO DE SESIÓN CON SUPABASE
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    // 3. VERIFICACIÓN DE CREDENCIALES
    // Si las credenciales son incorrectas o el email no ha sido confirmado
    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas o cuenta no confirmada.',
        details: error ? error.message : null,
      });
    }

    // 4. RESPUESTA EXITOSA (200 OK)
    // El cliente móvil (.NET MAUI) almacenará el accessToken para sus peticiones seguras
    // y el refreshToken en SecureStorage para no pedir credenciales nuevamente al usuario.
    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      user: {
        id: data.user.id,
        email: data.user.email,
        lastSignInAt: data.user.last_sign_in_at,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in, // Tiempo en segundos de validez (usualmente 3600 = 1 hora)
        tokenType: data.session.token_type,
      },
    });
  } catch (err) {
    console.error('Error no controlado en /login:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al iniciar sesión.',
    });
  }
});

/**
 * ----------------------------------------------------------------------------
 * ENDPOINT: POST /api/auth/refresh
 * ----------------------------------------------------------------------------
 * Propósito: Renovar un Access Token vencido sin obligar al usuario a escribir
 *            su contraseña otra vez.
 * Body esperado (JSON):
 *   {
 *     "refreshToken": "tu_refresh_token_aqui"
 *   }
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 1. VALIDACIÓN DEL TOKEN DE REFRESCO
    if (!refreshToken || typeof refreshToken !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Petición inválida: El campo "refreshToken" es obligatorio.',
      });
    }

    // 2. SOLICITUD DE RENOVACIÓN A SUPABASE
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken.trim(),
    });

    // 3. COMPROBACIÓN DE VIGENCIA DEL REFRESH TOKEN
    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        error: 'El refresh token es inválido o ha expirado. Por favor, inicia sesión de nuevo.',
        details: error ? error.message : null,
      });
    }

    // 4. RETORNO DE LA NUEVA SESIÓN
    return res.status(200).json({
      success: true,
      message: 'Sesión renovada correctamente.',
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
        tokenType: data.session.token_type,
      },
    });
  } catch (err) {
    console.error('Error no controlado en /refresh:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al renovar la sesión.',
    });
  }
});

module.exports = router;
