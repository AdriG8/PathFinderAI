// =============================================
// TESTS UNITARIOS - roadmapController (validaciones)
// =============================================

jest.mock('../../models/database', () => ({
  supabaseAdmin: {},
}));

jest.mock('../../models/roadmapModel', () => ({
  createRoadmap: jest.fn(),
  getRoadmapsByUser: jest.fn(),
  getRoadmapById: jest.fn(),
  updateRoadmap: jest.fn(),
  deleteRoadmap: jest.fn(),
}));

jest.mock('../../models/metricModel', () => ({
  agregarTemaConsultado: jest.fn(),
}));

const roadmapModel = require('../../models/roadmapModel');
const metricModel = require('../../models/metricModel');
const {
  saveRoadmap,
  getRoadmaps,
  getRoadmapById,
  updateRoadmap,
  deleteRoadmap,
  testRoadmap,
} = require('../../controllers/roadmapController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// -----------------------------------------------
// BLOQUE: Guardar roadmap
// -----------------------------------------------
describe('saveRoadmap', () => {

  // TEST 1: Sin título
  test('Debe rechazar un roadmap sin título', async () => {
    // Elemento probado: Validación de título obligatorio en saveRoadmap
    // Resultado esperado: 400 con error 'El titulo es requerido'
    const req = { user: { id: 'u1' }, body: { json: {} } };
    const res = mockRes();

    await saveRoadmap(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El titulo es requerido' });
  });

  // TEST 2: JSON inválido como string
  test('Debe rechazar un roadmap con JSON string inválido', async () => {
    // Elemento probado: Validación de parseo de JSON string
    // Resultado esperado: 400 con error 'JSON invalido'
    const req = { user: { id: 'u1' }, body: { title: 'React', json: 'no-es-json{{{' } };
    const res = mockRes();

    await saveRoadmap(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'JSON invalido' });
  });

  // TEST 3: Guardar exitosamente
  test('Debe guardar un roadmap correctamente', async () => {
    // Elemento probado: Flujo completo de saveRoadmap con datos válidos
    // Resultado esperado: Respuesta con datos del roadmap creado
    const mockData = { ID: 1, Titulo_Tema: 'React', JSON: { nodes: [], edges: [] } };
    roadmapModel.createRoadmap.mockResolvedValue({ data: mockData, error: null });
    metricModel.agregarTemaConsultado.mockResolvedValue({ data: null, error: null });

    const req = {
      user: { id: 'u1' },
      body: { title: 'React', json: { nodes: [], edges: [] } },
    };
    const res = mockRes();

    await saveRoadmap(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(mockData);
    expect(metricModel.agregarTemaConsultado).toHaveBeenCalledWith('u1', 'React');
  });

  // TEST 4: Guardar con JSON como string válido
  test('Debe parsear JSON string válido al guardar', async () => {
    // Elemento probado: Conversión de JSON string a objeto
    // Resultado esperado: createRoadmap recibe objeto parseado
    const jsonObj = { nodes: [{ id: '1' }], edges: [] };
    roadmapModel.createRoadmap.mockResolvedValue({ data: { ID: 2 }, error: null });
    metricModel.agregarTemaConsultado.mockResolvedValue({ data: null, error: null });

    const req = {
      user: { id: 'u1' },
      body: { title: 'Vue', json: JSON.stringify(jsonObj) },
    };
    const res = mockRes();

    await saveRoadmap(req, res);

    // Resultado obtenido
    expect(roadmapModel.createRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({ JSON: jsonObj })
    );
  });
});

// -----------------------------------------------
// BLOQUE: Obtener roadmaps
// -----------------------------------------------
describe('getRoadmaps', () => {

  // TEST 5: Listar roadmaps del usuario
  test('Debe devolver la lista de roadmaps del usuario', async () => {
    // Elemento probado: getRoadmaps con usuario autenticado
    // Resultado esperado: Array con los roadmaps del usuario
    const mockData = [
      { ID: 1, Titulo_Tema: 'React' },
      { ID: 2, Titulo_Tema: 'Vue' },
    ];
    roadmapModel.getRoadmapsByUser.mockResolvedValue({ data: mockData, error: null });

    const req = { user: { id: 'u1' } };
    const res = mockRes();

    await getRoadmaps(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  // TEST 6: Lista vacía
  test('Debe devolver array vacío si no tiene roadmaps', async () => {
    // Elemento probado: getRoadmaps sin roadmaps existentes
    // Resultado esperado: Array vacío []
    roadmapModel.getRoadmapsByUser.mockResolvedValue({ data: null, error: null });

    const req = { user: { id: 'u2' } };
    const res = mockRes();

    await getRoadmaps(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

// -----------------------------------------------
// BLOQUE: Obtener roadmap por ID
// -----------------------------------------------
describe('getRoadmapById', () => {

  // TEST 7: Obtener roadmap existente
  test('Debe devolver un roadmap por su ID', async () => {
    // Elemento probado: getRoadmapById con ID existente
    // Resultado esperado: Objeto roadmap completo
    const mockData = { ID: 1, Titulo_Tema: 'React', JSON: { nodes: [], edges: [] } };
    roadmapModel.getRoadmapById.mockResolvedValue({ data: mockData, error: null });

    const req = { params: { id: '1' } };
    const res = mockRes();

    await getRoadmapById(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});

// -----------------------------------------------
// BLOQUE: Eliminar roadmap
// -----------------------------------------------
describe('deleteRoadmap', () => {

  // TEST 8: Eliminar roadmap exitosamente
  test('Debe eliminar un roadmap correctamente', async () => {
    // Elemento probado: deleteRoadmap con ID y usuario válidos
    // Resultado esperado: Mensaje 'Roadmap eliminado'
    roadmapModel.deleteRoadmap.mockResolvedValue({ error: null });

    const req = { params: { id: '1' }, user: { id: 'u1' } };
    const res = mockRes();

    await deleteRoadmap(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({ message: 'Roadmap eliminado' });
  });
});

// -----------------------------------------------
// BLOQUE: Actualizar roadmap
// -----------------------------------------------
describe('updateRoadmap', () => {

  // TEST 9: Actualizar título del roadmap
  test('Debe actualizar el roadmap correctamente', async () => {
    // Elemento probado: updateRoadmap con nuevo título
    // Resultado esperado: Mensaje 'Roadmap actualizado'
    roadmapModel.updateRoadmap.mockResolvedValue({ error: null });

    const req = {
      params: { id: '1' },
      user: { id: 'u1' },
      body: { Titulo_Tema: 'React Avanzado' },
    };
    const res = mockRes();

    await updateRoadmap(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({ message: 'Roadmap actualizado' });
  });
});

// -----------------------------------------------
// BLOQUE: Test endpoint
// -----------------------------------------------
describe('testRoadmap', () => {

  // TEST 10: Endpoint de prueba
  test('Debe devolver mensaje de prueba', () => {
    // Elemento probado: testRoadmap endpoint público
    // Resultado esperado: { message: 'Test endpoint works', tables: ['Roadmap'] }
    const req = {};
    const res = mockRes();

    testRoadmap(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({
      message: 'Test endpoint works',
      tables: ['Roadmap'],
    });
  });
});
