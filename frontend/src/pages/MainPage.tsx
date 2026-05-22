// Importa el componente Link para navegación
import { Link, useNavigate } from 'react-router-dom'
// Importa hooks de React (useState, useRef, useEffect)
import { useState, useRef, useEffect } from 'react'
// Importa el contexto de autenticación y la URL de la API
import { useAuth, API_URL } from '../context/AuthContext'
// Importa iconos de Lucide
import { Plus, Map, FolderOpen, Upload, LogOut, Send, User, MoreVertical, Edit, Trash2, Settings } from 'lucide-react'
// Importa utilidades de sanitización
import { sanitizeFileName } from '../utils/sanitize'
// Importa el modal de perfil
import ProfileModal from '../components/ProfileModal'
// Importa sonner para notificaciones toast (shadcn)
import { toast } from 'sonner'
import { Toaster } from '../components/ui/sonner'

// =============================================
// INTERFACES - Definiciones de tipos
// =============================================

// Interface para un mapa importado localmente
interface ImportedMap {
  name: string   // Nombre del mapa
  id: string     // ID único del mapa
}

// Interface para un roadmap guardado en la base de datos
interface Roadmap {
  ID: string           // ID único del roadmap
  ID_Usuario: string  // ID del usuario propietario
  Titulo_Tema: string   // Título del roadmap
  Fecha_Creacion: string  // Fecha de creación
  JSON: any          // Datos JSON del roadmap
}

// =============================================
// PÁGINA PRINCIPAL
// =============================================

