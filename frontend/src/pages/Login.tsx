// Importa el hook useState para gestionar estados locales
import { useState, useEffect, useCallback } from 'react'
// Importa el componente Link para navegación
import { Link } from 'react-router-dom'
// Importa el componente Footer
import Footer from '../components/Footer'
// Importa iconos de Lucide
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
// Importa utilidad de Google
import { initializeGoogle } from '../utils/googleAuth'

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
  // Estado para indicar si está inicializando Google
  const [googleReady, setGoogleReady] = useState(false)

  // Función callback para Google
  const googleCallback = useCallback(async (response: { credential: string }) => {
    console.log('Google callback triggered, credential received')
    setLoading(true)
    setError('')
    try {
      console.log('Sending token to backend...')
      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
      })
      console.log('Backend response status:', res.status)
      const data = await res.json()
      console.log('Backend response data:', data)
      
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión con Google')
      } else {
        localStorage.setItem('token', data.session.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.user?.role) {
          localStorage.setItem('userRole', data.user.role)
        }
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Error during Google auth:', err)
      setError('Error de conexión')
    }
    setLoading(false)
  }, [])

  // Efecto para inicializar Google
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientId) {
      initializeGoogle(googleCallback, clientId).then(() => {
        setGoogleReady(true)
      }).catch(err => {
        console.error('Error initializing Google:', err)
      })
    }
  }, [googleCallback])

  // Función para mostrar el popup de Google
  const handleGoogleSignIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt()
    }
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión')
      } else {
        localStorage.setItem('token', data.session.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        if (data.user?.role) {
          localStorage.setItem('userRole', data.user.role)
        }
        window.location.href = '/'
      }
    } catch (err) {
      setError('Error de conexión')
    }

    setLoading(false)
  }

  // Renderiza el formulario de login
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(69, 71, 71, 0.1)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        <div className="mb-12 z-10 flex flex-col items-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Logo_2.png"
          />
          <h1 className="font-extrabold text-2xl tracking-tight" style={{ color: 'var(--color-on-surface)' }}>PathFinderAI</h1>
        </div>

        <div className="w-full max-w-md z-10">
          <div className="rounded-lg p-8 md:p-10 shadow-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            <div className="mb-10">
              <h2 className="font-semibold text-2xl mb-2" style={{ color: 'var(--color-on-surface)' }}>Bienvenido de nuevo</h2>
              <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Ingresa a tu tutor personal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
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
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="password">Contraseña</label>
                  <Link to="/forgot-password" className="text-xs transition-colors duration-200" style={{ color: 'var(--color-on-surface-variant)' }}>¿Olvidaste tu contraseña?</Link>
                </div>
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

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              {googleReady && (
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'var(--color-outline-variant)', opacity: 0.1 }} />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-4" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)' }}>O continúa con</span>
                  </div>
                </div>
              )}

              {googleReady && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-8 rounded-xl transition-colors duration-150 group hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-surface-container-high)' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" style={{ color: 'var(--color-on-surface)' }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="currentColor"/>
                  </svg>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>Google</span>
                </button>
              )}

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

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            ¿No tienes una cuenta? <Link to="/register" className="font-semibold hover:underline underline-offset-4 transition-all" style={{ color: 'var(--color-on-surface)' }}>Regístrate</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}