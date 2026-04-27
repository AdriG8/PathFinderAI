# 📍 PathFinderAI

> **Transforma tus dudas en un plan de estudio estructurado.** > Proyecto Final de Ciclo Formativo de Grado Superior en Desarrollo de Aplicaciones Web (DAW).

[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
[![Gemini](https://img.shields.io/badge/Gemini_AI-8E75FF?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

---

## 🌟 Sobre el Proyecto

**PathFinderAI** es un generador inteligente de rutas de aprendizaje. A diferencia de las hojas de ruta estáticas, esta herramienta utiliza Inteligencia Artificial (**Google Gemini API**) para crear mapas de estudio personalizados y dinámicos basados en la entrada del usuario, visualizándolos mediante grafos interactivos.

### 🏫 Contexto Académico
* **Centro**: I.E.S. «Venancio Blanco» (Salamanca)
* **Ciclo**: Desarrollo de Aplicaciones Web (DAW)
* **Autor**: [Adrián Gómez Izquierdo](https://github.com/AdriG8)

---

## ✨ Funcionalidades Clave

* **🤖 Generación con IA**: Procesamiento de lenguaje natural mediante Gemini API para estructurar temas, subtemas y recursos educativos.
* **🕸️ Visualización con React Flow**: Renderizado de la ruta como un gráfico interactivo (nodos y enlaces) que facilita la comprensión del camino a seguir.
* **📊 Seguimiento de Progreso**: Posibilidad de marcar nodos como completados para visualizar el avance académico.
* **🔐 Persistencia en la Nube**: Sistema de autenticación y guardado de historial de rutas mediante **Supabase** (PostgreSQL).
* **📱 Interfaz Moderna**: UI limpia y responsivo construida con **Tailwind CSS** y componentes de **Shadcn/UI**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite |
| **Estilos** | Tailwind CSS, Shadcn/UI, Lucide Icons |
| **Visualización** | React Flow (Grafos dinámicos) |
| **BaaS (Backend)** | Supabase (Auth, Database, JSONB storage) |
| **Inteligencia AI** | Google Gemini API |

---

## 🚀 Instalación y Configuración

### Prerequisites

* Node.js (v18+)
* npm o yarn

### 1. Clonar el repositorio

```bash
git clone https://github.com/AdriG8/PathFinderAI.git
cd PathFinderAI
```

---

## 💻 Despliegue para Desarrollo

El proyecto se compone de dos partes:
- **Frontend** (puerto 5173): Interfaz de usuario con React + Vite
- **API** (puerto 3000): Servidor Express con endpoints para IA y datos

### Paso 1: Configurar la API

```bash
# Navegar a la carpeta de la API
cd api

# Instalar dependencias
npm install

# Copiar el archivo de ejemplo de variables de entorno
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Supabase (obténlas desde tu proyecto en supabase.com)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# Clave de la API de Gemini (obténla desde Google AI Studio)
GEMINI_API_KEY=tu-gemini-api-key

# Clave de servicio de Supabase (para operaciones admin)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Iniciar la API:**
```bash
npm run start
# La API estará disponible en http://localhost:3000
```

### Paso 2: Configurar el Frontend

```bash
# Navegar a la carpeta del frontend
cd ../frontend

# Instalar dependencias
npm install
```

Crea un archivo `.env` en `frontend/` con:

```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Iniciar el Frontend:**
```bash
npm run dev
# La app estará disponible en http://localhost:5173
```

### Paso 3: Verificar que funciona

1. La API debe responder en `http://localhost:3000/api/health` (si está configurado)
2. El frontend debe cargar en `http://localhost:5173`
3. Los cambios en código se recargan automáticamente

---

## 🏗️ Estructura del Proyecto

```
PathFinderAI/
├── api/                    # Servidor Express
│   ├── controllers/        # Controladores de endpoints
│   ├── index.js            # Punto de entrada
│   ├── package.json        # Dependencias API
│   └── .env                # Variables de entorno
│
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas de la app
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── context/        # Contextos de React
│   │   └── utils/          # Utilidades
│   ├── package.json        # Dependencias Frontend
│   └── .env                # Variables de entorno
│
└── README.md
```

---

## 🧠 Estructura de Datos (IA)

El sistema procesa los prompts del usuario para devolver un esquema JSON compatible con el motor de visualización:

```json
{
  "title": "Nombre de la ruta",
  "nodes": [
    {
      "id": "1",
      "position": { "x": 0, "y": 0 },
      "data": { "label": "Tema Principal", "status": "pendiente" }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "target": "2"
    }
  ]
}
```

---

## 📄 Licencia

Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/.