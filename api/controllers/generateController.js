// =============================================
// CONTROLADORES DE GENERACIÓN DE ROADMAP
// =============================================

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const generateRoadmap = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log('Generando roadmap para prompt:', prompt);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.log('Error: GEMINI_API_KEY no configurada');
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-lite-latest',
    });

    const userId = req.user.id;
    const { data: userData } = await supabaseAdmin
      .from('Usuarios')
      .select('Nivel')
      .eq('ID', userId)
      .single();

    const nivelUsuario = userData?.Nivel || 'principiante';

    // ========================================
    // Generar roadmap completo en UNA petición
    // ========================================
    console.log('📋 Generando roadmap...');

    const generationPrompt = `Genera una ruta de aprendizaje en formato JSON para React Flow.
La respuesta debe ser solo JSON válido, sin texto adicional.
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
- type puede SOLO PUEDE ser: "custom"
- status valores: "pendiente", "estudiando", "aprendido"
- horas: tiempo estimado en horas para completar ese nodo/tema
- resources.enlaces: array con recursos para aprender este tema. Cada recurso debe tener "nombre" y "url". Incluye fuentes como: Documentación oficial, Artículos, Cursos, Vídeos de YT, Libros, Tutoriales. Mínimo 2-3 recursos por nodo.
- LOS ENLACES DEBEN SER REALES Y TENER SENTIDO CON EL TEMA DE SU NODO
- Comprueba con google que los enlaces siguen activos y existen
- Cada nodo debe tener su propio id único
- Cada arista tiene id, source y target
- El NIVEL DEL USUARIO es: ${nivelUsuario} (principiante/medio/avanzada)
- Adapta la complejidad y profundidad del roadmap al nivel del usuario
- El roadmap debe tener esta estructura: 50 nodos o mas para un tema extenso, 20 nodos o menos para temas cortos.
- Incluye subtemas, conceptos específicos, y detalles relevantes para cada tema
- Estructura tipo árbol con ramas principales y secundarias
- El mapa debe de tener un nodo principal donde se ramifican los demás temas
TEMA: ${prompt}
RESPONDE SOLO CON JSON VÁLIDO, SIN TEXTO EXTRA NI MARKDOWN. SI EL TEMA NO TIENE SENTIDO RESPONDE SOLO CON: TEMA NO VALIDO.`;

    const result = await model.generateContent(generationPrompt);
    const generatedText = result.response.text();

    // Verificar si el tema no es válido
    if (generatedText.trim() === 'TEMA NO VALIDO') {
      console.log('Tema no válido:', prompt);
      return res.status(400).json({ error: 'El tema no es válido para generar un roadmap' });
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