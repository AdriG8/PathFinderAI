// =============================================
// CONTROLADORES DE MÉTRICAS
// =============================================
// Controladores para gestionar métricas de usuarios

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// =============================================
// CONTROLADOR: Obtener temas consultados del usuario
// =============================================

const getUserMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabaseAdmin
      .from('Metrica')
      .select('Temas_Consultados')
      .eq('ID_Usuario', userId)
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      temas: data?.Temas_Consultados || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN
// =============================================

module.exports = {
  getUserMetrics
};