// Componente principal de la aplicación (dashboard)
export default function MainPage() {
  // Hook para navegación
  const navigate = useNavigate()
  // Obtiene el usuario, estado de carga y función de cerrar sesión del contexto
  const { user, loading, signOut } = useAuth()
  // Estado para el rol del usuario (usuario/admin)
  const [userRole, setUserRole] = useState<string>('user')
  // Estado para abrir/cerrar la barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Estado para los mapas importados localmente
  const [importedMaps, setImportedMaps] = useState<ImportedMap[]>([])
  // Estado para los roadmaps del servidor
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  // Estado para el menú del usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false)
// Estado para el modal de perfil
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  // Estado para el input de búsqueda
  const [searchPrompt, setSearchPrompt] = useState('')
  // Estado para indicar si se está generando un roadmap
  const [isGenerating, setIsGenerating] = useState(false)
  // Estado para el mensaje de carga del roadmap
  const [generatingMessage, setGeneratingMessage] = useState('')
  // Estado para el progreso de carga
  const [generatingProgress, setGeneratingProgress] = useState(0)
  // Estado para el menú de roadmap
  const [activeRoadmapMenu, setActiveRoadmapMenu] = useState<string | null>(null)
  // Estado para el roadmap que está siendo renombrado (input inline)
  const [renamingRoadmap, setRenamingRoadmap] = useState<Roadmap | null>(null)
  const [newRoadmapName, setNewRoadmapName] = useState('')
  // Estado para el menú de mapas importados
  const [activeImportedMenu, setActiveImportedMenu] = useState<string | null>(null)
  // Estado para el mapa importado que está siendo renombrado
  const [renamingImportedMap, setRenamingImportedMap] = useState<ImportedMap | null>(null)
  const [newImportedMapName, setNewImportedMapName] = useState('')
  // Referencia al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)
  

  // Efecto para obtener los roadmaps del usuario y el rol
  useEffect(() => {
    // Cargar rol desde localStorage inmediatamente
    const savedRole = localStorage.getItem('userRole')
    if (savedRole) {
      setUserRole(savedRole)
    }

    // Funcion para obtener los roadmaps
    const fetchRoadmaps = async () => {
      // Solo si hay usuario autenticado
      if (user) {
        // Obtiene el token
        const token = localStorage.getItem('token')
        try {
          // Hace la peticion al servidor
          const response = await fetch(`${API_URL}/api/roadmaps`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          
          // Si el token ha expirado, cerrar sesion
          if (response.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return
          }
          
          // Si es exitosa, guarda los roadmaps
          if (response.ok) {
            const data = await response.json()
            setRoadmaps(data)
          }
        } catch (error) {
          // Maneja errores
          console.error('Error fetching roadmaps:', error)
        }
      }
    }

    // Funcion para obtener el rol del usuario
    const fetchUserRole = async () => {
      if (!user) return
      
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setUserRole(data.rol || 'usuario')
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }

    // Ejecuta las funciones
    fetchRoadmaps()
    fetchUserRole()
  }, [user])

  // Función para importar un archivo JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Obtiene el archivo seleccionado
    const file = event.target.files?.[0]
    // Si no hay archivo, sale
    if (!file) return

    // Crea un lector de archivos
    const reader = new FileReader()
    // Cuando termina de leer
    reader.onload = (e) => {
      try {
        // Parsea el JSON
        const json = JSON.parse(e.target?.result as string)
        // Genera un ID único
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        
        // Guarda en sessionStorage
        sessionStorage.setItem(mapId, JSON.stringify(json))
        
        // Crea el objeto del mapa
        const newMap: ImportedMap = {
          name: file.name.replace('.json', ''),
          id: mapId,
        }
        // Agrega a la lista
        setImportedMaps((prev) => [...prev, newMap])
        
        // Notificación de éxito
        toast.success('JSON importado', {
          description: `Se ha importado "${file.name}" correctamente`,
        })
      } catch (error) {
        // Maneja errores de parseo
        console.error('Error parsing JSON:', error)
        toast.error('Error al importar JSON', {
          description: 'El archivo no es un JSON válido',
        })
      }
    }
    // Lee el archivo como texto
    reader.readAsText(file)
    
    // Limpia el input para poder seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Función para abrir un mapa importado
  // En móvil abre en modo solo lectura (viewer), en desktop abre en editor
  const openImportedMap = (map: ImportedMap) => {
    const isMobile = window.innerWidth < 768
    const page = isMobile ? '/roadmap-viewer' : '/roadmap-editor'
    window.open(`${page}?id=${map.id}`, '_blank')
  }

  // Función helper para abrir roadmap según el dispositivo
  const openRoadmap = (roadmapId: string) => {
    const isMobile = window.innerWidth < 768
    const page = isMobile ? '/roadmap-viewer' : '/roadmap-editor'
    window.open(`${page}?id=${roadmapId}`, '_blank')
  }

  // Función para cerrar sesión
  const handleSignOut = async () => {
    // Loguea el cierre
    console.log('Cerrando sesión...')
    try {
      // Ejecuta la función de cerrar sesión del contexto
      await signOut()
      // Loguea la confirmación
      console.log('Sesión cerrada')
    } catch (error) {
      // Maneja errores
      console.error('Error:', error)
    }
    // Cierra el menú
    setUserMenuOpen(false)
  }

  // Función para manejar clic en el usuario
  const handleUserClick = () => {
    // Abre el menú
    setUserMenuOpen(true)
  }

  // Efecto para cerrar el menú al hacer clic fuera
  useEffect(() => {
    // Función para cerrar el menú
    const handleClickOutside = (event: MouseEvent) => {
      // Obtiene el elemento donde se hizo clic
      const target = event.target as HTMLElement
      // Busca el contenedor del dropdown
      const dropdownContainer = target.closest('.user-dropdown')
      // Si no está dentro del dropdown, cierra
      if (!dropdownContainer) {
        setUserMenuOpen(false)
      }
    }

    // Si el menú está abierto, agrega el evento
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Limpia el evento al desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Función auxiliar para obtener el nombre a mostrar del usuario
  const getUserDisplayName = () => {
    // Si no hay usuario, retorna vacío
    if (!user) return ''
    // Obtiene los metadatos
    const metadata = user.user_metadata
    // Usa full_name si existe
    if (metadata?.full_name) return metadata.full_name
    // Usa first_name y last_name si existen
    if (metadata?.first_name && metadata?.last_name) return `${metadata.first_name} ${metadata.last_name}`
    // Usa el email como último recurso
    return user.email?.split('@')[0] || 'Usuario'
  }

  // Función auxiliar para obtener el email del usuario
  const getUserEmail = () => {
    // Retorna el email del usuario
    return user?.email || ''
  }

  // Función para generar roadmap con IA
  const generateRoadmap = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return

    if (!user) {
      toast.info('Inicia sesión', {
        description: 'Debes iniciar sesión para generar un roadmap',
      })
      return
    }

    setIsGenerating(true)
    setGeneratingProgress(0)

    const loadingMessages = [
      'Analizando tema...',
      'Creando estructura...',
      'Organizando conceptos...',
      'Finalizando...'
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length) {
        setGeneratingMessage(loadingMessages[messageIndex])
        setGeneratingProgress((messageIndex + 1) / loadingMessages.length * 70)
        messageIndex++
      }
    }, 2500)

    const token = localStorage.getItem('token')

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 60000)
    })

    try {
      const response = await Promise.race([
        fetch(`${API_URL}/api/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt })
        }),
        timeoutPromise
      ]) as Response

      clearInterval(messageInterval)

      if (!response.ok) {
        const err = await response.json()
        const errorMessage = err.error?.toLowerCase() || ''
        const errorStatus = response.status

        if (errorMessage.includes('tema no valido') || errorMessage.includes('tema no válido')) {
          toast.error('Tema no válido', {
            description: 'El tema introducido no es válido, vuelva a introducir un tema correcto',
          })
        } else if (errorStatus === 429) {
          toast.error('Demasiadas peticiones', {
            description: 'Has hecho demasiadas peticiones, por favor inténtelo más tarde',
          })
        } else if (errorStatus === 503 || errorMessage.includes('high demand') || errorMessage.includes('service unavailable') || errorMessage.includes('saturado')) {
          toast.error('Servicio saturado', {
            description: 'El servicio de generación está experimentando una alta demanda, por favor espere e inténtelo más tarde',
          })
        } else {
          toast.error('Error al generar roadmap', {
            description: 'Ha ocurrido un error, vuelve a intentarlo más tarde',
          })
        }
        setIsGenerating(false)
        return
      }

      setGeneratingMessage('Guardando...')
      setGeneratingProgress(85)

      const generatedData = await response.json()
      console.log('Roadmap generado:', generatedData)

      setGeneratingMessage('Abriendo roadmap...')
      setGeneratingProgress(95)

      const saveResponse = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: prompt,
          json: generatedData
        })
      })

      if (saveResponse.ok) {
        const savedRoadmap = await saveResponse.json()
        console.log('Roadmap guardado en DB:', savedRoadmap)

        if (savedRoadmap && savedRoadmap.ID) {
          const newRoadmap: Roadmap = {
            ID: savedRoadmap.ID,
            ID_Usuario: user?.id || '',
            Titulo_Tema: prompt,
            JSON: JSON.stringify(generatedData),
            Fecha_Creacion: new Date().toISOString()
          }
          setRoadmaps([newRoadmap, ...roadmaps])

          toast.success('Roadmap generado', {
            description: `Se ha creado el roadmap "${prompt}"`,
          })

          openRoadmap(savedRoadmap.ID)
        } else {
          throw new Error('No se pudo obtener el ID del roadmap guardado')
        }
      } else {
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        sessionStorage.setItem(mapId, JSON.stringify(generatedData))
        openRoadmap(mapId)
      }

      setGeneratingProgress(100)
    } catch (error: any) {
      clearInterval(messageInterval)
      console.error('Error generating roadmap:', error)

      if (error.message === 'timeout') {
        toast.error('Tiempo de espera agotado', {
          description: 'El servicio está tardando demasiado, por favor inténtelo más tarde',
        })
      } else {
        toast.error('Error al generar el roadmap', {
          description: 'Ha ocurrido un error, vuelve a intentarlo más tarde',
        })
      }
    } finally {
      setIsGenerating(false)
      setGeneratingMessage('')
      setGeneratingProgress(0)
    }
  }

  // Función para abrir/cerrar menú de roadmap
  const handleRoadmapMenuClick = (e: React.MouseEvent, roadmapId: string) => {
    e.stopPropagation()
    setActiveRoadmapMenu(activeRoadmapMenu === roadmapId ? null : roadmapId)
  }

  // Función para iniciar edición de nombre (inline)
  const handleStartRename = (roadmap: Roadmap) => {
    setRenamingRoadmap(roadmap)
    setNewRoadmapName(roadmap.Titulo_Tema)
    setActiveRoadmapMenu(null)
  }

  // Función para guardar nuevo nombre
  const handleSaveRename = async () => {
    if (!renamingRoadmap || !newRoadmapName.trim()) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/api/roadmaps/${renamingRoadmap.ID}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Titulo_Tema: newRoadmapName.trim() })
      })
      
      if (response.ok) {
        setRoadmaps(roadmaps.map(r => 
          r.ID === renamingRoadmap.ID ? { ...r, Titulo_Tema: newRoadmapName.trim() } : r
        ))
        toast.success('Nombre actualizado', {
          description: 'El nombre del roadmap se ha actualizado correctamente',
        })
      }
    } catch (error) {
      console.error('Error updating roadmap:', error)
      toast.error('Error al actualizar nombre', {
        description: 'Ha ocurrido un error al actualizar el nombre',
      })
    }
    setRenamingRoadmap(null)
    setNewRoadmapName('')
  }

  // Función para cancelar edición
  const handleCancelRename = () => {
    setRenamingRoadmap(null)
    setNewRoadmapName('')
  }

  // Función para eliminar roadmap
  const handleDeleteRoadmap = async (roadmapId: string) => {
    if (!confirm('¿Eliminar este roadmap?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_URL}/api/roadmaps/${roadmapId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setRoadmaps(roadmaps.filter(r => r.ID !== roadmapId))
        toast.success('Roadmap eliminado', {
          description: 'El roadmap ha sido eliminado correctamente',
        })
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error)
      toast.error('Error al eliminar', {
        description: 'Ha ocurrido un error al eliminar el roadmap',
      })
    }
    setActiveRoadmapMenu(null)
  }

  // Función para abrir menú de mapa importado
  const handleImportedMenuClick = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation()
    setActiveImportedMenu(activeImportedMenu === mapId ? null : mapId)
  }

  // Función para iniciar edición de nombre de mapa importado
  const handleStartRenameImported = (map: ImportedMap) => {
    setRenamingImportedMap(map)
    setNewImportedMapName(map.name)
    setActiveImportedMenu(null)
  }

  // Función para guardar nuevo nombre de mapa importado
  const handleSaveRenameImported = () => {
    if (!renamingImportedMap || !newImportedMapName.trim()) return
    
    setImportedMaps(importedMaps.map(m => 
      m.id === renamingImportedMap.id ? { ...m, name: newImportedMapName.trim() } : m
    ))
    
    toast.success('Nombre actualizado', {
      description: 'El nombre del mapa se ha actualizado correctamente',
    })
    
    setRenamingImportedMap(null)
    setNewImportedMapName('')
  }

  // Función para cancelar edición de mapa importado
  const handleCancelRenameImported = () => {
    setRenamingImportedMap(null)
    setNewImportedMapName('')
  }

  // Función para eliminar mapa importado
  const handleDeleteImported = (mapId: string) => {
    setImportedMaps(importedMaps.filter(m => m.id !== mapId))
    sessionStorage.removeItem(mapId)
    setActiveImportedMenu(null)
    toast.success('Mapa eliminado', {
      description: 'El mapa importado ha sido eliminado',
    })
  }

  // Efecto para cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.roadmap-menu-container') && !target.closest('.imported-menu-container')) {
        setActiveRoadmapMenu(null)
        setActiveImportedMenu(null)
      }
    }
    if (activeRoadmapMenu || activeImportedMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeRoadmapMenu, activeImportedMenu])

  // Mientras carga, muestra pantalla de carga
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
      </div>
    )
  }

  // Renderiza la página principal
  return (
    // Contenedor principal
    <div className="relative h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Toaster para notificaciones */}
      <Toaster position="top-right" />
      
      {/* Barra lateral fija */}
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
        {/* Header de la sidebar */}
        <div className="flex items-center gap-3 mb-8 px-4">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <img alt="PathFinder AI Logo" className="w-full h-full object-contain rounded-lg" src="/Logo_2.png" />
          </div>
          {/* Título (solo si sidebar abierta) */}
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tighter leading-tight" style={{ color: 'var(--color-primary)' }}>PathFinderAI</span>
            </div>
          )}
        </div>
        
        {/* Navegación de la sidebar */}
        <nav className={`flex flex-col gap-2 flex-grow ${sidebarOpen ? 'items-start px-1' : 'items-center'}`}>
          {/* Botón para nuevo chat */}
          <button 
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Nuevo chat"
          >
            <span className="text-xl"><Plus /></span>
            {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
          </button>

          {/* Lista de roadmaps guardados */}
          {roadmaps.map((roadmap) => (
            <div key={roadmap.ID} className="relative group roadmap-menu-container">
              {renamingRoadmap?.ID === roadmap.ID ? (
                <div className={`flex items-center gap-2 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}>
                  <input
                    type="text"
                    value={newRoadmapName}
                    onChange={(e) => setNewRoadmapName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRename(); if (e.key === 'Escape') handleCancelRename() }}
                    className="flex-1 bg-transparent border rounded px-2 py-1 text-sm"
                    style={{ borderColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
                    autoFocus
                  />
                  <button onClick={handleSaveRename} className="text-green-500 text-xs">Guardar</button>
                  <button onClick={handleCancelRename} className="text-red-500 text-xs">Cancelar</button>
                </div>
              ) : (
                <button 
                  onClick={() => openRoadmap(roadmap.ID)}
                  className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
                  style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
                  title={roadmap.Titulo_Tema}
                >
                  <span className="text-xl"><Map /></span>
                  {sidebarOpen && <span className="text-sm font-medium truncate max-w-[120px]">{roadmap.Titulo_Tema}</span>}
                  {sidebarOpen && (
                    <div 
                      onClick={(e) => handleRoadmapMenuClick(e, roadmap.ID)}
                      title="Opciones"
                      className="ml-auto p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </div>
                  )}
                </button>
              )}
              {/* Menú dropdown */}
              {activeRoadmapMenu === roadmap.ID && sidebarOpen && !renamingRoadmap && (
                <div 
                  className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden shadow-xl z-50"
                  style={{ backgroundColor: 'var(--color-surface-container-low)' }}
                >
                  <button 
                    onClick={() => handleStartRename(roadmap)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <Edit className="w-4 h-4" />
                    Cambiar nombre
                  </button>
                  <button 
                    onClick={() => handleDeleteRoadmap(roadmap.ID)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Lista de mapas importados */}
          {importedMaps.map((map, index) => (
            <div key={index} className="relative group imported-menu-container">
              {renamingImportedMap?.id === map.id ? (
                <div className={`flex items-center gap-2 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}>
                  <input
                    type="text"
                    value={newImportedMapName}
                    onChange={(e) => setNewImportedMapName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveRenameImported(); if (e.key === 'Escape') handleCancelRenameImported() }}
                    className="flex-1 bg-transparent border rounded px-2 py-1 text-sm"
                    style={{ borderColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
                    autoFocus
                  />
                  <button onClick={handleSaveRenameImported} className="text-green-500 text-xs">Guardar</button>
                  <button onClick={handleCancelRenameImported} className="text-red-500 text-xs">Cancelar</button>
                </div>
              ) : (
                <button 
                  onClick={() => openImportedMap(map)}
                  className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
                  style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
                  title={sanitizeFileName(map.name)}
                >
                  <span className="text-xl"><FolderOpen /></span>
                  {sidebarOpen && <span className="text-sm font-medium truncate max-w-[120px]">{sanitizeFileName(map.name)}</span>}
                  {sidebarOpen && (
                    <div 
                      onClick={(e) => handleImportedMenuClick(e, map.id)}
                      className="ml-auto p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </div>
                  )}
                </button>
              )}
              {/* Menú dropdown */}
              {activeImportedMenu === map.id && sidebarOpen && !renamingImportedMap && (
                <div 
                  className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden shadow-xl z-50"
                  style={{ backgroundColor: 'var(--color-surface-container-low)' }}
                >
                  <button 
                    onClick={() => handleStartRenameImported(map)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--color-on-surface)' }}
                  >
                    <Edit className="w-4 h-4" />
                    Cambiar nombre
                  </button>
                  <button 
                    onClick={() => handleDeleteImported(map.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Sección del usuario (solo si hay usuario) */}
          {user && (
            <div className="mt-auto pt-4 border-t user-dropdown" style={{ borderColor: 'var(--color-surface-container-high)', width: '100%' }}>
              <div className="relative">
                {/* Botón del usuario */}
                <button 
                  onClick={handleUserClick}
                  className={`flex items-center gap-3 w-full rounded-xl p-2 transition-all hover:opacity-80 ${sidebarOpen ? 'px-3' : 'justify-center'}`}
                  style={{ backgroundColor: 'transparent' }}
                >
                  {/* Avatar del usuario */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                  {/* Nombre y email (si sidebar abierta) */}
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

                {/* Menú desplegable del usuario */}
                {userMenuOpen && sidebarOpen && (
                  <div 
                    className="absolute left-0 bottom-full mb-2 w-full rounded-xl overflow-hidden shadow-xl flex flex-col"
                    style={{ backgroundColor: 'var(--color-surface-container-low)', zIndex: 100 }}
                  >
                    {/* Opción de Mi Perfil */}
                    <button 
                      onClick={() => { setUserMenuOpen(false); setProfileModalOpen(true) }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      <User className="w-5 h-5" />
                      Mi Perfil
                    </button>
                    {/* Opción de importar JSON */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      <Upload className="w-5 h-5" />
                      Importar JSON
                    </button>
                    {/* Opción de Admin (solo para admins) */}
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => { setUserMenuOpen(false); navigate('/admin') }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                        style={{ color: 'var(--color-on-surface)' }}
                      >
                        <Settings className="w-5 h-5" />
                        Admin
                      </button>
                    )}
                    {/* Opción de cerrar sesión */}
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

          {/* Input de archivo oculto para importar JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </nav>
      </aside>

      {/* Modal de Perfil */}
      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
        user={user}
      />

      {/* Header */}
      <header 
        className="relative z-10 flex justify-end items-center px-6 py-4"
      >
        <div className="flex items-center gap-4">
          {/* Si no hay usuario, muestra botones de login/register */}
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

      {/* Área de contenido principal */}
      <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden pt-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Efecto de fondo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        {/* Título y descripción */}
        <div className="relative z-10 w-full max-w-3xl px-6 text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight" style={{ color: 'var(--color-on-surface)' }}>
            ¿Qué quieres aprender hoy?
          </h1>
          <p className="text-lg max-w-lg mx-auto font-light leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tu asistente personal para el conocimiento profundo y la creatividad sin límites.
          </p>
        </div>

        {/* Botones de ejemplos y campo de búsqueda */}
        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col mb-12 gap-4">
          {/* Botones de ejemplos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => generateRoadmap('Quiero aprender Física Cuántica')} disabled={isGenerating} className="p-3 rounded-2xl transition-all text-xs disabled:opacity-50" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Física Cuántica
            </button>
            <button onClick={() => generateRoadmap('Quiero aprender Desarrollo con IA')} disabled={isGenerating} className="p-3 rounded-2xl transition-all text-xs disabled:opacity-50" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Desarrollo con IA
            </button>
            <button onClick={() => generateRoadmap('Quiero aprender Historia del Arte')} disabled={isGenerating} className="p-3 rounded-2xl transition-all text-xs disabled:opacity-50" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Historia del Arte
            </button>
            <button onClick={() => generateRoadmap('Quiero aprender Estrategia de Negocios')} disabled={isGenerating} className="p-3 rounded-2xl transition-all text-xs disabled:opacity-50" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Estrategia de Negocios
            </button>
          </div>

          {/* Campo de búsqueda/chat */}
          <div className="flex items-center rounded-full px-6 py-3 transition-all focus-within:outline-none" style={{ backgroundColor: 'var(--color-surface-container-highest)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="Pregunta cualquier cosa..." 
              type="text"
              value={searchPrompt}
              onChange={(e) => setSearchPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isGenerating) generateRoadmap(searchPrompt) }}
            />
            <button 
              onClick={() => generateRoadmap(searchPrompt)} 
              disabled={isGenerating}
              aria-label="Enviar mensaje"
              className="ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50" 
              style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

{/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'var(--color-surface-container-high)' }} />
                <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
              <p className="text-base font-medium mb-4" style={{ color: 'var(--color-on-surface)' }}>{generatingMessage || 'Generando roadmap...'}</p>
              <div className="w-64 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generatingProgress}%`, backgroundColor: 'var(--color-primary)' }}
                />
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                Por favor espera...
              </p>
            </div>
          </div>
        )}

        {/* Footer de advertencia */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
            PathFinder AI puede cometer errores. Considera verificar la informacion importante.
          </p>
        </footer>
      </main>
    </div>
  )
}