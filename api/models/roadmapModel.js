// =============================================
// MODELO DE ROADMAPS
// =============================================

const { supabaseAdmin } = require('./database');

const createRoadmap = async (roadmapData) => {
  const { ID_Usuario, Titulo_Tema, JSON } = roadmapData;
  
  const { data, error } = await supabaseAdmin
    .from('Roadmap')
    .insert([{
      ID_Usuario,
      Titulo_Tema,
      JSON
    }])
    .select()
    .single();
  
  return { data, error };
};

const getRoadmapById = async (roadmapId) => {
  const { data, error } = await supabaseAdmin
    .from('Roadmap')
    .select('*')
    .eq('ID', roadmapId)
    .single();
  
  return { data, error };
};

const getRoadmapsByUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('Roadmap')
    .select('*')
    .eq('ID_Usuario', userId)
    .order('Fecha_Creacion', { ascending: false });
  
  return { data, error };
};

const updateRoadmap = async (roadmapId, userId, updateData) => {
  const { error } = await supabaseAdmin
    .from('Roadmap')
    .update(updateData)
    .eq('ID', roadmapId)
    .eq('ID_Usuario', userId);
  
  return { error };
};

const deleteRoadmap = async (roadmapId, userId) => {
  const { error } = await supabaseAdmin
    .from('Roadmap')
    .delete()
    .eq('ID', roadmapId)
    .eq('ID_Usuario', userId);
  
  return { error };
};

const countRoadmaps = async () => {
  const { count, error } = await supabaseAdmin
    .from('Roadmap')
    .select('*', { count: 'exact', head: true });
  
  return { count: count || 0, error };
};

module.exports = {
  createRoadmap,
  getRoadmapById,
  getRoadmapsByUser,
  updateRoadmap,
  deleteRoadmap,
  countRoadmaps
};