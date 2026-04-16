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

Sigue estos pasos para levantar el proyecto en tu entorno local:

1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/AdriG8/PathFinderAI.git](https://github.com/AdriG8/PathFinderAI.git)
   cd PathFinderAI


Instalar dependencias:
Bash
npm install


Ejecutar en desarrollo:
Bash
npm run dev


🧠 Estructura de Datos (IA)
El sistema procesa los prompts del usuario para devolver un esquema JSON compatible con el motor de visualización:

JSON


{
  "title": "Nombre de la ruta",
  "nodes": [...],
  "edges": [...]
}


📄 Licencia
Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de esta licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/.