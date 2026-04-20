import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth, API_URL } from '../context/AuthContext'

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

export default function MainPage() {
  const { user, loading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [importedMaps, setImportedMaps] = useState<ImportedMap[]>([])
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (user) {
        const token = localStorage.getItem('token')
        try {
          const response = await fetch(`${API_URL}/api/roadmaps`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setRoadmaps(data)
          }
        } catch (error) {
          console.error('Error fetching roadmaps:', error)
        }
      }
    }

    fetchRoadmaps()
  }, [user])

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        sessionStorage.setItem(mapId, JSON.stringify(json))
        
        const newMap: ImportedMap = {
          name: file.name.replace('.json', ''),
          id: mapId,
        }
        setImportedMaps((prev) => [...prev, newMap])
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
    setUserMenuOpen(true)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const dropdownContainer = target.closest('.user-dropdown')
      if (!dropdownContainer) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className="relative h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
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
            <img alt="PathFinder AI Logo" className="w-full h-full object-contain rounded-lg" src="/Picture.png" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tighter leading-tight" style={{ color: 'var(--color-primary)' }}>PathFinderAI</span>
            </div>
          )}
        </div>
        
        <nav className={`flex flex-col gap-2 flex-grow ${sidebarOpen ? 'items-start px-1' : 'items-center'}`}>
          <button 
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Nuevo chat"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
          </button>

          {roadmaps.map((roadmap) => (
            <button 
              key={roadmap.ID}
              onClick={() => window.open(`/roadmap-editor?id=${roadmap.ID}`, '_blank')}
              className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
              style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
              title={roadmap.Titulo_Tema}
            >
              <span className="material-symbols-outlined text-xl">route</span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{roadmap.Titulo_Tema}</span>}
            </button>
          ))}

          {importedMaps.map((map, index) => (
            <button 
              key={index}
              onClick={() => openImportedMap(map)}
              className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
              style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
              title={map.name}
            >
              <span className="material-symbols-outlined text-xl">folder_open</span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{map.name}</span>}
            </button>
          ))}

          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Importar JSON"
          >
            <span className="material-symbols-outlined text-xl">upload_file</span>
            {sidebarOpen && <span className="text-sm font-medium">Importar JSON</span>}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />

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
                    className="absolute left-0 bottom-full mb-2 w-full rounded-xl overflow-hidden shadow-xl"
                    style={{ backgroundColor: 'var(--color-surface-container-low)', zIndex: 100 }}
                  >
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </aside>

      <header 
        className="relative z-10 flex justify-end items-center px-6 py-4"
      >
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link to="/login" className="text-xs font-bold uppercase tracking-widest transition-opacity duration-200 whitespace-nowrap" style={{ color: 'var(--color-on-surface-variant)' }}>
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity duration-200 whitespace-nowrap" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden pt-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        <div className="relative z-10 w-full max-w-3xl px-6 text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight" style={{ color: 'var(--color-on-surface)' }}>
            ¿Qué quieres aprender hoy?
          </h1>
          <p className="text-lg max-w-lg mx-auto font-light leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tu asistente personal para el conocimiento profundo y la creatividad sin límites.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col mb-12 gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Física Cuántica
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Desarrollo con IA
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Historia del Arte
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Estrategia de Negocios
            </button>
          </div>

          <div className="flex items-center rounded-full px-6 py-3 transition-all focus-within:outline-none" style={{ backgroundColor: 'var(--color-surface-container-highest)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="Pregunta cualquier cosa..." 
              type="text"
            />
            <button className="ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>

        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
            PathFinder AI puede cometer errores. Considera verificar la información importante.
          </p>
        </footer>
      </main>
    </div>
  )
}