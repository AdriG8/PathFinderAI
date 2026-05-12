// =============================================
// CONTROLADORES DE EXÁMENES
// =============================================

const { GoogleGenAI } = require('@google/genai');

// =============================================
// CONTROLADOR: Generar examen con IA
// =============================================

const generateExam = async (req, res) => {
  try {
    // Extrae el tema del cuerpo de la peticion
    const { topic } = req.body;
    console.log('Generando examen para:', topic);
    
    // Obtiene la clave de API de Gemini
    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Verifica que la clave este configurada
    if (!geminiApiKey) {
      console.log('Error: GEMINI_API_KEY no configurada');
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    // Verifica que el tema no este vacio
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: 'El tema es requerido' });
    }

    // Limpia el tema de espacios en blanco
    const cleanTopic = topic.trim();

    // Valida que el tema no sea demasiado corto
    if (cleanTopic.length < 2) {
      return res.status(400).json({ error: 'El tema es demasiado corto' });
    }

    // Valida que el tema contenga texto valido (letras)
    if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/i.test(cleanTopic)) {
      return res.status(400).json({ error: 'El tema no contiene texto válido' });
    }

    // Patrones para detectar texto sin sentido (gibberish)
    const gibberishPatterns = /^(.)\1+$|^[a-zA-Z0-9]{1,2}$|^\s+$|^[.,;:!@#$%^&*()]+$/i;
    if (gibberishPatterns.test(cleanTopic)) {
      return res.status(400).json({ error: 'El tema no tiene sentido' });
    }

    // Inicializa el cliente de Gemini con la clave de API
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Prompt para generar el examen con 3 preguntas tipo test
    const examPrompt = `Genera un examen tipo test sobre el tema: "${topic}"

REGLAS:
1. Genera EXACTAMENTE 3 preguntas
2. Cada pregunta debe tener EXACTAMENTE 4 opciones de respuesta (a, b, c, d)
3. Solo UNA opcion es correcta
4. Las preguntas deben ser de dificultad media (conceptos fundamentales)
5. Incluye una explicacion breve de por que la respuesta correcta es correcta

Devuelve SOLO JSON valido (sin texto adicional ni markdown):
{
  "questions": [
    {
      "question": "Texto de la pregunta",
      "options": [
        {"letter": "a", "text": "Opcion A"},
        {"letter": "b", "text": "Opcion B"},
        {"letter": "c", "text": "Opcion C"},
        {"letter": "d", "text": "Opcion D"}
      ],
      "correctAnswer": "b",
      "explanation": "Explicacion de por que es correcta"
    }
  ]
}`;

    console.log('Prompt examen:\n', examPrompt);

    // Genera el contenido usando Gemini
    const interaction = await ai.interactions.create({
      model: 'gemini-2.5-flash-lite',
      input: examPrompt,
    });

    // Extrae el texto generado de la respuesta
    let generatedText = '';
    if (interaction.steps && interaction.steps.length > 0) {
      const lastStep = interaction.steps[interaction.steps.length - 1];
      if (lastStep.content && lastStep.content.length > 0) {
        generatedText = lastStep.content[0].text || '';
      }
    }

    // Limpia el texto generado y extrae solo el JSON
    let cleanText = generatedText.trim();
    cleanText = cleanText.replace(/```json\s*/g, '');
    cleanText = cleanText.replace(/```\s*/g, '');
    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');

    // Verifica que se haya encontrado JSON valido
    if (jsonStart === -1 || jsonEnd === -1) {
      console.log('Error: No se encontro JSON en la respuesta');
      return res.status(400).json({ error: 'Error al generar el examen' });
    }

    // Parsea el JSON y lo devuelve
    const cleanJson = cleanText.substring(jsonStart, jsonEnd + 1);
    const examData = JSON.parse(cleanJson);

    console.log('Examen generado con', examData.questions?.length, 'preguntas');
    res.json(examData);

  } catch (err) {
    console.log('Error al generar examen:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// EXPORTACIÓN DE MÓDULOS
// =============================================

module.exports = {
  generateExam
};
