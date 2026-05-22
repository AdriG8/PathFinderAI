// =============================================
// TESTS UNITARIOS - sanitize.ts (frontend)
// =============================================

import { sanitizeText, sanitizeFileName, sanitizeUrl, isSafeUrl } from '../../utils/sanitize';

// -----------------------------------------------
// BLOQUE: sanitizeText
// -----------------------------------------------
describe('sanitizeText', () => {

  // TEST 1: Eliminar script tags
  test('Debe eliminar tags de script (XSS)', () => {
    // Elemento probado: sanitizeText con inyección de script
    // Resultado esperado: String sin el tag <script>
    const input = '<script>alert("XSS")</script>Hola';
    const resultado = sanitizeText(input);

    // Resultado obtenido
    expect(resultado).not.toContain('<script>');
    expect(resultado).toContain('Hola');
  });

  // TEST 2: Texto normal sin cambios
  test('Debe mantener texto plano sin modificar', () => {
    // Elemento probado: sanitizeText con texto normal
    // Resultado esperado: Texto idéntico al input
    const input = 'Aprender React y TypeScript';
    const resultado = sanitizeText(input);

    // Resultado obtenido
    expect(resultado).toBe('Aprender React y TypeScript');
  });

  // TEST 3: Eliminar event handlers
  test('Debe eliminar atributos de eventos HTML (onerror, onclick)', () => {
    // Elemento probado: sanitizeText con atributos de eventos maliciosos
    // Resultado esperado: Sin atributos onerror/onclick
    const input = '<img src=x onerror="alert(1)">';
    const resultado = sanitizeText(input);

    // Resultado obtenido
    expect(resultado).not.toContain('onerror');
  });
});

// -----------------------------------------------
// BLOQUE: sanitizeFileName
// -----------------------------------------------
describe('sanitizeFileName', () => {

  // TEST 4: Eliminar caracteres peligrosos
  test('Debe eliminar caracteres HTML peligrosos del nombre', () => {
    // Elemento probado: sanitizeFileName con caracteres <>"'&
    // Resultado esperado: Nombre limpio sin caracteres peligrosos
    const input = 'Mi <Roadmap> "React" & \'Vue\'';
    const resultado = sanitizeFileName(input);

    // Resultado obtenido
    expect(resultado).not.toContain('<');
    expect(resultado).not.toContain('>');
    expect(resultado).not.toContain('"');
    expect(resultado).not.toContain("'");
    expect(resultado).not.toContain('&');
  });

  // TEST 5: Limitar longitud a 100 caracteres
  test('Debe limitar el nombre a 100 caracteres', () => {
    // Elemento probado: sanitizeFileName con string de 200 caracteres
    // Resultado esperado: String truncado a máximo 100 caracteres
    const input = 'A'.repeat(200);
    const resultado = sanitizeFileName(input);

    // Resultado obtenido
    expect(resultado.length).toBeLessThanOrEqual(100);
  });

  // TEST 6: Eliminar espacios extra (trim)
  test('Debe eliminar espacios al inicio y final', () => {
    // Elemento probado: sanitizeFileName con espacios
    // Resultado esperado: Nombre sin espacios al inicio/final
    const input = '  Mi Roadmap  ';
    const resultado = sanitizeFileName(input);

    // Resultado obtenido
    expect(resultado).toBe('Mi Roadmap');
  });
});

// -----------------------------------------------
// BLOQUE: sanitizeUrl
// -----------------------------------------------
describe('sanitizeUrl', () => {

  // TEST 7: URL HTTPS válida
  test('Debe aceptar URLs con protocolo HTTPS', () => {
    // Elemento probado: sanitizeUrl con URL HTTPS válida
    // Resultado esperado: URL sin modificar
    const url = 'https://www.youtube.com/watch?v=abc123';
    const resultado = sanitizeUrl(url);

    // Resultado obtenido
    expect(resultado).toBe(url);
  });

  // TEST 8: URL HTTP válida
  test('Debe aceptar URLs con protocolo HTTP', () => {
    // Elemento probado: sanitizeUrl con URL HTTP válida
    // Resultado esperado: URL sin modificar
    const url = 'http://example.com/docs';
    const resultado = sanitizeUrl(url);

    // Resultado obtenido
    expect(resultado).toBe(url);
  });

  // TEST 9: URL con protocolo javascript (peligroso)
  test('Debe rechazar URLs con protocolo javascript:', () => {
    // Elemento probado: sanitizeUrl con javascript: protocol
    // Resultado esperado: String vacío
    const url = 'javascript:alert(1)';
    const resultado = sanitizeUrl(url);

    // Resultado obtenido
    expect(resultado).toBe('');
  });

  // TEST 10: URL con protocolo data (peligroso)
  test('Debe rechazar URLs con protocolo data:', () => {
    // Elemento probado: sanitizeUrl con data: protocol
    // Resultado esperado: String vacío
    const url = 'data:text/html,<script>alert(1)</script>';
    const resultado = sanitizeUrl(url);

    // Resultado obtenido
    expect(resultado).toBe('');
  });

  // TEST 11: URL inválida
  test('Debe devolver vacío para URLs malformadas', () => {
    // Elemento probado: sanitizeUrl con URL inválida
    // Resultado esperado: String vacío
    const url = 'not-a-url';
    const resultado = sanitizeUrl(url);

    // Resultado obtenido
    expect(resultado).toBe('');
  });
});

// -----------------------------------------------
// BLOQUE: isSafeUrl
// -----------------------------------------------
describe('isSafeUrl', () => {

  // TEST 12: URL segura
  test('Debe devolver true para URL HTTPS', () => {
    // Elemento probado: isSafeUrl con URL HTTPS
    // Resultado esperado: true
    const resultado = isSafeUrl('https://es.wikipedia.org/wiki/React');

    // Resultado obtenido
    expect(resultado).toBe(true);
  });

  // TEST 13: URL insegura
  test('Debe devolver false para URL javascript:', () => {
    // Elemento probado: isSafeUrl con javascript: protocol
    // Resultado esperado: false
    const resultado = isSafeUrl('javascript:void(0)');

    // Resultado obtenido
    expect(resultado).toBe(false);
  });

  // TEST 14: URL malformada
  test('Debe devolver false para URL malformada', () => {
    // Elemento probado: isSafeUrl con string que no es URL
    // Resultado esperado: false
    const resultado = isSafeUrl('abc123');

    // Resultado obtenido
    expect(resultado).toBe(false);
  });
});
