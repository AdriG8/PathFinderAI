// Importa Link para navegación entre páginas
import { Link } from 'react-router-dom'
// Importa hooks de React para estado y referencias
import { useState, useRef } from 'react'

// Define la interfaz para los mapas importados desde JSON
interface ImportedMap {
  name: string  // Nombre del archivo importado
  id: string    // ID único generado para sessionStorage
}

// Página principal de la aplicación - punto de entrada y navegación
export default function MainPage() {
  // Estado para saber si el usuario está logueado (actualmente siempre false)
  const [isLoggedIn] = useState(false)
  // Estado para controlar si el sidebar está expandido o colapsado
  const [sidebarOpen, setSidebarOpen] = useState(false)
  // Estado que guarda la lista de mapas importados por el usuario
  const [importedMaps, setImportedMaps] = useState<ImportedMap[]>([])
  // Referencia al input de archivo para poder limpiarlo después de importar
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Función que maneja la importación de archivos JSON
  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Obtiene el primer archivo seleccionado
    const file = event.target.files?.[0]
    if (!file) return

    // Crea un FileReader para leer el contenido del archivo
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // Parsea el contenido del archivo como JSON
        const json = JSON.parse(e.target?.result as string)
        // Genera un ID único para el mapa usando timestamp + random
        const mapId = `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        // Guarda los datos del mapa en sessionStorage con el ID generado
        sessionStorage.setItem(mapId, JSON.stringify(json))
        
        // Crea un objeto con la información del mapa importado
        const newMap: ImportedMap = {
          name: file.name.replace('.json', ''),  // Usa el nombre del archivo sin extensión
          id: mapId,
        }
        // Agrega el nuevo mapa a la lista de mapas importados
        setImportedMaps((prev) => [...prev, newMap])
      } catch (error) {
        console.error('Error parsing JSON:', error)
        alert('Error al parsear el archivo JSON')
      }
    }
    // Lee el archivo como texto
    reader.readAsText(file)
    
    // Limpia el input de archivo para poder importar el mismo archivo otra vez
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Función que abre un mapa importado en una nueva pestaña
  const openImportedMap = (map: ImportedMap) => {
    window.open(`/roadmap-editor?id=${map.id}`, '_blank')
  }

  return (
    // Contenedor principal con altura de pantalla completa
    <div className="relative h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* SIDEBAR - Menú lateral colapsable */}
      <aside 
        className="fixed left-0 top-0 h-full flex flex-col py-4 px-3 z-30 transition-all duration-200"
        style={{ 
          backgroundColor: 'var(--color-surface-container-low)',
          // Ancho: 16rem (256px) cuando expandido, 4rem (64px) cuando colapsado
          width: sidebarOpen ? '16rem' : '4rem',
          overflow: 'hidden'
        }}
        // Expande el sidebar cuando el mouse entra
        onMouseEnter={() => setSidebarOpen(true)}
        // Colapsa el sidebar cuando el mouse sale
        onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Logo y título de la aplicación */}
        <div className="flex items-center gap-3 mb-8 px-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <img alt="PathFinder AI Logo" className="w-full h-full object-contain rounded-lg" src="/Picture.png" />
          </div>
          {/* Solo muestra el título cuando el sidebar está expandido */}
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tighter leading-tight" style={{ color: 'var(--color-primary)' }}>PathFinder AI</span>
            </div>
          )}
        </div>
        
        {/* Navegación del sidebar */}
        <nav className={`flex flex-col gap-2 flex-grow ${sidebarOpen ? 'items-start px-1' : 'items-center'}`}>
          {/* Botón para crear nuevo chat (actualmente sin función) */}
          <button 
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Nuevo chat"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
          </button>

          {/* Link a la página de ejemplo */}
          <Link 
            to="/example" 
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Example"
          >
            <span className="material-symbols-outlined text-xl">map</span>
            {sidebarOpen && <span className="text-sm font-medium">Example</span>}
          </Link>

          {/* Lista de mapas importados - cada uno abre en nueva pestaña */}
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

          {/* Botón para importar archivos JSON */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-full flex items-center gap-3 group active:scale-[0.98] transition-all duration-200 ${sidebarOpen ? 'px-4 py-2 w-full' : 'w-10 h-10 justify-center'}`}
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
            title="Importar JSON"
          >
            <span className="material-symbols-outlined text-xl">upload_file</span>
            {sidebarOpen && <span className="text-sm font-medium">Importar JSON</span>}
          </button>
          
          {/* Input de archivo oculto - se activa al hacer click en el botón de arriba */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </nav>
      </aside>

      {/* HEADER - Barra superior con opciones de autenticación */}
      <header 
        className="relative z-10 flex justify-end items-center px-6 py-4"
      >
        <div className="flex items-center gap-4">
          {/* Si está logueado, muestra el nombre de usuario */}
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--color-on-surface)' }}>Usuario</span>
            </div>
          ) : (
            /* Si no está logueado, muestra links a login y registro */
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

      {/* MAIN - Contenido principal de la página */}
      <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden pt-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        {/* Efecto de fondo decorativo - círculo difuminado */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        {/* Título y descripción de la aplicación */}
        <div className="relative z-10 w-full max-w-3xl px-6 text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight" style={{ color: 'var(--color-on-surface)' }}>
            ¿Qué quieres aprender hoy?
          </h1>
          <p className="text-lg max-w-lg mx-auto font-light leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tu asistente personal para el conocimiento profundo y la creatividad sin límites.
          </p>
        </div>

        {/* Área de búsqueda y botones de ejemplo */}
        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col mb-12 gap-4">
          {/* Botones de ejemplo que sugieren temas de aprendizaje */}
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

          {/* Campo de búsqueda estilo ChatGPT */}
          <div className="flex items-center rounded-full px-6 py-3 transition-all focus-within:outline-none" style={{ backgroundColor: 'var(--color-surface-container-highest)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="Pregunta cualquier cosa..." 
              type="text"
            />
            {/* Botón para enviar la pregunta */}
            <button className="ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>

        {/* FOOTER - Aviso de免责声明 */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
            PathFinder AI puede cometer errores. Considera verificar la información importante.
          </p>
        </footer>
      </main>
    </div>
  )
}