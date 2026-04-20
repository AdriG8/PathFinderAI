import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoadmapEditor from '../components/RoadmapEditor'
import { API_URL } from '../context/AuthContext'

export default function RoadmapViewerPage() {
  const [searchParams] = useSearchParams()
  const mapId = searchParams.get('id')
  const [loading, setLoading] = useState(true)
  const [roadmapData, setRoadmapData] = useState<any>(null)

  useEffect(() => {
    const fetchRoadmap = async () => {
      if (!mapId) {
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      console.log('Fetching roadmap with ID:', mapId)
      console.log('Token exists:', !!token)
      try {
        const response = await fetch(`${API_URL}/api/roadmap/${mapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        console.log('Response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('Roadmap JSON:', data)
          setRoadmapData(data.JSON)
        } else {
          console.error('Error fetching roadmap:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmap()
  }, [mapId])

  const data = useMemo(() => {
    if (!mapId) {
      return { nodes: [], edges: [] }
    }

    if (roadmapData) {
      return roadmapData
    }

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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando roadmap...</div>
      </div>
    )
  }

  return <RoadmapEditor initialData={data} readOnly={true} />
}