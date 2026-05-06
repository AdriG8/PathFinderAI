// Importa hooks de React
import { useState, useCallback, useEffect, useMemo } from 'react'
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
  useNodesState,
  useEdgesState,
  type ReactFlowInstance,
} from 'reactflow'
import dagre from 'dagre'
import 'reactflow/dist/style.css'

// Importa utilidades de sanitización
import { sanitizeUrl } from '../utils/sanitize'
// Importa utilidades del hook
import { getStatusColor, DEFAULT_NODE_COLORS, type RoadmapNodeData, calculateRoadmapStats } from '../hooks/useRoadmap'

// =============================================
// INTERFACES
// =============================================

interface RoadmapEditorProps {
  initialData: any
  readOnly?: boolean
  mapId?: string
  onSave?: (data: any) => void
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================

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

// =============================================
// COMPONENTE PERSONALIZADO DE NODO
// =============================================

const CustomNode = ({ data, id }: { data: RoadmapNodeData; id: string }) => {
  const color = data.color || getStatusColor(data.status)

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

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export default function RoadmapEditor({ initialData, readOnly = false, mapId, onSave }: RoadmapEditorProps) {
  // Estados locales de UI
  const [newNodeName, setNewNodeName] = useState('')
  const [showAddInput, setShowAddInput] = useState(false)
  const [clickedNode, setClickedNode] = useState<Node<RoadmapNodeData> | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  const [newResourceUrl, setNewResourceUrl] = useState('')
  const [newResourceTitle, setNewResourceTitle] = useState('')
  const [layoutDirection] = useState<'horizontal' | 'vertical'>('vertical')
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance | null>(null)

  // Preparar datos iniciales para ReactFlow
  const initialNodes = useMemo(() => {
    if (!initialData?.nodes) return []
    return initialData.nodes.map((node: any) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: {
        label: node.data.label,
        status: node.data.status,
        isEditing: false,
        color: node.data.color,
        horas: node.data.horas,
        resources: node.data.resources,
      },
    }))
  }, [initialData])

