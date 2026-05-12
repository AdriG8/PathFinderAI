// =============================================
// CONTROLADORES DE ADMIN
// =============================================

const userModel = require('../models/userModel');
const roadmapModel = require('../models/roadmapModel');
const metricModel = require('../models/metricModel');

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { data, error } = await userModel.getUserRol(userId);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!data || data.Rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { count: totalUsuarios, error: usuariosError } = await userModel.countUsers();
    
    if (usuariosError) {
      return res.status(400).json({ error: usuariosError.message });
    }
    
    const { count: totalRoadmaps, error: roadmapsError } = await roadmapModel.countRoadmaps();
    
    if (roadmapsError) {
      return res.status(400).json({ error: roadmapsError.message });
    }
    
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const { data: users, error: usersError } = await userModel.getUsersInRange(
      hace30Dias.toISOString(),
      new Date().toISOString()
    );
    
    if (usersError) {
      return res.status(400).json({ error: usersError.message });
    }
    
    const registrosPorDia = {};
    users?.forEach(user => {
      const fecha = new Date(user.created_at).toISOString().split('T')[0];
      registrosPorDia[fecha] = (registrosPorDia[fecha] || 0) + 1;
    });
    
    const tendenciaUsuarios = Object.entries(registrosPorDia).map(([fecha, count]) => ({
      fecha,
      count
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    res.json({
      totalUsuarios: totalUsuarios || 0,
      totalRoadmaps: totalRoadmaps || 0,
      tendenciaUsuarios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllTopics = async (req, res) => {
  try {
    const { data: metricas, error } = await metricModel.getAllMetrics();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!metricas || metricas.length === 0) {
      return res.json([]);
    }
    
    const userIds = [...new Set(metricas.map(m => m.ID_Usuario))];
    const { data: usuarios } = await userModel.getUsersByIds(userIds);
    
    const usuariosMap = {};
    usuarios?.forEach(u => {
      usuariosMap[u.ID] = u;
    });
    
    const topicsFlat = [];
    metricas.forEach(metrica => {
      const usuario = usuariosMap[metrica.ID_Usuario];
      const nombreCompleto = usuario 
        ? `${usuario.Nombre || ''} ${usuario.Apellidos || ''}`.trim() || usuario.Email 
        : 'Desconocido';
      
      metrica.Temas_Consultados?.forEach((tema, index) => {
        topicsFlat.push({
          id: `${metrica.ID_Usuario}-${index}`,
          usuario: nombreCompleto,
          tema: tema
        });
      });
    });
    
    res.json(topicsFlat.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requireAdmin,
  getAdminStats,
  getAllTopics
};