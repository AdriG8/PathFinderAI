// Importa hooks de React para memorizar datos
import { useMemo } from 'react'
// Importa el componente editor de roadmap
import RoadmapEditor from '../components/RoadmapEditor'
// Importa datos de ejemplo desde un archivo JSON
import exampleData from '../../example_roadmap.json'

// Página de ejemplo que muestra un roadmap predefinido en modo editable
export default function ExamplePage() {
  // Memoriza los datos del roadmap para evitar re-renderizados innecesarios
  const roadmapData = useMemo(() => exampleData, [])
  
  // Renderiza el editor de roadmap con los datos de ejemplo en modo edición (readOnly=false)
  return <RoadmapEditor initialData={roadmapData} readOnly={false} />
}
