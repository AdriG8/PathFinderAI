// =============================================
// CONTROLADORES DE GENERACIÓN DE ROADMAP
// =============================================

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

    // Llama a la API de Gemini para generar contenido (POR DESARROLLAR)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            // Prompt instructing Gemini to generate Roadmap JSON for React Flow
            text: `Genera una ruta de aprendizaje en formato JSON con esta estructura exacta para la libreria React Flow,:
          {
            "title": "nombre de la ruta",
            "nodes": [
              {"id": "1", "label": "tema principal", "type": "input"},
              {"id": "2", "label": "subtema", "type": "default"}
            ],
            "edges": [
              {"id": "e1-2", "source": "1", "target": "2"}
            ]
          }
          TEMA: ${prompt}, RESPONDE SOLO CON EL JSON NO PONGAS MENSAJES DE NINGUN TIPO.`,
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