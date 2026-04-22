// Importa el hook useState para gestionar estados locales
import { useState } from 'react'
// Importa el componente Link para navegación
import { Link } from 'react-router-dom'
// Importa el componente Footer
import Footer from '../components/Footer'

// =============================================
// CONSTANTES - URL de la API
// =============================================

// URL base de la API desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// =============================================
// PÁGINA DE REGISTRO
// =============================================

// Componente para registrar nuevo usuario
export default function Register() {
  // Estado para mostrar/ocultar la contraseña
  const [showPassword, setShowPassword] = useState(false)
  // Estado para mostrar/ocultar la confirmación de contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
    const confirmPassword = formData.get('confirm-password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // Valida que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Valida la longitud mínima de la contraseña
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      // Envía la petición de registro al servidor
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })

      // Convierte la respuesta a JSON
      const data = await response.json()

      // Si la respuesta no es exitosa, muestra el error
      if (!response.ok) {
        setError(data.error || 'Error al registrar')
      } else {
        // Redirige a la página de confirmación de email
        window.location.href = '/confirm-email'
      }
    } catch (err) {
      // Maneja errores de red
      setError('Error de conexión')
    }

    // Finaliza el estado de carga
    setLoading(false)
  }

  // Renderiza el formulario de registro
  return (
    // Contenedor principal
    <div className="min-h-screen flex flex-col items-center justify-center selection:bg-primary selection:text-surface overflow-x-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Efectos de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Blob superior izquierdo */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(69, 71, 71, 0.1)' }}></div>
        {/* Blob derecho */}
        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] rounded-full blur-[150px]" style={{ backgroundColor: 'rgba(31, 32, 32, 0.2)' }}></div>
      </div>

      {/* Área principal */}
      <main className="relative z-10 w-full px-6 pt-12 pb-24 flex flex-col items-center max-w-xl">
        {/* Logo y título */}
        <div className="mb-12 z-10 flex flex-col items-center">
          <img 
            alt="PathFinderAI Logo" 
            className="h-20 w-auto mb-4" 
            src="/Picture.png"
          />
          <h1 className="font-extrabold text-2xl tracking-tight" style={{ color: 'var(--color-on-surface)' }}>PathFinderAI</h1>
        </div>

        {/* Tarjeta del formulario */}
        <div className="w-full p-8 md:p-10 rounded-lg shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
          {/* Título y descripción */}
          <div className="mb-10">
            <h2 className="font-semibold text-2xl mb-2" style={{ color: 'var(--color-on-surface)' }}>Empieza tu viaje</h2>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Crea tu cuenta de tutor personal.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campos de nombre y apellido (dos columnas) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Campo de nombre */}
              <div className="space-y-3">
                <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="firstName">Nombre</label>
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="firstName" 
                  name="firstName" 
                  placeholder="Nombre" 
                  type="text"
                  required
                />
              </div>
              {/* Campo de apellido */}
              <div className="space-y-3">
                <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="lastName">Apellidos</label>
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="lastName" 
                  name="lastName" 
                  placeholder="Apellidos" 
                  type="text"
                  required
                />
              </div>
            </div>

            {/* Campo de email */}
            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="email">Email</label>
              <input 
                className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none"
                style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                id="email" 
                name="email" 
                placeholder="email@ejemplo.com" 
                type="email"
                required
              />
            </div>

            {/* Campo de contraseña */}
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
                  required
                  minLength={6}
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

            {/* Campo de confirmar contraseña */}
            <div className="space-y-3">
              <label className="block text-xs ml-1 uppercase tracking-wider" style={{ color: 'var(--color-on-surface-variant)' }} htmlFor="confirm-password">Repetir contraseña</label>
              <div className="relative">
                <input 
                  className="w-full border-none rounded-xl px-4 py-3.5 transition-all outline-none pr-12"
                  style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                  id="confirm-password" 
                  name="confirm-password" 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                  required
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

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            {/* Botón de submit */}
            <div className="pt-2 flex justify-center">
              <button 
                className="w-full font-bold py-4 rounded-full hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group max-w-xs disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        {/* Enlace a login */}
        <footer className="mt-8 text-center">
          <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            ¿Ya tienes una cuenta? <Link to="/login" className="font-semibold hover:underline underline-offset-4 transition-all" style={{ color: 'var(--color-on-surface)' }}>Inicia sesión</Link>
          </p>
        </footer>
      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  )
}