import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'

const API_URL = 'http://localhost:3000'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const signOut = async () => {
    console.log('AuthContext: Iniciando cierre de sesión')
    const token = localStorage.getItem('token')
    
    if (token) {
      try {
        console.log('AuthContext: Llamando a /api/logout')
        const response = await fetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await response.json()
        console.log('AuthContext: Respuesta logout:', response.status, data)
      } catch (error) {
        console.error('AuthContext: Error en logout:', error)
      }
    }
    
    console.log('AuthContext: Limpiando localStorage')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('AuthContext: Estableciendo user a null')
    setUser(null)
    console.log('AuthContext: Cierre de sesión completado')
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { API_URL }