import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function MainPage() {
  const [isLoggedIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="relative h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
      <aside 
        className="fixed left-0 top-0 h-full flex flex-col py-4 px-3 z-30 transition-all duration-200"
        style={{ 
          backgroundColor: 'var(--color-surface-container-low)',
          width: sidebarOpen ? '16rem' : '4rem',
          overflow: 'hidden'
        }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="flex items-center gap-3 mb-8 px-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <img alt="PathFinder AI Logo" className="w-full h-full object-contain rounded-lg" src="/Picture.png" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tighter leading-tight" style={{ color: 'var(--color-primary)' }}>PathFinder AI</span>
            </div>
          )}
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          <button className="rounded-full px-4 py-2 flex items-center gap-3 group active:scale-[0.98] transition-all duration-200" style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}>
            <span className="material-symbols-outlined text-xl">add</span>
            {sidebarOpen && <span className="text-sm font-medium">Nuevo chat</span>}
          </button>

          <Link 
            to="/example" 
            className="rounded-full px-4 py-2 flex items-center gap-3 group active:scale-[0.98] transition-all duration-200"
            style={{ backgroundColor: 'var(--color-surface-container-high)', color: '#f5f5f5' }}
          >
            <span className="material-symbols-outlined text-xl">map</span>
            {sidebarOpen && <span className="text-sm font-medium">Example</span>}
          </Link>
        </nav>
      </aside>

      <header 
        className="relative z-10 flex justify-end items-center px-6 py-4"
      >
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--color-on-surface)' }}>Usuario</span>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-xs font-bold uppercase tracking-widest transition-opacity duration-200 whitespace-nowrap" style={{ color: 'var(--color-on-surface-variant)' }}>
                Iniciar sesión
              </Link>
              <Link to="/register" className="text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity duration-200 whitespace-nowrap" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="h-[calc(100vh-64px)] flex flex-col items-center justify-center relative overflow-hidden pt-4" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: 'rgba(198, 198, 199, 0.05)' }}></div>
        
        <div className="relative z-10 w-full max-w-3xl px-6 text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight" style={{ color: 'var(--color-on-surface)' }}>
            ¿Qué quieres aprender hoy?
          </h1>
          <p className="text-lg max-w-lg mx-auto font-light leading-relaxed" style={{ color: 'var(--color-on-surface-variant)' }}>
            Tu asistente personal para el conocimiento profundo y la creatividad sin límites.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col mb-12 gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Física Cuántica
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Desarrollo con IA
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Historia del Arte
            </button>
            <button className="p-3 rounded-2xl transition-all text-xs" style={{ backgroundColor: 'var(--color-surface-container-low)', color: 'var(--color-on-surface-variant)', border: '1px solid rgba(72, 72, 72, 0.05)' }}>
              Quiero aprender Estrategia de Negocios
            </button>
          </div>

          <div className="flex items-center rounded-full px-6 py-3 transition-all focus-within:outline-none" style={{ backgroundColor: 'var(--color-surface-container-highest)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <input 
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base"
              style={{ color: 'var(--color-on-surface)' }}
              placeholder="Pregunta cualquier cosa..." 
              type="text"
            />
            <button className="ml-4 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all" style={{ backgroundColor: 'var(--color-surface-bright)', color: 'var(--color-on-surface)' }}>
              <span className="material-symbols-outlined text-xl">arrow_upward</span>
            </button>
          </div>
        </div>

        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-10 text-center">
          <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: 'var(--color-on-tertiary-fixed-variant)' }}>
            PathFinder AI puede cometer errores. Considera verificar la información importante.
          </p>
        </footer>
      </main>
    </div>
  )
}