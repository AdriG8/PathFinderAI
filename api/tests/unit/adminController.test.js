// =============================================
// TESTS UNITARIOS - adminController (reglas de negocio)
// =============================================

jest.mock('../../models/userModel', () => ({
  getUserRol: jest.fn(),
  countUsers: jest.fn(),
  getUsersInRange: jest.fn(),
  getUsersByIds: jest.fn(),
}));

jest.mock('../../models/roadmapModel', () => ({
  countRoadmaps: jest.fn(),
}));

jest.mock('../../models/metricModel', () => ({
  getAllMetrics: jest.fn(),
}));

const userModel = require('../../models/userModel');
const roadmapModel = require('../../models/roadmapModel');
const metricModel = require('../../models/metricModel');
const { requireAdmin, getAdminStats } = require('../../controllers/adminController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// -----------------------------------------------
// BLOQUE: Middleware requireAdmin
// -----------------------------------------------
describe('requireAdmin', () => {

  // TEST 1: Usuario con rol admin
  test('Debe permitir acceso a usuarios con rol admin', async () => {
    // Elemento probado: Middleware requireAdmin con usuario admin
    // Resultado esperado: next() es llamado
    userModel.getUserRol.mockResolvedValue({
      data: { Rol: 'admin' },
      error: null,
    });

    const req = { user: { id: 'admin1' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    // Resultado obtenido
    expect(next).toHaveBeenCalled();
  });

  // TEST 2: Usuario con rol user (no admin)
  test('Debe bloquear acceso a usuarios sin rol admin', async () => {
    // Elemento probado: Middleware requireAdmin con usuario normal
    // Resultado esperado: 403 con error 'Acceso denegado. Solo administradores.'
    userModel.getUserRol.mockResolvedValue({
      data: { Rol: 'user' },
      error: null,
    });

    const req = { user: { id: 'user1' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Acceso denegado. Solo administradores.' });
    expect(next).not.toHaveBeenCalled();
  });

  // TEST 3: Usuario no encontrado
  test('Debe bloquear acceso cuando no se encuentra el usuario', async () => {
    // Elemento probado: Middleware requireAdmin con data = null
    // Resultado esperado: 403 con error de acceso denegado
    userModel.getUserRol.mockResolvedValue({
      data: null,
      error: null,
    });

    const req = { user: { id: 'ghost' } };
    const res = mockRes();
    const next = jest.fn();

    await requireAdmin(req, res, next);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------
// BLOQUE: Estadísticas de admin
// -----------------------------------------------
describe('getAdminStats', () => {

  // TEST 4: Estadísticas correctas
  test('Debe devolver estadísticas del sistema', async () => {
    // Elemento probado: getAdminStats con datos válidos
    // Resultado esperado: JSON con totalUsuarios, totalRoadmaps, tendenciaUsuarios
    userModel.countUsers.mockResolvedValue({ count: 50, error: null });
    roadmapModel.countRoadmaps.mockResolvedValue({ count: 120, error: null });
    userModel.getUsersInRange.mockResolvedValue({
      data: [
        { created_at: '2026-05-20T10:00:00Z' },
        { created_at: '2026-05-20T15:00:00Z' },
        { created_at: '2026-05-21T08:00:00Z' },
      ],
      error: null,
    });

    const req = { user: { id: 'admin1' } };
    const res = mockRes();

    await getAdminStats(req, res);

    // Resultado obtenido
    const result = res.json.mock.calls[0][0];
    expect(result.totalUsuarios).toBe(50);
    expect(result.totalRoadmaps).toBe(120);
    expect(result.tendenciaUsuarios).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fecha: '2026-05-20', count: 2 }),
        expect.objectContaining({ fecha: '2026-05-21', count: 1 }),
      ])
    );
  });

  // TEST 5: Error al contar usuarios
  test('Debe devolver error si falla el conteo de usuarios', async () => {
    // Elemento probado: getAdminStats con error en countUsers
    // Resultado esperado: 400 con mensaje de error
    userModel.countUsers.mockResolvedValue({
      count: 0,
      error: { message: 'DB connection failed' },
    });

    const req = { user: { id: 'admin1' } };
    const res = mockRes();

    await getAdminStats(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB connection failed' });
  });
});
