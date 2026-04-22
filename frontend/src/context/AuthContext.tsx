// Importa createContext, useContext, useEffect y useState de React
import { createContext, useContext, useEffect, useState } from 'react'
// Importa el tipo ReactNode para tipar los hijos
import type { ReactNode } from 'react'
// Importa el tipo User de Supabase
import type { User } from '@supabase/supabase-js'

// =============================================
// CONSTANTES - URL de la API
// =============================================

// URL base de la API (usa variable de entorno o local)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// =============================================
// INTERFAZ DEL CONTEXTO DE AUTENTICACIÓN
// =============================================

// Interface que define la estructura del contexto de autenticación
interface AuthContextType {
  user: User | null      // Usuario actual o null si no está autenticado
  loading: boolean      // Estado de carga inicial
  signOut: () => Promise<void>  // Función para cerrar sesión
}

// =============================================
// CONTEXTO DE AUTENTICACIÓN
// =============================================

// Crea el contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// =============================================
// PROVEEDOR DE AUTENTICACIÓN
// =============================================

// Componente que envuelve la aplicación y provee el contexto de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado para el usuario actual
  const [user, setUser] = useState<User | null>(null)
  // Estado para indicar si está cargando la autenticación
  const [loading, setLoading] = useState(true)

  // Efecto para inicializar la autenticación desde localStorage
  useEffect(() => {
    // Recupera el token y datos del usuario desde localStorage
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    // Si existen ambos, establece el usuario
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    // Marca que terminó la carga
    setLoading(false)
  }, [])

  // Función para cerrar sesión
  const signOut = async () => {
    // Loguea el inicio del cierre de sesión
    console.log('AuthContext: Iniciando cierre de sesión')
    // Recupera el token
    const token = localStorage.getItem('token')
    
    // Si hay token, intenta cerrar sesión en el servidor
    if (token) {
      try {
        // Loguea la llamada a la API
        console.log('AuthContext: Llamando a /api/logout')
        // Envía la petición al servidor
        const response = await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        // Convierte la respuesta a JSON
        const data = await response.json()
        // Loguea la respuesta
        console.log('AuthContext: Respuesta logout:', response.status, data)
      } catch (error) {
        // Maneja errores de red
        console.error('AuthContext: Error en logout:', error)
      }
    }
    
    // Loguea la limpieza de localStorage
    console.log('AuthContext: Limpiando localStorage')
    // Elimina el token
    localStorage.removeItem('token')
    // Elimina los datos del usuario
    localStorage.removeItem('user')
    // Loguea el establecimiento de user a null
    console.log('AuthContext: Estableciendo user a null')
    // Establece el usuario a null
    setUser(null)
    // Loguea la finalización
    console.log('AuthContext: Cierre de sesión completado')
    // Redirige al inicio
    window.location.href = '/'
  }

  // Provee el contexto a los componentes hijos
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// =============================================
// HOOK PERSONALIZADO DE AUTENTICACIÓN
// =============================================

// Hook para acceder al contexto de autenticación desde cualquier componente
export function useAuth() {
  // Obtiene el contexto
  const context = useContext(AuthContext)
  // Si no hay proveedor, lanza un error
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  // Devuelve el contexto
  return context
}

// =============================================
// EXPORTACIÓN
// =============================================

// Exporta la URL de la API
export { API_URL }