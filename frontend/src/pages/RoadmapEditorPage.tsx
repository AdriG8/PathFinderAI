// Importa hooks de React (useMemo, useEffect, useState)
import { useMemo, useEffect, useState } from 'react'
// Importa hook para obtener parámetros de la URL
import { useSearchParams, useNavigate } from 'react-router-dom'
// Importa el componente del editor de roadmap
import RoadmapEditor from '../components/RoadmapEditor'
// Importa la URL de la API
import { API_URL } from '../context/AuthContext'
// Importa toast y Toaster para notificaciones (shadcn)
import { toast } from 'sonner'
import { Toaster } from '../components/ui/sonner'

// =============================================
// PÁGINA DEL EDITOR DE ROADMAP
// =============================================

// Componente que carga y muestra el editor de roadmap
export default function RoadmapEditorPage() {
  // Obtiene los parámetros de la URL
  const [searchParams, setSearchParams] = useSearchParams()
  // Obtiene el ID del roadmap de los parámetros
  const initialMapId = searchParams.get('id')
  // Estado para el ID actual (puede cambiar después de guardar)
  const [currentMapId, setCurrentMapId] = useState(initialMapId)
  // Navigate para actualizar la URL
  const navigate = useNavigate()
  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(true)
  // Estado para los datos del roadmap
  const [roadmapData, setRoadmapData] = useState<any>(null)

  // Efecto para obtener el roadmap al cargar la página
  useEffect(() => {
    // Función para obtener el roadmap
    const fetchRoadmap = async () => {
      // Si no hay ID, termina de cargar
      if (!currentMapId) {
        setLoading(false)
        return
      }

      // Obtiene el token
      const token = localStorage.getItem('token')
      try {
        // Intenta obtener el roadmap del servidor
        const response = await fetch(`${API_URL}/api/roadmap/${currentMapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Si existe en el servidor, lo usa
        if (response.ok) {
          const data = await response.json()
          console.log('Roadmap JSON:', data)
          
          // Parsear el JSON si viene como string
          let parsedJson = data.JSON
          if (typeof data.JSON === 'string') {
            parsedJson = JSON.parse(data.JSON)
          }
          
          setRoadmapData({ 
            JSON: parsedJson, 
            title: data.Titulo_Tema 
          })
          
          // También lo guarda en sessionStorage
          sessionStorage.setItem(currentMapId, JSON.stringify(parsedJson))
        } else {
          // Si no está en el servidor, intenta de sessionStorage
          const existing = sessionStorage.getItem(currentMapId)
          if (existing) {
            setRoadmapData({ JSON: JSON.parse(existing), title: 'Roadmap' })
          }
        }
      } catch (error) {
        // Maneja errores
        console.error('Error fetching roadmap:', error)
        // Intenta de sessionStorage como fallback
        const existing = sessionStorage.getItem(currentMapId)
        if (existing) {
          setRoadmapData({ JSON: JSON.parse(existing), title: 'Roadmap' })
        }
      } finally {
        // Finaliza la carga
        setLoading(false)
      }
    }

    // Ejecuta la función
    fetchRoadmap()
  }, [currentMapId])

  // Memo para calcular los datos iniciales del editor
  const data = useMemo(() => {
    // Si no hay ID, retorna vacío
    if (!currentMapId) {
      return { nodes: [], edges: [] }
    }

    // Si ya tiene los datos del roadmap, los usa
    if (roadmapData?.JSON) {
      return roadmapData.JSON
    }

    // Intenta obtener de sessionStorage
    try {
      const storedData = sessionStorage.getItem(currentMapId)
      if (storedData) {
        console.log('Roadmap JSON from sessionStorage:', JSON.parse(storedData))
        return JSON.parse(storedData)
      }
      return { nodes: [], edges: [] }
    } catch {
      return { nodes: [], edges: [] }
    }
  }, [currentMapId, roadmapData])

  // Mientras carga, muestra pantalla de carga
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando roadmap...</div>
      </div>
    )
  }

  // =============================================
  // GUARDAR ROADMAP
  // =============================================

  // Función para guardar el roadmap en la base de datos con notificaciones toast
  const handleSave = async (data: any) => {
    // Obtiene el token
    const token = localStorage.getItem('token')
    // Usa el título del roadmap o uno por defecto
    const title = roadmapData?.title || 'Roadmap sin título'
    console.log('Saving roadmap:', currentMapId, title)
    
    try {
      // Envía al servidor
      const response = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: currentMapId,
          title: title,
          json: data
        })
      })

      // Si es exitoso, muestra notificación
      if (response.ok) {
        const savedRoadmap = await response.json()
        
        // Si el ID cambió (era un map_ y ahora tiene UUID), actualizar estado y URL
        if (savedRoadmap?.ID && savedRoadmap.ID !== currentMapId && currentMapId) {
          // Transferir datos al nuevo ID en sessionStorage
          const existingData = sessionStorage.getItem(currentMapId)
          if (existingData) {
            sessionStorage.setItem(savedRoadmap.ID, existingData)
            sessionStorage.removeItem(currentMapId)
          }
          // Actualizar estado
          setCurrentMapId(savedRoadmap.ID)
          // Actualizar URL
          setSearchParams({ id: savedRoadmap.ID })
          // Recargar la página con el nuevo ID
          navigate(`/roadmap-editor?id=${savedRoadmap.ID}`, { replace: true })
        }
        
        toast.success('Roadmap guardado', {
          description: 'Los cambios se han guardado correctamente',
        })
      } else {
        // Si hay error, lo muestra
        const error = await response.json()
        toast.error('Error al guardar', {
          description: error.error,
        })
      }
    } catch (error) {
      // Maneja errores
      console.error('Error saving roadmap:', error)
      toast.error('Error al guardar', {
        description: 'Ha ocurrido un error al guardar el roadmap',
      })
    }
  }

  // =============================================
  // RENDER
  // =============================================

  // Renderiza el editor de roadmap con notificaciones
  // Toaster muestra las notificaciones toast en la esquina superior derecha
  return (
    <>
      <Toaster position="top-right" />
      <RoadmapEditor initialData={data} readOnly={false} mapId={currentMapId || undefined} onSave={handleSave} autoLayoutOnMount={true} />
    </>
  )
}