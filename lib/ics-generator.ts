import ical, { ICalEventData } from 'ical-generator';

export interface EventData {
  title: string | null;
  startDate: string | null;
  startTime: string | null;
  location: string | null;
  description: string | null;
}

export function generateICSFile(eventData: EventData): string {
  const calendar = ical({ name: 'Mi Calendario' });
  
  // Validamos que al menos tengamos título y fecha
  if (!eventData.title || !eventData.startDate) {
    throw new Error('Se requiere al menos título y fecha para crear un evento');
  }

  // Combinamos fecha y hora si existe
  let startDate: Date;
  if (eventData.startDate) {
    if (eventData.startTime) {
      // Combinar fecha y hora para crear un objeto Date
      const [year, month, day] = eventData.startDate.split('-').map(Number);
      const [hour, minute] = eventData.startTime.split(':').map(Number);
      startDate = new Date(year, month - 1, day, hour, minute);
    } else {
      // Solo fecha sin hora específica
      const [year, month, day] = eventData.startDate.split('-').map(Number);
      startDate = new Date(year, month - 1, day);
    }
  } else {
    throw new Error('Fecha de inicio no válida');
  }

  // Configurar el evento
  const eventConfig: ICalEventData = {
    start: startDate,
    summary: eventData.title,
    description: eventData.description || undefined,
    location: eventData.location || undefined,
    // Por defecto, definimos que el evento dura 1 hora si no se especifica
    end: new Date(startDate.getTime() + 60 * 60 * 1000)
  };

  calendar.createEvent(eventConfig);
  
  return calendar.toString();
}
