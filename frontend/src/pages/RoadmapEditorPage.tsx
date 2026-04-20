// Importa hooks de React para memorizar datos
import { useMemo } from 'react'
// Importa hook de React Router para acceder a parámetros de URL
import { useSearchParams } from 'react-router-dom'
// Importa el componente editor de roadmap
import RoadmapEditor from '../components/RoadmapEditor'

// Página del editor de roadmap que permite crear y editar roadmaps personalizados
export default function RoadmapEditorPage() {
  // Obtiene los parámetros de búsqueda de la URL (ej: ?id=123)
  const [searchParams] = useSearchParams()
  // Extrae el parámetro 'id' que identifica el roadmap en sessionStorage
  const mapId = searchParams.get('id')

  // Memoriza los datos del roadmap:
  // Si no existe ID, retorna estructura vacía; si existe, busca en sessionStorage
  const roadmapData = useMemo(() => {
    // Si no hay ID, retorna roadmap vacío
    if (!mapId) {
      return {
        nodes: [],
        edges: []
      }
    }
    // Intenta obtener los datos del roadmap desde sessionStorage
    try {
      const data = sessionStorage.getItem(mapId)
      if (data) {
        // Parsea los datos JSON del roadmap
        return JSON.parse(data)
      }
      return { nodes: [], edges: [] }
    } catch {
      // Si hay error al parsear, retorna roadmap vacío
      return { nodes: [], edges: [] }
    }
  }, [mapId])

  // Renderiza el editor de roadmap en modo editable
  // Pasa el ID del mapa para permitir guardar cambios en sessionStorage
  return <RoadmapEditor initialData={roadmapData} readOnly={false} mapId={mapId || undefined} />
}
