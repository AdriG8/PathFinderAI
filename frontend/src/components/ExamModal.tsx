// =============================================
// COMPONENTE MODAL DE EXAMEN
// =============================================
// Modal que muestra un examen tipo test generado con IA
// para validar que el usuario ha aprendido el contenido del nodo

import { useState, useEffect } from 'react'
import { X, Award } from 'lucide-react'

// =============================================
// INTERFAZ DE PROPS
// =============================================

interface ExamQuestion {
  question: string
  options: { letter: string; text: string }[]
  correctAnswer: string
  explanation: string
}

interface ExamModalProps {
  // Indica si el modal esta abierto
  isOpen: boolean
  // Funcion para cerrar el modal
  onClose: () => void
  // Tema del nodo para generar el examen
  topic: string
  // Funcion llamada cuando el usuario aprueba el examen
  onPass: () => void
}

// =============================================
// COMPONENTE MODAL DE EXAMEN
// =============================================

export default function ExamModal({ isOpen, onClose, topic, onPass }: ExamModalProps) {
  // Estados del componente
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Generando examen...')
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<{ question: number; selected: string; correct: boolean }[]>([])
  const [examFinished, setExamFinished] = useState(false)
  const [passed, setPassed] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // URL de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  // Efecto para generar el examen cuando se abre el modal
  useEffect(() => {
    let messageInterval: ReturnType<typeof setInterval> | null = null
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    if (isOpen && topic) {
      generateExam()
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isOpen, topic])

  // ============================================
  // FUNCION: Generar examen con IA
  // ============================================
  const generateExam = async () => {
    setLoading(true)
    setError(null)
    setQuestions([])
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAnswers([])
    setExamFinished(false)
    setPassed(false)
    setLoadingProgress(0)

    const loadingMessages = [
      'Preparando preguntas...',
      'Generando opciones...',
      'Casi listo...'
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      if (messageIndex < loadingMessages.length) {
        setLoadingMessage(loadingMessages[messageIndex])
        setLoadingProgress((messageIndex + 1) / loadingMessages.length * 80)
        messageIndex++
      }
    }, 2000)

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), 45000)
    })

    try {
      const token = localStorage.getItem('token')

      const fetchPromise = fetch(`${API_URL}/api/exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic })
      })

      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response
      const data = await response.json()
      const errorStatus = response.status
      const errorMessage = (data.error || '').toLowerCase()

      clearInterval(messageInterval)

      if (!response.ok) {
        if (errorStatus === 429 || errorMessage.includes('demasiadas peticiones') || errorMessage.includes('too many requests')) {
          setError('Has hecho demasiadas peticiones, por favor inténtelo más tarde')
        } else if (errorStatus === 503 || errorMessage.includes('high demand') || errorMessage.includes('service unavailable') || errorMessage.includes('saturado')) {
          setError('El servicio de generación está experimentando una alta demanda, por favor espere e inténtelo más tarde')
        } else if (errorMessage.includes('tema no válido') || errorMessage.includes('tema no valido')) {
          setError('El tema introducido no es válido, vuelva a introducir un tema correcto')
        } else {
          setError('Ha habido un error generando su examen, por favor inténtelo de nuevo')
        }
        setLoading(false)
        return
      }

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        setError('Ha habido un error generando su examen, por favor inténtelo de nuevo')
        setLoading(false)
        return
      }

      setLoadingProgress(100)
      setLoadingMessage('¡Examen listo!')
      setTimeout(() => {
        setQuestions(data.questions || [])
        setLoading(false)
      }, 300)
    } catch (err: any) {
      clearInterval(messageInterval)
      const errorText = err.message || ''

      if (errorText === 'timeout') {
        setError('El servicio está tardando demasiado, por favor inténtelo más tarde')
      } else if (errorText.includes('Unexpected token') || errorText.includes('JSON')) {
        setError('Ha habido un error generando su examen, por favor inténtelo de nuevo')
      } else {
        setError('Ha ocurrido un error, por favor inténtelo más tarde')
      }
      setLoading(false)
    }
  }

  // ============================================
  // FUNCION: Manejar seleccion de respuesta
  // ============================================
  const handleAnswer = (letter: string) => {
    // No permite cambiar si ya se mostro el resultado
    if (showResult) return
    setSelectedAnswer(letter)
  }

  // ============================================
  // FUNCION: Confirmar respuesta
  // ============================================
  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !questions[currentQuestion]) return

    // Verifica si la respuesta es correcta
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer
    // Guarda la respuesta
    setAnswers([...answers, { question: currentQuestion, selected: selectedAnswer, correct: isCorrect }])
    setShowResult(true)
  }

  // ============================================
  // FUNCION: Siguiente pregunta
  // ============================================
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Avanza a la siguiente pregunta
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // Finaliza el examen
      finishExam()
    }
  }

  // ============================================
  // FUNCION: Finalizar examen
  // ============================================
  const finishExam = () => {
    const correctCount = answers.filter(a => a.correct).length
    const passedExam = correctCount >= 2
    setPassed(passedExam)
    setExamFinished(true)
  }

  // Si no esta abierto, no renderiza nada
  if (!isOpen) return null

  // Cuenta las respuestas correctas
  const correctAnswers = answers.filter(a => a.correct).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro semitransparente */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--color-outline)' }}>
          <div className="flex items-center gap-3">
            {/* Icono de premio/certificado */}
            <Award className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-on-surface)' }}>Examen</h2>
              <p className="text-xs" style={{ color: 'var(--color-on-surface-variant)' }}>{topic}</p>
            </div>
          </div>
          {/* Boton de cerrar */}
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" style={{ color: 'var(--color-on-surface-variant)' }} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Estado de carga */}
          {loading && (
            <div className="flex flex-col items-center py-8">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'var(--color-surface-container-high)' }} />
                <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-on-surface)' }}>{loadingMessage}</p>
              <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%`, backgroundColor: 'var(--color-primary)' }}
                />
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--color-on-surface-variant)' }}>
                Esto puede tardar unos segundos
              </p>
            </div>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}>
                <X className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--color-on-surface)' }}>{error}</p>
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
                  Cerrar
                </button>
                <button onClick={generateExam} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Resultados finales */}
          {!loading && !error && examFinished && (
            <div className="text-center py-8">
              {passed ? (
                <>
                  {/* Indicador de aprobado */}
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                    <Award className="w-10 h-10" style={{ color: '#10b981' }} />
                  </div>
                  <h3 className="text-2xl font-bold mt-4" style={{ color: '#10b981' }}>Aprobado</h3>
                  <p className="mt-2" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Has acertado {correctAnswers} de {questions.length} preguntas
                  </p>
                </>
              ) : (
                <>
                  {/* Indicador de no aprobado */}
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <X className="w-10 h-10" style={{ color: '#ef4444' }} />
                  </div>
                  <h3 className="text-2xl font-bold mt-4" style={{ color: '#ef4444' }}>No aprobado</h3>
                  <p className="mt-2" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Has acertado {correctAnswers} de {questions.length} preguntas. Necesitas al menos 2.
                  </p>
                </>
              )}
              {/* Botones de accion */}
              <div className="mt-6 flex gap-3 justify-center">
                <button onClick={generateExam} className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }}>
                  Reintentar
                </button>
                <button onClick={() => { onPass(); onClose() }} disabled={!passed} className="px-4 py-2 rounded-lg font-medium disabled:opacity-50" style={{ backgroundColor: passed ? '#10b981' : 'var(--color-surface-container-high)', color: 'white' }}>
                  {passed ? 'Marcar como completado' : 'Volver al roadmap'}
                </button>
              </div>
            </div>
          )}

          {/* Preguntas del examen */}
          {!loading && !error && !examFinished && questions.length > 0 && (
            <>
              {/* Barra de progreso */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-on-surface-variant)' }}>
                  <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                  <span>{answers.filter(a => a.correct).length} correctas</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: 'var(--color-primary)' }} />
                </div>
              </div>

              {/* Pregunta actual */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--color-on-surface)' }}>
                  {questions[currentQuestion].question}
                </h3>

                {/* Opciones de respuesta */}
                <div className="space-y-2">
                  {questions[currentQuestion].options.map((option) => {
                    // Estilos base
                    let bgColor = 'var(--color-surface-container-high)'
                    let borderColor = 'var(--color-outline)'
                    let textColor = 'var(--color-on-surface)'
                    let boxShadow = 'none'

                    // Si se mostro el resultado
                    if (showResult) {
                      // Respuesta correcta - verde
                      if (option.letter === questions[currentQuestion].correctAnswer) {
                        bgColor = 'rgba(16, 185, 129, 0.2)'
                        borderColor = '#10b981'
                        textColor = '#10b981'
                        boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.3)'
                      } else if (option.letter === selectedAnswer && option.letter !== questions[currentQuestion].correctAnswer) {
                        // Respuesta incorrecta - rojo
                        bgColor = 'rgba(239, 68, 68, 0.2)'
                        borderColor = '#ef4444'
                        textColor = '#ef4444'
                        boxShadow = '0 0 0 2px rgba(239, 68, 68, 0.3)'
                      }
                    } else if (selectedAnswer === option.letter) {
                      // Opcion seleccionada - borde blanco
                      borderColor = 'white'
                      boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.3)'
                    }

                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswer(option.letter)}
                        disabled={showResult}
                        className="w-full p-3 rounded-lg text-left transition-all border-2"
                        style={{ backgroundColor: bgColor, borderColor, color: textColor, boxShadow }}
                      >
                        <span className="font-bold mr-2">{option.letter.toUpperCase()}.</span>
                        {option.text}
                      </button>
                    )
                  })}
                </div>

                {/* Explicacion de la respuesta */}
                {showResult && (
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-container-high)' }}>
                    <p className="text-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      <strong>Explicacion:</strong> {questions[currentQuestion].explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de accion */}
              <div className="flex justify-end gap-3">
                {!showResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer}
                    className="px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    Confirmar respuesta
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    {currentQuestion < questions.length - 1 ? 'Siguiente pregunta' : 'Ver resultados'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
