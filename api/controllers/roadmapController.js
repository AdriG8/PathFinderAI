// =============================================
// CONTROLADORES DE ROADMAP
// =============================================

// Controlador para guardar un roadmap (crear o actualizar)
const saveRoadmap = async (req, res) => {
  try {
    // Extrae los datos del cuerpo de la petición
    const { id, title, json } = req.body;
    // Obtiene el ID del usuario autentificado
    const userId = req.user.id;
    // Obtiene el cliente de Supabase con privilegios de admin
    const supabaseAdmin = req.supabaseAdmin;

    // Si existe ID, actualiza el roadmap existente
    if (id) {
      const { data, error } = await supabaseAdmin
        .from('Roadmap')
        .update({ 
          "Titulo_Tema": title,
          "JSON": json
        })
        .eq('ID', id)
        .eq('ID_Usuario', userId);

      // Si hay error, lo devuelve
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Devuelve los datos actualizados
      return res.json(data);
    } 
    // Si no existe ID, crea un nuevo roadmap
    else {
      const { data, error } = await supabaseAdmin
        .from('Roadmap')
        .insert([{
          "ID_Usuario": userId,
          "Titulo_Tema": title,
          "JSON": json
        }]);

      // Si hay error, lo devuelve
      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Devuelve los datos creados
      return res.json(data);
    }
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// Controlador para obtener todos los roadmaps del usuario
const getRoadmaps = async (req, res) => {
  try {
    // Obtiene el ID del usuario autentificado
    const userId = req.user.id;
    // Obtiene el cliente de Supabase con privilegios de admin
    const supabaseAdmin = req.supabaseAdmin;

    // Consulta los roadmaps del usuario ordenados por fecha
    const { data, error } = await supabaseAdmin
      .from('Roadmap')
      .select('*')
      .eq('ID_Usuario', userId)
      .order('Fecha_Creacion', { ascending: false });

    // Si hay error, lo devuelve
    if (error) {
      console.log('Error fetching roadmaps:', error);
      return res.status(400).json({ error: error.message });
    }

    // Devuelve los roadmaps encontrados
    res.json(data);
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// Controlador para obtener un roadmap por su ID
const getRoadmapById = async (req, res) => {
  try {
    // Extrae el ID del roadmap de los parámetros de la URL
    const { id } = req.params;
    // Obtiene el ID del usuario autentificado
    const userId = req.user.id;
    // Obtiene el cliente de Supabase con privilegios de admin
    const supabaseAdmin = req.supabaseAdmin;

    console.log('Fetching roadmap:', id, 'for user:', userId);

    // Consulta el roadmap específico del usuario
    const { data, error } = await supabaseAdmin
      .from('Roadmap')
      .select('*')
      .eq('ID', id)
      .eq('ID_Usuario', userId)
      .single();

    // Si no se encuentra, devuelve error
    if (error) {
      console.log('Supabase error:', error);
      return res.status(404).json({ error: 'Roadmap no encontrado' });
    }

    // Devuelve el roadmap encontrado
    res.json(data);
  } catch (err) {
    // Maneja errores inesperados
    console.log('Catch error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Controlador para actualizar un roadmap
const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const { Titulo_Tema } = req.body;
    const userId = req.user.id;
    const supabaseAdmin = req.supabaseAdmin;

    const { error } = await supabaseAdmin
      .from('Roadmap')
      .update({ Titulo_Tema })
      .eq('ID', id)
      .eq('ID_Usuario', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Roadmap actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controlador para eliminar un roadmap
const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const supabaseAdmin = req.supabaseAdmin;

    const { error } = await supabaseAdmin
      .from('Roadmap')
      .delete()
      .eq('ID', id)
      .eq('ID_Usuario', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Roadmap eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint de prueba para verificar la conexión
const testRoadmap = (req, res) => {
  res.json({ message: 'Test endpoint works', tables: ['Roadmap'] });
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  // Funciones de control de roadmaps
  saveRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  testRoadmap
};