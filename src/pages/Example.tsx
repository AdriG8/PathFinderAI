import { useMemo } from 'react'
import RoadmapEditor from '../components/RoadmapEditor'
import exampleData from '../../example_roadmap.json'

export default function ExamplePage() {
  const roadmapData = useMemo(() => exampleData, [])
  
  return <RoadmapEditor initialData={roadmapData} readOnly={false} />
}
