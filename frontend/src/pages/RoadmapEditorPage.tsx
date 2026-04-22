// Importa hooks de React (useMemo, useEffect, useState)
import { useMemo, useEffect, useState } from 'react'
// Importa hook para obtener parámetros de la URL
import { useSearchParams } from 'react-router-dom'
// Importa el componente del editor de roadmap
import RoadmapEditor from '../components/RoadmapEditor'
// Importa la URL de la API
import { API_URL } from '../context/AuthContext'

// =============================================
// PÁGINA DEL EDITOR DE ROADMAP
// =============================================

// Componente que carga y muestra el editor de roadmap
export default function RoadmapEditorPage() {
  // Obtiene los parámetros de la URL
  const [searchParams] = useSearchParams()
  // Obtiene el ID del roadmap de los parámetros
  const mapId = searchParams.get('id')
  // Estado para indicar si está cargando
  const [loading, setLoading] = useState(true)
  // Estado para los datos del roadmap
  const [roadmapData, setRoadmapData] = useState<any>(null)

  // Efecto para obtener el roadmap al cargar la página
  useEffect(() => {
    // Función para obtener el roadmap
    const fetchRoadmap = async () => {
      // Si no hay ID, termina de cargar
      if (!mapId) {
        setLoading(false)
        return
      }

      // Obtiene el token
      const token = localStorage.getItem('token')
      try {
        // Intenta obtener el roadmap del servidor
        const response = await fetch(`${API_URL}/api/roadmap/${mapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        // Si existe en el servidor, lo usa
        if (response.ok) {
          const data = await response.json()
          console.log('Roadmap JSON:', data)
          setRoadmapData({ 
            JSON: data.JSON, 
            title: data.Titulo_Tema 
          })
          
          // También lo guarda en sessionStorage
          sessionStorage.setItem(mapId, JSON.stringify(data.JSON))
        } else {
          // Si no está en el servidor, intenta de sessionStorage
          const existing = sessionStorage.getItem(mapId)
          if (existing) {
            setRoadmapData({ JSON: JSON.parse(existing), title: 'Roadmap' })
          }
        }
      } catch (error) {
        // Maneja errores
        console.error('Error fetching roadmap:', error)
        // Intenta de sessionStorage como fallback
        const existing = sessionStorage.getItem(mapId)
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
  }, [mapId])

  // Memo para calcular los datos iniciales del editor
  const data = useMemo(() => {
    // Si no hay ID, retorna vacío
    if (!mapId) {
      return { nodes: [], edges: [] }
    }

    // Si ya tiene los datos del roadmap, los usa
    if (roadmapData?.JSON) {
      return roadmapData.JSON
    }

    // Intenta obtener de sessionStorage
    try {
      const data = sessionStorage.getItem(mapId)
      if (data) {
        console.log('Roadmap JSON from sessionStorage:', JSON.parse(data))
        return JSON.parse(data)
      }
      return { nodes: [], edges: [] }
    } catch {
      return { nodes: [], edges: [] }
    }
  }, [mapId, roadmapData])

  // Mientras carga, muestra pantalla de carga
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando roadmap...</div>
      </div>
    )
  }

  // Función para guardar el roadmap
  const handleSave = async (data: any) => {
    // Obtiene el token
    const token = localStorage.getItem('token')
    // Usa el título del roadmap o uno por defecto
    const title = roadmapData?.title || 'Roadmap sin título'
    console.log('Saving roadmap:', mapId, title)
    
    try {
      // Envía al servidor
      const response = await fetch(`${API_URL}/api/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: mapId,
          title: title,
          json: data
        })
      })

      // Si es exitoso, muestra mensaje
      if (response.ok) {
        alert('Roadmap guardado correctamente')
      } else {
        // Si hay error, lo muestra
        const error = await response.json()
        alert('Error al guardar: ' + error.error)
      }
    } catch (error) {
      // Maneja errores
      console.error('Error saving roadmap:', error)
      alert('Error al guardar el roadmap')
    }
  }

  // Renderiza el editor de roadmap
  return <RoadmapEditor initialData={data} readOnly={false} mapId={mapId || undefined} onSave={handleSave} />
}