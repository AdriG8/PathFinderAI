// Importa hooks de React para memorizar datos
import { useMemo } from 'react'
// Importa el componente editor de roadmap (se reutiliza para visualización)
import RoadmapEditor from '../components/RoadmapEditor'
// Importa datos de ejemplo desde un archivo JSON
import exampleData from '../../example_roadmap.json'

// Página de ejemplo que muestra un roadmap predefinido en modo solo lectura
export default function ExampleViewer() {
  // Memoriza los datos del roadmap para evitar re-renderizados innecesarios
  const roadmapData = useMemo(() => exampleData, [])
  
  // Renderiza el editor de roadmap en modo lectura (readOnly=true) - no permite ediciones
  return <RoadmapEditor initialData={roadmapData} readOnly={true} />
}
