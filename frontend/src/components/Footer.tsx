// =============================================
// COMPONENTE PIE DE PÁGINA (FOOTER)
// =============================================

// Componente reutilizable para el pie de página
export default function Footer() {
  // Renderiza el pie de página
  return (
    // Contenedor del footer
    <footer className="w-full pt-8 mt-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Contenedor principal */}
      <div className="flex flex-col md:flex-row justify-between items-center px-6 py-8 w-full max-w-7xl mx-auto gap-4">
        {/* Copyright */}
        <span className="text-[0.75rem]" style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter' }}>© 2026 PathFinderAI</span>
        
        {/* Enlaces legales */}
        <div className="flex gap-6">
          <a 
            className="text-[0.75rem] transition-all duration-150" 
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} 
            href="#"
          >
            Privacy Policy
          </a>
          <a 
            className="text-[0.75rem] transition-all duration-150" 
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} 
            href="#"
          >
            Terms of Service
          </a>
          <a 
            className="text-[0.75rem] transition-all duration-150" 
            style={{ color: 'var(--color-on-surface-variant)', fontFamily: 'Inter', textDecorationColor: 'var(--color-primary-container)' }} 
            href="#"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  )
}