// Importa el componente Link para navegación
import { Link } from 'react-router-dom'

// =============================================
// PÁGINA DE RECUPERAR CONTRASEÑA
// =============================================

// Componente para solicitar recuperación de contraseña
export default function ForgotPassword() {
  // Renderiza el formulario de recuperación
  return (
    // Contenedor principal
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)', fontFamily: 'Inter, sans-serif' }}>
      {/* Área principal */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl flex flex-col items-center">
          {/* Logo y título */}
          <div className="mb-12 flex flex-col items-center justify-center">
            <img 
              alt="PathFinderAI Logo" 
              className="h-20 w-auto mb-4" 
              src="/Picture.png"
            />
            <h2 className="text-2xl font-bold text-center mt-4 tracking-tight" style={{ color: 'var(--color-on-surface)' }}>PathFinderAI</h2>
          </div>

          {/* Tarjeta del formulario */}
          <div className="w-full p-8 md:p-12 rounded-lg shadow-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            {/* Título y descripción */}
            <div className="text-center mb-10">
              <h1 className="text-[1.75rem] font-bold tracking-tight mb-4" style={{ color: 'var(--color-on-surface)' }}>Recuperar contraseña</h1>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: 'var(--color-on-surface-variant)' }}>
                Introduce tu email para recibir las instrucciones de recuperación en tu tutor personal.
              </p>
            </div>

            {/* Formulario */}
            <form className="space-y-8">
              {/* Campo de email */}
              <div className="space-y-2">
                <label className="text-[0.75rem] font-semibold tracking-widest px-1" style={{ color: 'var(--color-on-surface-variant)' }}>EMAIL</label>
                <div className="relative group">
                  <input 
                    className="w-full border-none py-4 px-6 rounded-xl transition-all duration-300 outline-none"
                    style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                    placeholder="email@ejemplo.com" 
                    type="email"
                  />
                </div>
              </div>

              {/* Botón de enviar */}
              <div className="pt-4 flex justify-center">
                <button 
                  className="font-bold px-10 py-4 rounded-full flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg w-2/3 justify-center mx-auto"
                  style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                  type="submit"
                >
                  Enviar instrucciones <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Enlace a login */}
            <div className="mt-12 text-center">
              <Link to="/login" className="text-sm transition-colors duration-200 underline-offset-4 hover:underline" style={{ color: 'var(--color-on-surface-variant)' }}>
                Volver a Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="text-[0.75rem] leading-relaxed w-full px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
        <div className="order-2 md:order-1">
          © 2026 PathFinderAI
        </div>
        <div className="flex gap-8 order-1 md:order-2">
          <a className="transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }} href="#">Privacy Policy</a>
          <a className="transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }} href="#">Terms of Service</a>
          <a className="transition-colors duration-200 cursor-pointer underline-offset-4 hover:underline" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }} href="#">Contact Support</a>
        </div>
      </footer>
    </div>
  )
}