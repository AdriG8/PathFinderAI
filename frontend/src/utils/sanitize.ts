// Importa la librería para sanitizar HTML y prevenir XSS
import DOMPurify from 'isomorphic-dompurify'

// =============================================
// UTILIDADES DE SANITIZACIÓN
// =============================================

// Función para sanitizar texto plano (elimina HTML tags)
export const sanitizeText = (text: string): string => {
  // Retorna el texto sanitizado
  return DOMPurify.sanitize(text, { RETURN_TRUSTED_TYPE: false })
}

// Función para sanitizar nombres de archivos/mapas
export const sanitizeFileName = (name: string): string => {
  // Elimina caracteres peligrosos y espacios extra
  const sanitized = name.replace(/[<>\"'&]/g, '').trim()
  // Limita la longitud
  return sanitized.substring(0, 100)
}

// Función para validar y sanitizar URLs
export const sanitizeUrl = (url: string): string => {
  try {
    // Parsea la URL
    const urlObj = new URL(url)
    // Solo permite protocolos seguros
    const allowedProtocols = ['https:', 'http:']
    // Si el protocolo no es seguro, retorna vacío
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return ''
    }
    // Retorna la URL sanitizada
    return urlObj.href
  } catch {
    // Si hay error al parsear, retorna vacío
    return ''
  }
}

// Función para validar si una URL es segura
export const isSafeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const allowedProtocols = ['https:', 'http:']
    return allowedProtocols.includes(urlObj.protocol)
  } catch {
    return false
  }
}