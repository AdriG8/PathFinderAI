// =============================================
// COMPONENTE SIDEBAR - Barra lateral de navegación
// =============================================
// Props transmitidas desde MainPage:
// - user: usuario autenticado
// - sidebarOpen: estado de la sidebar (abierta/cerrada)
// - userMenuOpen: estado del menú dropdown
// - setSidebarOpen, setUserMenuOpen, setProfileModalOpen: setters
// - userRole: rol del usuario (usuario/admin)
// - importedMaps, roadmaps: listas de mapas
// - signOut: función para cerrar sesión
// Funcionalidades:
// - Logo de la app
// - Lista de roadmaps guardados en Supabase
// - Lista de mapas importados desde JSON
// - Menú dropdown del usuario (Mi Perfil, Importar JSON, Admin, Cerrar sesión)

import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sanitizeFileName } from '../utils/sanitize'
import { Plus, Map, FolderOpen, Upload, LogOut, User, Settings, MoreVertical, Edit, Trash2 } from 'lucide-react'

interface ImportedMap {
  name: string
  id: string
}

interface Roadmap {
  ID: string
  ID_Usuario: string
  Titulo_Tema: string
  Fecha_Creacion: string
  JSON: any
}

interface SidebarProps {
  user: any
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  userMenuOpen: boolean
  setUserMenuOpen: (open: boolean) => void
  setProfileModalOpen: (open: boolean) => void
  userRole: string
  importedMaps: ImportedMap[]
  roadmaps: Roadmap[]
  signOut: () => Promise<void>
}

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  userMenuOpen,
  setUserMenuOpen,
  setProfileModalOpen,
  userRole,
  importedMaps,
  roadmaps,
  signOut,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const getUserDisplayName = () => {
    if (!user) return ''
    const metadata = user.user_metadata
    if (metadata?.full_name) return metadata.full_name
    if (metadata?.first_name && metadata?.last_name) return `${metadata.first_name} ${metadata.last_name}`
    return user.email?.split('@')[0] || 'Usuario'
  }

  const getUserEmail = () => {
    return user?.email || ''
  }

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem(mapId, JSON.stringify(json))
        window.location.reload()
      } catch (error) {
        console.error('Error parsing JSON:', error)
        alert('Error al parsear el archivo JSON')
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openImportedMap = (map: ImportedMap) => {
    window.open(`/roadmap-editor?id=${map.id}`, '_blank')
  }

  const handleSignOut = async () => {
    console.log('Cerrando sesión...')
    try {
      await signOut()
      console.log('Sesión cerrada')
    } catch (error) {
      console.error('Error:', error)
    }
    setUserMenuOpen(false)
  }

  const handleUserClick = () => {
    setUserMenuOpen(!userMenuOpen)
  }

  const handleRenameRoadmap = async (id: string, newName: string) => {
    if (!newName.trim()) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/roadmaps/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Titulo_Tema: newName })
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error renaming roadmap:', error)
    }
  }

  const handleDeleteRoadmap = async (id: string) => {
    if (!confirm('¿Eliminar este roadmap?')) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/roadmaps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (userMenuOpen && !target.closest('.user-dropdown')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [userMenuOpen])

  return (
    <aside 
      className="fixed left-0 top-0 h-full flex flex-col py-4 px-3 z-30 transition-all duration-200"
      style={{ 
        backgroundColor: 'var(--color-surface-container-low)',
        width: sidebarOpen ? '16rem' : '4rem',
        overflow: 'hidden'
      }}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
          <img alt="PathFinder AI Logo" className="w-full h-full object-contain rounded-lg" src="/Logo_2.png" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tighter leading-tight" style={{ color: 'var(--color-primary)' }}>PathFinderAI</span>
          </div>
        )}
      </div>
      
      <nav className={`flex flex-col gap-2 flex-grow ${sidebarOpen ? 'items-start px-1' : 'items-center'}`}>
        <button 
          onClick={() => navigate('/')}
          className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
          style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
          title="Nuevo chat"
        >
          <span className="text-xl"><Plus /></span>
          {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
        </button>

        {roadmaps.map((roadmap) => {
          const isEditing = editingRoadmapId === roadmap.ID
          const isMenuOpen = activeMenuId === roadmap.ID
          
          return (
            <div key={roadmap.ID} className={`relative ${sidebarOpen ? 'w-full' : ''}`}>
              <button 
                onClick={() => window.open(`/roadmap-editor?id=${roadmap.ID}`, '_blank')}
                className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
                title={roadmap.Titulo_Tema}
              >
                <span className="text-xl"><Map /></span>
                {sidebarOpen && <span className="text-sm font-medium truncate flex-1">{roadmap.Titulo_Tema}</span>}
              </button>
              
              {sidebarOpen && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : roadmap.ID) }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
              
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 rounded-lg overflow-hidden shadow-lg z-50" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                  <button 
                    onClick={() => { setEditingRoadmapId(roadmap.ID); setEditName(roadmap.Titulo_Tema); setActiveMenuId(null) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <Edit className="w-4 h-4" /> Cambiar nombre
                  </button>
                  <button 
                    onClick={() => handleDeleteRoadmap(roadmap.ID)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              )}
              
              {isEditing && (
                <div className="absolute left-0 top-full mt-1 w-48 rounded-lg overflow-hidden shadow-lg z-50 p-2" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 rounded text-sm mb-2"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <button 
                      onClick={() => { handleRenameRoadmap(roadmap.ID, editName); setEditingRoadmapId(null) }}
                      className="flex-1 px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                    >
                      Guardar
                    </button>
                    <button 
                      onClick={() => setEditingRoadmapId(null)}
                      className="flex-1 px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-on-surface)' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {importedMaps.map((map, index) => (
          <button 
            key={index}
            onClick={() => openImportedMap(map)}
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title={sanitizeFileName(map.name)}
          >
            <span className="text-xl"><FolderOpen /></span>
            {sidebarOpen && <span className="text-sm font-medium truncate">{sanitizeFileName(map.name)}</span>}
          </button>
        ))}

        {user && (
          <div className="mt-auto pt-4 border-t user-dropdown" style={{ borderColor: 'var(--color-surface-container-high)', width: '100%' }}>
            <div className="relative">
              <button 
                onClick={handleUserClick}
                className={`flex items-center gap-3 w-full rounded-xl p-2 transition-all hover:opacity-80 ${sidebarOpen ? 'px-3' : 'justify-center'}`}
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </div>
                {sidebarOpen && (
                  <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-on-surface)' }}>
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs truncate" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {getUserEmail()}
                    </span>
                  </div>
                )}
              </button>

              {userMenuOpen && sidebarOpen && (
                <div 
                  className="absolute left-0 bottom-full mb-2 w-full rounded-xl overflow-hidden shadow-xl flex flex-col"
                  style={{ backgroundColor: 'var(--color-surface-container-low)', zIndex: 100 }}
                >
                  <button 
                    onClick={() => { setUserMenuOpen(false); setProfileModalOpen(true) }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <User className="w-5 h-5" />
                    Mi Perfil
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <Upload className="w-5 h-5" />
                    Importar JSON
                  </button>
                  {userRole === 'admin' && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <Settings className="w-5 h-5" />
                      Admin
                    </button>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
        />
      </nav>
    </aside>
  )
}