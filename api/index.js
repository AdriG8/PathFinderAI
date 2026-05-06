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
// Controlador de admin (stats, requireAdmin)
const adminController = require('./controllers/adminController');

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
// RUTAS DE SALUD / HEALTH CHECK
// =============================================

// GET /api/health - Verifica que la API está funcionando
app.get('/api/health', (req, res) => {
  // Verificar variables de entorno críticas
  const requiredEnvVars = ['GEMINI_API_KEY', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  const healthStatus = {
    status: 'ok',
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    checks: {
      server: 'ok',
      environment: missingEnvVars.length === 0 ? 'ok' : 'warning',
    }
  }
  
  // Si faltan variables, incluir advertencia
  if (missingEnvVars.length > 0) {
    healthStatus.message = 'API funcionando pero faltan variables de entorno'
    healthStatus.missingEnvVars = missingEnvVars
  }
  
  const statusCode = missingEnvVars.length > 0 ? 200 : 200
  res.status(statusCode).json(healthStatus)
});

// =============================================
// RUTAS DE USUARIO
// =============================================

// POST /api/register - Registrar nuevo usuario
app.post('/api/register', userController.register);

// POST /api/login - Iniciar sesión
app.post('/api/login', userController.login);

// POST /api/forgot-password - Solicitar recuperación de contraseña
app.post('/api/forgot-password', userController.forgotPassword);

// POST /api/logout - Cerrar sesión (protegida)
app.post('/api/logout', userController.authenticateToken, userController.logout);

// GET /api/profile - Obtener perfil del usuario (protegida)
app.get('/api/profile', userController.authenticateToken, userController.getProfile);

// PUT /api/profile - Actualizar perfil del usuario (protegida)
app.put('/api/profile', userController.authenticateToken, userController.updateProfile);

// PUT /api/change-password - Cambiar contraseña (protegida)
app.put('/api/change-password', userController.authenticateToken, userController.changePassword);

// // DELETE /api/delete-account - Eliminar cuenta (protegida)
// app.delete('/api/delete-account', userController.authenticateToken, userController.deleteAccount);

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

// PUT /api/roadmaps/:id - Actualizar roadmap (protegida)
app.put('/api/roadmaps/:id', userController.authenticateToken, roadmapController.updateRoadmap);

// DELETE /api/roadmaps/:id - Eliminar roadmap (protegida)
app.delete('/api/roadmaps/:id', userController.authenticateToken, roadmapController.deleteRoadmap);

// =============================================
// RUTAS DE ADMIN
// =============================================

// GET /api/admin/stats - Estadísticas del admin (protegida, solo admin)
app.get('/api/admin/stats', userController.authenticateToken, adminController.requireAdmin, adminController.getAdminStats);

// =============================================
// INICIO DEL SERVIDOR
// =============================================

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});