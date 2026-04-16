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