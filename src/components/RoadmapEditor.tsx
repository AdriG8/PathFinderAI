import { useState, useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnConnect,
  type NodeTypes,
  Handle,
  Position,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import dagre from 'dagre'
import 'reactflow/dist/style.css'

const statusColors: Record<string, string> = {
  aprendido: '#10b981',
  estudiado: '#f59e0b',
  pendiente: '#6b7280',
}

const defaultColors = [
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#ef4444',
  '#14b8a6',
  '#f97316',
]

interface CustomNodeData {
  label: string
  status: string
  isEditing?: boolean
  color?: string
  resources?: {
    enlaces?: { nombre: string; url: string }[]
  }
}

const getStatusSymbol = (status: string): string => {
  switch (status) {
    case 'aprendido':
      return '✓ Aprendido'
    case 'estudiando':
      return '⏳ Estudiando'
    default:
      return '○ Pendiente'
  }
}

const CustomNode = ({ data, id }: { data: CustomNodeData; id: string }) => {
  const color = data.color || statusColors[data.status] || statusColors.pendiente

  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px] text-center"
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        border: `2px solid ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      {data.isEditing ? (
        <input
          autoFocus
          className="text-sm font-medium bg-transparent border-none text-center w-full outline-none"
          style={{ color: 'var(--color-on-surface)' }}
          defaultValue={data.label}
          onBlur={(e) => {
            const event = new CustomEvent('updateNodeLabel', { detail: { id, label: e.target.value } })
            window.dispatchEvent(event)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const event = new CustomEvent('updateNodeLabel', { detail: { id, label: e.currentTarget.value } })
              window.dispatchEvent(event)
            }
          }}
        />
      ) : (
        <div 
          className="text-sm font-medium cursor-pointer"
          style={{ color: 'var(--color-on-surface)' }}
          onDoubleClick={() => {
            const event = new CustomEvent('editNodeLabel', { detail: { id } })
            window.dispatchEvent(event)
          }}
        >
          {data.label}
        </div>
      )}
      <div className="text-xs mt-1" style={{ color }}>
        {getStatusSymbol(data.status)}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

interface RoadmapData {
  nodes: {
    id: string
    type?: string
    position: { x: number; y: number }
    data: {
      label: string
      status: string
      color?: string
      resources?: {
        enlaces?: { nombre: string; url: string }[]
      }
    }
  }[]
  edges: {
    id: string
    source: string
    target: string
    animated?: boolean
    label?: string
  }[]
}

interface RoadmapEditorProps {
  initialData: RoadmapData
  readOnly?: boolean
  mapId?: string
}

export default function RoadmapEditor({ initialData, readOnly = false, mapId }: RoadmapEditorProps) {
  const [newNodeName, setNewNodeName] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  const [clickedNode, setClickedNode] = useState<Node<CustomNodeData> | null>(null)
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

  const initialNodes: Node<CustomNodeData>[] = useMemo(() => {
    return initialData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: { label: node.data.label, status: node.data.status, isEditing: false, color: node.data.color, resources: node.data.resources },
    }))
  }, [initialData])

  const initialEdges: Edge[] = useMemo(() => {
    return initialData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }))
  }, [initialData])

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodeIds(new Set(selectedNodes.map((n) => n.id)))
  }, [])

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<CustomNodeData>) => {
    if (event.shiftKey || readOnly) {
      return
    }
    setClickedNode(node)
    setShowPanel(true)
  }, [readOnly])

  const closePanel = useCallback(() => {
    setShowPanel(false)
    setTimeout(() => setClickedNode(null), 300)
  }, [])

  const [newResourceUrl, setNewResourceUrl] = useState('')
  const [newResourceTitle, setNewResourceTitle] = useState('')

  const addResource = useCallback(() => {
    if (!newResourceUrl.trim() || !newResourceTitle.trim() || !clickedNode) return

    const newEnlace = { nombre: newResourceTitle, url: newResourceUrl }
    const currentResources = clickedNode.data.resources?.enlaces || []

    setNodes((nds) =>
      nds.map((node) =>
        node.id === clickedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                resources: {
                  enlaces: [...currentResources, newEnlace],
                },
              },
            }
          : node
      )
    )

    setClickedNode((prev) =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              resources: {
                enlaces: [...currentResources, newEnlace],
              },
            },
          }
        : null
    )

    setNewResourceUrl('')
    setNewResourceTitle('')
  }, [newResourceUrl, newResourceTitle, clickedNode, setNodes])

  const changeStatus = useCallback((newStatus: string) => {
    if (!clickedNode) return

    setNodes((nds) =>
      nds.map((node) =>
        node.id === clickedNode.id
          ? { ...node, data: { ...node.data, status: newStatus } }
          : node
      )
    )

    setClickedNode((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, status: newStatus } }
        : null
    )
  }, [clickedNode, setNodes])

  const onConnect: OnConnect = useCallback((connection) => {
    if (connection.source && connection.target) {
      setEdges((eds) => addEdge({ 
        ...connection, 
        id: `e${connection.source}-${connection.target}`,
        style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 } 
      }, eds))
    }
  }, [setEdges])

  const [layoutDirection, setLayoutDirection] = useState<'horizontal' | 'vertical'>('vertical')

  const getLayoutedElements = useCallback((nodes: Node[], edges: Edge[], direction: 'horizontal' | 'vertical') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    const nodeWidth = 200
    const nodeHeight = 120
    
    dagreGraph.setGraph({ rankdir: direction })
    
    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })
    
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })
    
    dagre.layout(dagreGraph)
    
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      }
    })
    
    return { nodes: layoutedNodes, edges }
  }, [])

  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes } = getLayoutedElements(
      [...nodes],
      [...edges],
      layoutDirection
    )
    setNodes(layoutedNodes)
  }, [nodes, edges, layoutDirection, getLayoutedElements, setNodes])

  const addNode = () => {
    if (!newNodeName.trim()) return
    
    const newId = String(Math.max(...nodes.map((n) => parseInt(n.id)), 0) + 1)
    const newNode: Node<CustomNodeData> = {
      id: newId,
      type: 'custom',
      position: { 
        x: 250 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
      data: { label: newNodeName, status: 'pendiente', isEditing: false },
    }
    
    setNodes((nds) => [...nds, newNode])
    setNewNodeName('')
    setShowAddInput(false)
  }

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return
    
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)))
    setEdges((eds) => eds.filter((edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)))
    setSelectedNodeIds(new Set())
  }, [selectedNodeIds, setNodes, setEdges])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        event.preventDefault()
        deleteSelectedNodes()
      }
    }
  }, [deleteSelectedNodes, readOnly])

  const handleUpdateNodeLabel = useCallback((event: CustomEvent<{ id: string; label: string }>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === event.detail.id
          ? { ...node, data: { ...node.data, label: event.detail.label, isEditing: false } }
          : node
      )
    )
  }, [setNodes])

  const handleEditNodeLabel = useCallback((event: CustomEvent<{ id: string }>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === event.detail.id
          ? { ...node, data: { ...node.data, isEditing: true } }
          : { ...node, data: { ...node.data, isEditing: false } }
      )
    )
  }, [setNodes])

  const changeNodeColor = useCallback((color: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        selectedNodeIds.has(node.id)
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    )
  }, [selectedNodeIds, setNodes])

  const exportMap = useCallback(() => {
    const mapData = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type === 'custom' ? undefined : node.type,
        position: node.position,
        data: {
          label: node.data.label,
          status: node.data.status,
          color: node.data.color,
          resources: node.data.resources,
        },
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated,
        label: (edge as any).label,
      })),
    }

    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roadmap.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener)
    window.addEventListener('editNodeLabel', handleEditNodeLabel as EventListener)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('updateNodeLabel', handleUpdateNodeLabel as EventListener)
      window.removeEventListener('editNodeLabel', handleEditNodeLabel as EventListener)
    }
  }, [handleKeyDown, handleUpdateNodeLabel, handleEditNodeLabel])

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      {showCursor && !readOnly && (
        <div 
          className="cursor-glow"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y,
          }}
        />
      )}
      {!readOnly && (
        <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
          <button
            onClick={() => {
              const currentMapId = mapId || `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              sessionStorage.setItem(currentMapId, JSON.stringify({ nodes, edges }))
              window.open(`/roadmap-viewer?id=${currentMapId}`, '_blank')
            }}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
          >
            Modo Lectura
          </button>

          {showAddInput ? (
            <div className="flex gap-2">
              <input
                autoFocus
                className="px-3 py-2 rounded-full text-sm outline-none"
                style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                placeholder="Nombre del nodo..."
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNode()
                  if (e.key === 'Escape') setShowAddInput(false)
                }}
              />
              <button
                onClick={addNode}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#10b981', color: 'white' }}
              >
                Añadir
              </button>
              <button
                onClick={() => { setShowAddInput(false); setNewNodeName('') }}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowAddInput(true)}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-surface)' }}
              >
                + Añadir nodo
              </button>
              <button
                onClick={exportMap}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-surface)' }}
              >
                Exportar
              </button>
              <button
                onClick={() => { setLayoutDirection('vertical'); autoLayout() }}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
              >
                Organizar
              </button>
            </>
          )}

          {selectedNodeIds.size > 0 && (
            <>
              <button
                onClick={deleteSelectedNodes}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
              >
                Eliminar ({selectedNodeIds.size})
              </button>
              <div className="flex gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => changeNodeColor(color)}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: color, 
                      borderColor: selectedNodeIds.size === 1 
                        ? nodes.find(n => n.id === [...selectedNodeIds][0])?.data.color === color 
                          ? 'var(--color-on-surface)' 
                          : 'transparent'
                        : 'transparent'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {readOnly && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
          >
            ← Volver
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20">
        <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
          {readOnly 
            ? 'Click en un nodo para ver recursos' 
            : 'Click para seleccionar • Doble click para editar • Delete para eliminar'}
        </p>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: 'var(--color-surface)' }}
        selectNodesOnDrag={false}
        panOnScroll={false}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
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
            return statusColors[status] || statusColors.pendiente
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
            {readOnly ? (
              <p className="text-sm mt-1" style={{ color: statusColors[clickedNode.data.status] || statusColors.pendiente }}>
                {getStatusSymbol(clickedNode.data.status)}
              </p>
            ) : (
              <select
                value={clickedNode.data.status}
                onChange={(e) => changeStatus(e.target.value)}
                className="mt-1 px-2 py-1 rounded text-sm outline-none w-full"
                style={{ 
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: statusColors[clickedNode.data.status] || statusColors.pendiente,
                  border: '1px solid var(--color-outline)',
                }}
              >
                <option value="pendiente">○ Pendiente</option>
                <option value="estudiando">⏳ Estudiando</option>
                <option value="aprendido">✓ Aprendido</option>
              </select>
            )}
          </div>

          {(clickedNode.data.resources?.enlaces && clickedNode.data.resources.enlaces.length > 0) && (
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
                {!readOnly && (
                <div className="flex flex-col gap-2 mt-10">
                  <input
                    className="px-2 py-1 rounded text-sm outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline)',
                    }}
                    placeholder="Título del recurso"
                    value={newResourceTitle}
                    onChange={(e) => setNewResourceTitle(e.target.value)}
                  />
                  <input
                    className="px-2 py-1 rounded text-sm outline-none"
                    style={{ 
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline)',
                    }}
                    placeholder="URL del recurso"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                  />
                  <button
                    onClick={addResource}
                    className="px-3 py-1 rounded-full text-sm font-bold transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                  >
                    Añadir recurso
                  </button>
                </div>
              )}
            </div>
          )}

          {!readOnly && (
            <div>
              <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Notas
              </h3>
              <textarea
                className="w-full h-40 p-2 rounded text-sm outline-none resize-none"
                style={{ 
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-outline)',
                }}
                placeholder="Añade tus notas aquí..."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
