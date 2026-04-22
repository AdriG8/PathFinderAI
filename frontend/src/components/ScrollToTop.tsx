// Importa el hook useEffect para ejecutar efectos secundarios
import { useEffect } from 'react'
// Importa el hook useLocation para obtener la ubicación actual
import { useLocation } from 'react-router-dom'

// =============================================
// COMPONENTE PARA SCROLL AL TOP
// =============================================

// Componente que hace scroll al top cuando cambia la ruta
export function ScrollToTop() {
  // Obtiene la ruta actual
  const { pathname } = useLocation()

  // Efecto que se ejecuta cuando cambia la ruta
  useEffect(() => {
    // Desplaza la página al inicio
    window.scrollTo(0, 0)
  }, [pathname])

  // No renderiza nada visualmente
  return null
}

// =============================================
// COMPONENTE DE TRANSICIÓN DE PÁGINA
// =============================================

// Componente que anima la transición entre páginas
export function PageTransition({ children }: { children: React.ReactNode }) {
  // Obtiene la ubicación actual
  const location = useLocation()

  // Renderiza los hijos con una key única para forzar re-render
  return (
    <div
      key={location.pathname}
      className="animate-fade-in"
    >
      {children}
    </div>
  )
}