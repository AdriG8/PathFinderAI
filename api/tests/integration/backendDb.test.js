// =============================================
// TESTS DE INTEGRACIÓN - Backend ↔ Base de Datos
// =============================================
// Valida la comunicación entre controladores y modelos con Supabase mockeado

jest.mock('../../models/database', () => {
  const mockFrom = (table) => {
    const chain = {
      select: jest.fn().mockReturnValue(chain),
      insert: jest.fn().mockReturnValue(chain),
      update: jest.fn().mockReturnValue(chain),
      delete: jest.fn().mockReturnValue(chain),
      eq: jest.fn().mockReturnValue(chain),
      gte: jest.fn().mockReturnValue(chain),
      lte: jest.fn().mockReturnValue(chain),
      in: jest.fn().mockReturnValue(chain),
      order: jest.fn().mockReturnValue(chain),
      single: jest.fn(),
    };
    chain._table = table;
    chain._mockData = null;
    chain._mockError = null;

    // Default: resolve with empty
    chain.single.mockResolvedValue({ data: null, error: null });
    chain.order.mockResolvedValue({ data: [], error: null });
    chain.select.mockReturnValue(chain);
    chain.insert.mockReturnValue(chain);
    chain.delete.mockResolvedValue({ error: null });

    return chain;
  };

  return {
    supabase: {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithIdToken: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        updateUser: jest.fn(),
        resetPasswordForEmail: jest.fn(),
      },
    },
    supabaseAdmin: {
      from: jest.fn(mockFrom),
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        admin: {
          deleteUser: jest.fn().mockResolvedValue({ error: null }),
        },
      },
    },
  };
});

const { supabase, supabaseAdmin } = require('../../models/database');

// -----------------------------------------------
// BLOQUE: Integración Registro → Supabase Auth → BD
// -----------------------------------------------
describe('Integración: Registro completo de usuario', () => {

  // TEST 1: Registro exitoso crea usuario en auth y responde
  test('Registro → Supabase Auth → Respuesta al cliente', async () => {
    // Elemento probado: POST /api/register llama a supabase.auth.signUp y devuelve datos
    // Resultado esperado: Se llama signUp con los datos correctos y se devuelve el resultado
    const { register } = require('../../controllers/userController');

    supabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new-1', email: 'integ@test.com' },
        session: { access_token: 'tok123' },
      },
      error: null,
    });

    const req = {
      body: {
        email: 'integ@test.com',
        password: 'SecurePass1!',
        firstName: 'Integration',
        lastName: 'Test',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    // Resultado obtenido
    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'integ@test.com',
        password: 'SecurePass1!',
      })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.objectContaining({ id: 'new-1' }),
      })
    );
  });
});

// -----------------------------------------------
// BLOQUE: Integración Autenticación → Perfil desde BD
// -----------------------------------------------
describe('Integración: Autenticación → Obtener perfil', () => {

  // TEST 2: Token válido → getProfile consulta BD
  test('authenticateToken → getProfile → Datos de BD', async () => {
    // Elemento probado: Flujo completo auth middleware + getProfile consultando userModel
    // Resultado esperado: Se verifica token, se consulta usuario en BD y se devuelve perfil

    const { authenticateToken, getProfile } = require('../../controllers/userController');
    const userModel = require('../../models/userModel');

    // Mock del middleware auth
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-integ', email: 'perfil@test.com' } },
      error: null,
    });

    // Simular que el req pasa por authenticateToken
    const req = { headers: { authorization: 'Bearer valid-integration-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'u-integ', email: 'perfil@test.com' });

    // Ahora simular getProfile con el req que ya tiene user
    // Mock directo del modelo
    jest.spyOn(userModel, 'getUserById').mockResolvedValue({
      data: { Nombre: 'Ana', Apellidos: 'Pérez', Nivel: 'avanzada', Rol: 'user', Email: 'perfil@test.com' },
      error: null,
    });

    await getProfile(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellidos: 'Pérez',
      nivel: 'avanzada',
      rol: 'user',
      email: 'perfil@test.com',
    });
  });
});

