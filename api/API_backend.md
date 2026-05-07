# API PathFinderAI - Documentación de Endpoints

Base URL: `http://localhost:3000` (desarrollo)  
Puertos de producción: Variables de entorno de Vercel

---

## Autenticación

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer <token>
```

El token se obtiene tras hacer login o register y debe almacenarse en el cliente.

---

## Endpoints

### Health Check

#### GET /api/health
Verifica que la API está funcionando y el estado de las variables de entorno.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "checks": {
    "server": "ok",
    "environment": "ok"
  }
}
```

Si faltan variables de entorno:
```json
{
  "status": "ok",
  "message": "API funcionando pero faltan variables de entorno",
  "checks": {
    "server": "ok",
    "environment": "warning"
  },
  "missingEnvVars": ["GEMINI_API_KEY"]
}
```

---

## Autenticación

### POST /api/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta (éxito):**
```json
{
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600,
    "expires_at": 1704067200,
    "token_type": "bearer",
    "user": { ... }
  }
}
```

**Respuesta (error):**
```json
{ "error": "User already registered" }
```

---

### POST /api/login
Inicia sesión con email y contraseña.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta:** Mismo formato que register.

---

### POST /api/forgot-password
Solicita un email para recuperar la contraseña.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Respuesta:**
```json
{ "message": "Correo de recuperación enviado" }
```

---

### POST /api/logout
Cierra la sesión del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{ "message": "Sesión cerrada correctamente" }
```

---

### POST /api/forgot-password
Solicita un email para recuperar la contraseña olvidada.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

**Respuesta:**
```json
{ "message": "Correo de recuperación enviado" }
```

---

## Perfil de Usuario

### GET /api/profile
Obtiene los datos del perfil del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "nombre": "Nombre",
  "apellidos": "Apellidos",
  "nivel": "principiante",
  "email": "usuario@email.com"
}
```

---

### PUT /api/profile
Actualiza los datos del perfil.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "Nuevo Nombre",
  "apellidos": "Nuevos Apellidos",
  "nivel": "medio"
}
```

Opciones de nivel: `principiante`, `medio`, `avanzada`

**Respuesta:**
```json
{ "message": "Perfil actualizado correctamente" }
```

---

### PUT /api/change-password
Cambia la contraseña del usuario.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña"
}
```

**Respuesta:**
```json
{ "message": "Contraseña cambiada correctamente" }
```

**Errores:**
```json
{ "error": "La contraseña actual es incorrecta" }
```

---

## Generación de Roadmap

### POST /api/generate
Genera un roadmap usando IA (Google Gemini).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "prompt": "Quiero aprender Desarrollo con IA"
}
```

**Proceso:**
1. Obtiene el nivel del usuario desde la base de datos
2. Envía el prompt a Gemini con instrucciones para crear un roadmap JSON
3. Devuelve el roadmap con nodos y conexiones

**Respuesta:**
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "data": {
        "label": "Tema principal",
        "status": "pendiente",
        "isEditing": false,
        "horas": 2,
        "resources": {
          "enlaces": [
            { "nombre": "Doc oficial", "url": "https://react.dev" },
            { "nombre": "Tutorial", "url": "https://ejemplo.com" }
          ]
        }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
```

**Notas:**
- El roadmap se adapta al nivel del usuario (principiante/medio/avanzada)
- Aprox. 50 nodos de profundidad
- Cada nodo incluye `horas` estimadas
- Cada nodo incluye recursos con enlaces válidos

**Errores específicos:**
```json
{ "error": "GEMINI_API_KEY no configurada" }
```
```json
{ "error": "El tema no es válido para generar un roadmap" }
```
```json
{ "error": "Servicio no disponible, intente más tarde" }
```

---

## Roadmaps

