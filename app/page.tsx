"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import * as Label from "@radix-ui/react-label";
import { generateICSFile, EventData } from "@/lib/ics-generator";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editableData, setEditableData] = useState<EventData>({ 
    title: "", 
    startDate: "", 
    startTime: "", 
    location: "", 
    description: "" 
  });
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleExtractData = async () => {
    if (!inputText.trim()) {
      setError("Por favor, ingresa un texto para procesar");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Error al procesar el texto");
      }

      const data = await response.json();
      setEditableData({
        title: data.title || "",
        startDate: data.startDate || "",
        startTime: data.startTime || "",
        location: data.location || "",
        description: data.description || ""
      });
      setShowResults(true);
    } catch (err) {
      setError("Ocurrió un error al procesar el texto. Intenta nuevamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadICS = (e: FormEvent) => {
    e.preventDefault();
    try {
      const icsContent = generateICSFile(editableData);
      
      // Crear un blob con el contenido ICS
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      
      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace y descargar
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${editableData.title || "evento"}.ics`);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Puedes elegir si quieres ocultar los resultados después de descargar
      // setShowResults(false);
    } catch (err) {
      setError("Error al generar el archivo ICS");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] via-[#151e19] to-[color-mix(in_srgb,var(--background),var(--accent)_20%)] text-[var(--foreground)] relative overflow-hidden">
      {/* Capa decorativa con efecto radial */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(32,121,71,0.15),transparent_60%)]" aria-hidden="true"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-3xl mx-auto p-6 sm:p-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-[var(--accent-light)]">Texto a Calendario</h1>
          <p className="text-sm text-[var(--gray)]">
            Convierte descripciones de texto a archivos de calendario (.ics) usando IA
          </p>
        </header>

        <main className="rounded-xl border border-[var(--accent)]/30 p-6 bg-[rgba(32,121,71,0.08)] backdrop-blur-sm shadow-[0_4px_20px_rgba(32,121,71,0.15)]">
          <div className="space-y-6">
            <div>
              <Label.Root
                className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                htmlFor="event-text"
              >
                Texto del evento
              </Label.Root>
              <textarea
                id="event-text"
                className="w-full h-40 p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                placeholder="Ingresa la descripción del evento (ej: Recuerda que tienes una hora para Laboratorio, el día Sábado 22 de marzo de 2025...)"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

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
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[var(--foreground)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Procesar texto"
              )}
            </button>
            
            {showResults && (
              <div className="mt-10 pt-6 border-t border-[var(--accent)]/20">
                <h2 className="text-xl font-bold mb-6 text-[var(--accent-light)]">Información extraída</h2>
                
                <form onSubmit={handleDownloadICS} className="space-y-4">
                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                      htmlFor="title"
                    >
                      Título
                    </Label.Root>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                      value={editableData.title}
                      onChange={handleInputChange}
                      placeholder="Título del evento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label.Root
                        className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                        htmlFor="startDate"
                      >
                        Fecha
                      </Label.Root>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                        value={editableData.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label.Root
                        className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                        htmlFor="startTime"
                      >
                        Hora
                      </Label.Root>
                      <input
                        id="startTime"
                        name="startTime"
                        type="time"
                        className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                        value={editableData.startTime}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                      htmlFor="location"
                    >
                      Ubicación
                    </Label.Root>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
                      value={editableData.location}
                      onChange={handleInputChange}
                      placeholder="Ubicación del evento"
                    />
                  </div>
                  
                  <div>
                    <Label.Root
                      className="text-sm font-medium mb-2 block text-[var(--gray-light)]"
                      htmlFor="description"
                    >
                      Descripción
                    </Label.Root>
                    <textarea
                      id="description"
                      name="description"
                      className="w-full h-24 p-3 rounded-lg bg-[#1a1a1a] border border-[var(--accent)]/30 focus:ring-2 focus:ring-[var(--accent)]/40 focus:outline-none focus:border-[var(--accent)] transition duration-200 text-[var(--foreground)]"
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
          <p>Construido con Next.js, Tailwind CSS y IA</p>
        </footer>
      </div>
    </div>
  );
}
