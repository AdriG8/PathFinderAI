// =============================================
// PÁGINA DE ADMIN - Panel de administración
// =============================================
// Componente que renderiza:
// - Sidebar (reutilizada del componente existente)
// - Panel de métricas (usuarios, roadmaps)
// - Gráfico de tendencia de registros
// Estados y funciones principales:
// - stats: objeto con datos del admin
// - loading: estado de carga
// - error: mensaje de error
// Efectos:
// - fetchStats: obtiene estadísticas del servidor

import { useState, useEffect } from 'react'
import { useAuth, API_URL } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

interface AdminStats {
  totalUsuarios: number
  totalRoadmaps: number
  tendenciaUsuarios: { fecha: string; count: number }[]
}

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Obtener estadísticas del admin
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return
      
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${API_URL}/api/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          const err = await response.json()
          setError(err.error || 'Error al cargar estadísticas')
          return
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [user])

  // Mostrar mientras carga
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
      </div>
    )
  }

  // Si no hay usuario, mostrar error
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="text-xl" style={{ color: 'var(--color-on-surface)' }}>No tienes acceso a esta página</div>
      </div>
    )
  }

  // Renderizar gráfico SVG
  const renderChart = () => {
    if (!stats?.tendenciaUsuarios?.length) {
      return (
        <div className="h-48 flex items-center justify-center text-on-surface-variant">
          No hay datos disponibles
        </div>
      )
    }

    const data = stats.tendenciaUsuarios
    const maxCount = Math.max(...data.map(d => d.count), 1)
    const chartHeight = 180
    const chartWidth = data.length - 1 || 1

    // Crear puntos para el SVG
    const points = data.map((d, i) => {
      const x = (i / chartWidth) * 100
      const y = chartHeight - ((d.count / maxCount) * chartHeight * 0.9)
      return `${x},${y}`
    }).join(' ')

    // Crear área.fill
    const areaPoints = `M0,${chartHeight} L${points} L100,${chartHeight} Z`

    return (
      <div className="w-full h-48 relative mt-2">
        <svg className="w-full h-full" viewBox={`0 0 100 ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPoints} fill="url(#chartGradient)" />
          <polyline
            fill="none"
            points={points}
            stroke="#4ade80"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
          {data.length > 0 && (
            <>
              <span>{data[0].fecha}</span>
              <span>{data[Math.floor(data.length / 2)]?.fecha}</span>
              <span>{data[data.length - 1]?.fecha}</span>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        setProfileModalOpen={() => {}}
        userRole="admin"
        importedMaps={[]}
        roadmaps={[]}
        signOut={signOut}
      />

      {/* Contenido principal */}
      <main className="ml-64">
        <div className="pt-12 px-4 md:px-6 lg:px-8 pb-12 max-w-7xl w-full flex flex-col gap-6 lg:gap-8 overflow-x-hidden">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
              Panel de Administración
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Monitoreo y análisis de la plataforma PathFinderAI.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Usuarios */}
            <div className="p-4 lg:p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              <div className="flex justify-between items-start mb-4 lg:mb-8">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                  <span className="material-symbols-outlined text-primary text-lg lg:text-xl">group</span>
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                Usuarios Registrados
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
                {loading ? '...' : stats?.totalUsuarios?.toLocaleString() || 0}
              </h2>
            </div>

            {/* Roadmaps */}
            <div className="p-4 lg:p-6 rounded-2xl" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
              <div className="flex justify-between items-start mb-4 lg:mb-8">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                  <span className="material-symbols-outlined text-primary text-lg lg:text-xl">map</span>
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                Mapas Generados
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold" style={{ color: 'var(--color-on-surface)' }}>
                {loading ? '...' : stats?.totalRoadmaps?.toLocaleString() || 0}
              </h2>
            </div>
          </div>

          {/* Gráfico */}
          <section className="p-4 lg:p-6 xl:p-8 rounded-2xl flex flex-col gap-4 lg:gap-6" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
              <div>
                <h3 className="text-lg lg:text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                  Tendencia de Usuarios Registrados
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Crecimiento en los últimos 30 días.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="h-40 lg:h-48 flex items-center justify-center">
                <div className="animate-pulse" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
              </div>
            ) : (
              <>
                {/* Grilla */}
                <div className="relative w-full h-40 lg:h-48 overflow-hidden">
                  {/* Líneas horizontales */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                    <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                    <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                    <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                    <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                  </div>

                  {/* SVG Chart */}
                  {renderChart()}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}