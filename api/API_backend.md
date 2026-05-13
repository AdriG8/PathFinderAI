# API PathFinderAI - Documentación de Endpoints

Base URL: `http://localhost:3000` (desarrollo)  
Producción: Configurar en variables de entorno del despliegue (Vercel/Railway)

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
  "timestamp": "2024-01-01T12:00:00.000Z"
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
  "password": "contraseña123",
  "firstName": "Nombre",
  "lastName": "Apellidos"
}
```

**Respuesta:**
```json
{
  "session": { ... },
  "user": { ... }
}
```

**Errores:**
```json
{ "error": "Faltan datos requeridos" }
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

**Respuesta:**
```json
{
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 3600,
    "token_type": "bearer",
    "user": { ... }
  },
  "user": { ... }
}
```

---

### POST /api/auth/google
Inicia sesión con Google OAuth.

**Body:**
```json
{
  "idToken": "google_id_token"
}
```

**Respuesta:** Mismo formato que login.

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
{ "message": "Instructions sent to your email" }
```

---

### POST /api/logout
Cierra la sesión del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{ "message": "Sesion cerrada correctamente" }
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
  "rol": "user",
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

Opciones de nivel: `principiante`, `medio`, `avanzado`

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
{ "message": "Contrasena cambiada correctamente" }
```

**Errores:**
```json
{ "error": "La contrasena actual es incorrecta" }
```

---

### DELETE /api/delete-account
Elimina la cuenta del usuario y todos sus datos.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "password": "contraseñaActual"
}
```

**Nota:** Si el usuario se registró con Google, no requiere contraseña.

**Respuesta:**
```json
{ "message": "Cuenta eliminada correctamente" }
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
3. Devuelve el roadmap con nodos, conexiones y recursos (enlaces)

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
            { "titulo": "Documentación oficial", "url": "https://react.dev" },
            { "titulo": "Tutorial gratuito", "url": "https://freecodecamp.org" }
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
- Cada nodo incluye recursos con enlaces reales y funcionales
- Los enlaces son generados por la IA (no se usa búsqueda externa)
- Aprox. 10-15 nodos de profundidad
- Cada nodo incluye `horas` estimadas para completarlo

**Errores:**
```json
{ "error": "GEMINI_API_KEY no configurada" }
{ "error": "El tema no es valido para generar un roadmap" }
```

---

## Búsqueda de Recursos

### POST /api/search-resources
Busca recursos externos para un nodo (YouTube + Wikipedia).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "query": "React hooks tutorial"
}
```

**Respuesta:**
```json
{
  "youtube": [
    { "title": "Video título", "url": "https://youtube.com/watch?v=..." }
  ],
  "wikipedia": [
    { "title": "Artículo título", "url": "https://wikipedia.org/wiki/..." }
  ]
}
```

---

## Exámenes

### POST /api/exam
Genera un examen tipo test para validar el aprendizaje de un nodo.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "topic": "JavaScript Arrays",
  "level": "principiante"
}
```

**Respuesta:**
```json
{
  "questions": [
    {
      "id": "1",
      "question": "¿Qué es un array en JavaScript?",
      "options": [
        { "letter": "A", "text": "Un tipo de dato primitivo" },
        { "letter": "B", "text": "Una lista ordenada de elementos" },
        { "letter": "C", "text": "Un objeto especial" },
        { "letter": "D", "text": "Una función" }
      ],
      "explanation": "Los arrays son estructuras de datos que almacenan elementos ordenados."
    }
  ]
}
```

---

## Roadmaps

### POST /api/save
Guarda un roadmap en la base de datos.

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

**Nota:** Al guardar, el tema se añade automáticamente a la tabla Metrica.

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

**Error:**
```json
{ "error": "No se encontró el roadmap" }
```

---

### PUT /api/roadmaps/:id
Actualiza un roadmap existente (ej. cambiar título).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "Titulo_Tema": "Nuevo título"
}
```

**Respuesta:**
```json
{ "message": "Roadmap actualizado" }
```

---

### DELETE /api/roadmaps/:id
Elimina un roadmap de la base de datos.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{ "message": "Roadmap eliminado" }
```

---

### GET /api/roadmap/test
Endpoint de prueba público.

**Respuesta:**
```json
{ "message": "Test endpoint works", "tables": ["Roadmap"] }
```

---

## Administración

### GET /api/admin/stats
Obtiene estadísticas globales (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "totalUsuarios": 150,
  "totalRoadmaps": 320,
  "tendenciaUsuarios": [
    { "fecha": "2024-01-01", "count": 5 },
    { "fecha": "2024-01-02", "count": 3 }
  ]
}
```

**Error:**
```json
{ "error": "Acceso denegado. Solo administradores." }
```

---

### GET /api/admin/topics
Obtiene todos los temas consultados (solo admin).

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
[
  { "id": "user1-0", "usuario": "Juan Pérez", "tema": "React" },
  { "id": "user1-1", "usuario": "Juan Pérez", "tema": "JavaScript" },
  { "id": "user2-0", "usuario": "María García", "tema": "Python" }
]
```

---

## Métricas de Usuario

### GET /api/metrics/temas
Obtiene los temas consultados del usuario actual.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{
  "temas": ["React", "JavaScript", "TypeScript"]
}
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
{ "error": "Faltan datos requeridos" }
{ "error": "Token no proporcionado" }
{ "error": "Token invalido o expirado" }
{ "error": "La contrasena es incorrecta" }
{ "error": "GEMINI_API_KEY no configurada" }
{ "error": "El tema no es valido para generar un roadmap" }
{ "error": "Acceso denegado. Solo administradores." }
```

---

## Variables de Entorno Requeridas

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Google Gemini
GEMINI_API_KEY=tu-gemini-api-key

# Sitio
SITE_URL=http://localhost:5173

# OAuth Google (frontend)
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

---

## Estructura de Base de Datos

### Tablas

- **Usuarios**: Perfiles de usuario (ID, Nombre, Apellidos, Email, Nivel, Rol)
- **Roadmap**: Roadmaps guardados (ID, ID_Usuario, Titulo_Tema, JSON, Fecha_Creacion)
- **Metrica**: Temas consultados por usuario (ID, ID_Usuario, Temas_Consultados[])

### Funciones SQL

- `agregar_tema_consultado(p_id_usuario, p_tema)`: Añade un tema al array de un usuario
- `obtener_temas_consultados(p_id_usuario)`: Obtiene los temas de un usuario

---

## Notas

- Todos los endpoints requieren autenticación excepto: `/health`, `/register`, `/login`, `/forgot-password`, `/auth/google`, `/roadmap/test`
- La generación de roadmaps usa `gemini-2.5-flash` de Google Gemini
- Los recursos (enlaces) se generan junto con el roadmap (no se buscan externamente)
- Los roadmaps se guardan automáticamente al generar y añadir a Metrica