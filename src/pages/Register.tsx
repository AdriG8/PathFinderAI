import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center selection:bg-primary selection:text-surface overflow-x-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(69, 71, 71, 0.1)' }}></div>
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(31, 32, 32, 0.2)' }}></div>
      </div>

      <main className="relative z-10 w-full px-6 pt-12 pb-24 flex flex-col items-center max-w-xl">
        <div className="mb-12 z-10 flex flex-col items-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Picture.png"
          />
          <h1 className="font-extrabold text-2xl tracking-tight" style={{ color: 'var(--color-on-surface)' }}>PathFinderAI</h1>
        </div>

        <div className="w-full p-8 md:p-10 rounded-lg shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
          <div className="mb-10">
            <h2 className="font-semibold text-2xl mb-2" style={{ color: 'var(--color-on-surface)' }}>Empieza tu viaje</h2>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Crea tu cuenta de tutor personal.</p>
          </div>

          <form className="space-y-8">
            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="name">Nombre completo</label>
              <input 
                className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                id="name" 
                name="name" 
                placeholder="John Doe" 
                type="text"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="email">Email</label>
              <input 
                className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                id="email" 
                name="email" 
                placeholder="email@ejemplo.com" 
                type="email"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="password">Contraseña</label>
              <div className="relative">
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none pr-12"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
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

            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="repeat-password">Repetir contraseña</label>
              <div className="relative">
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none pr-12"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="repeat-password" 
                  name="repeat-password" 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 px-1">
              <div className="flex items-center h-5">
                <input 
                  className="w-4 h-4 rounded cursor-pointer" 
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', accentColor: 'var(--color-primary)' }}
                  id="terms" 
                  type="checkbox"
                />
              </div>
              <label className="text-[0.75rem] cursor-pointer" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="terms">
                Acepto los términos y condiciones
              </label>
            </div>

            <div className="pt-2 flex justify-center">
              <button 
                className="w-full font-bold py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group max-w-xs"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                type="submit"
              >
                Registrarse
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgba(72, 72, 72, 0.1)' }}></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 uppercase tracking-widest font-bold opacity-60" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)' }}>o regístrate con</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="flex items-center justify-center gap-3 py-3 px-8 rounded-xl transition-colors duration-150 group w-full max-w-xs" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z" fill="currentColor"></path>
              </svg>
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            ¿Ya tienes una cuenta? <Link to="/login" className="font-semibold hover:underline underline-offset-4 transition-all" style={{ color: 'var(--color-on-surface)' }}>Inicia sesión</Link>
          </p>
        </footer>
      </main>

      <div className="relative w-full mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 w-full max-w-7xl mx-auto gap-4">
          <p className="text-[0.75rem]" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter' }}>© 2026 PathFinderAI</p>
          <div className="flex gap-6">
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Privacy Policy</a>
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Terms of Service</a>
            <a className="text-[0.75rem] transition-all duration-150" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} href="#">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}