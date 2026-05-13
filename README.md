# 📍 PathFinderAI

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-CC%20BY--SA%203.0-green)
![Status](https://img.shields.io/badge/status-Activo-success)

**Transforma tus dudas en un plan de estudio estructurado.**

*Proyecto Final de Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW)*

</div>

---

## 🌟 Sobre el Proyecto

**PathFinderAI** es un generador inteligente de rutas de aprendizaje que utiliza **Inteligencia Artificial** para crear mapas de estudio personalizados. A diferencia de las hojas de ruta estáticas, esta herramienta:

- 🤖 Genera roadmaps automáticamente usando **Google Gemini API**
- 🕸️ Visualiza el aprendizaje como un grafo interactivo con **React Flow**
- 📊 Permite seguir el progreso con exámenes tipo test
- 📚 Busca recursos automáticamente en **Wikipedia** y **YouTube**
- 🔐 Persiste datos en la nube con **Supabase**

### 🏫 Contexto Académico

| | |
| :--- | :--- |
| **Centro** | I.E.S. «Venancio Blanco» (Salamanca) |
| **Ciclo** | Desarrollo de Aplicaciones Web (DAW) |
| **Autor** | [Adrián Gómez Izquierdo](https://github.com/AdriG8) |
| **Tutor** | Proyecto de fin de ciclo |

---

## ✨ Funcionalidades

<div align="center">

| Función | Descripción |
| :--- | :--- |
| 🤖 **Generación con IA** | Crea rutas de aprendizaje personalizadas a partir de cualquier tema |
| 📝 **Exámenes de Validación** | Examen tipo test de 3 preguntas para marcar nodos como completados |
| 🔍 **Búsqueda de Recursos** | Busca automáticamente enlaces en Wikipedia y YouTube |
| 🕸️ **Grafos Interactivos** | Visualiza el roadmap como nodos conectados |
| 📊 **Seguimiento de Progreso** | Marca temas como completados, estudiando o pendientes |
| 📁 **Importar/Exportar** | Guarda y comparte roadmaps en formato JSON e imagen |
| 🔐 **Autenticación** | Sistema de usuarios con Supabase Auth |
| 📱 **Diseño Responsivo** | Interfaz adaptativa para móvil y escritorio |
| 🌙 **Tema Oscuro** | Diseño moderno con tema oscuro por defecto |

</div>

---

## 🛠️ Stack Tecnológico

<div align="center">

| Categoría | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilos** | Tailwind CSS + Shadcn/UI + Lucide Icons |
| **Visualización** | React Flow (grafos dinámicos) + Dagre (layout automático) |
| **Backend** | Express.js + Node.js |
| **Base de Datos** | Supabase (PostgreSQL + Auth) |
| **Inteligencia Artificial** | Google Gemini API |

</div>

---

## 🚀 Instalación

### Requisitos Previos

- Node.js (v18+)
- npm o pnpm
- Cuenta de [Supabase](https://supabase.com)
- Cuenta de [Google Cloud](https://console.cloud.google.com/) (para OAuth)
- Clave de API de [Google AI Studio](https://makersuite.google.com/app/apikey)

### Clonar el Repositorio

```bash
git clone https://github.com/AdriG8/PathFinderAI.git
cd PathFinderAI
```

### Configurar la API

```bash
cd api
npm install
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Google Gemini
GEMINI_API_KEY=tu-gemini-api-key

# Sitio
SITE_URL=http://localhost:5173
```

Inicia la API:
```bash
npm run dev
# API disponible en http://localhost:3000
```

### Configurar el Frontend

```bash
cd ../frontend
npm install
```

Crea `.env` en `frontend/`:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com
```

Inicia el frontend:
```bash
npm run dev
# App disponible en http://localhost:5173
```

### Configurar Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Ve a **APIs y servicios** > **Credenciales**
4. Crea credenciales de **ID de cliente OAuth 2.0** (tipo: Aplicacion web)
5. Añade estos URIs autorizados:
   - `http://localhost:5173`
   - `http://localhost:5173/`
6. Habilita el provider **Google** en [Supabase Dashboard](https://supabase.com/dashboard)
   - Ve a **Authentication** > **Providers** > **Google**
   - Introduce tu **Client ID** y **Client Secret**

### Configurar la Base de Datos

Ejecuta el script SQL en el SQL Editor de Supabase:

```bash
# Archivo: Script_SQL_PathFinderAI.sql
```

Este script crea las tablas necesarias:
- `Usuarios` - Perfiles de usuario
- `Roadmap` - Roadmaps guardados
- `Metrica` - Estadísticas de uso

---

## 📁 Estructura del Proyecto

```
PathFinderAI/
│
├── 📂 api/                          # Backend Express.js
│   ├── 📂 controllers/               # Controladores de endpoints
│   │   ├── adminController.js        # Estadísticas del admin
│   │   ├── examController.js        # Generación de exámenes con IA
│   │   ├── generateController.js    # Generación de roadmaps con IA
│   │   ├── metricsController.js     # Métricas de uso
│   │   ├── roadmapController.js     # CRUD de roadmaps
│   │   ├── simpleSearchController.js # Búsqueda de recursos
│   │   └── userController.js        # Autenticación y perfiles
│   ├── 📂 models/                   # Modelos de datos
│   │   ├── database.js              # Configuración de Supabase
│   │   ├── metricModel.js          # Modelo de métricas
│   │   ├── roadmapModel.js         # Modelo de roadmaps
│   │   └── userModel.js             # Modelo de usuarios
│   ├── index.js                    # Punto de entrada
│   ├── package.json
│   └── API_backend.md               # Documentación de endpoints
│
├── 📂 frontend/                      # Aplicación React
│   ├── 📂 src/
│   │   ├── 📂 components/           # Componentes UI
│   │   │   ├── ExamModal.tsx       # Modal de examen
│   │   │   ├── Footer.tsx          # Pie de página
│   │   │   ├── PageTransition.tsx  # Transición de páginas
│   │   │   ├── ProfileModal.tsx     # Modal de perfil
│   │   │   ├── ProtectedRoute.tsx  # Ruta protegida
│   │   │   ├── RoadmapEditor.tsx    # Editor de grafos con React Flow
│   │   │   ├── ScrollToTop.tsx      # Scroll automático
│   │   │   ├── Sidebar.tsx          # Barra lateral
│   │   │   └── 📂 ui/               # Componentes shadcn/ui
│   │   │       ├── alert.tsx
│   │   │       └── sonner.tsx
│   │   ├── 📂 context/              # Contextos React
│   │   │   └── AuthContext.tsx      # Contexto de autenticación
│   │   ├── 📂 hooks/                # Hooks personalizados
│   │   │   ├── index.ts
│   │   │   └── useRoadmap.ts        # Gestión de estado del roadmap
│   │   ├── 📂 lib/                  # Utilidades
│   │   │   ├── client.ts           # Cliente Supabase
│   │   │   ├── server.ts           # Servidor Supabase
│   │   │   └── utils.ts             # Funciones utilitarias
│   │   ├── 📂 pages/                # Páginas/Rutas
│   │   │   ├── AdminPage.tsx       # Panel de administración
│   │   │   ├── AuthCallback.tsx     # Callback de autenticación
│   │   │   ├── ConfirmEmail.tsx     # Confirmación de email
│   │   │   ├── EmailConfirmed.tsx    # Email confirmado
│   │   │   ├── ForgotPassword.tsx    # Recuperar contraseña
│   │   │   ├── Login.tsx            # Página de login
│   │   │   ├── MainPage.tsx         # Página principal
│   │   │   ├── Register.tsx          # Página de registro
│   │   │   ├── ResetPassword.tsx    # Restablecer contraseña
│   │   │   ├── RoadmapEditorPage.tsx # Editor de roadmap
│   │   │   └── RoadmapViewerPage.tsx # Visor de roadmap
│   │   ├── 📂 types/                # Definiciones TypeScript
│   │   │   └── google.d.ts          # Tipos de Google OAuth
│   │   ├── 📂 utils/                # Utilidades
│   │   │   ├── googleAuth.ts        # Utilidad de autenticación Google
│   │   │   └── sanitize.ts          # Funciones de sanitización
│   │   ├── App.tsx                  # Componente principal
│   │   ├── main.tsx                 # Punto de entrada
│   │   └── index.css                # Estilos globales
│   ├── public/                       # Archivos públicos
│   ├── package.json
│   ├── vite.config.ts               # Configuración de Vite
│   ├── tailwind.config.js           # Configuración de Tailwind
│   └── vercel.json                  # Configuración de Vercel
│
├── 📂 docs/                          # Documentación
│   └── API_backend.md               # Documentación de endpoints
│
├── 📂 .github/                      # Configuración de GitHub
│   └── workflows/                   # Acciones de GitHub (vacío)
│
├── Script_SQL_PathFinderAI.sql       # Script de base de datos
├── README.md                        # Este archivo
└── package.json                    # Workspace root (opcional)
```
---

## 🔌 Endpoints Principales

### Autenticación

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/api/register` | Registrar nuevo usuario |
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/auth/google` | Iniciar sesión con Google |
| POST | `/api/forgot-password` | Solicitar recuperación de contraseña |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/health` | Estado de la API |

### Perfil

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/api/profile` | Obtener perfil del usuario |
| PUT | `/api/profile` | Actualizar perfil |
| PUT | `/api/change-password` | Cambiar contraseña |
| DELETE | `/api/delete-account` | Eliminar cuenta |

### Generación y Contenido

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/api/generate` | Generar roadmap con IA (Gemini) |
| POST | `/api/search-resources` | Buscar recursos (Wikipedia + YouTube) |
| POST | `/api/exam` | Generar examen con IA |

### Roadmaps

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/api/save` | Guardar roadmap |
| GET | `/api/roadmaps` | Listar todos los roadmaps del usuario |
| GET | `/api/roadmap/:id` | Obtener roadmap específico |
| PUT | `/api/roadmaps/:id` | Actualizar roadmap |
| DELETE | `/api/roadmaps/:id` | Eliminar roadmap |

### Administración

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/api/admin/stats` | Estadísticas globales |
| GET | `/api/admin/topics` | Lista de todos los temas |

### Métricas

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | `/api/metrics/temas` | Temas consultados por el usuario |

> 📖 **Documentación completa:** Ver [`api/API_backend.md`](api/API_backend.md) para detalles de request/response.

---

## 🎯 Flujo de Uso

### 1. Generar Roadmap
- Introduce un tema (ej: "JavaScript", "Machine Learning")
- La IA genera automáticamente una estructura de nodos

### 2. Explorar el Roadmap
- Visualiza el grafo interactivo
- Haz clic en nodos para ver/editar detalles

### 3. Buscar Recursos
- Selecciona un nodo
- Pulsa "Wiki+YT" para obtener enlaces de Wikipedia y YouTube

### 4. Completar Nodos
- Cuando estudies un tema, marca como "En estudio"
- Para marcar como "Aprendido", completa el examen de 3 preguntas
- Necesitas acertar al menos 2 para aprobar

### 5. Guardar Progreso
- Los roadmaps se guardan automáticamente en Supabase
- Exporta a JSON o imagen cuando quieras

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad'`)
5. Crear Pull Request

---

## 📝 Licencia

<div align="center">

Esta obra está bajo licencia **Creative Commons Reconocimiento-CompartirIgual 3.0 España**

[![License: CC BY-SA 3.0](https://licensebuttons.net/l/by-sa/3.0/88x31.png)](http://creativecommons.org/licenses/by-sa/3.0/es/)

</div>

---

## 🙏 Agradecimientos

- **I.E.S. Venancio Blanco** por el espacio y recursos
- **Supabase** por la infraestructura de base de datos
- **Google** por la API de Gemini
- **Comunidad open source** por las herramientas utilizadas

---

<div align="center">

⭐️ ¡Dale una estrella al proyecto si te ha sido útil!

</div>
