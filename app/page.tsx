"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Label from "@radix-ui/react-label";
import { generateICSFile, EventData } from "@/lib/ics-generator";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<EventData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      setExtractedData(data);
      setDialogOpen(true);
    } catch (err) {
      setError("Ocurrió un error al procesar el texto. Intenta nuevamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadICS = () => {
    try {
      if (!extractedData) return;

      const icsContent = generateICSFile(extractedData);
      
      // Crear un blob con el contenido ICS
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      
      // Crear URL para descargar
      const url = window.URL.createObjectURL(blob);
      
      // Crear enlace y descargar
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${extractedData.title || "evento"}.ics`);
      document.body.appendChild(link);
      link.click();
      
      // Limpieza
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDialogOpen(false);
    } catch (err) {
      setError("Error al generar el archivo ICS");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto p-6 sm:p-10">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Texto a Calendario</h1>
          <p className="text-sm opacity-70">
            Convierte descripciones de texto a archivos de calendario (.ics) usando IA
          </p>
        </header>

        <main className="rounded-xl border border-foreground/10 p-6 bg-foreground/[0.02] backdrop-blur-md">
          <div className="space-y-6">
            <div>
              <Label.Root
                className="text-sm font-medium mb-2 block"
                htmlFor="event-text"
              >
                Texto del evento
              </Label.Root>
              <textarea
                id="event-text"
                className="w-full h-40 p-3 rounded-lg bg-background border border-foreground/10 focus:ring-2 focus:ring-foreground/20 focus:outline-none focus:border-foreground/30 transition duration-200"
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
              className="w-full py-3 px-4 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleExtractData}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Procesar texto"
              )}
            </button>
          </div>
        </main>

        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-xl border border-foreground/10 shadow-xl w-[90vw] max-w-md max-h-[85vh] p-6">
              <Dialog.Title className="text-xl font-bold mb-4">
                Información extraída
              </Dialog.Title>
              
              {extractedData && (
                <div className="space-y-4 mb-6 text-sm">
                  <div>
                    <div className="font-medium opacity-70 mb-1">Título</div>
                    <div>{extractedData.title || "No detectado"}</div>
                  </div>
                  <div>
                    <div className="font-medium opacity-70 mb-1">Fecha</div>
                    <div>{extractedData.startDate || "No detectada"}</div>
                  </div>
                  <div>
                    <div className="font-medium opacity-70 mb-1">Hora</div>
                    <div>{extractedData.startTime || "No detectada"}</div>
                  </div>
                  <div>
                    <div className="font-medium opacity-70 mb-1">Ubicación</div>
                    <div>{extractedData.location || "No detectada"}</div>
                  </div>
                  {extractedData.description && (
                    <div>
                      <div className="font-medium opacity-70 mb-1">Descripción</div>
                      <div>{extractedData.description}</div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3 justify-end">
                <Dialog.Close asChild>
                  <button 
                    className="px-4 py-2 rounded-lg border border-foreground/10 text-sm hover:bg-foreground/5 transition-colors"
                  >
                    Cancelar
                  </button>
                </Dialog.Close>
                <button 
                  className="px-4 py-2 rounded-lg bg-foreground text-background text-sm hover:opacity-90 transition-opacity"
                  onClick={handleDownloadICS}
                >
                  Descargar .ICS
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <footer className="mt-10 text-center text-xs opacity-60 pt-4 border-t border-foreground/10">
          <p>Construido con Next.js, Tailwind CSS y IA</p>
        </footer>
      </div>
    </div>
  );
}
