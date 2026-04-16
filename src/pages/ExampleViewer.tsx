import { useState, useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import exampleData from '../../example_roadmap.json'

const statusColors = {
  aprendido: '#10b981',
  estudiado: '#f59e0b',
  pendiente: '#6b7280',
}

interface NodeData {
  label: string
  status: string
  color?: string
  resources?: {
    enlaces?: { nombre: string; url: string }[]
  }
}

const CustomNode = ({ data }: { data: NodeData }) => {
  const color = data.color || statusColors[data.status as keyof typeof statusColors] || statusColors.pendiente

  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px] text-center"
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        border: `2px solid ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div className="text-sm font-medium" style={{ color: 'var(--color-on-surface)' }}>
        {data.label}
      </div>
      <div className="text-xs mt-1" style={{ color }}>
        {data.status === 'aprendido' ? '✓ Aprendido' : data.status === 'estudiando' ? '⏳ Estudiando' : '○ Pendiente'}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

export default function ExampleViewer() {
  const [clickedNode, setClickedNode] = useState<Node<NodeData> | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      setShowCursor(true)
    }
    const handleMouseLeave = () => {
      setShowCursor(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const initialNodes: Node<NodeData>[] = useMemo(() => {
    return exampleData.nodes.map((node: { id: string; position: { x: number; y: number }; data: { label: string; status: string; resources?: { enlaces?: { nombre: string; url: string }[] } } }) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: node.data,
    }))
  }, [])

  const initialEdges: Edge[] = useMemo(() => {
    return exampleData.edges.map((edge: { id: string; source: string; target: string; animated?: boolean }) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }))
  }, [])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<NodeData>) => {
    setClickedNode(node)
    setShowPanel(true)
  }, [])

  const closePanel = useCallback(() => {
    setShowPanel(false)
    setTimeout(() => setClickedNode(null), 300)
  }, [])

  return (
    <div className="w-screen h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      {showCursor && (
        <div 
          className="cursor-glow"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y,
          }}
        />
      )}
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <Background 
          color="#ffffff" 
          gap={20} 
          size={1}
          style={{ opacity: 0.1 }}
        />
        <Controls 
          style={{ 
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: '8px',
          }} 
        />
        <MiniMap 
          nodeColor={(node) => {
            const status = node.data?.status as string
            return statusColors[status as keyof typeof statusColors] || statusColors.pendiente
          }}
          style={{ 
            backgroundColor: 'var(--color-surface-container-low)',
          }}
        />
      </ReactFlow>

      {clickedNode && showPanel && (
        <div 
          className="absolute top-0 right-0 h-full w-80 z-30 p-4 overflow-y-auto transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--color-surface-container-low)',
            borderLeft: '1px solid var(--color-outline)',
            transform: showPanel ? 'translateX(0)' : 'translateX(100%)',
            opacity: showPanel ? 1 : 0,
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>
              {clickedNode.data.label}
            </h2>
            <button
              onClick={closePanel}
              className="px-2 py-1 rounded hover:opacity-80"
              style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <span 
              className="text-xs font-semibold uppercase"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Estado
            </span>
            <p className="text-sm mt-1" style={{ color: statusColors[clickedNode.data.status as keyof typeof statusColors] || statusColors.pendiente }}>
              {clickedNode.data.status === 'aprendido' ? '✓ Aprendido' : clickedNode.data.status === 'estudiando' ? '⏳ Estudiando' : '○ Pendiente'}
            </p>
          </div>

          {clickedNode.data.resources?.enlaces && clickedNode.data.resources.enlaces.length > 0 && (
            <div className="mb-4">
              <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Recursos
              </h3>
              <ul className="space-y-2">
                {clickedNode.data.resources.enlaces.map((enlace, index) => (
                  <li key={index}>
                    <a
                      href={enlace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {enlace.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
