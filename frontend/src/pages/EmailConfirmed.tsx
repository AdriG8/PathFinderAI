// Importa hooks de React (useEffect para efectos, useState para estados)
import { useEffect, useState } from 'react'
// Importa componentes de navegación (Link, useNavigate, useSearchParams)
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
// Importa iconos de Lucide
import { Hourglass, XCircle, CheckCircle, ArrowRight } from 'lucide-react'

// =============================================
// PÁGINA DE EMAIL CONFIRMADO
// =============================================

// Componente que maneja la confirmación exitosa del email
export default function EmailConfirmed() {
  // Obtiene parámetros de la URL
  const [searchParams] = useSearchParams()
  // Hook de navegación
  const navigate = useNavigate()
  // Estado para el status de la verificación (loading, success, error)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  // Efecto para verificar el token de confirmación
  useEffect(() => {
    // Función asíncrona para confirmar el email
    const confirmEmail = async () => {
      // Extrae parámetros del hash en la URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      // Obtiene el token de acceso
      const token = hashParams.get('access_token') || searchParams.get('token')
      // Obtiene el tipo de confirmación
      const type = hashParams.get('type') || searchParams.get('type')

      // Si hay token y es de tipo signup o email_change, es exitoso
      if (token && type === 'signup' || type === 'email_change') {
        setStatus('success')
      } else if (!token && !type) {
        // Si no hay token pero tampoco hay tipo, también es exitoso
        setStatus('success')
      } else {
        // En otro caso, es error
        setStatus('error')
      }
    }

    // Ejecuta la confirmación
    confirmEmail()
  }, [searchParams])

  // Función para navegar al login
  const handleLogin = () => {
    navigate('/login')
  }

  // Renderiza según el estado
  return (
    // Contenedor principal
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      {/* Efecto de fondo */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-hidden">
        <div className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-60 mix-blend-screen" style={{ backgroundColor: 'var(--color-surface-container-high)/30' }}></div>
      </div>

      {/* Área principal */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center justify-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Picture.png"
          />
          <h2 className="text-2xl font-bold text-center mt-4 tracking-tight">PathFinderAI</h2>
        </div>

        {/* Estado: cargando */}
        {status === 'loading' ? (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
              <Hourglass className="w-11 h-11 animate-spin" />
            </div>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Verificando...</p>
          </div>
        ) : status === 'error' ? (
          // Estado: error
          <div className="flex flex-col items-center space-y-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-error-container)' }}>
              <XCircle className="w-11 h-11" style={{ color: 'var(--color-error)' }} />
            </div>
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-medium">Error al confirmar</h1>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>El enlace ha expirado o es inválido.</p>
            </div>
            <Link 
              to="/register" 
              className="font-bold px-10 py-4 rounded-full flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 bg-surface-bright text-on-surface"
            >
              Volver a registrarse
            </Link>
          </div>
        ) : (
          // Estado: éxito
          <div className="flex flex-col items-center space-y-8">
            {/* Icono de check */}
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-surface-container-highest/40 backdrop-blur-md border" style={{ borderColor: 'var(--color-outline-variant)/10' }}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-md"></div>
              <CheckCircle className="w-16 h-16 relative z-10" style={{ color: 'var(--color-primary)' }} />
            </div>

            {/* Mensaje de éxito */}
            <div className="text-center space-y-4">
              <h1 className="text-headline-md font-medium">¡Email confirmado!</h1>
              <p className="text-body-md leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--color-on-surface-variant)' }}>
                Tu cuenta ha sido verificada con éxito. Ya puedes empezar a aprender con tu tutor personal.
              </p>
            </div>

            {/* Botón para iniciar sesión */}
            <div className="pt-4 flex w-full justify-center">
              <button 
                onClick={handleLogin}
                className="font-bold px-10 py-4 rounded-full flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg bg-surface-bright text-on-surface group w-full sm:w-2/3 justify-center mx-auto"
              >
                Iniciar sesión <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pie de página */}
      <footer className="text-[0.75rem] px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10" style={{ color: 'var(--color-on-surface-variant)' }}>
        <div className="order-2 md:order-1">
          © 2026 PathFinderAI
        </div>
        <div className="flex gap-8 order-1 md:order-2">
          <a className="hover:underline underline-offset-4 transition-colors cursor-pointer" href="#">Privacy Policy</a>
          <a className="hover:underline underline-offset-4 transition-colors cursor-pointer" href="#">Terms of Service</a>
          <a className="hover:underline underline-offset-4 transition-colors cursor-pointer" href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  )
}