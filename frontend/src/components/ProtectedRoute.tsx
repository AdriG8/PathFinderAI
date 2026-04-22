// Importa el componente Navigate para redirigir usuarios no autenticados
import { Navigate } from 'react-router-dom'
// Importa el tipo ReactNode para tipar los hijos del componente
import type { ReactNode } from 'react'
// Importa el hook de contexto de autenticación
import { useAuth } from '../context/AuthContext'

// =============================================
// COMPONENTE DE RUTA PROTEGIDA
// =============================================

// Componente que protege rutas requiere autenticación
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  // Obtiene el usuario y estado de carga del contexto de autenticación
  const { user, loading } = useAuth()

  // Mientras carga la autenticación, muestra pantalla de carga
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirige a la página de login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si hay usuario, renderiza los hijos (componente protegido)
  return <>{children}</>
}