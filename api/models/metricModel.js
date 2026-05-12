// =============================================
// MODELO DE MÉTRICAS
// =============================================

const { supabaseAdmin } = require('./database');

const getMetricsByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('Metrica')
    .select('ID_Usuario, Temas_Consultados')
    .eq('ID_Usuario', userId)
    .single();
  
  return { data, error };
};

const getAllMetrics = async () => {
  const { data, error } = await supabaseAdmin
    .from('Metrica')
    .select('ID_Usuario, Temas_Consultados');
  
  return { data, error };
};

const agregarTemaConsultado = async (userId, tema) => {
  const { data, error } = await supabaseAdmin.rpc('agregar_tema_consultado', {
    p_id_usuario: userId,
    p_tema: tema
  });
  
  return { data, error };
};

module.exports = {
  getMetricsByUser,
  getAllMetrics,
  agregarTemaConsultado
};