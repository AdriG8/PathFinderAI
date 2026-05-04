import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [tokenReady, setTokenReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      setTokenReady(true)
    } else {
      setError('Enlace inválido o expirado')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
      } else {
        setMessage('Contraseña actualizada correctamente')
        setTimeout(() => navigate('/login'), 3000)
      }
    } catch (err) {
      setError('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)', fontFamily: 'Inter, sans-serif' }}>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-12 mx-auto">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
            <img alt="PathFinderAI Logo" className="w-full h-full object-cover" src="/Picture.png" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-primary)' }}>PathFinderAI</h1>
        </div>

        <div className="w-full p-8 rounded-xl flex flex-col gap-8" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
          {(error || !tokenReady) ? (
            <div className="flex flex-col gap-4 text-center">
              <div className="flex flex-col gap-2">
                <span className="material-symbols-outlined text-4xl mx-auto" style={{ color: '#ef4444' }}>error</span>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Enlace inválido o expirado</h2>
                <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.</p>
              </div>
              <Link 
                to="/forgot-password"
                className="mt-4 w-full rounded-full py-3 px-6 flex items-center justify-center gap-2 transition-colors duration-200"
                style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
              >
                <span className="text-sm font-medium">Solicitar nuevo enlace</span>
              </Link>
              <Link 
                to="/"
                className="w-full rounded-full py-3 px-6 flex items-center justify-center gap-2 transition-colors duration-200"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}
              >
                <span className="text-sm font-medium">Volver al inicio</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>Establece tu nueva contraseña</h2>
                <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Crea una contraseña segura para proteger tu cuenta.</p>
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: '#ef4444' }}>{error}</p>
              )}

              {message ? (
                <p className="text-sm text-center" style={{ color: '#10b981' }}>{message}</p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Nueva Contraseña</label>
                    <input 
                      className="w-full rounded-full px-5 py-3 text-sm"
                      style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }}
                      placeholder="Ingresa tu nueva contraseña" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium tracking-wider uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Repetir Nueva Contraseña</label>
                    <input 
                      className="w-full rounded-full px-5 py-3 text-sm"
                      style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }}
                      placeholder="Confirma tu nueva contraseña" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full rounded-full py-3 px-6 flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
                  >
                    <span className="text-sm font-medium">{loading ? 'Cambiando...' : 'Cambiar contraseña'}</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <footer className="w-full py-8 px-6 border-t" style={{ borderColor: 'var(--color-outline)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs order-2 md:order-1" style={{ color: 'var(--color-on-surface-variant)' }}>© 2026 PathFinderAI</p>
          <div className="flex items-center gap-8 order-1 md:order-2">
            <Link className="text-xs hover:text-primary transition-colors duration-200" to="#" style={{ color: 'var(--color-on-surface-variant)' }}>Privacy Policy</Link>
            <Link className="text-xs hover:text-primary transition-colors duration-200" to="#" style={{ color: 'var(--color-on-surface-variant)' }}>Terms of Service</Link>
            <Link className="text-xs hover:text-primary transition-colors duration-200" to="#" style={{ color: 'var(--color-on-surface-variant)' }}>Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}