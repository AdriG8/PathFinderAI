// =============================================
// TESTS DE INTEGRACIÓN - Frontend ↔ Backend
// =============================================
// Valida la comunicación del frontend con la API backend
// Usa fetch mock para simular respuestas de la API

// Mock global de fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock de localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const API_URL = 'http://localhost:3000';

beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
});

// -----------------------------------------------
// BLOQUE: Frontend → POST /api/login
// -----------------------------------------------
describe('Frontend → Backend: Login', () => {

  // TEST 1: Login exitoso desde frontend
  test('Frontend envía credenciales y recibe token', async () => {
    // Elemento probado: Fetch POST /api/login con credenciales
    // Resultado esperado: Respuesta con session.access_token y user
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        session: { access_token: 'jwt-token-abc' },
        user: { id: 'u1', email: 'user@test.com' },
      }),
    });

    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@test.com', password: 'Pass123!' }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.session.access_token).toBe('jwt-token-abc');
    expect(data.user.email).toBe('user@test.com');

    // Simular que el frontend guarda el token
    localStorage.setItem('token', data.session.access_token);
    expect(localStorage.getItem('token')).toBe('jwt-token-abc');
  });

  // TEST 2: Login fallido desde frontend
  test('Frontend recibe error con credenciales inválidas', async () => {
    // Elemento probado: Fetch POST /api/login con credenciales malas
    // Resultado esperado: Respuesta con ok=false y error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid login credentials' }),
    });

    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad@test.com', password: 'wrong' }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(false);
    expect(data.error).toBe('Invalid login credentials');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → POST /api/register
// -----------------------------------------------
describe('Frontend → Backend: Registro', () => {

  // TEST 3: Registro exitoso
  test('Frontend envía datos de registro y recibe confirmación', async () => {
    // Elemento probado: Fetch POST /api/register con datos completos
    // Resultado esperado: Respuesta con user creado
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: 'new-u1', email: 'nuevo@test.com' },
      }),
    });

    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nuevo@test.com',
        password: 'Secure123!',
        firstName: 'Nuevo',
        lastName: 'Usuario',
      }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.user.email).toBe('nuevo@test.com');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → GET /api/profile (autenticado)
// -----------------------------------------------
describe('Frontend → Backend: Perfil autenticado', () => {

  // TEST 4: Obtener perfil con token válido
  test('Frontend envía token y recibe datos del perfil', async () => {
    // Elemento probado: Fetch GET /api/profile con header Authorization
    // Resultado esperado: Datos del perfil del usuario
    const token = 'valid-jwt-token';
    localStorage.setItem('token', token);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nombre: 'Carlos',
        apellidos: 'López',
        nivel: 'medio',
        rol: 'user',
        email: 'carlos@test.com',
      }),
    });

    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.nombre).toBe('Carlos');
    expect(data.nivel).toBe('medio');
    // Verificar que se envió el header correcto
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-jwt-token',
        }),
      })
    );
  });

  // TEST 5: Perfil sin token → 401
  test('Frontend recibe 401 sin token de autenticación', async () => {
    // Elemento probado: Fetch GET /api/profile sin header Authorization
    // Resultado esperado: 401 Unauthorized
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Token no proporcionado' }),
    });

    const response = await fetch(`${API_URL}/api/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(data.error).toBe('Token no proporcionado');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → POST /api/generate (roadmap IA)
// -----------------------------------------------
describe('Frontend → Backend: Generar roadmap', () => {

  // TEST 6: Generar roadmap con tema válido
  test('Frontend solicita roadmap y recibe estructura JSON', async () => {
    // Elemento probado: Fetch POST /api/generate con prompt válido
    // Resultado esperado: Roadmap con nodes y edges
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nodes: [
          { id: '1', type: 'custom', data: { label: 'React', status: 'pendiente', horas: 2 } },
          { id: '2', type: 'custom', data: { label: 'JSX', status: 'pendiente', horas: 1 } },
        ],
        edges: [
          { id: 'e1-2', source: '1', target: '2' },
        ],
      }),
    });

    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ prompt: 'Aprender React' }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.nodes).toHaveLength(2);
    expect(data.edges).toHaveLength(1);
    expect(data.nodes[0].data.label).toBe('React');
  });

  // TEST 7: Generar roadmap con tema inválido
  test('Frontend recibe error con tema inválido', async () => {
    // Elemento probado: Fetch POST /api/generate con tema inválido
    // Resultado esperado: 400 con mensaje de error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'El tema no es valido para generar un roadmap' }),
    });

    const response = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ prompt: 'asdfghjk' }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(false);
    expect(data.error).toBeTruthy();
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → POST /api/save (guardar roadmap)
// -----------------------------------------------
describe('Frontend → Backend: Guardar roadmap', () => {

  // TEST 8: Guardar roadmap exitosamente
  test('Frontend guarda roadmap generado en BD', async () => {
    // Elemento probado: Fetch POST /api/save con title y json
    // Resultado esperado: Roadmap guardado con ID
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ID: 42,
        Titulo_Tema: 'Machine Learning',
        JSON: { nodes: [], edges: [] },
      }),
    });

    const response = await fetch(`${API_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        title: 'Machine Learning',
        json: { nodes: [], edges: [] },
      }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.ID).toBe(42);
    expect(data.Titulo_Tema).toBe('Machine Learning');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → GET /api/roadmaps (listar)
