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
// FUNCION: Validar coherencia del roadmap
// Verifica que todas las referencias en edges existan en nodes
// =============================================
const validarCoherenciaRoadmap = (roadmap) => {
  const errors = [];
  const nodeIds = new Set(roadmap.nodes.map(n => n.id));

  if (!roadmap.nodes || !Array.isArray(roadmap.nodes) || roadmap.nodes.length === 0) {
    errors.push('El roadmap debe tener al menos un nodo');
  }

  if (!roadmap.edges || !Array.isArray(roadmap.edges)) {
    errors.push('El roadmap debe tener un array de aristas');
  }

  if (roadmap.nodes) {
    roadmap.nodes.forEach(node => {
      if (!node.id) {
        errors.push('Todos los nodos deben tener un ID');
      }
      if (!node.data?.label) {
        errors.push('Todos los nodos deben tener una etiqueta (label)');
      }
    });
  }

  if (roadmap.edges) {
    roadmap.edges.forEach(edge => {
      if (!edge.source || !edge.target) {
        errors.push('Todas las aristas deben tener source y target');
      }
      if (edge.source && !nodeIds.has(edge.source)) {
        errors.push(`El nodo source "${edge.source}" no existe`);
      }
      if (edge.target && !nodeIds.has(edge.target)) {
        errors.push(`El nodo target "${edge.target}" no existe`);
      }
    });
  }

  const rootNodes = roadmap.nodes?.filter(node => {
    return !roadmap.edges?.some(edge => edge.target === node.id);
  }) || [];

  if (rootNodes.length === 0 && (roadmap.nodes?.length || 0) > 0) {
    errors.push('Debe haber al menos un nodo raiz (sin padre)');
  }

  if (rootNodes.length > 3) {
    errors.push('Demasiados nodos raiz, la estructura debe ser mas jerarquica');
  }

  return {
    valido: errors.length === 0,
    errors
  };
};

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
            { "title": "Introduccion al tema - Wikipedia", "url": "https://es.wikipedia.org/wiki/Tema", "type": "documentacion" },
            { "title": "Tutorial completo", "url": "https://www.youtube.com/watch?v=ejemplo", "type": "video" }
          ]
        }
      }
    }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

REGLAS CRITICAS DE COHERENCIA:
1. JERARQUIA CLARA: Unico nodo raiz de donde ramifican los demas. La estructura debe ser como un ARBOL, no un grafo arbitrario.
2. DEPENDENCIAS LOGICAS: Cada nodo (excepto el raiz) debe tener EXACTAMENTE UN padre. Un nodo no puede tener multiples padres.
3. IDS VALIDOS: TODOS los source y target en edges DEBEN existir en los ids de los nodos. Verifica 3 veces antes de generar.
4. SIN CICLOS: No puede haber rutas circulares (A->B->C->A). Cada nodo tiene UNA unica ruta hacia la raiz.
5. CONEXIONES COHERENTES: Si A depende de B, entonces B debe aparecer ANTES que A en la jerarquia.
6. FLUJO LOGICO: El flujo debe ser: concepto base -> conceptos intermedios -> conceptos avanzados. Nunca al reves.

REGLAS ADICIONALES:
- type solo puede ser: "custom"
- status valores: "pendiente", "estudiando", "aprendido"
- horas: tiempo estimado en horas para completar ese nodo
- resources.enlaces: GENERA 2-3 enlaces utiles por nodo con recursos reales de aprendizaje. Cada enlace debe tener: { "title": "Titulo descriptivo", "url": "https://...", "type": "video" | "documentacion" }. Prioriza enlaces a Wikipedia, documentacion oficial y canales educativos conocidos de YouTube. Las URLs deben ser reales y validas.
- Cada nodo debe tener su propio id unico numerico (1, 2, 3...)
- Nodo raiz: UNICO nodo sin aristas de entrada (solo tiene aristas de salida)
- Nodos intermedio: tienen UN padre y pueden tener varios hijos
- Nodos hoja: tienen un padre pero NO tienen hijos

EJEMPLO DE ESTRUCTURA CORRECTA:
  1 (raiz, sin padre)
 / \\
2   3 (intermedios, cada uno tiene a 1 como padre)
|    |
4    5 (hojas)

EJEMPLOS DE ESTRUCTURAS INCORRECTAS (NO HACER):
- Multiples nodos raiz: 1->2, 3->4 (DOS raices, mal)
- Nodo huérfano: 1->2, 3 (3 no tiene padre, mal)
- Dependencia circular: 1->2->3->1 (ciclo, mal)
- ID inexistente: edge dice source="10" pero no existe nodo con id="10"

ADAPTACION AL NIVEL:
- El NIVEL DEL USUARIO es: ${nivelUsuario} (principiante/medio/avanzada)
- Adapta la complejidad y cantidad de nodos al nivel

ROADMAP:
- 10-15 nodos aproximadamente
- Incluye subtemas, conceptos especificos y detalles relevantes
- Estructura tipo arbol con ramas principales y secundarias
- Unico nodo principal (raiz) donde se ramifican los demas temas

TEMA: ${prompt}

RESPONDE SOLO CON JSON VALIDO, SIN TEXTO EXTRA.
SI EL TEMA NO TIENE SENTIDO O NO SE PUEDE ESTRUCTURAR, RESPONDE SOLO CON: TEMA NO VALIDO
VERIFICA QUE TODOS LOS IDS EN EDGES EXISTAN EN NODES ANTES DE RESPONDER.`;

    const result = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: generationPrompt,
    });

    const generatedText = result.text;

    if (generatedText.trim() === 'TEMA NO VALIDO') {
      console.log('Tema no valido:', prompt);
      return res.status(400).json({ error: 'El tema no es valido para generar un roadmap' });
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.log('Error: No se pudo parsear el JSON');
        console.log('Respuesta recibida:', generatedText.substring(0, 500));
        return res.status(400).json({ error: 'Error al parsear la respuesta de la IA' });
      }

      const validacion = validarCoherenciaRoadmap(parsed);

      if (!validacion.valido) {
        console.log('Warning: Roadmap con inconsistencias:', validacion.errors);
        console.log('Intentando regenerar...');
        return res.status(400).json({
          error: 'El roadmap generado tiene inconsistencias en las dependencias',
          detalles: validacion.errors
        });
      }

      console.log('✅ Roadmap generado correctamente, nodos:', parsed.nodes?.length);
      res.json(parsed);
    } else {
      console.log('Error: No se pudo extraer JSON de la respuesta');
      console.log('Respuesta recibida:', generatedText.substring(0, 500));
      res.status(400).json({ error: 'No se pudo parsear la respuesta' });
    }
  } catch (err) {
    console.log('Error al generar roadmap:', err.message);

    if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE')) {
      return res.status(503).json({ error: 'Servicio temporalmente no disponible' });
    }
    if (err.message?.includes('429')) {
      return res.status(429).json({ error: 'Demasiadas peticiones' });
    }

    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  generateRoadmap,
  validarCoherenciaRoadmap
};
