// Importa el hook useState para gestionar estados locales
import { useState } from 'react'
// Importa el componente Link para navegación
import { Link } from 'react-router-dom'
// Importa el componente Footer
import Footer from '../components/Footer'
// Importa iconos de Lucide
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

// =============================================
// CONSTANTES - URL de la API
// =============================================

// URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// =============================================
// PÁGINA DE LOGIN
// =============================================

// Componente para iniciar sesión de usuario
export default function Login() {
  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false)
  // Estado para indicar si está cargando la petición
  const [loading, setLoading] = useState(false)
  // Estado para mensajes de error
  const [error, setError] = useState('')

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Evita el comportamiento por defecto del formulario
    e.preventDefault()
    // Limpia errores anteriores
    setError('')
    // Marca como cargando
    setLoading(true)

    // Obtiene los datos del formulario
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Envía la petición de login al servidor
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      // Convierte la respuesta a JSON
      const data = await response.json()

      // Si la respuesta no es exitosa, muestra el error
      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        // Guarda el token en localStorage
        localStorage.setItem('token', data.session.access_token)
        // Guarda los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.user))
        // Redirige al inicio
        window.location.href = '/'
      }
    } catch (err) {
      // Maneja errores de red
      setError('Error de conexión')
    }

    // Finaliza el estado de carga
    setLoading(false)
  }

  // Renderiza el formulario de login
  return (
    // Contenedor principal con fondo oscuro
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      {/* Área principal */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Efecto de fondo - blob superior izquierdo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(69, 71, 71, 0.1)' }}></div>
        {/* Efecto de fondo - blob inferior derecho */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        {/* Logo y título */}
        <div className="mb-12 z-10 flex flex-col items-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Logo_2.png"
          />
          <h1 className="font-extrabold text-2xl tracking-tight" style={{ color: 'var(--color-on-surface)' }}>PathFinderAI</h1>
        </div>

        {/* Formulario de login */}
        <div className="w-full max-w-md z-10">
          {/* Tarjeta del formulario */}
          <div className="rounded-lg p-8 md:p-10 shadow-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            {/* Título y descripción */}
            <div className="mb-10">
              <h2 className="font-semibold text-2xl mb-2" style={{ color: 'var(--color-on-surface)' }}>Bienvenido de nuevo</h2>
              <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Ingresa a tu tutor personal.</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Campo de email */}
              <div className="space-y-3">
                <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="email">Email</label>
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="email" 
                  name="email" 
                  placeholder="nombre@ejemplo.com" 
                  type="email"
                  required
                />
              </div>
              
              {/* Campo de contraseña */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="password">Contraseña</label>
                  <Link to="/forgot-password" className="text-xs transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>¿Olvidaste tu contraseña?</Link>
                </div>
                {/* Contenedor con botón para mostrar contraseña */}
                <div className="relative">
                  <input 
                    className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none pr-12"
                    style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--color-on-surface-variant)' }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              {/* Botón de submit */}
              <button 
                className="w-full rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group mt-2 font-bold py-4 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Enlace a registro */}
          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            ¿No tienes una cuenta? <Link to="/register" className="font-semibold hover:underline underline-offset-4 transition-all" style={{ color: 'var(--color-on-surface)' }}>Regístrate</Link>
          </p>
        </div>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  )
}