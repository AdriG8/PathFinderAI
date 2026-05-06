// =============================================
// CONTROLADORES DE ADMIN
// =============================================

// Importa el cliente de Supabase para conectar con la base de datos
const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase con privilegios de administrador
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// =============================================
// MIDDLEWARE DE VERIFICACIÓN DE ADMIN
// =============================================

// Verifica que el usuario es admin
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Consulta el rol del usuario
    const { data, error } = await supabaseAdmin
      .from('Usuarios')
      .select('Rol')
      .eq('ID', userId)
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (!data || data.Rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Solo administradores.' });
    }
    
    // Continúa con el siguiente middleware
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// CONTROLADORES DE ADMIN
// =============================================

// Obtener estadísticas del admin
const getAdminStats = async (req, res) => {
  try {
    // Contar usuarios totales
    const { count: totalUsuarios, error: usuariosError } = await supabaseAdmin
      .from('Usuarios')
      .select('*', { count: 'exact', head: true });
    
    if (usuariosError) {
      return res.status(400).json({ error: usuariosError.message });
    }
    
    // Contar roadmaps totales
    const { count: totalRoadmaps, error: roadmapsError } = await supabaseAdmin
      .from('Roadmap')
      .select('*', { count: 'exact', head: true });
    
    if (roadmapsError) {
      return res.status(400).json({ error: roadmapsError.message });
    }
    
    // Obtener registros de usuarios por día (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const { data: usuariosPorDia, error: porDiaError } = await supabaseAdmin
      .from('Usuarios')
      .select('ID, created_at')
      .gte('created_at', hace30Dias.toISOString())
      .order('created_at', { ascending: true });
    
    if (porDiaError) {
      return res.status(400).json({ error: porDiaError.message });
    }
    
    // Procesar datos para el gráfico
    const registrosPorDia = {};
    usuariosPorDia?.forEach(usuario => {
      const fecha = new Date(usuario.created_at).toISOString().split('T')[0];
      registrosPorDia[fecha] = (registrosPorDia[fecha] || 0) + 1;
    });
    
    // Convertir a array ordenado
    const tendenciaUsuarios = Object.entries(registrosPorDia).map(([fecha, count]) => ({
      fecha,
      count
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    // Devolver estadísticas
    res.json({
      totalUsuarios: totalUsuarios || 0,
      totalRoadmaps: totalRoadmaps || 0,
      tendenciaUsuarios
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  // Middleware
  requireAdmin,
  // Funciones
  getAdminStats
};