// =============================================
// CONTROLADORES DE GENERACIÓN DE ROADMAP
// =============================================

// Importa el cliente de Supabase para conectar con la base de datos
const { createClient } = require('@supabase/supabase-js');

// Cliente de Supabase con privilegios de administrador
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Controlador para generar un roadmap usando IA (Gemini)
const generateRoadmap = async (req, res) => {
  try {
    // Extrae el tema/prompt del cuerpo de la petición
    const { prompt } = req.body;
    
    // Obtiene la clave de la API de Gemini desde variables de entorno
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    // Verifica que la clave esté configurada
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    // Obtiene el nivel del usuario para personalizar el roadmap
    const userId = req.user.id;
    const { data: userData, error: userError } = await supabaseAdmin
      .from('Usuarios')
      .select('Nivel')
      .eq('ID', userId)
      .single();
    
    const nivelUsuario = userData?.Nivel || 'principiante';

    // Llama a la API de Gemini para generar contenido (POR DESARROLLAR)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            // Prompt
            text: `Genera una ruta de aprendizaje en formato JSON para React Flow.
La respuesta debe ser solo JSON válido, sin texto adicional.
Estructura requerida:
{
  "nodes": [
    {
      "id": "1",
      "type": "input",
      "data": {
        "label": "Tema principal",
        "status": "pendiente",
        "isEditing": false,
        "horas": 2,
        "resources": { "enlaces": [
          { "nombre": "Nombre del recurso", "url": "https://ejemplo.com" }
        ] }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
- type puede ser: "input" (nodo inicial), "default" (normal), "output" (final)
- status valores: "pendiente", "estudiando", "aprendido"
- horas: tiempo estimado en horas para completar ese nodo/tema
- resources.enlaces: array con recursos para aprender este tema. Cada recurso debe tener "nombre" y "url". Incluye fuentes como: Documentación oficial, Artículos, Cursos, Vídeos de YT, Libros, Tutoriales. Mínimo 2-3 recursos por nodo.
- Cada nodo debe tener su propio id único
- Cada arista tiene id, source y target
- El NIVEL DEL USUARIO es: ${nivelUsuario} (principiante/medio/avanzada)
- Adapta la complejidad y profundidad del roadmap al nivel del usuario
- El roadmap debe ser EXTENSO Y DETALLADO, aproximadamente 50 nodos
- Incluye subtemas, conceptos específicos, y detalles relevantes para cada tema
TEMA: ${prompt}
RESPONDE SOLO CON JSON VÁLIDO, SIN TEXTO EXTRA NI MARKDOWN.`,
          }]
        }]
      })
    });

    // Convierte la respuesta a JSON
    const data = await response.json();
    
    // Si hay error en la respuesta de Gemini, lo devuelve
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    // Extrae el texto generado
    const generatedText = data.candidates[0].content.parts[0].text;
    // Busca el objeto JSON en la respuesta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    
    // Si encuentra JSON, lo parsea y devuelve
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } else {
      // Si no encuentra JSON válido
      res.status(400).json({ error: 'No se pudo parsear la respuesta' });
    }
  } catch (err) {
    // Maneja errores inesperados
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  // Funciones de generación
  generateRoadmap
};