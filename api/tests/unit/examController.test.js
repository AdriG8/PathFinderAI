// =============================================
// TESTS UNITARIOS - examController (validaciones)
// =============================================

// Mock de @google/genai para no depender de la API real
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    interactions: {
      create: jest.fn(),
    },
  })),
}));

// Guardamos el env original
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };
  jest.clearAllMocks();
});

afterAll(() => {
  process.env = originalEnv;
});

const { generateExam } = require('../../controllers/examController');

// Helpers para simular req/res de Express
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('generateExam - Validaciones de entrada', () => {

  // -----------------------------------------------
  // TEST 1: Topic vacío
  // -----------------------------------------------
  test('Debe rechazar un topic vacío', async () => {
    // Elemento probado: Validación de campo topic vacío
    // Resultado esperado: 400 con error 'El tema es requerido'
    const req = { body: { topic: '' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema es requerido' });
  });

  // -----------------------------------------------
  // TEST 2: Topic undefined
  // -----------------------------------------------
  test('Debe rechazar cuando no se envía topic', async () => {
    // Elemento probado: Validación de topic undefined
    // Resultado esperado: 400 con error 'El tema es requerido'
    const req = { body: {} };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema es requerido' });
  });

  // -----------------------------------------------
  // TEST 3: Topic demasiado corto
  // -----------------------------------------------
  test('Debe rechazar un topic de 1 carácter', async () => {
    // Elemento probado: Validación de longitud mínima del topic
    // Resultado esperado: 400 con error 'El tema es demasiado corto'
    const req = { body: { topic: 'A' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema es demasiado corto' });
  });

  // -----------------------------------------------
  // TEST 4: Topic solo con números y símbolos
  // -----------------------------------------------
  test('Debe rechazar un topic sin letras válidas', async () => {
    // Elemento probado: Validación de contenido textual (regex letras)
    // Resultado esperado: 400 con error 'El tema no contiene texto válido'
    const req = { body: { topic: '12345!@#' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema no contiene texto válido' });
  });

  // -----------------------------------------------
  // TEST 5: Topic con gibberish (repetición)
  // -----------------------------------------------
  test('Debe rechazar un topic con texto sin sentido (repetición)', async () => {
    // Elemento probado: Detección de gibberish con patrón de repetición
    // Resultado esperado: 400 con error 'El tema no tiene sentido'
    const req = { body: { topic: 'aaaaaaa' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema no tiene sentido' });
  });

  // -----------------------------------------------
  // TEST 6: Topic con solo símbolos
  // -----------------------------------------------
  test('Debe rechazar un topic con solo símbolos de puntuación', async () => {
    // Elemento probado: Detección de gibberish con patrón de símbolos
    // Resultado esperado: 400 con error (símbolos no contienen letras)
    const req = { body: { topic: '.,;:!@#$%' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema no contiene texto válido' });
  });

  // -----------------------------------------------
  // TEST 7: GEMINI_API_KEY no configurada
  // -----------------------------------------------
  test('Debe rechazar si GEMINI_API_KEY no está configurada', async () => {
    // Elemento probado: Validación de variable de entorno GEMINI_API_KEY
    // Resultado esperado: 500 con error 'GEMINI_API_KEY no configurada'
    delete process.env.GEMINI_API_KEY;
    const req = { body: { topic: 'JavaScript' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'GEMINI_API_KEY no configurada' });
  });

  // -----------------------------------------------
  // TEST 8: Topic válido con acentos
  // -----------------------------------------------
  test('Debe aceptar un topic con caracteres acentuados', async () => {
    // Elemento probado: Validación de letras con acentos (áéíóúñ)
    // Resultado esperado: NO devuelve 400 (pasa las validaciones de entrada)
    const { GoogleGenAI } = require('@google/genai');
    GoogleGenAI.mockImplementation(() => ({
      interactions: {
        create: jest.fn().mockResolvedValue({
          steps: [{
            content: [{
              text: JSON.stringify({
                questions: [
                  { question: 'Q1', options: [{ letter: 'a', text: 'A' }], correctAnswer: 'a', explanation: 'ok' }
                ]
              })
            }]
          }]
        })
      }
    }));

    const req = { body: { topic: 'Programación en español' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido: no es 400 (pasa las validaciones)
    if (res.status.mock.calls.length > 0) {
      expect(res.status.mock.calls[0][0]).not.toBe(400);
    }
  });

  // -----------------------------------------------
  // TEST 9: Topic solo espacios
  // -----------------------------------------------
  test('Debe rechazar un topic con solo espacios en blanco', async () => {
    // Elemento probado: Validación de topic vacío con trim
    // Resultado esperado: 400 con error 'El tema es requerido'
    const req = { body: { topic: '   ' } };
    const res = mockRes();

    await generateExam(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El tema es requerido' });
  });
});
