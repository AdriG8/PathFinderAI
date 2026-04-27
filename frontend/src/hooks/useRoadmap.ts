/**
 * Hook useRoadmap - Gestión del estado de diagramas de roadmap
 * 
 * Este hook encapsula toda la lógica de gestión de un roadmap interactivo:
 * - Estado de nodos y aristas (edges)
 * - Operaciones CRUD sobre nodos
 * - Conexiones entre nodos
 * - Layout automático con Dagre
 * - Persistencia (sessionStorage, JSON, imagen)
 * 
 * NOTA: Este hook usa useState interno en lugar de useNodesState/useEdgesState
 * de ReactFlow. Para funcionalidad completa, usar los hooks oficiales de ReactFlow
 * y utilizar este hook solo para utilidades auxiliares (getStatusColor, etc.)
 */

import { useState, useCallback, useEffect } from 'react'
import {
  type Node,
  type Edge,
  type OnConnect,
  addEdge,
  type NodeChange,
  type EdgeChange,
} from 'reactflow'
import dagre from 'dagre'

// =============================================
// INTERFACES - Tipos TypeScript
// =============================================

/**
 * Datos contenidos en cada nodo del roadmap
 * label: texto mostrado en el nodo
 * status: estado del aprendizaje (pendiente/estudiando/aprendido)
 * isEditing: flag para modo edición de la etiqueta
 * color: color personalizado del borde del nodo
 * resources: lista de recursos/enlaces asociados al nodo
 */
export interface RoadmapNodeData {
  label: string
  status: string
  isEditing?: boolean
  color?: string
  resources?: {
    enlaces?: { nombre: string; url: string }[]
  }
}

/**
 * Estructura de un nodo en el roadmap (serializado)
 */
export interface RoadmapNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: RoadmapNodeData
}

/**
 * Estructura de una arista (conexión) en el roadmap
 */
export interface RoadmapEdge {
  id: string
  source: string
  target: string
  animated?: boolean
  label?: string
}

/**
 * Datos completos del roadmap (serializable)
 */
export interface RoadmapData {
  nodes: RoadmapNode[]
  edges: RoadmapEdge[]
}

/**
 * Opciones para inicializar el hook
 * initialData: datos del roadmap cargados desde外部
 * readOnly: si true, deshabilita todas las operaciones de edición
 * mapId: identificador para guardar en sessionStorage
 * onSave: callback opcional para guardar en base de datos
 */
export interface UseRoadmapOptions {
  initialData?: RoadmapData
  readOnly?: boolean
  mapId?: string
  onSave?: (data: RoadmapData) => void
}

/**
 *Retorno del hook - todas las funciones y estados expuestos
 */
export interface UseRoadmapReturn {
  // Estado
  nodes: Node<RoadmapNodeData>[]
  edges: Edge[]
  selectedNodeIds: Set<string>
  
  // Callbacks de ReactFlow (para conectar con el componente)
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: OnConnect
  
  // Operaciones de nodos
  addNode: (label: string, position?: { x: number; y: number }) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeStatus: (id: string, status: string) => void
  updateNodeColor: (id: string, color: string) => void
  deleteNode: (id: string) => void
  deleteSelectedNodes: () => void
  addResource: (nodeId: string, resource: { nombre: string; url: string }) => void
  setNodeEditing: (id: string, isEditing: boolean) => void
  setSelectedIds: (ids: Set<string>) => void
  
  // Utilidades
  getNode: (id: string) => Node<RoadmapNodeData> | undefined
  getConnectedNodes: (nodeId: string) => Node<RoadmapNodeData>[]
  
  // Layout automático
  autoLayout: (direction?: 'horizontal' | 'vertical') => void
  getLayoutedElements: (nodes: Node<RoadmapNodeData>[], edges: Edge[], direction: 'horizontal' | 'vertical') => { nodes: Node<RoadmapNodeData>[]; edges: Edge[] }
  
  // Persistencia
  exportToJson: () => void
  exportToImage: (flowInstance: any) => Promise<void>
  getData: () => RoadmapData
  loadData: (data: RoadmapData) => void
  
  // Sesión (sessionStorage)
  saveToSession: () => void
  loadFromSession: () => void
}

