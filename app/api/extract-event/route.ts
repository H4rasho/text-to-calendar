import {NextResponse} from 'next/server'
import OpenAI from 'openai'

export async function POST(req: Request) {
  try {
    const {text, apiKey} = await req.json()

    if (!text) {
      return NextResponse.json({error: 'El texto es requerido'}, {status: 400})
    }

    // Usa la clave API proporcionada por el usuario o la del entorno
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        {error: 'Se requiere una clave API de OpenAI'},
        {status: 400}
      )
    }

    // Inicializa el cliente de OpenAI con la clave proporcionada
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Extrae la información de eventos de calendario del siguiente texto. 
          Devuelve ÚNICAMENTE un objeto JSON válido (sin explicaciones adicionales) con los siguientes campos:
          - title: el título o asunto del evento
          - startDate: la fecha de inicio en formato ISO (YYYY-MM-DD)
          - startTime: la hora de inicio en formato 24h (HH:mm)
          - location: la ubicación del evento
          - description: descripción o detalles adicionales
          
          Si algún campo no está presente en el texto, devuelve null para ese campo.
          
          IMPORTANTE: Tu respuesta debe contener SOLAMENTE el objeto JSON, sin texto adicional.
          Ejemplo de formato de respuesta válido:
          { "title": "Reunión", "startDate": "2025-03-22", "startTime": "09:30", "location": "Oficina central", "description": "Llevar documentos" }`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
    })

    const responseContent = completion.choices[0].message.content

    if (!responseContent) {
      return NextResponse.json(
        {error: 'No se pudo extraer información del texto'},
        {status: 500}
      )
    }

    let eventData
    try {
      // Intentar analizar la respuesta como JSON
      eventData = JSON.parse(responseContent.trim())
    } catch (jsonError) {
      console.error(
        'Error al parsear JSON:',
        jsonError,
        'Contenido:',
        responseContent
      )
      // Intento de recuperación para casos donde el modelo devuelve texto extra alrededor del JSON
      try {
        // Buscar contenido que parezca JSON entre llaves
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          eventData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No se pudo extraer un objeto JSON válido')
        }
      } catch (finalError) {
        console.error('Error en intento de recuperación:', finalError)
        return NextResponse.json(
          {error: 'No se pudo extraer información estructurada del texto'},
          {status: 500}
        )
      }
    }

    return NextResponse.json(eventData)
  } catch (error) {
    console.error('Error al procesar el texto:', error)
    return NextResponse.json(
      {error: 'Error al procesar el texto'},
      {status: 500}
    )
  }
}
