import { useState, useEffect } from 'react'
import { X, Save, Lock, AlertCircle, Check } from 'lucide-react'

// =============================================
// INTERFAZ DE PROPS
// =============================================

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

// =============================================
// COMPONENTE MODAL DE PERFIL
// =============================================

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'eliminar' | 'admin'>('perfil')
  
  // Estados del formulario
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nivel, setNivel] = useState<'principiante' | 'medio' | 'avanzado'>('principiante')
  const [userRole, setUserRole] = useState<string>('usuario')
  
  // Estados de contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Estados de UI
  const [loading, setLoading] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  // Cargar datos del perfil al abrir
  useEffect(() => {
    if (isOpen && user) {
      fetchProfile()
    }
  }, [isOpen, user])
  
  // Obtener perfil del servidor
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Fetching profile from:', `${API_URL}/api/profile`)
      console.log('Token:', token ? 'present' : 'missing')
      
      const response = await fetch(`${API_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      console.log('Response status:', response.status)
      console.log('Response url:', response.url)
      
      if (response.ok) {
        const data = await response.json()
        setFirstName(data.nombre || user?.user_metadata?.first_name || '')
        setLastName(data.apellidos || user?.user_metadata?.last_name || '')
        setNivel(data.nivel || user?.user_metadata?.nivel || 'principiante')
        setUserRole(data.rol || 'usuario')
      } else {
        console.log('Using fallback - user metadata')
        setFirstName(user?.user_metadata?.first_name || '')
        setLastName(user?.user_metadata?.last_name || '')
        setNivel(user?.user_metadata?.nivel || 'principiante')
        setUserRole(user?.user_metadata?.rol || 'usuario')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      console.log('Using fallback - user metadata due to error')
      setFirstName(user?.user_metadata?.first_name || '')
      setLastName(user?.user_metadata?.last_name || '')
      setNivel(user?.user_metadata?.nivel || 'principiante')
      setUserRole(user?.user_metadata?.rol || 'usuario')
    }
  }
  
  // Guardar perfil
  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: firstName,
          apellidos: lastName,
          nivel: nivel
        })
      })
      
      if (!response.ok) {
        // Si la API falla, intentar actualizar localmente
        if (user) {
          user.user_metadata = {
            ...user.user_metadata,
            first_name: firstName,
            last_name: lastName,
            nivel: nivel
          }
          localStorage.setItem('user', JSON.stringify(user))
        }
        setMessage({ type: 'success', text: 'Perfil actualizado (local)' })
        setLoading(false)
        return
      }
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' })
      
      // Actualizar el usuario en el contexto
      if (user) {
        user.user_metadata = {
          ...user.user_metadata,
          first_name: firstName,
          last_name: lastName,
          nivel: nivel
        }
        localStorage.setItem('user', JSON.stringify(user))
      }
    } catch (error: any) {
      // Si hay error de red, guardar localmente
      if (user) {
        user.user_metadata = {
          ...user.user_metadata,
          first_name: firstName,
          last_name: lastName,
          nivel: nivel
        }
        localStorage.setItem('user', JSON.stringify(user))
        setMessage({ type: 'success', text: 'Perfil actualizado (sin conexión)' })
      } else {
        setMessage({ type: 'error', text: error.message })
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Cambiar contraseña
  const handleChangePassword = async () => {
    setLoading(true)
    setMessage(null)
    
    // Validaciones
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Introduce tu contraseña actual' })
      setLoading(false)
      return
    }
    
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' })
      setLoading(false)
      return
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      setLoading(false)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }
      
      setMessage({ type: 'success', text: 'Contraseña cambiada correctamente' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')
    if (!confirmed) return

    setLoadingDelete(true)
    setMessage(null)

    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Introduce tu contraseña para confirmar' })
      setLoadingDelete(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: currentPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      setMessage({ type: 'success', text: 'Cuenta eliminada correctamente' })
      
      setTimeout(() => {
        localStorage.removeItem('token')
        window.location.href = '/'
      }, 1500)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoadingDelete(false)
    }
  }

  // Si no está abierto, no renderizar
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative z-10 w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-container-low)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-outline)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
            Mi Perfil
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--color-surface-container-high)' }}
          >
            <X className="w-5 h-5" style={{ color: 'var(--color-on-surface)' }} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-outline)' }}>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'perfil' 
                ? 'border-b-2' 
                : ''
            }`}
            style={{ 
              color: activeTab === 'perfil' 
                ? 'var(--color-primary)' 
                : 'var(--color-on-surface-variant)',
              borderColor: activeTab === 'perfil' ? 'var(--color-primary)' : 'transparent'
            }}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'seguridad' 
                ? 'border-b-2' 
                : ''
            }`}
            style={{ 
              color: activeTab === 'seguridad' 
                ? 'var(--color-primary)' 
                : 'var(--color-on-surface-variant)',
              borderColor: activeTab === 'seguridad' ? 'var(--color-primary)' : 'transparent'
            }}
          >
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab('eliminar')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'eliminar' 
                ? 'border-b-2' 
                : ''
            }`}
            style={{ 
              color: activeTab === 'eliminar' 
                ? '#ef4444' 
                : 'var(--color-on-surface-variant)',
              borderColor: activeTab === 'eliminar' ? '#ef4444' : 'transparent'
            }}
          >
            Eliminar
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === 'admin' 
                  ? 'border-b-2' 
                  : ''
              }`}
              style={{ 
                color: activeTab === 'admin' 
                  ? 'var(--color-primary)' 
                  : 'var(--color-on-surface-variant)',
                borderColor: activeTab === 'admin' ? 'var(--color-primary)' : 'transparent'
              }}
            >
              Admin
            </button>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          
          {/* Mensaje de éxito/error */}
          {message && (
            <div 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}
          
          {/* TAB PERFIL */}
          {activeTab === 'perfil' && (
            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
              </div>
              
              {/* Apellidos */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Apellidos
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
              </div>
              
              {/* Email (solo lectura) */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none opacity-60"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                  El email no se puede cambiar
                </p>
              </div>
              
              {/* Nivel de Aprendizaje */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Nivel de Aprendizaje
                </label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value as 'principiante' | 'medio' | 'avanzado')}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                >
                  <option value="principiante">Principiante</option>
                  <option value="medio">Medio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              
              {/* Botón guardar */}
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <Save className="w-5 h-5" />
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
          
          {/* TAB SEGURIDAD */}
          {activeTab === 'seguridad' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                <Lock className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                    Cambiar contraseña
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Debes verificar tu contraseña actual antes de establecer una nueva.
                  </p>
                </div>
              </div>
              
              {/* Contraseña actual */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Contraseña actual
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
              </div>
              
              {/* Nueva contraseña */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
              </div>
              
              {/* Confirmar contraseña */}
              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                />
              </div>
              
              {/* Botón cambiar contraseña */}
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <Lock className="w-5 h-5" />
                {loading ? 'Cambiando...' : 'Cambiar contraseña'}
              </button>
            </div>
          )}
          
          {/* TAB ELIMINAR */}
          {activeTab === 'eliminar' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle className="w-5 h-5 mt-0.5" style={{ color: '#ef4444' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                    Eliminar cuenta
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Esta acción es irreversible. Perderás todos tus datos.
                  </p>
                </div>
              </div>

              <div>
                <label 
                  className="block text-xs ml-1 uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-on-surface-variant)' }}
                >
                  Confirma tu contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ 
                    backgroundColor: 'var(--color-surface-container-high)',
                    color: 'var(--color-on-surface)'
                  }}
                  disabled
                />
              </div>

              <button
                onClick={handleDeleteAccount}
                disabled={true}
                className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-opacity opacity-50 cursor-not-allowed"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
              >
                <AlertCircle className="w-5 h-5" />
                Eliminar mi cuenta (Deshabilitado)
              </button>
            </div>
          )}
          
          {/* TAB ADMIN */}
          {activeTab === 'admin' && userRole === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                <Lock className="w-5 h-5 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
                    Panel de Administrador
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Gestiona usuarios y configuraciones del sistema.
                  </p>
                </div>
              </div>
              
              <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Aquí podrás gestionar usuarios, ver estadísticas y más en futuras actualizaciones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}