import { useMemo, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoadmapEditor from '../components/RoadmapEditor'
import { API_URL } from '../context/AuthContext'

export default function RoadmapEditorPage() {
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
      try {
        const response = await fetch(`${API_URL}/api/roadmap/${mapId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Roadmap JSON:', data)
          setRoadmapData({ 
            JSON: data.JSON, 
            title: data.Titulo_Tema 
          })
          
          sessionStorage.setItem(mapId, JSON.stringify(data.JSON))
        } else {
          const existing = sessionStorage.getItem(mapId)
          if (existing) {
            setRoadmapData({ JSON: JSON.parse(existing), title: 'Roadmap' })
          }
        }
      } catch (error) {
        console.error('Error fetching roadmap:', error)
        const existing = sessionStorage.getItem(mapId)
        if (existing) {
          setRoadmapData({ JSON: JSON.parse(existing), title: 'Roadmap' })
        }
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

    if (roadmapData?.JSON) {
      return roadmapData.JSON
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

  const handleSave = async (data: any) => {
    const token = localStorage.getItem('token')
    const title = roadmapData?.title || 'Roadmap sin título'
    console.log('Saving roadmap:', mapId, title)
    
    try {
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

      if (response.ok) {
        alert('Roadmap guardado correctamente')
      } else {
        const error = await response.json()
        alert('Error al guardar: ' + error.error)
      }
    } catch (error) {
      console.error('Error saving roadmap:', error)
      alert('Error al guardar el roadmap')
    }
  }

  return <RoadmapEditor initialData={data} readOnly={false} mapId={mapId || undefined} onSave={handleSave} />
}