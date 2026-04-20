// Importa hooks de React para manejar estado, efectos y callbacks
import { useState, useCallback, useMemo, useEffect } from 'react'
// Importa componentes y funciones de ReactFlow para crear el editor de diagrama
import ReactFlow, {
  Background,          // Fondo de cuadrícula
  Controls,            // Botones de zoom y paneo
  MiniMap,             // Vista minimap del diagrama
  type Node,           // Tipo para nodos
  type Edge,           // Tipo para aristas
  type OnConnect,      // Tipo para conexión de nodos
  type NodeTypes,     // Tipos de nodos personalizados
  Handle,             // Puntos de conexión (input/output)
  Position,           // Posiciones de los handles
  addEdge,            // Función para añadir aristas
  useNodesState,       // Hook para gestionar nodos
  useEdgesState,      // Hook para gestionar aristas
} from 'reactflow'
// Importa librería Dagre para auto-layout de nodos
import dagre from 'dagre'
// Importa estilos de ReactFlow
import 'reactflow/dist/style.css'

// =============================================
// CONSTANTES - Colores y configuraciones
// =============================================

// Mapa de colores para cada estado del nodo
const statusColors: Record<string, string> = {
  aprendido: '#10b981',   // Verde - completado
  estudiado: '#f59e0b',  // Amarillo - en progreso
  pendiente: '#6b7280',  // Gris - sin iniciar
}

// Colores disponibles para personalizar nodos
const defaultColors = [
  '#10b981',  // Verde esmeralda
  '#3b82f6', // Azul
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#f59e0b', // Amarillo
  '#ef4444', // Rojo
  '#14b8a6', // Teal
  '#f97316', // Naranja
]

// =============================================
// INTERFACES - Definiciones de tipos
// =============================================

// Interface para los datos de un nodo personalizado
interface CustomNodeData {
  label: string           // Texto del nodo
  status: string         // Estado: pendiente, estudiado, aprendido
  isEditing?: boolean   // Flag si está editando la etiqueta
  color?: string        // Color personalizado del borde
  resources?: {
    // Recursos/enlaces asociados al nodo
    enlaces?: { nombre: string; url: string }[]
  }
}

// Interface para los datos del roadmap completo
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

// Interface para las props del componente
interface RoadmapEditorProps {
  initialData: RoadmapData    // Datos iniciales del roadmap
  readOnly?: boolean       // Modo solo lectura
  mapId?: string         // ID del mapa para guardar en sessionStorage
  onSave?: (data: RoadmapData) => void  // Callback para guardar en BD
}

// =============================================
// FUNCIONES AUXILIARES
// =============================================

// Función que devuelve el símbolo y texto según el estado
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

// Componente que renderiza cada nodo del roadmap
const CustomNode = ({ data, id }: { data: CustomNodeData; id: string }) => {
  // Determina el color del borde: personalizado, según estado, o gris por defecto
  const color = data.color || statusColors[data.status] || statusColors.pendiente

  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px] text-center"
      style={{
        backgroundColor: 'var(--color-surface-container-low)',
        border: `2px solid ${color}`,
      }}
    >
      {/* Handle de entrada (arriba) - punto donde se conectan aristas */}
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      
      {/* Si está en modo edición, mostrar input; si no, mostrar texto */}
      {data.isEditing ? (
        <input
          autoFocus
          className="text-sm font-medium bg-transparent border-none text-center w-full outline-none"
          style={{ color: 'var(--color-on-surface)' }}
          defaultValue={data.label}
          // Al perder foco, guardar la nueva etiqueta
          onBlur={(e) => {
            const event = new CustomEvent('updateNodeLabel', { detail: { id, label: e.target.value } })
            window.dispatchEvent(event)
          }}
          // Al presionar Enter, guardar la etiqueta
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
          // Al hacer doble click, entrar en modo edición
          onDoubleClick={() => {
            const event = new CustomEvent('editNodeLabel', { detail: { id } })
            window.dispatchEvent(event)
          }}
        >
          {data.label}
        </div>
      )}
      
      {/* Estado del nodo (texto pequeño debajo) */}
      <div className="text-xs mt-1" style={{ color }}>
        {getStatusSymbol(data.status)}
      </div>
      
      {/* Handle de salida (abajo) - punto donde se conectan aristas */}
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  )
}

