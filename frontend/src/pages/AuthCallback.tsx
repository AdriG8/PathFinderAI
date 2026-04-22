// Importa el hook useEffect para ejecutar efectos secundarios
import { useEffect } from 'react'
// Importa el hook useNavigate para redirigir
import { useNavigate } from 'react-router-dom'
// Importa la URL de la API
import { API_URL } from '../context/AuthContext'

// =============================================
// PÁGINA DE CALLBACK DE AUTENTICACIÓN
// =============================================

// Componente que maneja el callback de OAuth después de iniciar sesión
export default function AuthCallback() {
  // Hook de navegación
  const navigate = useNavigate()

  // Efecto para procesar el callback
  useEffect(() => {
    // Función para manejar el callback
    const handleCallback = async () => {
      // Extrae parámetros del hash en la URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      // Obtiene el token de acceso
      const accessToken = hashParams.get('access_token')

      // Si hay token, intenta obtener los datos del usuario
      if (accessToken) {
        try {
          // Pide los datos del usuario al servidor
          const response = await fetch(`${API_URL}/api/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })
          
          // Si es exitoso, guarda los datos y redirige
          if (response.ok) {
            const userData = await response.json()
            // Guarda el token
            localStorage.setItem('token', accessToken)
            // Guarda los datos del usuario
            localStorage.setItem('user', JSON.stringify(userData.user))
            // Redirige al inicio
            navigate('/')
          } else {
            // Si falla, redirige a login
            navigate('/login')
          }
        } catch (error) {
          // Maneja errores
          console.error('Error en callback:', error)
          // Redirige a login
          navigate('/login')
        }
      } else {
        // Si no hay token, verifica si hay mensaje de error
        const errorDescription = new URLSearchParams(window.location.search).get('error_description')
        // Si hay mensaje, lo muestra
        if (errorDescription) {
          alert(errorDescription)
        }
        // Redirige a login
        navigate('/login')
      }
    }

    // Ejecuta la función
    handleCallback()
  }, [navigate])

  // Renderiza indicador de carga
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="text-center">
        {/* Spinner de carga */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
        <p style={{ color: 'var(--color-on-surface)' }}>Verificando...</p>
      </div>
    </div>
  )
}