// Importa el cliente de Supabase para conectar con la base de datos
const { createClient } = require('@supabase/supabase-js');

// =============================================
// CONSTANTES - Configuración de Supabase
// =============================================

// URL del proyecto Supabase desde variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Clave anónima pública de Supabase
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Clave de servicio con privilegios de administrador
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente de Supabase para operaciones públicas
const supabase = createClient(supabaseUrl, supabaseKey);
// Cliente de Supabase con privilegios de administrador (para operaciones privadas)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// =============================================
// CONTROLADORES DE USUARIO
// =============================================

// Controlador para registrar un nuevo usuario
const register = async (req, res) => {
  try {
    // Extrae los datos del cuerpo de la petición
    const { email, password, firstName, lastName } = req.body;

    // Valida que todos los campos requeridos estén presentes
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Llama a la API de Supabase para crear el usuario
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Guarda metadatos del usuario
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        },
        // Redirección después de confirmar email
        emailRedirectTo: 'http://localhost:5173/email-confirmed'
      }
    });

    // Si hay error, lo devuelve
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Devuelve los datos del usuario creado
    res.json(data);
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// Controlador para iniciar sesión
const login = async (req, res) => {
  try {
    // Extrae credenciales del cuerpo de la petición
    const { email, password } = req.body;

    // Autentica con Supabase usando email y contraseña
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Si hay error, lo devuelve
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Devuelve los datos de sesión
    res.json(data);
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// Controlador para cerrar sesión
const logout = async (req, res) => {
  try {
    // Cierra la sesión en Supabase
    const { error } = await supabase.auth.signOut();

    // Si hay error, lo devuelve
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Confirma el cierre de sesión
    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// Middleware para autenticar solicitudes protegidas
const authenticateToken = async (req, res, next) => {
  // Extrae el token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si no hay token, rechaza la petición
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  // Verifica la validez del token con Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  // Si el token es inválido o expirado, rechaza la petición
  if (error || !user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Adjunta el usuario y cliente admin a la petición
  req.user = user;
  req.supabaseAdmin = supabaseAdmin;
  // Continúa con el siguiente middleware
  next();
};

// =============================================
// CONTROLADORES DE PERFIL
// =============================================

// Controlador para obtener el perfil del usuario
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtiene los datos del usuario desde la tabla Usuarios
    const { data, error } = await supabaseAdmin
      .from('Usuarios')
      .select('Nombre, Apellidos, Nivel, Email')
      .eq('ID', userId)
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Devuelve el perfil
    res.json({
      nombre: data.Nombre || '',
      apellidos: data.Apellidos || '',
      nivel: data.Nivel || 'principiante',
      email: data.Email || req.user.email
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controlador para actualizar el perfil
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellidos, nivel } = req.body;
    
    // Actualiza en la tabla Usuarios
    const { error } = await supabaseAdmin
      .from('Usuarios')
      .update({
        Nombre: nombre,
        Apellidos: apellidos,
        Nivel: nivel
      })
      .eq('ID', userId);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // También actualiza en user_metadata de auth
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

// Controlador para cambiar la contraseña
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.user.email;
    
    // Verificar la contraseña actual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword
    });
    
    if (signInError) {
      return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    }
    
    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    
    res.json({ message: 'Contraseña cambiada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  // Funciones de autenticación
  register,
  login,
  logout,
  authenticateToken,
  // Funciones de perfil
  getProfile,
  updateProfile,
  changePassword,
  // Instancias de Supabase
  supabase,
  supabaseAdmin
};