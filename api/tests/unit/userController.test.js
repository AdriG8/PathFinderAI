// =============================================
// TESTS UNITARIOS - userController (validaciones)
// =============================================

// Mock de database.js
jest.mock('../../models/database', () => ({
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
    auth: {
      admin: {
        deleteUser: jest.fn(),
      },
    },
  },
}));

jest.mock('../../models/userModel', () => ({
  getUserById: jest.fn(),
  getUserRol: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

jest.mock('../../models/roadmapModel', () => ({
  deleteRoadmap: jest.fn(),
}));

const { supabase } = require('../../models/database');
const userModel = require('../../models/userModel');
const {
  register,
  login,
  googleAuth,
  authenticateToken,
  getProfile,
  updateProfile,
} = require('../../controllers/userController');

// Helpers para simular req/res de Express
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// -----------------------------------------------
// BLOQUE: Registro de usuario
// -----------------------------------------------
describe('register', () => {

  // TEST 1: Campos vacíos
  test('Debe rechazar registro sin campos requeridos', async () => {
    // Elemento probado: Validación de campos obligatorios en register
    // Resultado esperado: 400 con error 'Faltan datos requeridos'
    const req = { body: { email: 'test@test.com' } };
    const res = mockRes();

    await register(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Faltan datos requeridos' });
  });

  // TEST 2: Registro exitoso
  test('Debe registrar un usuario con datos completos', async () => {
    // Elemento probado: Flujo completo de registro con Supabase
    // Resultado esperado: Respuesta JSON con datos del usuario creado
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: '123', email: 'nuevo@test.com' } },
      error: null,
    });

    const req = {
      body: {
        email: 'nuevo@test.com',
        password: 'Pass123!',
        firstName: 'John',
        lastName: 'Doe',
      },
    };
    const res = mockRes();

    await register(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ email: 'nuevo@test.com' }) })
    );
  });

  // TEST 3: Error de Supabase en registro
  test('Debe devolver error cuando Supabase falla en registro', async () => {
    // Elemento probado: Manejo de error de Supabase auth.signUp
    // Resultado esperado: 400 con el mensaje de error de Supabase
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'Email already registered' },
    });

    const req = {
      body: {
        email: 'dup@test.com',
        password: 'Pass123!',
        firstName: 'Jane',
        lastName: 'Doe',
      },
    };
    const res = mockRes();

    await register(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
  });
});

// -----------------------------------------------
// BLOQUE: Login de usuario
// -----------------------------------------------
describe('login', () => {

  // TEST 4: Login exitoso
  test('Debe autenticar con credenciales válidas', async () => {
    // Elemento probado: Flujo de login con signInWithPassword
    // Resultado esperado: Respuesta JSON con session y user
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'abc' }, user: { id: '1' } },
      error: null,
    });

    const req = { body: { email: 'test@test.com', password: 'Pass123!' } };
    const res = mockRes();

    await login(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ session: expect.objectContaining({ access_token: 'abc' }) })
    );
  });

  // TEST 5: Login con credenciales inválidas
  test('Debe rechazar login con credenciales inválidas', async () => {
    // Elemento probado: Manejo de error de credenciales
    // Resultado esperado: 400 con mensaje de error
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    const req = { body: { email: 'bad@test.com', password: 'wrong' } };
    const res = mockRes();

    await login(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid login credentials' });
  });
});

// -----------------------------------------------
// BLOQUE: Google Auth
// -----------------------------------------------
describe('googleAuth', () => {

  // TEST 6: Google Auth sin token
  test('Debe rechazar auth de Google sin idToken', async () => {
    // Elemento probado: Validación de idToken en googleAuth
    // Resultado esperado: 400 con error 'Token de Google no proporcionado'
    const req = { body: {} };
    const res = mockRes();

    await googleAuth(req, res);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token de Google no proporcionado' });
  });

  // TEST 7: Google Auth con token válido
  test('Debe autenticar con token de Google válido', async () => {
    // Elemento probado: Flujo de signInWithIdToken
    // Resultado esperado: Respuesta JSON con datos de usuario
    supabase.auth.signInWithIdToken.mockResolvedValue({
      data: { user: { id: 'g1', email: 'google@gmail.com' } },
      error: null,
    });

    const req = { body: { idToken: 'valid-google-token' } };
    const res = mockRes();

    await googleAuth(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ email: 'google@gmail.com' }) })
    );
  });
});