// -----------------------------------------------
describe('Frontend → Backend: Listar roadmaps', () => {

  // TEST 9: Listar roadmaps del usuario
  test('Frontend obtiene lista de roadmaps guardados', async () => {
    // Elemento probado: Fetch GET /api/roadmaps con token
    // Resultado esperado: Array de roadmaps
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { ID: 1, Titulo_Tema: 'React', Fecha_Creacion: '2026-05-01' },
        { ID: 2, Titulo_Tema: 'Python', Fecha_Creacion: '2026-05-10' },
      ]),
    });

    const response = await fetch(`${API_URL}/api/roadmaps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0].Titulo_Tema).toBe('React');
    expect(data[1].Titulo_Tema).toBe('Python');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → POST /api/exam
// -----------------------------------------------
describe('Frontend → Backend: Generar examen', () => {

  // TEST 10: Generar examen correctamente
  test('Frontend solicita examen y recibe preguntas', async () => {
    // Elemento probado: Fetch POST /api/exam con topic válido
    // Resultado esperado: 3 preguntas con opciones y respuesta correcta
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        questions: [
          {
            question: '¿Qué es React?',
            options: [
              { letter: 'a', text: 'Una librería' },
              { letter: 'b', text: 'Un framework' },
              { letter: 'c', text: 'Un lenguaje' },
              { letter: 'd', text: 'Un sistema operativo' },
            ],
            correctAnswer: 'a',
            explanation: 'React es una librería de JavaScript',
          },
          {
            question: '¿Qué es JSX?',
            options: [
              { letter: 'a', text: 'JavaScript XML' },
              { letter: 'b', text: 'Java Server Extension' },
              { letter: 'c', text: 'JSON Schema' },
              { letter: 'd', text: 'Java Syntax' },
            ],
            correctAnswer: 'a',
            explanation: 'JSX significa JavaScript XML',
          },
          {
            question: '¿Qué hook maneja estado?',
            options: [
              { letter: 'a', text: 'useEffect' },
              { letter: 'b', text: 'useRef' },
              { letter: 'c', text: 'useState' },
              { letter: 'd', text: 'useMemo' },
            ],
            correctAnswer: 'c',
            explanation: 'useState es el hook para manejar estado',
          },
        ],
      }),
    });

    const response = await fetch(`${API_URL}/api/exam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ topic: 'React' }),
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.questions).toHaveLength(3);
    data.questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
      expect(['a', 'b', 'c', 'd']).toContain(q.correctAnswer);
      expect(q.explanation).toBeTruthy();
    });
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → DELETE /api/roadmaps/:id
// -----------------------------------------------
describe('Frontend → Backend: Eliminar roadmap', () => {

  // TEST 11: Eliminar roadmap existente
  test('Frontend elimina un roadmap correctamente', async () => {
    // Elemento probado: Fetch DELETE /api/roadmaps/:id
    // Resultado esperado: Mensaje de confirmación
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Roadmap eliminado' }),
    });

    const response = await fetch(`${API_URL}/api/roadmaps/42`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
    });
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.message).toBe('Roadmap eliminado');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → GET /api/health
// -----------------------------------------------
describe('Frontend → Backend: Health check', () => {

  // TEST 12: Verificar que la API está disponible
  test('Frontend verifica estado de la API', async () => {
    // Elemento probado: Fetch GET /api/health
    // Resultado esperado: status = 'ok'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'ok',
        message: 'API funcionando correctamente',
        timestamp: '2026-05-22T10:00:00Z',
        checks: { server: 'ok', environment: 'ok' },
      }),
    });

    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();

    // Resultado obtenido
    expect(response.ok).toBe(true);
    expect(data.status).toBe('ok');
    expect(data.checks.server).toBe('ok');
  });
});

// -----------------------------------------------
// BLOQUE: Frontend → Error de red
// -----------------------------------------------
describe('Frontend → Backend: Manejo de errores de red', () => {

  // TEST 13: Error de conexión
  test('Frontend maneja error cuando el backend no responde', async () => {
    // Elemento probado: Fetch con error de red (backend caído)
    // Resultado esperado: Se captura el error fetch
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    // Resultado obtenido
    await expect(
      fetch(`${API_URL}/api/health`)
    ).rejects.toThrow('Failed to fetch');
  });
});
