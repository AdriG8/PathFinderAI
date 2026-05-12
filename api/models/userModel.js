// =============================================
// MODELO DE USUARIOS
// =============================================

const { supabaseAdmin, supabase } = require('./database');

const getUserById = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .select('*')
    .eq('ID', userId)
    .single();
  
  return { data, error };
};

const getUserRol = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .select('Rol')
    .eq('ID', userId)
    .single();
  
  return { data, error };
};

const getUserByEmail = async (email) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .select('*')
    .eq('Email', email)
    .single();
  
  return { data, error };
};

const updateUser = async (userId, updateData) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .update(updateData)
    .eq('ID', userId)
    .select()
    .single();
  
  return { data, error };
};

const deleteUser = async (userId) => {
  const { error } = await supabaseAdmin
    .from('Usuarios')
    .delete()
    .eq('ID', userId);
  
  return { error };
};

const deleteUserRoadmaps = async (userId) => {
  const { error } = await supabaseAdmin
    .from('Roadmap')
    .delete()
    .eq('ID_Usuario', userId);
  
  return { error };
};

const deleteUserMetrics = async (userId) => {
  const { error } = await supabaseAdmin
    .from('Metrica')
    .delete()
    .eq('ID_Usuario', userId);
  
  return { error };
};

const countUsers = async () => {
  const { count, error } = await supabaseAdmin
    .from('Usuarios')
    .select('*', { count: 'exact', head: true });
  
  return { count: count || 0, error };
};

const getUsersInRange = async (startDate, endDate) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .select('created_at')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });
  
  return { data, error };
};

const getUsersByIds = async (userIds) => {
  const { data, error } = await supabaseAdmin
    .from('Usuarios')
    .select('ID, Nombre, Apellidos, Email')
    .in('ID', userIds);
  
  return { data, error };
};

module.exports = {
  getUserById,
  getUserRol,
  getUserByEmail,
  updateUser,
  deleteUser,
  deleteUserRoadmaps,
  deleteUserMetrics,
  countUsers,
  getUsersInRange,
  getUsersByIds
};