// Define los tipos de nodos disponibles para ReactFlow
const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

// =============================================
// COMPONENTE PRINCIPAL - RoadmapEditor
// =============================================

// Componente principal para editar roadmaps
export default function RoadmapEditor({ initialData, readOnly = false, mapId, onSave }: RoadmapEditorProps) {
  // =============================================
  // ESTADOS DEL COMPONENTE
  // =============================================
  
  // Estado para el nombre del nuevo nodo a crear
  const [newNodeName, setNewNodeName] = useState('')
  // Estado para mostrar/ocultar el input de añadir nodo
  const [showAddInput, setShowAddInput] = useState(false)
  // Set de IDs de nodos seleccionados
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())
  // Nodo actualmente seleccionado (clickeado)
  const [clickedNode, setClickedNode] = useState<Node<CustomNodeData> | null>(null)
  // Estado para mostrar/ocultar el panel lateral
  const [showPanel, setShowPanel] = useState(false)
  // Posición del mouse para efecto glow
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  // Flag para mostrar cursor glow
  const [showCursor, setShowCursor] = useState(false)
  // Estados para recursos (enlaces)
  const [newResourceUrl, setNewResourceUrl] = useState('')
  const [newResourceTitle, setNewResourceTitle] = useState('')
  // Estado para la dirección del layout (vertical/horizontal)
  const [layoutDirection] = useState<'horizontal' | 'vertical'>('vertical')

  // =============================================
  // MEMOS - Datos memoizados
  // =============================================

  // Convierte los datos iniciales en nodos de ReactFlow
  const initialNodes: Node<CustomNodeData>[] = useMemo(() => {
    return initialData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: node.position,
      data: { label: node.data.label, status: node.data.status, isEditing: false, color: node.data.color, resources: node.data.resources },
    }))
  }, [initialData])

  // Convierte los datos iniciales en aristas de ReactFlow
  const initialEdges: Edge[] = useMemo(() => {
    return initialData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }))
  }, [initialData])

  // =============================================
  // HOOKS DE REACTFLOW - Gestión del estado del diagrama
  // =============================================

  // Hook para gestionar nodos (persiste en sessionStorage cuando hay mapId)
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // =============================================
  // CALLBACKS - Manejadores de eventos
  // =============================================

  // Callback cuando cambia la selección de nodos
  const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: Node[] }) => {
    setSelectedNodeIds(new Set(selectedNodes.map((n) => n.id)))
  }, [])

  // Callback cuando se hace click en un nodo
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<CustomNodeData>) => {
    // Si Shift está presionado o es modo solo lectura, no hacer nada
    if (event.shiftKey || readOnly) {
      return
    }
    // Guardar el nodo clickeado y mostrar panel
    setClickedNode(node)
    setShowPanel(true)
  }, [readOnly])

  // Callback cuando se arrastra un nodo
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node<CustomNodeData>) => {
    if (clickedNode && clickedNode.id === node.id) {
      setClickedNode(node)
    }
  }, [clickedNode])

  // Función para cerrar el panel lateral
  const closePanel = useCallback(() => {
    setShowPanel(false)
    setTimeout(() => setClickedNode(null), 300)
  }, [])

  // Función para añadir un recurso/enlace al nodo
  const addResource = () => {
    // Validar que hay datos necesarios
    if (!newResourceUrl.trim() || !newResourceTitle.trim() || !clickedNode) return

    // Crear el nuevo enlace
    const newEnlace = { nombre: newResourceTitle, url: newResourceUrl }
    const currentResources = clickedNode.data.resources?.enlaces || []

    // Actualizar el nodo en la lista de nodos
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

    // Actualizar el nodo clickeado
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

    // Limpiar inputs
    setNewResourceUrl('')
    setNewResourceTitle('')
  }

  // Función para cambiar el estado de un nodo
  const changeStatus = useCallback((newStatus: string) => {
    if (!clickedNode) return

    // Actualizar en la lista de nodos
    setNodes((nds) =>
      nds.map((node) =>
        node.id === clickedNode.id
          ? { ...node, data: { ...node.data, status: newStatus } }
          : node
      )
    )

    // Actualizar el nodo clickeado
    setClickedNode((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, status: newStatus } }
        : null
    )
  }, [clickedNode, setNodes])

  // Callback cuando se conecta un nodo con otro
  const onConnect: OnConnect = useCallback((connection) => {
    if (connection.source && connection.target) {
      // Añadir la nueva arista con ID único
      setEdges((eds) => addEdge({ 
        ...connection, 
        id: `e${connection.source}-${connection.target}`,
        style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 } 
      }, eds))
    }
  }, [setEdges])

  // Función que calcula el layout automático usando Dagre
  const getLayoutedElements = useCallback((nodesToLayout: Node[], edgesToLayout: Edge[], direction: 'horizontal' | 'vertical') => {
    // Crear grafo de Dagre
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    const nodeWidth = 200
    const nodeHeight = 120
    
    // Configurar dirección del layout
    dagreGraph.setGraph({ rankdir: direction })
    
    // Añadir nodos al grafo
    nodesToLayout.forEach((node) => {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })
    
    // Añadir aristas al grafo
    edgesToLayout.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target)
    })
    
    // Calcular layout
    dagre.layout(dagreGraph)
    
    // Actualizar posiciones de los nodos
    const layoutedNodes = nodesToLayout.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      }
    })
    
    return { nodes: layoutedNodes, edges: edgesToLayout }
  }, [])

  // Función para aplicar layout automático
  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes } = getLayoutedElements(
      [...nodes],
      [...edges],
      layoutDirection
    )
    setNodes(layoutedNodes)
  }, [nodes, edges, layoutDirection, getLayoutedElements, setNodes])

  // Función para añadir un nuevo nodo
  const addNode = () => {
    if (!newNodeName.trim()) return
    
    // Generar ID único (máximo ID actual + 1)
    const newId = String(Math.max(...nodes.map((n) => parseInt(n.id)), 0) + 1)
    const newNode: Node<CustomNodeData> = {
      id: newId,
      type: 'custom',
      position: { 
        x: 250 + Math.random() * 200, 
        y: 100 + Math.random() * 200 
      },
      data: { label: newNodeName, status: 'pendiente', isEditing: false, resources: { enlaces: [] } },
    }
    
    // Añadir nodo a la lista
    setNodes((nds) => [...nds, newNode])
    // Limpiar estados
    setNewNodeName('')
    setShowAddInput(false)
  }

  // Función para eliminar nodos seleccionados
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return
    
    // Eliminar nodos seleccionados
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)))
    // Eliminar aristas relacionadas
    setEdges((eds) => eds.filter((edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)))
    // Limpiar selección
    setSelectedNodeIds(new Set())
  }, [selectedNodeIds, setNodes, setEdges])

  // Callback para manejar teclas (Delete para eliminar)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (readOnly) return
    // Si se presiona Delete o Backspace
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.target as HTMLElement
      // Solo si no está en un input o textarea
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        event.preventDefault()
        deleteSelectedNodes()
      }
    }
  }, [readOnly, deleteSelectedNodes])

  // Callback para actualizar etiqueta del nodo
  const handleUpdateNodeLabel = useCallback((event: CustomEvent<{ id: string; label: string }>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === event.detail.id
          ? { ...node, data: { ...node.data, label: event.detail.label, isEditing: false } }
          : node
      )
    )
  }, [setNodes])

  // Callback para entrar en modo edición de etiqueta
  const handleEditNodeLabel = useCallback((event: CustomEvent<{ id: string }>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === event.detail.id
          ? { ...node, data: { ...node.data, isEditing: true } }
          : { ...node, data: { ...node.data, isEditing: false } }
      )
    )
  }, [setNodes])

  // Callback para cambiar color de nodos seleccionados
  const changeNodeColor = useCallback((color: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        selectedNodeIds.has(node.id)
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    )
  }, [selectedNodeIds, setNodes])

  // Función para exportar el mapa a JSON
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

    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roadmap.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  // =============================================
  // EFECTOS - Efectos secundarios
  // =============================================

  // Efecto para escuchar eventos de teclado y edición de nodos
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

  // Efecto para rastrear movimiento del mouse (efecto visual)
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

  // =============================================
  // RENDERIZADO DEL COMPONENTE
  // =============================================

  return (
    // Contenedor principal
    <div className="w-full h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface)' }}>
      
      {/* Efecto de cursor glow (solo en modo editable) */}
      {showCursor && !readOnly && (
        <div 
          className="cursor-glow"
          style={{ 
            left: mousePos.x, 
            top: mousePos.y,
          }}
        />
      )}
      
      {/* Barra de herramientas (solo en modo editable) */}
      {!readOnly && (
        <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap">
          {/* Botón para abrir en modo lectura */}
          <button
            onClick={() => {
              // Genera ID único o usa el existente
              const currentMapId = mapId || `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              // Guarda en sessionStorage
              sessionStorage.setItem(currentMapId, JSON.stringify({ nodes, edges }))
              // Abre en nueva pestaña
              window.open(`/roadmap-viewer?id=${currentMapId}`, '_blank')
            }}
            className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}
          >
            Modo Lectura
          </button>

          {/* Input para nuevo nodo (si showAddInput es true) */}
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
              {/* Botón para mostrar input de añadir */}
              <button
                onClick={() => setShowAddInput(true)}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-surface)' }}
              >
                + Añadir nodo
              </button>
              {/* Botón para exportar JSON */}
              <button
                onClick={exportMap}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-surface)' }}
              >
                Exportar
              </button>
              {/* Botón para guardar en BD */}
              {mapId && (
                <button
                  onClick={() => {
                    const data = { 
                      nodes: nodes.map(n => ({ id: n.id, type: n.type, position: n.position, data: n.data })), 
                      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target, animated: e.animated })) 
                    }
                    if (onSave) {
                      onSave(data as any)
                    } else {
                      sessionStorage.setItem(mapId, JSON.stringify(data))
                      alert('Guardado en sessionStorage')
                    }
                  }}
                  className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  Guardar
                </button>
              )}
              {/* Botón para auto-layout */}
              <button
                onClick={() => autoLayout()}
                className="px-3 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
              >
                Organizar
              </button>
            </>
          )}

          {/* Botones de acción cuando hay nodos seleccionados */}
          {selectedNodeIds.size > 0 && (
            <>
              {/* Botón eliminar */}
              <button
                onClick={deleteSelectedNodes}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: '#ef4444', color: 'white' }}
              >
                Eliminar ({selectedNodeIds.size})
              </button>
              {/* Paleta de colores */}
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

      {/* Botón volver (solo en modo lectura) */}
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

      {/* Instrucciones en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-20">
        <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>
          {readOnly 
            ? 'Click en un nodo para ver recursos' 
            : 'Click para seleccionar • Doble click para editar • Delete para eliminar'}
        </p>
      </div>
      
      {/* Componente ReactFlow - El editor de diagrama */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: 'var(--color-surface)' }}
        selectNodesOnDrag={false}
        panOnScroll={false}
        selectionOnDrag
        multiSelectionKeyCode="Shift"
      >
        {/* Fondo de cuadrícula */}
        <Background 
          color="#ffffff" 
          gap={20} 
          size={1}
          style={{ opacity: 0.1 }}
        />
        {/* Controles de zoom */}
        <Controls 
          style={{ 
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: '8px',
          }} 
        />
        {/* Minimap */}
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

      {/* Panel lateral de detalle del nodo */}
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
          {/* Título del nodo */}
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

          {/* Sección de Estado */}
          <div className="mb-4">
            <span 
              className="text-xs font-semibold uppercase"
              style={{ color: 'var(--color-on-surface-variant)' }}
            >
              Estado
            </span>
            {readOnly ? (
              // Modo solo lectura: mostrar estado sin opciones
              <p className="text-sm mt-1" style={{ color: statusColors[clickedNode.data.status] || statusColors.pendiente }}>
                {getStatusSymbol(clickedNode.data.status)}
              </p>
            ) : (
              // Modo editable: mostrar select
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

          {/* Sección de Recursos */}
          <div className="mb-4">
            <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--color-on-surface)' }}
              >
                Recursos
              </h3>
              
              {/* Lista de recursos/enlaces */}
              <ul className="space-y-2">
                {(clickedNode.data.resources?.enlaces || []).map((enlace, index) => (
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

              {/* Formulario para añadir recurso (solo si no es solo lectura) */}
              {!readOnly && (
                <div className="flex flex-col gap-2 mt-4">
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

            {/* Sección de Notas (solo si no es solo lectura) */}
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