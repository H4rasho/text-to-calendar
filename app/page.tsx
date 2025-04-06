'use client'

import {useState, ChangeEvent, FormEvent} from 'react'
import * as Label from '@radix-ui/react-label'
import {generateICSFile, EventData} from '@/lib/ics-generator'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [editableData, setEditableData] = useState<EventData>({
    title: '',
    startDate: '',
    startTime: '',
    location: '',
    description: '',
  })
  const [showResults, setShowResults] = useState(false)

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name, value} = e.target
    setEditableData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleExtractData = async () => {
    if (!inputText.trim()) {
      setError('Por favor, ingresa un texto para procesar')
      return
    }

    if (!apiKey.trim() && !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setError('Se requiere una clave de API de OpenAI para procesar el texto')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/extract-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          apiKey: apiKey.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al procesar el texto')
      }

      const data = await response.json()
      setEditableData({
        title: data.title || '',
        startDate: data.startDate || '',
        startTime: data.startTime || '',
        location: data.location || '',
        description: data.description || '',
      })
      setShowResults(true)
    } catch (err) {
      setError('Ocurrió un error al procesar el texto. Intenta nuevamente.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadICS = (e: FormEvent) => {
    e.preventDefault()
    try {
      const icsContent = generateICSFile(editableData)

      // Crear un blob con el contenido ICS
      const blob = new Blob([icsContent], {type: 'text/calendar;charset=utf-8'})

      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob)

      // Crear enlace y descargar
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${editableData.title || 'evento'}.ics`)
      document.body.appendChild(link)
      link.click()

      // Limpieza
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Puedes elegir si quieres ocultar los resultados después de descargar
      // setShowResults(false);
    } catch (err) {
      setError('Error al generar el archivo ICS')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-background  relative overflow-hidden">
      {/* Capa decorativa con efecto radial */}
      <div className="absolute inset-0" aria-hidden="true"></div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-3xl mx-auto p-6 sm:p-10">
        <header className="mb-10 text-center relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-r from-[#4B66EA] to-[#7085F2] flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="pt-10 pb-2">
            <h1 className="text-3xl font-bold mb-2 text-foreground bg-clip-text text-transparent bg-gradient-to-r from-[#192B5D] to-[#4B66EA]">
              Texto a Calendario
            </h1>
            <p className="text-sm text-[var(--gray-dark)]">
              Convierte descripciones de texto a archivos de calendario (.ics)
              <span className="px-1">•</span>
              <span className="text-[var(--accent)]">Potenciado por IA</span>
            </p>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent mt-4"></div>
        </header>

        <main className="rounded-xl border border-[var(--accent)]/30 p-6 bg-[#f8faff] backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <Label.Root
                className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                htmlFor="event-text"
              >
                Texto del evento
              </Label.Root>
              <textarea
                id="event-text"
                className="w-full h-40 p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                placeholder="Ingresa la descripción del evento (ej: Recuerda que tienes una hora para Laboratorio, el día Sábado 22 de marzo de 2025...)"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                {showApiKey
                  ? 'Ocultar configuración API'
                  : 'Configurar API Key'}
              </button>
            </div>

            {showApiKey && (
              <div className="p-4 rounded-lg border border-[var(--accent)]/30 bg-[#f8faff]">
                <Label.Root
                  className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                  htmlFor="api-key"
                >
                  Clave API de OpenAI
                </Label.Root>
                <input
                  id="api-key"
                  type="password"
                  className="w-full p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <p className="mt-2 text-xs text-[var(--gray)]">
                  Si no proporcionas una clave, se usará la configurada en el
                  servidor si está disponible.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500">
                {error}
              </div>
            )}

            <button
              className="w-full py-3 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleExtractData}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--foreground)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Procesar texto'
              )}
            </button>

            {showResults && (
              <div className="mt-10 pt-6 border-t border-[var(--accent)]/20">
                <h2 className="text-xl font-bold mb-6 text-[var(--accent-light)]">
                  Información extraída
                </h2>

                <p className="text-sm text-[var(--gray)] mb-5 italic">
                  Puedes modificar cualquiera de estos campos antes de descargar
                  el archivo de calendario.
                </p>

                <form onSubmit={handleDownloadICS} className="space-y-4">
                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                      htmlFor="title"
                    >
                      Título
                    </Label.Root>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="w-full p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                      value={editableData.title}
                      onChange={handleInputChange}
                      placeholder="Título del evento"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label.Root
                        className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                        htmlFor="startDate"
                      >
                        Fecha
                      </Label.Root>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="w-full p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                        value={editableData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label.Root
                        className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                        htmlFor="startTime"
                      >
                        Hora
                      </Label.Root>
                      <input
                        id="startTime"
                        name="startTime"
                        type="time"
                        className="w-full p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                        value={editableData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                      htmlFor="location"
                    >
                      Ubicación
                    </Label.Root>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="w-full p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                      value={editableData.location}
                      onChange={handleInputChange}
                      placeholder="Ubicación del evento"
                    />
                  </div>

                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-dark)]"
                      htmlFor="description"
                    >
                      Descripción
                    </Label.Root>
                    <textarea
                      id="description"
                      name="description"
                      className="w-full h-24 p-3 rounded-lg bg-[#ffffff] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                      value={editableData.description}
                      onChange={handleInputChange}
                      placeholder="Descripción o detalles adicionales"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-medium hover:bg-[var(--accent-hover)] transition-colors"
                  >
                    Descargar archivo .ICS
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-10 text-center text-xs text-[var(--gray)] pt-4 border-t border-[var(--accent)]/20">
          <span className="mx-1">•</span>{' '}
          <a
            href="https://github.com/H4rasho/text-to-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            GitHub
          </a>
        </footer>
      </div>
    </div>
  )
}
