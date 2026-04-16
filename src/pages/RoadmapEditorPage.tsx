import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoadmapEditor from '../components/RoadmapEditor'

export default function RoadmapEditorPage() {
  const [searchParams] = useSearchParams()
  const mapId = searchParams.get('id')

  const roadmapData = useMemo(() => {
    if (!mapId) {
      return {
        nodes: [],
        edges: []
      }
    }
    try {
      const data = sessionStorage.getItem(mapId)
      if (data) {
        return JSON.parse(data)
      }
      return { nodes: [], edges: [] }
    } catch {
      return { nodes: [], edges: [] }
    }
  }, [mapId])

  return <RoadmapEditor initialData={roadmapData} readOnly={false} mapId={mapId || undefined} />
}
