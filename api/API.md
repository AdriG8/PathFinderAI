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
Verifica que la API está funcionando.

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

---

### Autenticación

#### POST /api/register
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@email.com",
  "password": "contraseña123",
  "nombre": "Nombre",
  "apellidos": "Apellidos"
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

#### POST /api/login
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

#### POST /api/logout
Cierra la sesión del usuario.

**Headers:** `Authorization: Bearer <token>`

**Respuesta:**
```json
{ "message": "Sesión cerrada correctamente" }
```

---

### Perfil de Usuario

#### GET /api/profile
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

#### PUT /api/profile
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

#### PUT /api/change-password
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

---

### Generación de Roadmap

#### POST /api/generate
Genera un roadmap usando IA (Gemini).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "prompt": "Quiero aprender Desarrollo con IA"
}
```

**Respuesta:**
```json
{
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "data": {
        "label": "Tema principal",
        "status": "pendiente",
        "isEditing": false,
        "horas": 2,
        "resources": { "enlaces": [] }
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

---

### Roadmaps

#### POST /api/save
Guarda un roadmap en la base de datos.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "id": "roadmap_123",
  "title": "Mi Roadmap",
  "json": {
    "nodes": [...],
    "edges": [...]
  }
}
```

**Respuesta:**
```json
{ "message": "Roadmap guardado correctamente", "id": "roadmap_123" }
```

---

#### GET /api/roadmaps
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

#### GET /api/roadmap/:id
Obtiene un roadmap específico por ID.

**Headers:** `Authorization: Bearer <token>`

**Params:** `id` - ID del roadmap

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

---

#### GET /api/roadmap/test
Endpoint de prueba público (sin auth).

**Respuesta:**
```json
{ "message": "Roadmap test endpoint working" }
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Error en la petición (datos inválidos) |
| 401 | No autenticado (token inválido o ausente) |
| 500 | Error interno del servidor |

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