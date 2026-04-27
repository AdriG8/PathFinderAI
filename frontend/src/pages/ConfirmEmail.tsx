// Importa el componente Link para navegación
import { Link } from 'react-router-dom'
// Importa iconos de Lucide
import { Mail, ArrowLeft } from 'lucide-react'

// =============================================
// PÁGINA DE CONFIRMAR EMAIL
// =============================================

// Componente que muestra mensaje para confirmar email
export default function ConfirmEmail() {
  // Renderiza el mensaje de confirmación
  return (
    // Contenedor principal
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}>
      {/* Área principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        {/* Fondo gradiente */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-container-low via-surface to-surface -z-10 opacity-70"></div>
        
        {/* Contenedor del contenido */}
        <div className="w-full max-w-lg flex flex-col items-center text-center space-y-12">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center">
            <img 
              alt="PathFinderAI Logo" 
              className="h-20 w-auto mb-4" 
              src="/Picture.png"
            />
            <h2 className="text-2xl font-bold text-center mt-4 tracking-tight">PathFinderAI</h2>
          </div>

          {/* Icono y mensaje */}
          <div className="flex flex-col items-center space-y-8">
            {/* Icono de email no leído */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(198,198,199,0.03)] relative" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-transparent opacity-50 blur-xl"></div>
              <Mail className="w-11 h-11 relative z-10" style={{ color: 'var(--color-primary)' }} />
            </div>

            {/* Título y descripción */}
            <div className="space-y-5 px-4">
              <h1 className="text-[2.5rem] sm:text-display-lg font-bold tracking-tighter leading-tight">
                Confirma tu email
              </h1>
              <p className="text-body-md leading-relaxed max-w-[320px] mx-auto" style={{ color: 'var(--color-on-surface-variant)' }}>
                Hemos enviado un enlace de verificación a tu correo. Por favor, revisa tu bandeja de entrada para continuar.
              </p>
            </div>
          </div>

          {/* Botón para volver */}
          <div className="pt-6 w-full flex justify-center">
            <Link 
              to="/" 
              className="font-bold px-10 py-4 rounded-full flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg bg-surface-bright text-on-surface group w-2/3 justify-center mx-auto"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Volver a la página principal
            </Link>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="text-[0.75rem] px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6" style={{ color: 'var(--color-on-surface-variant)' }}>
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