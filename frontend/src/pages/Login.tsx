import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:3000'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
        window.location.href = '/'
      }
    } catch (err) {
      setError('Error de conexión')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(69, 71, 71, 0.1)' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px]" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        <div className="mb-12 z-10 flex flex-col items-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Picture.png"
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
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              <button 
                className="w-full rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group mt-2 font-bold py-4 disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            ¿No tienes una cuenta? <Link to="/register" className="font-semibold hover:underline underline-offset-4 transition-all" style={{ color: 'var(--color-on-surface)' }}>Regístrate</Link>
          </p>
        </div>
      </main>

      <footer className="w-full pt-8 mt-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 w-full max-w-7xl mx-auto gap-4">
          <span className="text-[0.75rem]" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter' }}>© 2026 PathFinderAI</span>
          <div className="flex gap-6">
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Privacy Policy</a>
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Terms of Service</a>
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}