/**
 * ============================================================================
 * ARCHIVO DE CONFIGURACIÓN DEL CLIENTE SUPABASE (src/config/supabase.js)
 * ============================================================================
 * 
 * En este archivo centralizamos la inicialización de Supabase usando el SDK oficial.
 * Al aislar la configuración aquí, cualquier ruta o controlador puede importar
 * la misma instancia sin duplicar lógica ni dispersar variables de entorno.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Obtenemos las credenciales desde las variables de entorno.
// Esto permite que el código funcione tanto en local (.env) como en Vercel (Project Settings -> Environment Variables).
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validación temprana de variables esenciales para evitar fallos silenciosos en tiempo de ejecución.
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error crítico: SUPABASE_URL o SUPABASE_ANON_KEY no están definidas en las variables de entorno.');
}

/**
 * ----------------------------------------------------------------------------
 * 1. CLIENTE ESTÁNDAR (Público / Anon)
 * ----------------------------------------------------------------------------
 * Este cliente utiliza la clave `anon` y respeta todas las políticas de
 * seguridad a nivel de fila (RLS - Row Level Security) configuradas en Supabase.
 * 
 * NOTA SENIOR DE ARQUITECTURA SERVERLESS:
 * En entornos de backend (Node.js / Express / Vercel Serverless), es FUNDAMENTAL
 * configurar `persistSession: false` y `autoRefreshToken: false`.
 * ¿Por qué? Porque en un backend no hay un "navegador" ni un solo usuario:
 * múltiples peticiones de distintos usuarios comparten el mismo proceso o contenedor.
 * Si persistiéramos la sesión, la sesión de un usuario podría quedar guardada en memoria
 * y filtrarse accidentalmente a la petición de otro usuario. Cada petición debe ser 100% sin estado (stateless).
 */
let supabase = null;
let supabaseAdmin = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,     // No almacenar tokens en almacenamiento local o cookies del proceso
      autoRefreshToken: false,   // El backend no debe renovar tokens en segundo plano automáticamente
      detectSessionInUrl: false, // Desactivar detección de hash en URL (propia de navegadores SPA)
    },
  });
} else {
  console.warn('⚠️ ADVERTENCIA: SUPABASE_URL o SUPABASE_ANON_KEY no están configuradas.');
}

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = {
  supabase,
  supabaseAdmin,
};
