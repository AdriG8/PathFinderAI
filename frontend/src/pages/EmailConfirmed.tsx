import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

export default function EmailConfirmed() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const confirmEmail = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const token = hashParams.get('access_token') || searchParams.get('token')
      const type = hashParams.get('type') || searchParams.get('type')

      if (token && type === 'signup' || type === 'email_change') {
        setStatus('success')
      } else if (!token && !type) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    }

    confirmEmail()
  }, [searchParams])

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-hidden">
        <div className="w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-60 mix-blend-screen" style={{ backgroundColor: 'var(--color-surface-container-high)/30' }}></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6 py-12 relative z-10">
        <div className="mb-12 flex flex-col items-center justify-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Picture.png"
          />
          <h2 className="text-2xl font-bold text-center mt-4 tracking-tight">PathFinderAI</h2>
        </div>

        {status === 'loading' ? (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
              <span className="material-symbols-outlined text-[44px]">hourglass_empty</span>
            </div>
            <p style={{ color: 'var(--color-on-surface-variant)' }}>Verificando...</p>
          </div>
        ) : status === 'error' ? (
          <div className="flex flex-col items-center space-y-8">
            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-error-container)' }}>
              <span className="material-symbols-outlined text-[44px]" style={{ color: 'var(--color-error)' }}>error</span>
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
          <div className="flex flex-col items-center space-y-8">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-surface-container-highest/40 backdrop-blur-md border" style={{ borderColor: 'var(--color-outline-variant)/10' }}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-md"></div>
              <span className="material-symbols-outlined text-[4rem] relative z-10" style={{ color: 'var(--color-primary)', fontVariationSettings: "'FILL' 0, 'wght' 200" }}>check_circle</span>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-headline-md font-medium">¡Email confirmado!</h1>
              <p className="text-body-md leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--color-on-surface-variant)' }}>
                Tu cuenta ha sido verificada con éxito. Ya puedes empezar a aprender con tu tutor personal.
              </p>
            </div>

            <div className="pt-4 flex w-full justify-center">
              <button 
                onClick={handleLogin}
                className="font-bold px-10 py-4 rounded-full flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg bg-surface-bright text-on-surface group w-full sm:w-2/3 justify-center mx-auto"
              >
                Iniciar sesión <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </main>

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