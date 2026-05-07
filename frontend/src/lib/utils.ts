// =============================================
// UTILIDADES
// =============================================

// Importa las librerías necesarias para combinar clases de Tailwind
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Función helper para combinar clases de Tailwind CSS
// Útil para cuando se tienen múltiples clases condicionales
// Ejemplo: cn("px-2 py-1", isActive && "bg-blue-500", className)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}