# Texto a Calendario

Aplicación que convierte descripciones de texto en archivos de calendario (.ics) utilizando inteligencia artificial. La aplicación extrae automáticamente la información relevante como fecha, hora, ubicación y asunto del evento a partir de texto libre.

## Características

- Interfaz de usuario moderna y responsive utilizando Tailwind CSS 4
- Procesamiento de lenguaje natural mediante la API de OpenAI
- Generación de archivos .ics compatibles con la mayoría de aplicaciones de calendario
- Diseño adaptativo para móviles y escritorio

## Requisitos previos

- Node.js 18.0 o superior
- Una clave API de OpenAI

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:
   ```
   OPENAI_API_KEY=tu_clave_api_aquí
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Uso

1. Ingresa una descripción de texto que incluya detalles sobre un evento (fecha, hora, lugar, etc.)
2. Haz clic en "Procesar texto"
3. Revisa la información extraída
4. Descarga el archivo .ics

## Ejemplo de texto

```
Recuerda que tienes una hora para Laboratorio, el día Sábado 22 de marzo de 2025, a las 09:12, en Clínica INDISA Providencia ubicada en Los Españoles 1855 Piso 1.
Recuerda traer tu cédula de identidad, orden impresa y llegar con 10 minutos de anticipación.
```

## Tecnologías utilizadas

- Next.js 15
- Tailwind CSS 4
- Radix UI
- OpenAI API
- ical-generator
