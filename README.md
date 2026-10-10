# API REST Node.js + Supabase Auth (Optimizada para Vercel y .NET MAUI)

Backend API modular, seguro y listo para producción, construido con **Express**, el SDK oficial `@supabase/supabase-js`, y preparado para ejecutarse tanto de forma local como en **Vercel Serverless Functions**.

---

## 📁 Estructura del Proyecto

```text
Api-tests/
├── api/
│   └── index.js              # Entrypoint Serverless para Vercel
├── src/
│   ├── config/
│   │   └── supabase.js       # Inicialización del cliente Supabase (Stateless)
│   ├── middlewares/
│   │   └── auth.middleware.js# Middleware de validación JWT para rutas protegidas
│   ├── routes/
│   │   ├── auth.routes.js    # Endpoints: /register, /login, /refresh
│   │   └── user.routes.js    # Endpoint protegido: /profile
│   ├── app.js                # Configuración de Express, CORS y manejadores de error
│   └── server.js             # Listener HTTP para ejecución en entorno local
├── .env                      # Variables de entorno locales (credenciales de Supabase)
├── .env.example              # Plantilla para desplegar o compartir
├── .gitignore                # Exclusión de archivos sensibles y node_modules
├── package.json              # Dependencias y scripts de npm
├── vercel.json               # Configuración de reescritura de rutas para Vercel
└── README.md                 # Documentación y guía de estudio
```

---

## 🛠️ Instalación y Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Verificar variables en `.env`:**
   Asegúrate de que tu archivo `.env` contenga tus credenciales:
   ```env
   SUPABASE_URL=https://svcubwcrrwfwvahdbkjk.supabase.co
   SUPABASE_ANON_KEY=tu_clave_anon
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
   PORT=3000
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   O en producción local:
   ```bash
   npm start
   ```

---

## 🌐 Endpoints de la API

### 1. Health Check
- **Método:** `GET`
- **Ruta:** `/api`
- **Descripción:** Verifica que el servidor está activo.

---

### 2. Registro de Usuario
- **Método:** `POST`
- **Ruta:** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "email": "nuevo_usuario@correo.com",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "success": true,
    "message": "Usuario registrado exitosamente. Se ha enviado un correo de confirmación.",
    "user": {
      "id": "uuid-del-usuario",
      "email": "nuevo_usuario@correo.com",
      "createdAt": "2026-10-10T..."
    },
    "session": null
  }
  ```
  > **Nota de Supabase:** Si en tu panel de Supabase (*Authentication > Providers > Email*) está activada la opción **"Confirm email"**, `session` será `null` hasta que el usuario confirme su correo. Si está desactivada, recibirás la sesión y los tokens de inmediato.

---

### 3. Inicio de Sesión
- **Método:** `POST`
- **Ruta:** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "nuevo_usuario@correo.com",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Inicio de sesión exitoso.",
    "user": {
      "id": "uuid-del-usuario",
      "email": "nuevo_usuario@correo.com",
      "lastSignInAt": "2026-10-10T..."
    },
    "session": {
      "accessToken": "eyJhbGciOiJIUzI1Ni...",
      "refreshToken": "48f1c834-...",
      "expiresIn": 3600,
      "tokenType": "bearer"
    }
  }
  ```

---

### 4. Renovar Token (Refresh Token)
- **Método:** `POST`
- **Ruta:** `/api/auth/refresh`
- **Body (JSON):**
  ```json
  {
    "refreshToken": "48f1c834-..."
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Sesión renovada correctamente.",
    "session": {
      "accessToken": "nuevo_jwt_access_token...",
      "refreshToken": "nuevo_refresh_token...",
      "expiresIn": 3600,
      "tokenType": "bearer"
    }
  }
  ```

---

### 5. Obtener Perfil (Ruta Protegida con JWT)
- **Método:** `GET`
- **Ruta:** `/api/user/profile`
- **Headers:**
  ```text
  Authorization: Bearer <accessToken>
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid-del-usuario",
      "email": "nuevo_usuario@correo.com",
      "phone": null,
      "role": "authenticated",
      "createdAt": "2026-10-10T...",
      "updatedAt": "2026-10-10T...",
      "lastSignInAt": "2026-10-10T...",
      "userMetadata": {},
      "appMetadata": {}
    }
  }
  ```

---

## 🚀 Despliegue en Vercel

### Opción A: Despliegue mediante Vercel CLI
1. Instala el CLI de Vercel si no lo tienes:
   ```bash
   npm i -g vercel
   ```
2. Ejecuta el comando en la raíz del proyecto:
   ```bash
   vercel
   ```
3. Configura las variables de entorno en Vercel:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```
4. Despliega a producción:
   ```bash
   vercel --prod
   ```

### Opción B: Despliegue con GitHub (Recomendado)
1. Sube este repositorio a tu cuenta de GitHub.
2. Ve a [vercel.com](https://vercel.com) e importa tu repositorio.
3. En la sección **Environment Variables** antes de presionar *Deploy*, añade:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Presiona **Deploy**. Vercel detectará automáticamente `vercel.json` y el directorio `api/`.

---

## 📱 Consideraciones de Integración con .NET MAUI

1. **Almacenamiento Seguro:**
   En .NET MAUI, almacena el `accessToken` y `refreshToken` usando la API nativa de seguridad:
   ```csharp
   await SecureStorage.Default.SetAsync("access_token", response.Session.AccessToken);
   await SecureStorage.Default.SetAsync("refresh_token", response.Session.RefreshToken);
   ```

2. **Inyección del Bearer Token en HttpClient:**
   ```csharp
   var token = await SecureStorage.Default.GetAsync("access_token");
   httpClient.DefaultRequestHeaders.Authorization = 
       new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
   ```

3. **Pruebas en el Emulador de Android:**
   Si estás probando el servidor local (`http://localhost:3000`) desde el emulador de Android de MAUI, recuerda que `localhost` dentro del emulador apunta al propio dispositivo Android. Para acceder a tu máquina anfitriona debes usar la dirección IP:
   ```csharp
   http://10.0.2.2:3000/api
   ```
   (Para iOS Simulator o Windows Machine, puedes usar `http://localhost:3000/api` directamente).
