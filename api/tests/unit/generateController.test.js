// =============================================
// TESTS UNITARIOS - generateController
// =============================================

// Mock de Supabase para evitar error de inicializacion del cliente
// Simula las operaciones de base de datos sin conexion real
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
}));

// Importa la funcion de validacion de coherencia desde el controlador
const { validarCoherenciaRoadmap } = require('../../controllers/generateController');

describe('validarCoherenciaRoadmap', () => {

  // =============================================
  // TEST 1: Roadmap valido con estructura correcta
  // =============================================
  test('Debe validar un roadmap con estructura de árbol correcta', () => {
    // Elemento probado: validarCoherenciaRoadmap con roadmap válido
    // Resultado esperado: { valido: true, errors: [] }

    // Define un roadmap con 3 nodos y 2 aristas validas
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Raíz' } },
        { id: '2', data: { label: 'Hijo 1' } },
        { id: '3', data: { label: 'Hijo 2' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
      ],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: verifica que sea valido y sin errores
    expect(resultado.valido).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  // =============================================
  // TEST 2: Roadmap sin nodos
  // =============================================
  test('Debe rechazar un roadmap sin nodos', () => {
    // Elemento probado: validarCoherenciaRoadmap con array de nodos vacío
    // Resultado esperado: valido = false, error indicando que faltan nodos

    // Define un roadmap con arrays vacios de nodos y aristas
    const roadmap = {
      nodes: [],
      edges: [],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta que no hay nodos
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('El roadmap debe tener al menos un nodo');
  });

  // =============================================
  // TEST 3: Edge referenciando nodo inexistente (source)
  // =============================================
  test('Debe detectar edges con source inexistente', () => {
    // Elemento probado: validarCoherenciaRoadmap con edge cuyo source no existe
    // Resultado esperado: valido = false, error indicando source inexistente

    // Define un roadmap con un edge cuyo source "99" no existe en los nodos
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Raíz' } },
        { id: '2', data: { label: 'Hijo' } },
      ],
      edges: [
        { id: 'e99-2', source: '99', target: '2' },
      ],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta el source inexistente
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('El nodo source "99" no existe');
  });

  // =============================================
  // TEST 4: Edge referenciando nodo inexistente (target)
  // =============================================
  test('Debe detectar edges con target inexistente', () => {
    // Elemento probado: validarCoherenciaRoadmap con edge cuyo target no existe
    // Resultado esperado: valido = false, error indicando target inexistente

    // Define un roadmap con un edge cuyo target "50" no existe en los nodos
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Raíz' } },
      ],
      edges: [
        { id: 'e1-50', source: '1', target: '50' },
      ],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta el target inexistente
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('El nodo target "50" no existe');
  });

  // =============================================
  // TEST 5: Nodo sin ID
  // =============================================
  test('Debe detectar nodos sin ID', () => {
    // Elemento probado: validarCoherenciaRoadmap con nodo sin campo id
    // Resultado esperado: valido = false, error indicando falta de ID

    // Define un roadmap con un nodo que no tiene campo id
    const roadmap = {
      nodes: [
        { data: { label: 'Nodo sin ID' } },
      ],
      edges: [],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta la falta de ID
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('Todos los nodos deben tener un ID');
  });

  // =============================================
  // TEST 6: Nodo sin label
  // =============================================
  test('Debe detectar nodos sin label', () => {
    // Elemento probado: validarCoherenciaRoadmap con nodo sin data.label
    // Resultado esperado: valido = false, error indicando falta de label

    // Define un roadmap con un nodo sin etiqueta en data
    const roadmap = {
      nodes: [
        { id: '1', data: {} },
      ],
      edges: [],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta la falta de label
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('Todos los nodos deben tener una etiqueta (label)');
  });

  // =============================================
  // TEST 7: Demasiados nodos raiz (>3)
  // =============================================
  test('Debe rechazar roadmaps con más de 3 nodos raíz', () => {
    // Elemento probado: validarCoherenciaRoadmap con 4 nodos raíz sin edges
    // Resultado esperado: valido = false, error de demasiados nodos raiz

    // Define un roadmap con 4 nodos sin aristas (todos son raiz)
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Raíz 1' } },
        { id: '2', data: { label: 'Raíz 2' } },
        { id: '3', data: { label: 'Raíz 3' } },
        { id: '4', data: { label: 'Raíz 4' } },
      ],
      edges: [],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: rechaza la estructura poco jerarquica
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('Demasiados nodos raiz, la estructura debe ser mas jerarquica');
  });

  // =============================================
  // TEST 8: Edges sin source ni target
  // =============================================
  test('Debe detectar edges sin source ni target', () => {
    // Elemento probado: validarCoherenciaRoadmap con edge incompleto
    // Resultado esperado: valido = false, error de source/target faltantes

    // Define un roadmap con una arista incompleta sin source ni target
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Nodo' } },
      ],
      edges: [
        { id: 'e-bad' },
      ],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta la arista sin source y target
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('Todas las aristas deben tener source y target');
  });

  // =============================================
  // TEST 9: Roadmap complejo valido (10 nodos)
  // =============================================
  test('Debe validar un roadmap complejo con 10 nodos', () => {
    // Elemento probado: validarCoherenciaRoadmap con estructura de 10 nodos tipo árbol
    // Resultado esperado: valido = true, sin errores

    // Define un roadmap con estructura de arbol completa de 10 nodos
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'React' } },
        { id: '2', data: { label: 'JSX' } },
        { id: '3', data: { label: 'Componentes' } },
        { id: '4', data: { label: 'Estado' } },
        { id: '5', data: { label: 'Props' } },
        { id: '6', data: { label: 'Hooks' } },
        { id: '7', data: { label: 'useState' } },
        { id: '8', data: { label: 'useEffect' } },
        { id: '9', data: { label: 'Router' } },
        { id: '10', data: { label: 'Redux' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e3-5', source: '3', target: '5' },
        { id: 'e4-6', source: '4', target: '6' },
        { id: 'e6-7', source: '6', target: '7' },
        { id: 'e6-8', source: '6', target: '8' },
        { id: 'e1-9', source: '1', target: '9' },
        { id: 'e4-10', source: '4', target: '10' },
      ],
    };

    // Ejecuta la validacion del roadmap complejo
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: valida la estructura completa sin errores
    expect(resultado.valido).toBe(true);
    expect(resultado.errors).toHaveLength(0);
  });

  // =============================================
  // TEST 10: Roadmap sin edges (array undefined)
  // =============================================
  test('Debe rechazar roadmap sin array de edges', () => {
    // Elemento probado: validarCoherenciaRoadmap con edges = undefined
    // Resultado esperado: valido = false, error indicando falta de edges

    // Define un roadmap sin la propiedad edges (undefined)
    const roadmap = {
      nodes: [
        { id: '1', data: { label: 'Solo' } },
      ],
    };

    // Ejecuta la validacion de coherencia del roadmap
    const resultado = validarCoherenciaRoadmap(roadmap);

    // Resultado obtenido: detecta la ausencia del array de aristas
    expect(resultado.valido).toBe(false);
    expect(resultado.errors).toContain('El roadmap debe tener un array de aristas');
  });
});
