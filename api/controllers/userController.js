// =============================================
// CONTROLADORES DE USUARIO
// =============================================

const { createClient } = require('@supabase/supabase-js');
const { supabase, supabaseAdmin } = require('../models/database');
const userModel = require('../models/userModel');
const roadmapModel = require('../models/roadmapModel');

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        },
        emailRedirectTo: 'http://localhost:5173/email-confirmed'
      }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Token de Google no proporcionado' });
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Sesion cerrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }

  req.user = user;
  req.supabaseAdmin = supabaseAdmin;
  next();
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await userModel.getUserById(userId);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      nombre: data?.Nombre || '',
      apellidos: data?.Apellidos || '',
      nivel: data?.Nivel || 'principiante',
      rol: data?.Rol || 'user',
      email: data?.Email || req.user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellidos, nivel } = req.body;
    
    const updateData = {};
    if (nombre !== undefined) updateData.Nombre = nombre;
    if (apellidos !== undefined) updateData.Apellidos = apellidos;
    if (nivel !== undefined) updateData.Nivel = nivel;
    
    const { error } = await userModel.updateUser(userId, updateData);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    await supabase.auth.updateUser({
      data: {
        first_name: nombre,
        last_name: apellidos,
        nivel: nivel
      }
    });
    
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });
    
    if (signInError) {
      return res.status(400).json({ error: 'La contrasena actual es incorrecta' });
    }
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    
    res.json({ message: 'Contrasena cambiada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL || 'http://localhost:5173'}/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Instructions sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const authId = req.user.id;

    const isGoogleUser = req.user.app_metadata?.providers?.includes('google');
    
    if (!isGoogleUser) {
      if (!password) {
        return res.status(400).json({ error: 'Se requiere contraseña para eliminar la cuenta' });
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: req.user.email,
        password: password
      });

      if (signInError) {
        return res.status(400).json({ error: 'La contrasena es incorrecta' });
      }
    }

    const { data: userData, error: userError } = await userModel.getUserById(authId);

    if (userData) {
      await roadmapModel.deleteRoadmap(null, authId);
      
      const { error: deleteUsuariosError } = await userModel.deleteUser(userData.ID);

      if (deleteUsuariosError) {
        console.log('Error eliminando de Usuarios:', deleteUsuariosError.message);
      }
    }

    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authId);

    if (deleteAuthError) {
      return res.status(400).json({ error: 'Error al eliminar cuenta de autenticacion: ' + deleteAuthError.message });
    }

    res.json({ message: 'Cuenta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  googleAuth,
  authenticateToken,
  forgotPassword,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};