// Importa Express para crear el servidor web
const express = require('express');
// Importa CORS para permitir peticiones cruzadas
const cors = require('cors');
// Carga las variables de entorno desde .env
require('dotenv').config();

// =============================================
// IMPORTACIONES DE CONTROLADORES
// =============================================

// Controlador de usuario (login, register, logout, authenticate)
const userController = require('./controllers/userController');
// Controlador de roadmap (save, get, getById)
const roadmapController = require('./controllers/roadmapController');
// Controlador de generación (AI)
const generateController = require('./controllers/generateController');

// =============================================
// CONFIGURACIÓN DEL SERVIDOR
// =============================================

// Crea la aplicación Express
const app = express();
// Puerto donde escuchará el servidor
const PORT = 3000;

// middlewares globales
app.use(cors());  // Habilita CORS
app.use(express.json());  // Parsea JSON en las peticiones

// Middleware para loguear todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// =============================================
// RUTAS DE USUARIO
// =============================================

// POST /api/register - Registrar nuevo usuario
app.post('/api/register', userController.register);

// POST /api/login - Iniciar sesión
app.post('/api/login', userController.login);

// POST /api/logout - Cerrar sesión (protegida)
app.post('/api/logout', userController.authenticateToken, userController.logout);

// =============================================
// RUTAS DE GENERACIÓN
// =============================================

// POST /api/generate - Generar roadmap con IA (protegida)
app.post('/api/generate', userController.authenticateToken, generateController.generateRoadmap);

// =============================================
// RUTAS DE ROADMAP
// =============================================

// POST /api/save - Guardar roadmap (protegida)
app.post('/api/save', userController.authenticateToken, roadmapController.saveRoadmap);

// GET /api/roadmaps - Obtener todos los roadmaps (protegida)
app.get('/api/roadmaps', userController.authenticateToken, roadmapController.getRoadmaps);

// GET /api/roadmap/test - Endpoint de prueba (público)
app.get('/api/roadmap/test', roadmapController.testRoadmap);

// GET /api/roadmap/:id - Obtener roadmap por ID (protegida)
app.get('/api/roadmap/:id', userController.authenticateToken, roadmapController.getRoadmapById);

// =============================================
// INICIO DEL SERVIDOR
// =============================================

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});