// -----------------------------------------------
// BLOQUE: Integración Guardar Roadmap → BD + Métrica
// -----------------------------------------------
describe('Integración: Guardar roadmap → BD + Métricas', () => {

  // TEST 3: saveRoadmap → createRoadmap en BD → agregarTemaConsultado
  test('saveRoadmap guarda en Roadmap y registra métrica', async () => {
    // Elemento probado: saveRoadmap llama a roadmapModel.createRoadmap y metricModel.agregarTemaConsultado
    // Resultado esperado: Se guardan ambos registros correctamente
    const roadmapModel = require('../../models/roadmapModel');
    const metricModel = require('../../models/metricModel');
    const { saveRoadmap } = require('../../controllers/roadmapController');

    jest.spyOn(roadmapModel, 'createRoadmap').mockResolvedValue({
      data: { ID: 100, Titulo_Tema: 'Python', JSON: { nodes: [], edges: [] } },
      error: null,
    });
    jest.spyOn(metricModel, 'agregarTemaConsultado').mockResolvedValue({
      data: null,
      error: null,
    });

    const req = {
      user: { id: 'u-integ' },
      body: { title: 'Python', json: { nodes: [], edges: [] } },
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await saveRoadmap(req, res);

    // Resultado obtenido
    expect(roadmapModel.createRoadmap).toHaveBeenCalledWith(
      expect.objectContaining({
        ID_Usuario: 'u-integ',
        Titulo_Tema: 'Python',
      })
    );
    expect(metricModel.agregarTemaConsultado).toHaveBeenCalledWith('u-integ', 'Python');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ ID: 100, Titulo_Tema: 'Python' })
    );
  });
});

// -----------------------------------------------
// BLOQUE: Integración Admin → Verificación rol + Stats
// -----------------------------------------------
describe('Integración: Admin middleware → Stats del sistema', () => {

  // TEST 4: requireAdmin verifica rol → getAdminStats consulta BD
  test('Verificación de admin + obtener estadísticas', async () => {
    // Elemento probado: requireAdmin consulta rol en BD → getAdminStats agrega datos
    // Resultado esperado: Admin verificado puede obtener stats del sistema
    const userModel = require('../../models/userModel');
    const roadmapModel = require('../../models/roadmapModel');
    const { requireAdmin, getAdminStats } = require('../../controllers/adminController');

    // 1. Simular requireAdmin
    jest.spyOn(userModel, 'getUserRol').mockResolvedValue({
      data: { Rol: 'admin' },
      error: null,
    });

    const req = { user: { id: 'admin-integ' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();

    // 2. Simular getAdminStats
    jest.spyOn(userModel, 'countUsers').mockResolvedValue({ count: 25, error: null });
    jest.spyOn(roadmapModel, 'countRoadmaps').mockResolvedValue({ count: 80, error: null });
    jest.spyOn(userModel, 'getUsersInRange').mockResolvedValue({ data: [], error: null });

    await getAdminStats(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        totalUsuarios: 25,
        totalRoadmaps: 80,
        tendenciaUsuarios: [],
      })
    );
  });
});

// -----------------------------------------------
// BLOQUE: Integración Login → Token → Acceso protegido
// -----------------------------------------------
describe('Integración: Login → Token → Ruta protegida', () => {

  // TEST 5: Login genera token → Token se valida → Acceso a ruta protegida
  test('Login exitoso → authenticateToken → Acceso concedido', async () => {
    // Elemento probado: Flujo completo login + autenticación + acceso a roadmaps
    // Resultado esperado: Usuario puede acceder a sus roadmaps tras login
    const { login, authenticateToken } = require('../../controllers/userController');
    const { getRoadmaps } = require('../../controllers/roadmapController');
    const roadmapModel = require('../../models/roadmapModel');

    // 1. Login
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: 'integration-token-123' },
        user: { id: 'u-flow', email: 'flow@test.com' },
      },
      error: null,
    });

    const loginReq = { body: { email: 'flow@test.com', password: 'Pass123!' } };
    const loginRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await login(loginReq, loginRes);
    const loginData = loginRes.json.mock.calls[0][0];
    expect(loginData.session.access_token).toBe('integration-token-123');

    // 2. Usar el token para autenticar
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u-flow', email: 'flow@test.com' } },
      error: null,
    });

    const protectedReq = {
      headers: { authorization: `Bearer ${loginData.session.access_token}` },
    };
    const protectedRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateToken(protectedReq, protectedRes, next);
    expect(next).toHaveBeenCalled();
    expect(protectedReq.user.id).toBe('u-flow');

    // 3. Acceder a roadmaps
    jest.spyOn(roadmapModel, 'getRoadmapsByUser').mockResolvedValue({
      data: [{ ID: 1, Titulo_Tema: 'JavaScript' }],
      error: null,
    });

    await getRoadmaps(protectedReq, protectedRes);

    // Resultado obtenido
    expect(protectedRes.json).toHaveBeenCalledWith([
      expect.objectContaining({ Titulo_Tema: 'JavaScript' }),
    ]);
  });
});

// -----------------------------------------------
// BLOQUE: Integración Acceso no autorizado
// -----------------------------------------------
describe('Integración: Acceso denegado sin token', () => {

  // TEST 6: Petición sin token → Rechazo 401
  test('Petición sin Authorization header es bloqueada', async () => {
    // Elemento probado: authenticateToken rechaza peticiones sin token
    // Resultado esperado: 401, no se accede al controlador
    const { authenticateToken } = require('../../controllers/userController');

    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