  const initialEdges = useMemo(() => {
    if (!initialData?.edges) return []
    return initialData.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }))
  }, [initialData])

  // Hooks oficiales de ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState<RoadmapNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())

  // Calcular estadísticas del roadmap
  const stats = useMemo(() => calculateRoadmapStats(nodes), [nodes])

  // Callback de selección
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodeIds(new Set(selectedNodes.map((n) => n.id)))
  }, [])

  // Click en nodo
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<RoadmapNodeData>) => {
    if (event.shiftKey || readOnly) return
    setClickedNode(node)
    setShowPanel(true)
  }, [readOnly])

  // Arrastre de nodo
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node<RoadmapNodeData>) => {
    if (clickedNode && clickedNode.id === node.id) {
      setClickedNode(node)
    }
  }, [clickedNode])

  // Cerrar panel
  const closePanel = useCallback(() => {
    setShowPanel(false)
    setTimeout(() => setClickedNode(null), 300)
  }, [])

  // Añadir nodo
  const addNode = useCallback(() => {
    if (!newNodeName.trim()) return
    const newId = String(Math.max(...nodes.map((n) => parseInt(n.id) || 0), 0) + 1)
    const newNode: Node<RoadmapNodeData> = {
      id: newId,
      type: 'custom',
      position: { x: 250 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: newNodeName, status: 'pendiente', isEditing: false, horas: 0, resources: { enlaces: [] } },
    }
    setNodes((nds) => [...nds, newNode])
    setNewNodeName('')
    setShowAddInput(false)
  }, [newNodeName, nodes, setNodes])

  // Añadir recurso
  const addResource = useCallback(() => {
    if (!newResourceUrl.trim() || !newResourceTitle.trim() || !clickedNode) return
    const newEnlace = { nombre: newResourceTitle, url: newResourceUrl }
    const currentResources = clickedNode.data.resources?.enlaces || []
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === clickedNode.id
          ? { ...node, data: { ...node.data, resources: { enlaces: [...currentResources, newEnlace] } } }
          : node
      )
    )
    
    setClickedNode((prev) => prev ? { ...prev, data: { ...prev.data, resources: { enlaces: [...currentResources, newEnlace] } } } : null)
    setNewResourceUrl('')
    setNewResourceTitle('')
  }, [clickedNode, setNodes])

  // Cambiar estado
  const changeStatus = useCallback((status: string) => {
    if (!clickedNode) return
    setNodes((nds) => nds.map((node) => node.id === clickedNode.id ? { ...node, data: { ...node.data, status } } : node))
    setClickedNode((prev) => prev ? { ...prev, data: { ...prev.data, status } } : null)
  }, [clickedNode, setNodes])

  // Cambiar color
  const changeNodeColor = useCallback((color: string) => {
    setNodes((nds) => nds.map((node) => selectedNodeIds.has(node.id) ? { ...node, data: { ...node.data, color } } : node))
  }, [selectedNodeIds, setNodes])

  // Callback de conexión
  const onConnect: OnConnect = useCallback((connection) => {
    if (!connection.source || !connection.target) return
    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }
    setEdges((eds) => [...eds, newEdge])
  }, [setEdges])

  // Auto layout
  const autoLayout = useCallback(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: layoutDirection })
    
    const nodeWidth = 200
    const nodeHeight = 120
    
    nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }))
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target))
    
    dagre.layout(dagreGraph)
    
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return { ...node, position: { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 } }
    })
    
    setNodes(layoutedNodes)
  }, [nodes, edges, layoutDirection, setNodes])

  // Eliminar nodos seleccionados
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)))
    setEdges((eds) => eds.filter((edge: Edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)))
    setSelectedNodeIds(new Set())
  }, [selectedNodeIds, setNodes, setEdges])

  // Exportar JSON
  const exportMap = useCallback((type: 'json' | 'image') => {
    if (type === 'json') {
      const mapData = {
        nodes: nodes.map((node) => ({
          id: node.id,
          position: node.position,
          data: { label: node.data.label, status: node.data.status, color: node.data.color, horas: node.data.horas, resources: node.data.resources },
        })),
        edges: edges.map((edge: Edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          animated: edge.animated,
        })),
      }
      const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'roadmap.json'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      setIsExporting(true)
      setTimeout(async () => {
        const html2canvas = (await import('html2canvas')).default
        if (flowInstance) flowInstance.fitView({ padding: 0.2, duration: 300 })
        await new Promise((resolve) => setTimeout(resolve, 350))
        const flowElement = document.querySelector('.react-flow') as HTMLElement
        if (flowElement) {
          const canvas = await html2canvas(flowElement, { backgroundColor: '#1a1a2e', scale: 2, useCORS: true, allowTaint: true })
          const link = document.createElement('a')
          link.download = 'roadmap.png'
          link.href = canvas.toDataURL('image/png')
          link.click()
        }
        setIsExporting(false)
      }, 100)
    }
    setShowExportModal(false)
  }, [nodes, edges, flowInstance])

  // Manejar teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly) return
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.target as HTMLElement
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        event.preventDefault()
        deleteSelectedNodes()
      }
    }
  }, [readOnly, deleteSelectedNodes])

  // Actualizar label
  const handleUpdateNodeLabel = useCallback((event: CustomEvent<{ id: string; label: string }>) => {
    setNodes((nds) => nds.map((node) => node.id === event.detail.id ? { ...node, data: { ...node.data, label: event.detail.label, isEditing: false } } : node))
  }, [setNodes])

  // Editar label
  const handleEditNodeLabel = useCallback((event: CustomEvent<{ id: string }>) => {
    setNodes((nds) => nds.map((node) => node.id === event.detail.id ? { ...node, data: { ...node.data, isEditing: true } } : { ...node, data: { ...node.data, isEditing: false } }))
  }, [setNodes])

  // Guardar
  const handleSave = useCallback(() => {
    const data = { nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })), edges: edges.map((e: Edge) => ({ id: e.id, source: e.source, target: e.target, animated: e.animated })) }
    if (onSave) onSave(data)
    else if (mapId) { sessionStorage.setItem(mapId, JSON.stringify(data)); alert('Guardado en sessionStorage') }
  }, [nodes, edges, onSave, mapId])

  // Abrir modo lectura
  const openReadOnlyMode = useCallback(() => {
    const currentMapId = mapId || `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const data = { nodes: nodes.map((n) => ({ id: n.id, type: n.type, position: n.position, data: n.data })), edges: edges.map((e: Edge) => ({ id: e.id, source: e.source, target: e.target, animated: e.animated })) }
    sessionStorage.setItem(currentMapId, JSON.stringify(data))
    window.open(`/roadmap-viewer?id=${currentMapId}`, '_blank')
  }, [mapId, nodes, edges])

  // Efectos
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMousePos({ x: e.clientX, y: e.clientY }); setShowCursor(true) }
    const handleMouseLeave = () => setShowCursor(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // =============================================
  // RENDER
  // =============================================

  return (
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      
      {showCursor && !readOnly && (
        <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />
      )}
      
      {!readOnly && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {showAddInput ? (
            <div className="flex flex-col gap-2 p-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              <input autoFocus className="px-3 py-2 rounded-full text-sm" style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }} placeholder="Nombre del nodo..." value={newNodeName} onChange={(e) => setNewNodeName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addNode(); if (e.key === 'Escape') setShowAddInput(false) }} />
              <div className="flex gap-2">
                <button onClick={addNode} className="flex-1 px-3 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: '#10b981', color: 'white' }}>Añadir</button>
                <button onClick={() => { setShowAddInput(false); setNewNodeName('') }} className="flex-1 px-3 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <button onClick={() => setShowAddInput(true)} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#10b981', color: 'white' }}>+ Añadir</button>
              <button onClick={() => setShowExportModal(true)} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>Exportar</button>
              <button onClick={autoLayout} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#f59e0b', color: 'white' }}>Organizar</button>
              {mapId && <button onClick={handleSave} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#3b82f6', color: 'white' }}>Guardar</button>}
            </>
          )}

          {selectedNodeIds.size > 0 && (
            <>
              <button onClick={deleteSelectedNodes} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: '#ef4444', color: 'white' }}>Eliminar ({selectedNodeIds.size})</button>
              <div className="flex flex-wrap gap-1 p-2 rounded-xl" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                {DEFAULT_NODE_COLORS.map((color) => (
                  <button key={color} onClick={() => changeNodeColor(color)} className="w-7 h-7 rounded-full border-2" style={{ backgroundColor: color, borderColor: selectedNodeIds.size === 1 && nodes.find(n => n.id === [...selectedNodeIds][0])?.data.color === color ? 'var(--color-on-surface)' : 'transparent' }} />
                ))}
              </div>
            </>
          )}
          
          <button onClick={openReadOnlyMode} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Modo Lectura</button>
        </div>
      )}

      {readOnly && (
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => window.history.back()} className="px-4 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>← Volver</button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20">
        <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{readOnly ? 'Click en un nodo para ver recursos' : 'Click para seleccionar • Doble click para editar • Delete para eliminar'}</p>
      </div>

      {!readOnly && stats.total > 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline)' }}>
          <div className="flex items-center gap-6 text-xs">
            <div className="text-center">
              <p className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>{stats.progreso}%</p>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Progreso</p>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: 'var(--color-outline)' }} />
            <div className="text-center">
              <p className="font-bold" style={{ color: '#10b981' }}>{stats.completados}</p>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Completados</p>
            </div>
            <div className="text-center">
              <p className="font-bold" style={{ color: '#f59e0b' }}>{stats.enProceso}</p>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>En proceso</p>
            </div>
            <div className="text-center">
              <p className="font-bold" style={{ color: 'var(--color-on-surface-variant)' }}>{stats.pendientes}</p>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Pendientes</p>
            </div>
            <div className="w-px h-8" style={{ backgroundColor: 'var(--color-outline)' }} />
            <div className="text-center">
              <p className="font-bold" style={{ color: 'var(--color-on-surface)' }}>{stats.horasRestantes}h</p>
              <p style={{ color: 'var(--color-on-surface-variant)' }}>Restantes</p>
            </div>
          </div>
        </div>
      )}
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setFlowInstance}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: 'var(--color-surface)' }}
        selectNodesOnDrag={false}
        panOnScroll={false}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
      >
        <Background color="#ffffff" gap={20} size={1} style={{ opacity: 0.1 }} />
        <Controls style={{ backgroundColor: 'var(--color-surface-container-low)', borderRadius: '8px' }} />
        <MiniMap nodeColor={(node) => getStatusColor(node.data?.status)} style={{ backgroundColor: 'var(--color-surface-container-low)' }} />
      </ReactFlow>

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExportModal(false)} />
          <div className="relative z-10 p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--color-on-surface)' }}>Exportar como</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => exportMap('json')} disabled={isExporting} className="w-full px-4 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>📄 JSON</button>
              <button onClick={() => exportMap('image')} disabled={isExporting} className="w-full px-4 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--color-secondary)', color: 'white' }}>{isExporting ? 'Exportando...' : '🖼️ Imagen'}</button>
            </div>
            <button onClick={() => setShowExportModal(false)} className="mt-4 w-full px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Cancelar</button>
          </div>
        </div>
      )}

      {clickedNode && showPanel && (
        <div className="absolute top-0 right-0 h-full w-80 z-30 p-4 overflow-y-auto" style={{ backgroundColor: 'var(--color-surface-container-low)', borderLeft: '1px solid var(--color-outline)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>{clickedNode.data.label}</h2>
            <button onClick={closePanel} className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>✕</button>
          </div>

          <div className="mb-4">
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Estado</span>
            {readOnly ? (
              <p className="text-sm mt-1" style={{ color: getStatusColor(clickedNode.data.status) }}>{getStatusSymbol(clickedNode.data.status)}</p>
            ) : (
              <select value={clickedNode.data.status} onChange={(e) => changeStatus(e.target.value)} className="mt-1 px-2 py-1 rounded text-sm w-full" style={{ backgroundColor: 'var(--color-surface-container-high)', color: getStatusColor(clickedNode.data.status), border: '1px solid var(--color-outline)' }}>
                <option value="pendiente">○ Pendiente</option>
                <option value="estudiando">⏳ Estudiando</option>
                <option value="aprendido">✓ Aprendido</option>
              </select>
            )}
          </div>

          {!readOnly && (
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-on-surface-variant)' }}>Horas Estimadas</span>
              <input
                type="number"
                min="0"
                value={clickedNode.data.horas || 0}
                onChange={(e) => {
                  const horas = parseInt(e.target.value) || 0
                  setNodes((nds) => nds.map((n) => n.id === clickedNode.id ? { ...n, data: { ...n.data, horas } } : n))
                  setClickedNode({ ...clickedNode, data: { ...clickedNode.data, horas } })
                }}
                className="mt-1 px-2 py-1 rounded text-sm w-full"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }}
              />
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>Recursos</h3>
            <ul className="space-y-2">
              {(clickedNode.data.resources?.enlaces || []).map((enlace, index) => {
                const safeUrl = sanitizeUrl(enlace.url)
                if (!safeUrl) return null
                return (
                  <li key={index}>
                    <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--color-primary)' }}>{enlace.nombre}</a>
                  </li>
                )
              })}
            </ul>

            {!readOnly && (
              <div className="flex flex-col gap-2 mt-4">
                <input className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }} placeholder="Título del recurso" value={newResourceTitle} onChange={(e) => setNewResourceTitle(e.target.value)} />
                <input className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }} placeholder="URL del recurso" value={newResourceUrl} onChange={(e) => setNewResourceUrl(e.target.value)} />
                <button onClick={addResource} className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>Añadir recurso</button>
              </div>
            )}
          </div>

          {!readOnly && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-on-surface)' }}>Notas</h3>
              <textarea className="w-full h-40 p-2 rounded text-sm" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }} placeholder="Añade tus notas aquí..." />
            </div>
          )}
        </div>
      )}
    </div>
  )
}