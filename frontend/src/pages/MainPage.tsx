// Importa el componente Link para navegación
import { Link } from 'react-router-dom'
// Importa hooks de React (useState, useRef, useEffect)
import { useState, useRef, useEffect } from 'react'
// Importa el contexto de autenticación y la URL de la API
import { useAuth, API_URL } from '../context/AuthContext'
// Importa iconos de Lucide
import { Plus, Map, FolderOpen, Upload, LogOut, Send } from 'lucide-react'
// Importa utilidades de sanitización
import { sanitizeFileName } from '../utils/sanitize'

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
  // Obtiene el usuario, estado de carga y función de cerrar sesión del contexto
  const { user, loading, signOut } = useAuth()
  // Estado para abrir/cerrar la barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Estado para los mapas importados localmente
  const [importedMaps, setImportedMaps] = useState<ImportedMap[]>([])
  // Estado para los roadmaps del servidor
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  // Estado para el menú del usuario
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  // Referencia al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Efecto para obtener los roadmaps del usuario
  useEffect(() => {
    // Función para obtener los roadmaps
    const fetchRoadmaps = async () => {
      // Solo si hay usuario autenticado
      if (user) {
        // Obtiene el token
        const token = localStorage.getItem('token')
        try {
          // Hace la petición al servidor
          const response = await fetch(`${API_URL}/api/roadmaps`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
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

    // Ejecuta la función
    fetchRoadmaps()
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
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Guarda en sessionStorage
        sessionStorage.setItem(mapId, JSON.stringify(json))
        
        // Crea el objeto del mapa
        const newMap: ImportedMap = {
          name: file.name.replace('.json', ''),
          id: mapId,
        }
        // Agrega a la lista
        setImportedMaps((prev) => [...prev, newMap])
      } catch (error) {
        // Maneja errores de parseo
        console.error('Error parsing JSON:', error)
        alert('Error al parsear el archivo JSON')
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
  const openImportedMap = (map: ImportedMap) => {
    // Abre en nueva pestaña
    window.open(`/roadmap-editor?id=${map.id}`, '_blank')
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
            <button 
              key={roadmap.ID}
              onClick={() => window.open(`/roadmap-editor?id=${roadmap.ID}`, '_blank')}
              className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
              style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
              title={roadmap.Titulo_Tema}
            >
              <span className="text-xl"><Map /></span>
              {sidebarOpen && <span className="text-sm font-medium truncate">{roadmap.Titulo_Tema}</span>}
            </button>
          ))}

          {/* Lista de mapas importados */}
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
                    className="absolute left-0 bottom-full mb-2 w-full rounded-xl overflow-hidden shadow-xl"
                    style={{ backgroundColor: 'var(--color-surface-container-low)', zIndex: 100 }}
                  >
                    {/* Opción de importar JSON */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:opacity-80"
                      style={{ color: 'var(--color-on-surface)' }}
                    >
                      <Upload className="w-5 h-5" />
                      Importar JSON
                    </button>
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

          {/* Campo de búsqueda/chat */}
          <div className="flex items-center rounded-full px-6 py-3 transition-all focus-within:outline-none" style={{ backgroundColor: 'var(--color-surface-container-highest)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="Pregunta cualquier cosa..." 
              type="text"
            />
            <button className="ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Footer de advertencia */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
            PathFinder AI puede cometer errores. Considera verificar la información importante.
          </p>
        </footer>
      </main>
    </div>
  )
}