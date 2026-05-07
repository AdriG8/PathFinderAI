// =============================================
// COMPONENTE TOASTER (SONNER)
// =============================================
// Componente de notificaciones toast personalizado para PathFinderAI
// Proporciona notificaciones emergentes en la esquina superior derecha

import {
  CircleCheck,  // Icono para éxito
  Info,         // Icono para información
  LoaderCircle, // Icono para cargando
  OctagonX,     // Icono para error
  TriangleAlert // Icono para advertencia
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

// Tipo para las props del Toaster
type ToasterProps = React.ComponentProps<typeof Sonner>

// Componente Toaster personalizado con estilos oscuros
// Usa iconos de Lucide y estilos blancos para tema oscuro
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group text-white"
      // Iconos personalizados para cada tipo de notificación
      icons={{
        success: <CircleCheck className="h-5 w-5 text-green-400" />,
        info: <Info className="h-5 w-5 text-blue-400" />,
        warning: <TriangleAlert className="h-5 w-5 text-yellow-400" />,
        error: <OctagonX className="h-5 w-5 text-red-400" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin text-gray-400" />,
      }}
      // Opciones de estilo para las notificaciones
      toastOptions={{
        // Estilos base del toast (fondo oscuro, borde, texto blanco)
        style: {
          background: '#1f1f1f',
          border: '1px solid #333',
          color: '#ffffff',
        },
        // Clases adicionales para personalizar elementos del toast
        classNames: {
          toast: "bg-[#1f1f1f] text-white border border-[#333] shadow-lg",
          description: "text-white opacity-90",
          actionButton: "bg-blue-600 text-white hover:bg-blue-700",
          cancelButton: "bg-gray-600 text-white hover:bg-gray-700",
        },
      }}
      // Habilita colores ricos para los iconos
      richColors
      {...props}
    />
  )
}

export { Toaster }