import { useMemo } from 'react'
import RoadmapEditor from '../components/RoadmapEditor'
import exampleData from '../../example_roadmap.json'

export default function ExampleViewer() {
  const roadmapData = useMemo(() => exampleData, [])
  
  return <RoadmapEditor initialData={roadmapData} readOnly={true} />
}