// =============================================
// CONSTANTES
// =============================================

/**
 * Colores asociados a cada estado de aprendizaje
 * - aprendido: verde (completado)
 * - estudiado: amarillo (en progreso)
 * - pendiente: gris (sin iniciar)
 */
const STATUS_COLORS: Record<string, string> = {
  aprendido: '#10b981',
  estudiado: '#f59e0b',
  pendiente: '#6b7280',
}

// =============================================
// HOOK PRINCIPAL
// =============================================

/**
 * Hook principal para gestionar el estado de un roadmap
 * @param options - Configuración inicial del roadmap
 * @returns Objeto con estado y funciones para manipular el roadmap
 * 
 * @example
 * const { nodes, edges, addNode, deleteSelectedNodes } = useRoadmap({
 *   initialData: { nodes: [], edges: [] },
 *   readOnly: false
 * })
 */
export function useRoadmap(options: UseRoadmapOptions): UseRoadmapReturn {
  // Desestructuramos las opciones con valores por defecto
  const { initialData, readOnly = false, mapId } = options

  // =============================================
  // ESTADO INTERNO DEL HOOK
  // =============================================
  
  /**
   * Estado de los nodos del roadmap
   * Se inicializa con los datos externos o un array vacío
   * Cada nodo se transforma para asegurar el tipo 'custom'
   */
  const [nodes, setNodes] = useState<Node<RoadmapNodeData>[]>(() => {
    if (!initialData) return []
    return initialData.nodes.map((node) => ({
      id: node.id,
      type: 'custom',  // Usamos nodos personalizados
      position: node.position,
      data: {
        label: node.data.label,
        status: node.data.status,
        isEditing: false,  // Resetear modo edición al cargar
        color: node.data.color,
        resources: node.data.resources,
      },
    }))
  })

  /**
   * Estado de las aristas (conexiones) del roadmap
   * Se inicializa con estilos por defecto para las conexiones
   */
  const [edges, setEdges] = useState<Edge[]>(() => {
    if (!initialData) return []
    return initialData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      animated: edge.animated || false,
      style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
    }))
  })

  /**
   * Conjunto de IDs de nodos actualmente seleccionados
   * Se usa para operaciones en lote (eliminar, cambiar color)
   */
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set())

  // =============================================
  // UTILIDADES PRIVADAS
  // =============================================

  /**
   * Genera un ID único para nuevos nodos
   * Busca el ID máximo numérico existente y le suma 1
   * @returns Nuevo ID como string
   */
  const generateNodeId = useCallback(() => {
    return String(Math.max(...nodes.map((n) => parseInt(n.id) || 0), 0) + 1)
  }, [nodes])

  /**
   * Crea un nuevo nodo con datos por defecto
   * @param label - Texto del nodo
   * @param position - Posición opcional (si no se usa, se calcula aleatoriamente)
   * @returns Nodo formateado para ReactFlow
   */
  const createNode = useCallback((
    label: string,
    position?: { x: number; y: number }
  ): Node<RoadmapNodeData> => {
    const id = generateNodeId()
    return {
      id,
      type: 'custom',
      // Posición por defecto con pequeña variación aleatoria
      position: position || {
        x: 250 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      },
      data: {
        label,
        status: 'pendiente',  // Estado inicial por defecto
        isEditing: false,
        resources: { enlaces: [] },  // Array vacío de recursos
      },
    }
  }, [generateNodeId])

  // =============================================
  // OPERACIONES DE NODOS
  // =============================================

  /**
   * Maneja los cambios de nodos enviados por ReactFlow
   * Procesa cambios de posición y eliminación de nodos
   * @param changes - Array de cambios de ReactFlow
   */
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // En modo solo lectura, no procesamos cambios
    if (readOnly) return
    
    setNodes((nds) => {
      return nds.map((node) => {
        let updatedNode = node
        
        changes.forEach((change) => {
          // Actualizar posición cuando el usuario arrastra un nodo
          if (change.type === 'position' && change.id === node.id && 'position' in change && change.position) {
            updatedNode = { ...updatedNode, position: change.position }
          }
          // Eliminar nodo cuando se remueve
          if (change.type === 'remove' && change.id === node.id) {
            updatedNode = null as any
          }
        })
        
        return updatedNode
      }).filter(Boolean) as Node<RoadmapNodeData>[]
    })
  }, [readOnly])

  /**
   * Actualiza los IDs de nodos seleccionados desde el componente
   * Se llama desde onSelectionChange de ReactFlow
   * @param ids - Nuevo conjunto de IDs seleccionados
   */
  const setSelectedIds = useCallback((ids: Set<string>) => {
    setSelectedNodeIds(ids)
  }, [])

  /**
   * Añade un nuevo nodo al roadmap
   * @param label - Texto del nuevo nodo
   * @param position - Posición opcional (usa posición por defecto si no se especifica)
   */
  const addNode = useCallback((label: string, position?: { x: number; y: number }) => {
    // Validaciones: no permite en modo lectura ni etiquetas vacías
    if (readOnly || !label.trim()) return
    
    const newNode = createNode(label, position)
    setNodes((nds) => [...nds, newNode])
  }, [readOnly, createNode])

  /**
   * Actualiza la etiqueta (texto) de un nodo
   * @param id - ID del nodo a modificar
   * @param label - Nuevo texto
   */
  const updateNodeLabel = useCallback((id: string, label: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label, isEditing: false } }  // Sale del modo edición
          : node
      )
    )
  }, [])

  /**
   * Actualiza el estado de aprendizaje de un nodo
   * @param id - ID del nodo
   * @param status - Nuevo estado (pendiente/estudiando/aprendido)
   */
  const updateNodeStatus = useCallback((id: string, status: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, status } }
          : node
      )
    )
  }, [])

  /**
   * Actualiza el color personalizado del borde de un nodo
   * @param id - ID del nodo
   * @param color - Color en formato hex
   */
  const updateNodeColor = useCallback((id: string, color: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, color } }
          : node
      )
    )
  }, [])

  /**
   * Elimina un nodo específico y todas sus conexiones
   * @param id - ID del nodo a eliminar
   */
  const deleteNode = useCallback((id: string) => {
    // Eliminar el nodo
    setNodes((nds) => nds.filter((node) => node.id !== id))
    // Eliminar todas las aristas conectadas a ese nodo
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id))
  }, [])

  /**
   * Elimina todos los nodos seleccionados
   * También elimina las aristas conectadas a esos nodos
   */
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeIds.size === 0) return
    
    // Filtrar nodos que no estén seleccionados
    setNodes((nds) => nds.filter((node) => !selectedNodeIds.has(node.id)))
    // Filtrar aristas que no estén conectadas a nodos seleccionados
    setEdges((eds) => eds.filter(
      (edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)
    ))
    // Limpiar selección
    setSelectedNodeIds(new Set())
  }, [selectedNodeIds])

  /**
   * Activa/desactiva el modo edición de un nodo
   * En modo edición, el nodo muestra un input en lugar de texto
   * @param id - ID del nodo
   * @param isEditing - True para entrar en modo edición
   */
  const setNodeEditing = useCallback((id: string, isEditing: boolean) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isEditing } }
          // Desactiva edición en todos los demás nodos
          : { ...node, data: { ...node.data, isEditing: false } }
      )
    )
  }, [])

  /**
   * Añade un recurso/enlace a un nodo
   * @param nodeId - ID del nodo objetivo
   * @param resource - Objeto con nombre y URL del recurso
   */
  const addResource = useCallback((nodeId: string, resource: { nombre: string; url: string }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                resources: {
                  // Mantiene los recursos existentes y añade el nuevo
                  enlaces: [...(node.data.resources?.enlaces || []), resource],
                },
              },
            }
          : node
      )
    )
  }, [])

  // =============================================
  // OPERACIONES DE ARISTAS (CONEXIONES)
  // =============================================

  /**
   * Maneja los cambios de aristas enviados por ReactFlow
   * @param changes - Array de cambios de ReactFlow
   */
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    if (readOnly) return
    
    setEdges((eds) => {
      return eds.map((edge) => {
        let updatedEdge = edge
        
        changes.forEach((change) => {
          // Eliminar arista cuando se remueve
          if (change.type === 'remove' && edge.id === change.id) {
            updatedEdge = null as any
          }
        })
        
        return updatedEdge
      }).filter(Boolean) as Edge[]
    })
  }, [readOnly])

  /**
   * Callback de ReactFlow para crear nuevas conexiones
   * Se llama cuando el usuario arrastra de un handle a otro
   * @param connection - Objeto con source, target y handles
   */
  const onConnect: OnConnect = useCallback((connection) => {
    // Validar que existen source y target
    if (readOnly || !connection.source || !connection.target) return
    
    // Usar addEdge de ReactFlow para crear la arista con ID único
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          id: `e${connection.source}-${connection.target}`,
          style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
        },
        eds
      )
    )
  }, [readOnly])

  // =============================================
  // UTILIDADES DE CONSULTA
  // =============================================

  /**
   * Busca un nodo por su ID
   * @param id - ID del nodo a buscar
   * @returns El nodo encontrado o undefined
   */
  const getNode = useCallback((id: string) => {
    return nodes.find((node) => node.id === id)
  }, [nodes])

  /**
   * Obtiene todos los nodos conectados a un nodo específico
   * @param nodeId - ID del nodo cuyas conexiones queremos buscar
   * @returns Array de nodos conectados
   */
  const getConnectedNodes = useCallback((nodeId: string) => {
    const connectedIds = new Set<string>()
    
    //遍历 todas las aristas para encontrar conexiones
    edges.forEach((edge) => {
      if (edge.source === nodeId) connectedIds.add(edge.target)
      if (edge.target === nodeId) connectedIds.add(edge.source)
    })
    
    // Filtrar nodos que están en las conexiones encontradas
    return nodes.filter((node) => connectedIds.has(node.id))
  }, [nodes, edges])

  // =============================================
  // LAYOUT AUTOMÁTICO (DAGRE)
  // =============================================

  /**
   * Calcula el layout de los nodos usando el algoritmo de Dagre
   * Organiza los nodos automáticamente según sus conexiones
   * @param nodesToLayout - Nodos a reorganizar
   * @param edgesToLayout - Aristas para calcular el layout
   * @param direction - 'vertical' o 'horizontal'
   * @returns Nodos con posiciones actualizadas
   */
  const getLayoutedElements = useCallback((
    nodesToLayout: Node<RoadmapNodeData>[],
    edgesToLayout: Edge[],
    direction: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    // Crear grafo dirigido
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    
    // Dimensiones de cada nodo (ancho x alto)
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
    
    // Ejecutar el algoritmo de layout
    dagre.layout(dagreGraph)
    
    // Calcular nuevas posiciones (centradas en el nodo)
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

  /**
   * Aplica el layout automático a los nodos actuales
   * @param direction - Dirección del layout (vertical/horizontal)
   */
  const autoLayout = useCallback((direction: 'horizontal' | 'vertical' = 'vertical') => {
    const { nodes: layoutedNodes } = getLayoutedElements([...nodes], [...edges], direction)
    setNodes(layoutedNodes)
  }, [nodes, edges, getLayoutedElements])

  // =============================================
  // PERSISTENCIA Y EXPORTACIÓN
  // =============================================

  /**
   * Obtiene los datos actuales del roadmap en formato serializable
   * @returns Objeto con nodos y aristas (sin datos de ReactFlow internos)
   */
  const getData = useCallback((): RoadmapData => {
    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
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
        label: edge.label as string | undefined,
      })),
    }
  }, [nodes, edges])

  /**
   * Exporta el roadmap a un archivo JSON
   * Descarga automáticamente el archivo
   */
  const exportToJson = useCallback(() => {
    const data = getData()
    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'roadmap.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [getData])

  /**
   * Exporta el roadmap como imagen PNG
   * Usa html2canvas para capturar el elemento de ReactFlow
   * @param flowInstance - Instancia de ReactFlow para ajustar la vista
   */
  const exportToImage = useCallback(async (flowInstance: any) => {
    if (!flowInstance) return
    
    // Ajustar vista para que todo sea visible
    flowInstance.fitView({ padding: 0.2, duration: 300 })
    await new Promise((resolve) => setTimeout(resolve, 350))
    
    // Capturar el elemento de ReactFlow
    const flowElement = document.querySelector('.react-flow') as HTMLElement
    if (!flowElement) return
    
    // Importar dinámicamente html2canvas
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(flowElement, {
      backgroundColor: '#1a1a2e',
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })
    
    // Descargar imagen
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'roadmap.png'
    link.href = dataUrl
    link.click()
  }, [])

  /**
   * Carga datos externos en el roadmap
   * @param data - Datos del roadmap a cargar
   */
  const loadData = useCallback((data: RoadmapData) => {
    // Cargar nodos
    setNodes(
      data.nodes.map((node) => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          label: node.data.label,
          status: node.data.status,
          isEditing: false,
          color: node.data.color,
          resources: node.data.resources,
        },
      }))
    )
    // Cargar aristas
    setEdges(
      data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated || false,
        style: { stroke: 'var(--color-on-surface-variant)', strokeWidth: 2 },
      }))
    )
  }, [])

  /**
   * Guarda el roadmap en sessionStorage
   * Se identifica por el mapId proporcionado en las opciones
   */
  const saveToSession = useCallback(() => {
    if (!mapId) return
    const data = getData()
    sessionStorage.setItem(mapId, JSON.stringify(data))
  }, [mapId, getData])

  /**
   * Carga el roadmap desde sessionStorage
   * Se ejecuta automáticamente al inicio si existe un mapId
   */
  const loadFromSession = useCallback(() => {
    if (!mapId) return
    const stored = sessionStorage.getItem(mapId)
    if (stored) {
      try {
        const data = JSON.parse(stored) as RoadmapData
        loadData(data)
      } catch (e) {
        console.error('Error loading from session:', e)
      }
    }
  }, [mapId, loadData])

  // =============================================
  // EFECTOS SECUNDARIOS
  // =============================================

  /**
   * Efecto: cargar datos desde sessionStorage al iniciar
   * Se ejecuta cuando cambia el mapId o la función loadFromSession
   */
  useEffect(() => {
    if (mapId) {
      loadFromSession()
    }
  }, [mapId, loadFromSession])

  /**
   * Efecto: limpiar aristas huérfanas
   * Cuando se elimina un nodo, también se eliminan sus conexiones
   */
  useEffect(() => {
    const nodeIds = new Set(nodes.map((n) => n.id))
    setEdges((eds) =>
      // Filtrar aristas que apunten a nodos que ya no existen
      eds.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    )
  }, [nodes])

  // =============================================
  // RETORNO DEL HOOK
  // =============================================

  return {
    // Estado
    nodes,
    edges,
    selectedNodeIds,
    
    // Callbacks de ReactFlow
    onNodesChange,
    onEdgesChange,
    onConnect,
    
    // Operaciones de nodos
    addNode,
    updateNodeLabel,
    updateNodeStatus,
    updateNodeColor,
    deleteNode,
    deleteSelectedNodes,
    addResource,
    setNodeEditing,
    setSelectedIds,
    
    // Utilidades
    getNode,
    getConnectedNodes,
    
    // Layout
    autoLayout,
    getLayoutedElements,
    
    // Persistencia
    exportToJson,
    exportToImage,
    getData,
    loadData,
    
    // Sesión
    saveToSession,
    loadFromSession,
  }
}

// =============================================
// UTILIDADES AUXILIARES
// =============================================

/**
 * Obtiene el color asociado a un estado de aprendizaje
 * @param status - Estado del nodo (pendiente/estudiando/aprendido)
 * @returns Color en formato hex
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || STATUS_COLORS.pendiente
}

/**
 * Colores disponibles para personalizar nodos
 * Usados en la paleta de colores del editor
 */
export const DEFAULT_NODE_COLORS = [
  '#10b981', // Verde esmeralda
  '#3b82f6', // Azul
  '#8b5cf6', // Violeta
  '#ec4899', // Rosa
  '#f59e0b', // Amarillo
  '#ef4444', // Rojo
  '#14b8a6', // Teal
  '#f97316', // Naranja
]