### POST /api/save
Guarda o actualiza un roadmap en la base de datos.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "Mi Roadmap",
  "json": {
    "nodes": [...],
    "edges": [...]
  }
}
```

Para actualizar un roadmap existente, incluir el `id`:
```json
{
  "id": "uuid-del-roadmap",
  "title": "Mi Roadmap Actualizado",
  "json": { ... }
}
```

**Respuesta:**
```json
{
  "ID": "uuid-generado",
  "ID_Usuario": "user_id",
  "Titulo_Tema": "Mi Roadmap",
  "JSON": { ... },
  "Fecha_Creacion": "2024-01-01T12:00:00.000Z"
}
```

---

### GET /api/roadmaps
Obtiene todos los roadmaps del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
[
  {
    "ID": "roadmap_123",
    "ID_Usuario": "user_456",
    "Titulo_Tema": "Mi Roadmap",
    "Fecha_Creacion": "2024-01-01",
    "JSON": { ... }
  }
]
```

---

### GET /api/roadmap/:id
Obtiene un roadmap específico por ID.

**Headers:** `Authorization: Bearer <token>`

**Parámetros:** `id` - UUID del roadmap

**Respuesta:**
```json
{
  "ID": "roadmap_123",
  "ID_Usuario": "user_456",
  "Titulo_Tema": "Mi Roadmap",
  "Fecha_Creacion": "2024-01-01",
  "JSON": { ... }
}
```

**Error (no encontrado):**
```json
{ "error": "Roadmap no encontrado" }
```

---

### GET /api/roadmap/test
Endpoint de prueba público (sin autenticación).

**Respuesta:**
```json
{ "message": "Roadmap test endpoint working" }
```

---

### PUT /api/roadmaps/:id
Actualiza un roadmap existente (ej. cambiar título).

**Headers:** `Authorization: Bearer <token>`

**Parámetros:** `id` - UUID del roadmap

**Body:**
```json
{
  "Titulo_Tema": "Nuevo título del roadmap"
}
```

**Respuesta:**
```json
{ "message": "Roadmap actualizado correctamente" }
```

---

### DELETE /api/roadmaps/:id
Elimina un roadmap de la base de datos.

**Headers:** `Authorization: Bearer <token>`

**Parámetros:** `id` - UUID del roadmap

**Respuesta:**
```json
{ "message": "Roadmap eliminado correctamente" }
```

---

## Administración

### GET /api/admin/stats
Obtiene estadísticas globales de la aplicación (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "totalUsuarios": 150,
  "totalRoadmaps": 320,
  "roadmapsPorNivel": {
    "principiante": 100,
    "medio": 150,
    "avanzada": 70
  }
}
```

**Error (sin permisos):**
```json
{ "error": "Acceso restringido a administradores" }
```

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 400 | Error en la petición (datos inválidos, tema no válido) |
| 401 | No autenticado (token inválido o ausente) |
| 403 | Prohibido (sin permisos, ej. endpoint de admin) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Códigos de Error Comunes

```json
{ "error": "User already registered" }
{ "error": "Invalid login credentials" }
{ "error": "Token expired" }
{ "error": "Roadmap no encontrado" }
{ "error": "GEMINI_API_KEY no configurada" }
{ "error": "El tema no es válido para generar un roadmap" }
{ "error": "Acceso restringido a administradores" }
```

---

## Variables de Entorno Requeridas

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key

# Gemini IA
GEMINI_API_KEY=tu_api_key
```

---

## Uso con Frontend

### Fetch ejemplo (JavaScript)
```javascript
const response = await fetch(`${API_URL}/api/roadmaps`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
const data = await response.json()
```

### Fetch ejemplo (with Axios)
```javascript
const config = {
  headers: { Authorization: `Bearer ${token}` }
}
const response = await axios.get(`${API_URL}/api/profile`, config)
```

---

## Notas

- Todos los endpoints de usuario requieren autenticación excepto: `/api/health`, `/api/register`, `/api/login`, `/api/forgot-password`, `/api/roadmap/test`
- El endpoint de eliminación de cuenta (`DELETE /api/delete-account`) está deshabilitado temporalmente
- La generación de roadmaps usa el modelo `gemini-flash-latest` de Google Gemini