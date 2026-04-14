import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)

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

            <form className="space-y-8">
              <div className="space-y-3">
                <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="email">Email</label>
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="email" 
                  name="email" 
                  placeholder="nombre@ejemplo.com" 
                  type="email"
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

              <button 
                className="w-full rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group mt-2 font-bold py-4"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                type="submit"
              >
                Iniciar sesión
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'rgba(72, 72, 72, 0.1)' }}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)' }}>O continúa con</span>
              </div>
            </div>

            <div className="flex justify-center">
              <button className="flex items-center justify-center gap-3 rounded-xl transition-colors duration-150 group py-3 px-8" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
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