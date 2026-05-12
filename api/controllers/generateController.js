// =============================================
// CONTROLADORES DE GENERACIÓN DE ROADMAP
// =============================================

const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// =============================================
// CONTROLADOR: Generar estructura del roadmap
// =============================================

const generateRoadmap = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Generando roadmap para prompt:', prompt);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.log('Error: GEMINI_API_KEY no configurada');
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const userId = req.user.id;
    const { data: userData } = await supabaseAdmin
      .from('Usuarios')
      .select('Nivel')
      .eq('ID', userId)
      .single();

    const nivelUsuario = userData?.Nivel || 'principiante';

    // ========================================
    // Generar estructura del roadmap
    // ========================================
    console.log('📋 Generando estructura del roadmap...');

    const generationPrompt = `Genera una ruta de aprendizaje en formato JSON para React Flow.
La respuesta debe ser solo JSON valido, sin texto adicional.
Estructura requerida:
{
  "nodes": [
    {
      "id": "1",
      "type": "custom",
      "data": {
        "label": "Tema principal",
        "status": "pendiente",
        "isEditing": false,
        "horas": 2,
        "resources": {
          "enlaces": [
            { "titulo": "Nombre del recurso", "url": "https://ejemplo.com/recurso" },
            { "titulo": "Otro recurso", "url": "https://ejemplo.com/otro" }
          ]
        }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}
REGLAS:
- type solo puede ser: "custom"
- status valores: "pendiente", "estudiando", "aprendido"
- horas: tiempo estimado en horas para completar ese nodo
- resources.enlaces: array de objetos con "titulo" (nombre del recurso) y "url" (enlace real y funcional a documentos, videos, tutoriales o articulos utiles)
- Cada nodo debe tener al menos 2-3 enlaces reales y funcionales (urls reales de recursos educativos como MDN, freeCodeCamp, YouTube, Coursera, documentación oficial, etc.)
- Los enlaces deben ser reales y verificables, no inventados
- Cada nodo debe tener su propio id unico
- Cada arista tiene id, source y target
- El NIVEL DEL USUARIO es: ${nivelUsuario} (principiante/medio/avanzada)
- Adapta la complejidad al nivel del usuario
- Roadmap de 10-15 nodos aproximadamente
- Incluye subtemas, conceptos especificos y detalles relevantes
- Estructura tipo arbol con ramas principales y secundarias
- Nodo principal donde se ramifican los demas temas
TEMA: ${prompt}
RESPONDE SOLO CON JSON VALIDO, SIN TEXTO EXTRA. SI EL TEMA NO TIENE SENTIDO RESPONDE SOLO CON: TEMA NO VALIDO.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generationPrompt,
    });

    const generatedText = result.text;

    // Verificar si el tema no es valido
    if (generatedText.trim() === 'TEMA NO VALIDO') {
      console.log('Tema no valido:', prompt);
      return res.status(400).json({ error: 'El tema no es valido para generar un roadmap' });
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Roadmap generado correctamente, nodos:', parsed.nodes?.length);
      res.json(parsed);
    } else {
      console.log('Error: No se pudo parsear la respuesta');
      console.log('Respuesta recibida:', generatedText.substring(0, 500));
      res.status(400).json({ error: 'No se pudo parsear la respuesta' });
    }
  } catch (err) {
    console.log('Error al generar roadmap:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  generateRoadmap
};