// -----------------------------------------------
// BLOQUE: Middleware authenticateToken
// -----------------------------------------------
describe('authenticateToken', () => {

  // TEST 8: Sin header Authorization
  test('Debe rechazar petición sin token', async () => {
    // Elemento probado: authenticateToken sin header Authorization
    // Resultado esperado: 401 con error 'Token no proporcionado'
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  // TEST 9: Token inválido
  test('Debe rechazar token inválido', async () => {
    // Elemento probado: authenticateToken con token expirado/inválido
    // Resultado esperado: 401 con error 'Token invalido o expirado'
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    // Resultado obtenido
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token invalido o expirado' });
    expect(next).not.toHaveBeenCalled();
  });

  // TEST 10: Token válido
  test('Debe llamar a next() con token válido', async () => {
    // Elemento probado: authenticateToken con token correcto
    // Resultado esperado: next() llamado, req.user asignado
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@test.com' } },
      error: null,
    });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = mockRes();
    const next = jest.fn();

    await authenticateToken(req, res, next);

    // Resultado obtenido
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'u1', email: 'user@test.com' });
  });
});

// -----------------------------------------------
// BLOQUE: Perfil de usuario
// -----------------------------------------------
describe('getProfile', () => {

  // TEST 11: Obtener perfil correctamente
  test('Debe devolver perfil del usuario', async () => {
    // Elemento probado: getProfile con usuario existente
    // Resultado esperado: JSON con nombre, apellidos, nivel, rol, email
    userModel.getUserById.mockResolvedValue({
      data: { Nombre: 'Juan', Apellidos: 'García', Nivel: 'medio', Rol: 'user', Email: 'juan@test.com' },
      error: null,
    });

    const req = { user: { id: 'u1', email: 'juan@test.com' } };
    const res = mockRes();

    await getProfile(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({
      nombre: 'Juan',
      apellidos: 'García',
      nivel: 'medio',
      rol: 'user',
      email: 'juan@test.com',
    });
  });

  // TEST 12: Perfil con datos vacíos (defaults)
  test('Debe devolver valores por defecto cuando faltan datos', async () => {
    // Elemento probado: getProfile con campos nulos en BD
    // Resultado esperado: valores por defecto para cada campo
    userModel.getUserById.mockResolvedValue({
      data: {},
      error: null,
    });

    const req = { user: { id: 'u2', email: 'empty@test.com' } };
    const res = mockRes();

    await getProfile(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({
      nombre: '',
      apellidos: '',
      nivel: 'principiante',
      rol: 'user',
      email: 'empty@test.com',
    });
  });
});

// -----------------------------------------------
// BLOQUE: Actualizar perfil
// -----------------------------------------------
describe('updateProfile', () => {

  // TEST 13: Actualizar perfil exitosamente
  test('Debe actualizar el perfil correctamente', async () => {
    // Elemento probado: updateProfile con datos nuevos
    // Resultado esperado: 'Perfil actualizado correctamente'
    userModel.updateUser.mockResolvedValue({ error: null });
    supabase.auth.updateUser.mockResolvedValue({ error: null });

    const req = {
      user: { id: 'u1' },
      body: { nombre: 'Pedro', apellidos: 'López', nivel: 'avanzada' },
    };
    const res = mockRes();

    await updateProfile(req, res);

    // Resultado obtenido
    expect(res.json).toHaveBeenCalledWith({ message: 'Perfil actualizado correctamente' });
    expect(userModel.updateUser).toHaveBeenCalledWith('u1', {
      Nombre: 'Pedro',
      Apellidos: 'López',
      Nivel: 'avanzada',
    });
  });
});
