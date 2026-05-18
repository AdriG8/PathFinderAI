// Importa hooks de React
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
// Importa modal de examen
import ExamModal from './ExamModal'

// =============================================
// CONSTANTES
// =============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// =============================================
// INTERFAZ DE PROPS DEL EDITOR
// =============================================

interface RoadmapEditorProps {
  initialData: any              // Datos iniciales del roadmap (nodes y edges)
  readOnly?: boolean           // Modo lectura (sin edición)
  mapId?: string              // ID del roadmap para guardar
  onSave?: (data: any) => void // Callback para guardar cambios
  autoLayoutOnMount?: boolean // Si true, ordena el mapa automáticamente al cargar
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
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px] text-center cursor-pointer"
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        border: `2px solid ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: color, left: -6 }} />
      
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
          className="text-sm font-medium cursor-text"
          style={{ color: 'var(--color-on-surface)' }}
          onDoubleClick={(e) => {
            e.stopPropagation()
            const event = new CustomEvent('editNodeLabel', { detail: { id } })
            window.dispatchEvent(event)
          }}
        >
          {data.label}
        </div>
      )}
      
      <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
        {getStatusSymbol(data.status)}
      </div>
      
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: color, right: -6 }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// =============================================
// COMPONENTE PRINCIPAL
// =============================================

export default function RoadmapEditor({ initialData, readOnly = false, mapId, onSave, autoLayoutOnMount = false }: RoadmapEditorProps) {
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
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [showExamModal, setShowExamModal] = useState(false)
  const [examNodeId, setExamNodeId] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const [pendingDeleteInfo, setPendingDeleteInfo] = useState<{ count: number; rootNodes: string[]; childCount: number } | null>(null)
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const hasAutoLayoutRun = useRef(false)

  // Función para calcular posiciones de nodos usando dagre
  const calculatePositions = (nodes: any[], edges: any[]) => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 80 })
    
    const nodeWidth = 200
    const nodeHeight = 120
    
    nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }))
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target))
    
    dagre.layout(dagreGraph)
    
    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      if (nodeWithPosition) {
        return { ...node, position: { x: nodeWithPosition.x - nodeWidth / 2, y: nodeWithPosition.y - nodeHeight / 2 } }
      }
      return { ...node, position: { x: Math.random() * 200, y: Math.random() * 200 } }
    })
  }

  // Preparar datos iniciales para ReactFlow
  const initialNodes = useMemo(() => {
    if (!initialData?.nodes) return []
    
    const nodesWithPosition = initialData.nodes.map((node: any) => ({
      id: node.id,
      type: 'custom', // Normalizar todos los tipos a custom
      position: node.position || { x: 0, y: 0 },
      data: {
        label: node.data?.label || '',
        status: node.data?.status || 'pendiente',
        isEditing: false,
        color: node.data?.color,
        horas: node.data?.horas || 0,
        notes: node.data?.notes || '',
        resources: node.data?.resources || { enlaces: [] },
      },
    }))
    
    // Si hay nodos sin posición, calcular posiciones
    const hasPositions = nodesWithPosition.some((n: any) => n.position?.x !== undefined && n.position?.y !== undefined)
    if (!hasPositions && nodesWithPosition.length > 0) {
      return calculatePositions(nodesWithPosition, initialData.edges || [])
    }
    
    return nodesWithPosition
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

  // Ref para forzar seleccion manual
  const forceSelectionRef = useRef<Set<string> | null>(null)

  // Callback de seleccion (solo para seleccion por arrastre/selection box)
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    if (forceSelectionRef.current) return
    setSelectedNodeIds(new Set(selectedNodes.map((n) => n.id)))
  }, [])

  // Click en el fondo - deseleccionar todo y cerrar panel
  const onPaneClick = useCallback(() => {
    setSelectedNodeIds(new Set())
    setShowPanel(false)
    setTimeout(() => setClickedNode(null), 300)
  }, [])

  // Click en nodo - abre el panel de recursos y selecciona el nodo
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<RoadmapNodeData>) => {
    console.log('onNodeClick called', node.id, readOnly)
    event.stopPropagation()
    if (event.shiftKey) return
    const newSelection = new Set([node.id])
    forceSelectionRef.current = newSelection
    setClickedNode(node)
    setShowPanel(true)
    setSelectedNodeIds(newSelection)
    if (!readOnly) setShowToolsMenu(true)
    setTimeout(() => { forceSelectionRef.current = null }, 500)
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
    const newEnlace = { title: newResourceTitle, url: newResourceUrl, type: 'documentacion' }
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
    if (status === 'aprendido') {
      setExamNodeId(clickedNode.id)
      setShowExamModal(true)
      return
    }
    setNodes((nds) => nds.map((node) => node.id === clickedNode.id ? { ...node, data: { ...node.data, status } } : node))
    setClickedNode((prev) => prev ? { ...prev, data: { ...prev.data, status } } : null)
  }, [clickedNode, setNodes])

  // Marcar nodo como completado tras aprobar examen
  const handleExamPass = useCallback(() => {
    if (!examNodeId) return
    setNodes((nds) => nds.map((node) => node.id === examNodeId ? { ...node, data: { ...node.data, status: 'aprendido' } } : node))
    setClickedNode((prev) => prev && prev.id === examNodeId ? { ...prev, data: { ...prev.data, status: 'aprendido' } } : null)
    setShowExamModal(false)
    setExamNodeId(null)
  }, [examNodeId, setNodes])

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

  // ============================================
  // FUNCION: Auto layout con Dagre
  // Organiza los nodos automaticamente en forma de grafo
  // ============================================
  const autoLayout = useCallback(() => {
    if (nodes.length === 0) return

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

  // ============================================
  // FUNCION: Buscar recursos con Wikipedia + YouTube
  // Llama al endpoint de busqueda y añade los enlaces encontrados
  // ============================================
  const handleSearchResources = useCallback(async () => {
    // Verifica que hay un nodo seleccionado
    if (!clickedNode) return
    setIsSearching(true)
    try {
      // Obtiene el token de autenticacion
      const token = localStorage.getItem('token')
      // Realiza la peticion al endpoint de busqueda
      const response = await fetch(`${API_URL}/api/search-resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: clickedNode.data.label }),
      })
      // Procesa la respuesta
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        // Transforma los resultados al formato de enlaces
        const newEnlaces = data.results.map((r: any) => ({ title: r.title, url: r.url, type: r.type || 'documentacion', channel: r.channel }))
        const currentEnlaces = clickedNode.data.resources?.enlaces || []
        // Actualiza los nodos y el nodo seleccionado
        setNodes((nds) => nds.map((n) => n.id === clickedNode.id ? { ...n, data: { ...n.data, resources: { enlaces: [...currentEnlaces, ...newEnlaces] } } } : n))
        setClickedNode((prev) => prev ? { ...prev, data: { ...prev.data, resources: { enlaces: [...currentEnlaces, ...newEnlaces] } } } : null)
      }
    } catch (error) {
      console.error('Error buscando recursos:', error)
    } finally {
      setIsSearching(false)
    }
  }, [clickedNode, setNodes])

  // ============================================
  // FUNCION: Obtener el padre directo de un nodo
  // Devuelve el ID del nodo padre o null si no tiene
  // ============================================
  const getParentNode = useCallback((nodeId: string, currentEdges: Edge[]): string | null => {
    const parentEdge = currentEdges.find(edge => edge.target === nodeId)
    return parentEdge ? parentEdge.source : null
  }, [])

  // ============================================
  // FUNCION: Obtener todos los hijos directos de un nodo
  // Devuelve un array con los IDs de los nodos hijos
  // ============================================
  const getChildNodes = useCallback((nodeId: string, currentEdges: Edge[]): string[] => {
    return currentEdges
      .filter(edge => edge.source === nodeId)
      .map(edge => edge.target)
  }, [])

  // ============================================
  // FUNCION: Eliminar nodo con reasignacion de dependencias
  // Cuando se elimina un nodo, los nodos hijos pasan a depender
  // del padre del nodo eliminado (si existe)
  // ============================================
  const deleteNodeWithReassignment = useCallback((nodeIdToDelete: string, currentNodes: Node[], currentEdges: Edge[]) => {
    const parentId = getParentNode(nodeIdToDelete, currentEdges)
    const childIds = getChildNodes(nodeIdToDelete, currentEdges)

    let newEdges = currentEdges.filter(
      edge => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete
    )

    if (parentId && childIds.length > 0) {
      const existingConnections = new Set(
        currentEdges
          .filter(e => e.source === parentId)
          .map(e => e.target)
      )

      childIds.forEach(childId => {
        if (!existingConnections.has(childId) && childId !== parentId) {
          newEdges.push({
            id: `e${parentId}-${childId}`,
            source: parentId,
            target: childId,
            style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
          })
        }
      })
    } else if (!parentId && childIds.length > 0) {
      console.log(`Nodo raiz eliminado: los nodos [${childIds.join(', ')}] quedan como nodos raiz`)
    }

    const newNodes = currentNodes.filter(node => node.id !== nodeIdToDelete)
    return { newNodes, newEdges }
  }, [getParentNode, getChildNodes])

  // ============================================
  // FUNCION: Verificar si un nodo es raiz (no tiene padre)
  // ============================================
  const isRootNode = useCallback((nodeId: string, currentEdges: Edge[]): boolean => {
    return !currentEdges.some(edge => edge.target === nodeId)
  }, [])

  // ============================================
  // FUNCION: Ejecutar eliminacion real de nodos seleccionados
  // Esta funcion es llamada despues de la confirmacion
  // ============================================
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return

    let currentNodes = nodes
    let currentEdges = edges

    const sortedNodeIds = Array.from(selectedNodeIds).sort((a, b) => {
      const indexA = currentNodes.findIndex(n => n.id === a)
      const indexB = currentNodes.findIndex(n => n.id === b)
      return indexA - indexB
    })

    sortedNodeIds.forEach(nodeId => {
      const result = deleteNodeWithReassignment(nodeId, currentNodes, currentEdges)
      currentNodes = result.newNodes
      currentEdges = result.newEdges
    })

    setNodes(currentNodes)
    setEdges(currentEdges)
    setSelectedNodeIds(new Set())
  }, [selectedNodeIds, nodes, edges, deleteNodeWithReassignment])

  // ============================================
  // FUNCION: Eliminar nodos seleccionados (con reasignacion y confirmacion)
  // ============================================
  const handleDeleteWithConfirmation = useCallback(() => {
    if (selectedNodeIds.size === 0) return

    const rootNodes: string[] = []
    let totalChildren = 0

    selectedNodeIds.forEach(nodeId => {
      if (isRootNode(nodeId, edges)) {
        const children = getChildNodes(nodeId, edges)
        rootNodes.push(nodeId)
        totalChildren += children.length
      }
    })

    if (rootNodes.length > 0) {
      setPendingDeleteInfo({ count: selectedNodeIds.size, rootNodes, childCount: totalChildren })
      setShowDeleteConfirmModal(true)
    } else {
      deleteSelectedNodes()
    }
  }, [selectedNodeIds, edges, isRootNode, getChildNodes, deleteSelectedNodes])

  const confirmDelete = useCallback(() => {
    deleteSelectedNodes()
    setShowDeleteConfirmModal(false)
    setPendingDeleteInfo(null)
  }, [deleteSelectedNodes])

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirmModal(false)
    setPendingDeleteInfo(null)
  }, [])

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
        handleDeleteWithConfirmation()
      }
    }
  }, [readOnly, handleDeleteWithConfirmation])

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

  // Efectos - Auto layout solo una vez al cargar
  useEffect(() => {
    // Reset del flag cuando cambian los datos iniciales
    if (initialData?.nodes && initialData.nodes.length > 0) {
      hasAutoLayoutRun.current = false
    }
  }, [initialData])

  useEffect(() => {
    if (autoLayoutOnMount && nodes.length > 0 && !hasAutoLayoutRun.current) {
      hasAutoLayoutRun.current = true
      console.log("Ejecutando auto layout para", nodes.length, "nodos")
      const timer = setTimeout(() => {
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

        setTimeout(() => {
          const instance = flowInstance
          console.log("1. Verificando instance:", instance)
          if (instance) {
            console.log("2. Ejecutando fitView")
            instance.fitView()
            setTimeout(() => {
              console.log("3. Ejecutando zoom")
              instance.zoomTo(0.5, { duration: 500 })
              console.log("4. Zoom ajustado")
            }, 300)
          } else {
            console.log("flowInstance aun no disponible")
          }
        }, 500)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoLayoutOnMount, nodes.length, edges.length])

  // Efecto separado para zoom cuando flowInstance esté listo
  useEffect(() => {
    if (flowInstance && autoLayoutOnMount && nodes.length > 0 && hasAutoLayoutRun.current) {
      console.log("flowInstance listo, ejecutando zoom")
      setTimeout(() => {
        if (flowInstance) {
          flowInstance.zoomTo(1, { duration: 500 })
        }
      }, 300)
    }
  }, [flowInstance, autoLayoutOnMount, nodes.length])

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
        <div className="absolute top-4 left-4 z-20">
          {/* Boton principal del menu de herramientas */}
          <button
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Herramientas
            <svg className={`w-4 h-4 transition-transform ${showToolsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          
          {showToolsMenu && (
            <div
              className="absolute top-full left-0 mt-2 py-2 rounded-xl shadow-xl min-w-[200px] z-30"
              style={{ backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline)' }}
            >
              {/* Input para anadir nodo */}
              {showAddInput ? (
                <div className="px-3 pb-2">
                  <input
                    autoFocus
                    className="w-full px-3 py-2 rounded-lg text-sm mb-2"
                    style={{ backgroundColor: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}
                    placeholder="Nombre del nodo..."
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addNode(); if (e.key === 'Escape') { setShowAddInput(false); setNewNodeName('') } }}
                  />
                  <div className="flex gap-2">
                    <button onClick={addNode} className="flex-1 px-3 py-1.5 rounded-lg font-bold text-xs" style={{ backgroundColor: '#047857', color: 'white' }}>Añadir</button>
                    <button onClick={() => { setShowAddInput(false); setNewNodeName('') }} className="flex-1 px-3 py-1.5 rounded-lg font-bold text-xs" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddInput(true)}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                  style={{ color: '#10b981' }}
                >
                  <span className="text-lg">+</span> Añadir nodo
                </button>
              )}

              <div className="h-px my-2" style={{ backgroundColor: 'var(--color-outline)' }} />

              <button
                onClick={() => { autoLayout(); setShowToolsMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                style={{ color: '#f59e0b' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Organizar
              </button>

              <button
                onClick={() => { setShowExportModal(true); setShowToolsMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                style={{ color: '#8b5cf6' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Exportar
              </button>

              {mapId && (
                <button
                  onClick={() => { handleSave(); setShowToolsMenu(false) }}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                  style={{ color: '#3b82f6' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar
                </button>
              )}

              <div className="h-px my-2" style={{ backgroundColor: 'var(--color-outline)' }} />

              <button
                onClick={() => { openReadOnlyMode(); setShowToolsMenu(false) }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                style={{ color: 'var(--color-on-surface-variant)' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Modo Lectura
              </button>

              {selectedNodeIds.size > 0 && (
                <>
                  <div className="h-px my-2" style={{ backgroundColor: 'var(--color-outline)' }} />

                  <button
                    onClick={handleDeleteWithConfirmation}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                    style={{ color: '#b91c1c' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar ({selectedNodeIds.size})
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-3 transition-colors hover:bg-white/5"
                      style={{ color: '#8b5cf6' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Color
                    </button>
                    {showColorPicker && (
                      <div className="absolute left-full top-0 ml-2 p-3 rounded-xl z-50 flex flex-wrap gap-1" style={{ backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline)' }}>
                        {DEFAULT_NODE_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => { changeNodeColor(color); setShowColorPicker(false) }}
                            className="w-8 h-8 rounded-full border-2"
                            style={{ backgroundColor: color, borderColor: selectedNodeIds.size === 1 && nodes.find(n => n.id === [...selectedNodeIds][0])?.data.color === color ? 'white' : 'transparent' }}
                            aria-label={`Color ${color}`}
                            title={`Aplicar color ${color}`}
                          />
                        ))}
                        <div className="relative">
                          <button
                            onClick={() => colorInputRef.current?.click()}
                            className="w-8 h-8 rounded-full border-2"
                            style={{
                              background: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
                              borderColor: 'transparent',
                            }}
                            aria-label="Color personalizado"
                            title="Elegir color personalizado"
                          />
                          <input
                            ref={colorInputRef}
                            type="color"
                            aria-label="Selector de color personalizado"
                            onChange={(e) => { changeNodeColor(e.target.value); setShowColorPicker(false) }}
                            className="absolute w-0 h-0 opacity-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {readOnly && mapId && (
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => window.open(`/roadmap-editor?id=${mapId}`, '_self')} className="px-4 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>← Volver al Editor</button>
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
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        onInit={setFlowInstance}
        nodeTypes={nodeTypes}
        fitViewOptions={{ padding: 0.2, maxZoom: 2 }}
        minZoom={0.1}
        maxZoom={2}
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
        <div className="absolute top-0 right-0 h-full w-80 z-30 flex flex-col animate-in slide-in-from-right duration-200" style={{ backgroundColor: 'var(--color-surface-container-low)', boxShadow: '-4px 0 20px rgba(0,0,0,0.3)' }}>
          {/* Header con color del nodo */}
          <div className="p-4 pb-3" style={{ borderBottom: `3px solid ${clickedNode.data.color || getStatusColor(clickedNode.data.status)}` }}>
            <div className="flex justify-between items-start gap-2">
              <h2 className="text-lg font-bold leading-tight" style={{ color: 'var(--color-on-surface)' }}>{clickedNode.data.label}</h2>
              <button onClick={closePanel} aria-label="Cerrar panel" className="p-1.5 rounded-full transition-colors hover:bg-opacity-20" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface-variant)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            {/* Estado */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Estado</label>
              {readOnly ? (
                <div className="mt-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--color-surface-container-high)', color: getStatusColor(clickedNode.data.status) }}>
                  {getStatusSymbol(clickedNode.data.status)} {clickedNode.data.status.charAt(0).toUpperCase() + clickedNode.data.status.slice(1)}
                </div>
              ) : (
                <select 
                  value={clickedNode.data.status} 
                  onChange={(e) => changeStatus(e.target.value)} 
                  aria-label="Estado del nodo"
                  className="mt-2 px-3 py-2 rounded-lg text-sm w-full font-medium transition-all" 
                  style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }}
                >
                  <option value="pendiente">○ Pendiente</option>
                  <option value="estudiando">⏳ Estudiando</option>
                  <option value="aprendido">✓ Aprendido</option>
                </select>
              )}
            </div>

            {!readOnly && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Horas Estimadas</label>
                <input
                  type="number"
                  min="0"
                  aria-label="Horas estimadas para completar este nodo"
                  value={clickedNode.data.horas || 0}
                  onChange={(e) => {
                    const horas = parseInt(e.target.value) || 0
                    setNodes((nds) => nds.map((n) => n.id === clickedNode.id ? { ...n, data: { ...n.data, horas } } : n))
                    setClickedNode({ ...clickedNode, data: { ...clickedNode.data, horas } })
                  }}
                  className="mt-2 px-3 py-2 rounded-lg text-sm w-full transition-all"
                  style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }}
                />
              </div>
            )}

            {/* Recursos */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Recursos</label>
                {!readOnly && (
                  <button
                    onClick={handleSearchResources}
                    disabled={isSearching || !clickedNode}
                    aria-label="Buscar recursos en Wikipedia y YouTube"
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-80 flex items-center gap-1.5"
                    style={{ backgroundColor: '#c2410c', color: 'white' }}
                  >
                    {isSearching ? (
                      <>
                        <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar recursos
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {(clickedNode.data.resources?.enlaces || []).length === 0 ? (
                  <p className="text-sm py-2" style={{ color: 'var(--color-on-surface-variant)' }}>No hay recursos disponibles</p>
                ) : (
                  (clickedNode.data.resources?.enlaces || []).map((enlace, index) => {
                    const safeUrl = sanitizeUrl(enlace.url)
                    if (!safeUrl) return null
                    const isVideo = enlace.type === 'video'
                    return (
                      <a 
                        key={index} 
                        href={safeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02]"
                        style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-primary)' }}
                      >
                        <div className="flex items-center gap-2">
                          {isVideo ? (
                            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium block truncate">{enlace.title || enlace.nombre || enlace.url}</span>
                            {enlace.channel && (
                              <span className="text-xs opacity-60">{enlace.channel}</span>
                            )}
                          </div>
                          {isVideo && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">VIDEO</span>
                          )}
                          <svg className="w-3 h-3 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </a>
                    )
                  })
                )}
              </div>

              {!readOnly && (
                <div className="mt-6">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Añadir Recurso</label>
                  <div className="mt-2 space-y-2">
                    <input 
                      className="px-3 py-2 rounded-lg text-sm w-full transition-all" 
                      style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }} 
                      placeholder="Título del recurso" 
                      value={newResourceTitle} 
                      onChange={(e) => setNewResourceTitle(e.target.value)} 
                    />
                    <input 
                      className="px-3 py-2 rounded-lg text-sm w-full transition-all" 
                      style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: '1px solid #333333' }} 
                      placeholder="URL del recurso" 
                      value={newResourceUrl} 
                      onChange={(e) => setNewResourceUrl(e.target.value)} 
                    />
                    <button onClick={addResource} className="px-4 py-2 rounded-full text-sm font-semibold w-full transition-all hover:opacity-80" style={{ backgroundColor: '#000000', color: '#ffffff', border: '1px solid #333333' }}>
                      + Añadir recurso
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            {!readOnly && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-on-surface-variant)' }}>Notas</label>
                <textarea 
                  className="mt-2 w-full h-32 p-3 rounded-lg text-sm transition-all resize-none" 
                  style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)' }} 
                  placeholder="Añade tus notas personales..."
                  value={clickedNode.data.notes || ''}
                  onChange={(e) => {
                    const notes = e.target.value
                    setNodes((nds) => nds.map((n) => n.id === clickedNode.id ? { ...n, data: { ...n.data, notes } } : n))
                    setClickedNode({ ...clickedNode, data: { ...clickedNode.data, notes } })
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {showExamModal && examNodeId && (
        <ExamModal
          isOpen={showExamModal}
          onClose={() => { setShowExamModal(false); setExamNodeId(null) }}
          topic={nodes.find(n => n.id === examNodeId)?.data.label || ''}
          onPass={handleExamPass}
        />
      )}

      {showDeleteConfirmModal && pendingDeleteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDelete} />
          <div className="relative z-10 w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(185, 28, 28, 0.15)' }}>
                <svg className="w-6 h-6" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>Confirmar eliminación</h3>
            </div>
            <p className="mb-2 text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Estás a punto de eliminar <strong style={{ color: 'var(--color-on-surface)' }}>{pendingDeleteInfo.count} nodo{pendingDeleteInfo.count > 1 ? 's' : ''}</strong>.
            </p>
            {pendingDeleteInfo.childCount > 0 && (
              <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <p className="text-sm" style={{ color: '#f59e0b' }}>
                  <strong>Atención:</strong> {pendingDeleteInfo.childCount} nodo{pendingDeleteInfo.childCount > 1 ? 's' : ''} se quedarán sin padre y quedarán como nodos raíz.
                </p>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: '#b91c1c', color: 'white' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}