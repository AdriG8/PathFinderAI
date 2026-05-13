// =============================================
// PÁGINA DE ADMIN - Panel de administración
// =============================================
// Componente que renderiza:
// - Sidebar (reutilizada del componente existente)
// - Panel de métricas (usuarios, roadmaps)
// - Gráfico de tendencia de registros
// - Tabla de temas consultados
// Estados y funciones principales:
// - stats: objeto con datos del admin
// - topics: array de temas consultados
// - loading: estado de carga
// - error: mensaje de error
// Efectos:
// - fetchStats: obtiene estadísticas del servidor
// - fetchTopics: obtiene todos los temas consultados

import { useState, useEffect } from 'react'
import { useAuth, API_URL } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'

interface AdminStats {
  totalUsuarios: number
  totalRoadmaps: number
  tendenciaUsuarios: { fecha: string; count: number }[]
}

interface Topic {
  id: string
  usuario: string
  tema: string
}

export default function AdminPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return
      
      const token = localStorage.getItem('token')
      try {
        const [statsRes, topicsRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/admin/topics`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        
        if (!statsRes.ok) {
          const err = await statsRes.json()
          setError(err.error || 'Error al cargar estadísticas')
          return
        }
        
        const statsData = await statsRes.json()
        setStats(statsData)
        
        if (topicsRes.ok) {
          const topicsData = await topicsRes.json()
          setTopics(topicsData)
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user])

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="animate-pulse text-xl" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="text-xl" style={{ color: 'var(--color-on-surface)' }}>No tienes acceso a esta página</div>
      </div>
    )
  }

  const renderChart = () => {
    const data = stats?.tendenciaUsuarios || []
    
    if (!data.length) {
      return (
        <div className="h-48 flex items-center justify-center text-on-surface-variant">
          No hay datos disponibles
        </div>
      )
    }

    const maxCount = Math.max(...data.map(d => d.count), 1)
    const chartHeight = 180

    let points, areaPoints
    if (data.length === 1) {
      const x = 50
      const y = chartHeight - ((data[0].count / maxCount) * chartHeight * 0.9)
      points = `${x},${y}`
      areaPoints = `M0,${chartHeight} L${x},${y} L100,${chartHeight} Z`
    } else {
      const chartWidth = data.length - 1
      points = data.map((d, i) => {
        const px = (i / chartWidth) * 100
        const py = chartHeight - ((d.count / maxCount) * chartHeight * 0.9)
        return `${px},${py}`
      }).join(' ')
      areaPoints = `M0,${chartHeight} L${points} L100,${chartHeight} Z`
    }

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
              {data.length > 1 && (
                <span>{data[Math.floor(data.length / 2)]?.fecha}</span>
              )}
              <span>{data[data.length - 1].fecha}</span>
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

      <main className="ml-64">
        <div className="pt-12 px-4 md:px-6 lg:px-8 pb-12 max-w-7xl w-full flex flex-col gap-6 lg:gap-8 overflow-x-hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}
              aria-label="Volver al inicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
              <div className="relative w-full h-40 lg:h-48 overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                  <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                  <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                  <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                  <div className="border-t w-full" style={{ borderColor: 'var(--color-outline)' }}></div>
                </div>
                {renderChart()}
              </div>
            )}
          </section>

          <section className="p-4 lg:p-6 xl:p-8 rounded-2xl flex flex-col gap-4 lg:gap-6" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold" style={{ color: 'var(--color-on-surface)' }}>
                Temas Consultados
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                Historial de todos los roadmaps generados por los usuarios.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse" style={{ color: 'var(--color-on-surface)' }}>Cargando...</div>
              </div>
            ) : topics.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-on-surface-variant">
                No hay temas consultados todavía
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-outline)' }}>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>Usuario</th>
                      <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--color-on-surface-variant)' }}>Tema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((topic) => (
                      <tr key={topic.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td className="py-3 px-4" style={{ color: 'var(--color-on-surface)' }}>{topic.usuario}</td>
                        <td className="py-3 px-4" style={{ color: 'var(--color-on-surface)' }}>{topic.tema}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}