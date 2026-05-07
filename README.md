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
- 📊 Permite seguir el progreso marcando nodos como completados
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
| 🕸️ **Grafos Interactivos** | Visualiza el roadmap como nodos conectados |
| 📊 **Seguimiento de Progreso** | Marca temas como completados, estudiando o pendientes |
| 📁 **Importar/Exportar** | Guarda y comparte roadmaps en formato JSON |
| 🔐 **Autenticación** | Sistema de usuarios con Supabase Auth |
| 📱 **Diseño Responsivo** | Interfaz adaptativa para móvil y escritorio |
| 🔔 **Notificaciones Toast** | Feedback visual instantáneo |
| 🌙 **Tema Oscuro** | Diseño moderno con tema oscuro por defecto |

</div>

---

## 🛠️ Stack Tecnológico

<div align="center">

| Categoría | Tecnologías |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite |
| **Estilos** | Tailwind CSS + Shadcn/UI + Lucide Icons |
| **Visualización** | React Flow (grafos dinámicos) |
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
```

Inicia la API:
```bash
npm run start
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
```

Inicia el frontend:
```bash
npm run dev
# App disponible en http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
PathFinderAI/
├── 📂 api/                      # Servidor Express
│   ├── 📂 controllers/         # Lógica de endpoints
│   │   ├── generateController.js   # Generación con IA
│   │   ├── roadmapController.js   # CRUD de roadmaps
│   │   ├── userController.js       # Autenticación
│   │   └── adminController.js     # Estadísticas admin
│   ├── index.js                # Punto de entrada
│   └── package.json
│
├── 📂 frontend/                 # Aplicación React
│   ├── 📂 src/
│   │   ├── 📂 components/      # Componentes UI
│   │   │   ├── RoadmapEditor.tsx   # Editor de grafos
│   │   │   ├── ProfileModal.tsx    # Modal de perfil
│   │   │   ├── Sidebar.tsx        # Barra lateral
│   │   │   └── 📂 ui/         # Componentes shadcn
│   │   │       ├── alert.tsx
│   │   │       └── sonner.tsx
│   │   ├── 📂 pages/          # Páginas
│   │   │   ├── MainPage.tsx       # Dashboard principal
│   │   │   ├── RoadmapEditorPage.tsx
│   │   │   └── RoadmapViewerPage.tsx
│   │   ├── 📂 hooks/          # Hooks personalizados
│   │   ├── 📂 context/        # Contextos React
│   │   └── 📂 lib/            # Utilidades
│   └── package.json
│
├── 📂 docs/
│   ├── API.md                 # Documentación de endpoints
│   └── ENDPOINTS.md          # Referencia API
│
└── README.md
```

---

## 🔌 Endpoints Principales

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/api/register` | Registrar nuevo usuario |
| POST | `/api/login` | Iniciar sesión |
| GET | `/api/profile` | Obtener perfil |
| PUT | `/api/profile` | Actualizar perfil |
| POST | `/api/generate` | Generar roadmap con IA |
| POST | `/api/save` | Guardar roadmap |
| GET | `/api/roadmaps` | Listar roadmaps del usuario |
| GET | `/api/roadmap/:id` | Obtener roadmap específico |
| PUT | `/api/roadmaps/:id` | Actualizar roadmap |
| DELETE | `/api/roadmaps/:id` | Eliminar roadmap |
| GET | `/api/health` | Estado de la API |

*Ver documento `docs/API.md` para documentación completa.*

---

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
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