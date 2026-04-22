// Importa hooks de React (useMemo, useEffect, useState)
import { useMemo, useEffect, useState } from 'react'
// Importa hook para obtener parámetros de la URL
import { useSearchParams } from 'react-router-dom'
// Importa el componente del editor (reutilizado en modo lectura)
import RoadmapEditor from '../components/RoadmapEditor'
// Importa la URL de la API
import { API_URL } from '../context/AuthContext'

// =============================================
// PÁGINA DEL VISOR DE ROADMAP
// =============================================

// Componente que muestra el roadmap en modo solo lectura
export default function RoadmapViewerPage() {
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
      console.log('Fetching roadmap with ID:', mapId)
      console.log('Token exists:', !!token)
      try {
        // Intenta obtener el roadmap del servidor
        const response = await fetch(`${API_URL}/api/roadmap/${mapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        console.log('Response status:', response.status)

        // Si existe, lo guarda
        if (response.ok) {
          const data = await response.json()
          console.log('Roadmap JSON:', data)
          setRoadmapData(data.JSON)
        } else {
          // Maneja errores HTTP
          console.error('Error fetching roadmap:', response.statusText)
        }
      } catch (error) {
        // Maneja errores de red
        console.error('Error fetching roadmap:', error)
      } finally {
        // Finaliza la carga
        setLoading(false)
      }
    }

    // Ejecuta la función
    fetchRoadmap()
  }, [mapId])

  // Memo para calcular los datos iniciales
  const data = useMemo(() => {
    // Si no hay ID, retorna vacío
    if (!mapId) {
      return { nodes: [], edges: [] }
    }

    // Si ya tiene los datos del roadmap, los usa
    if (roadmapData) {
      return roadmapData
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

  // Renderiza el editor en modo solo lectura
  return <RoadmapEditor initialData={data} readOnly={true} />
}