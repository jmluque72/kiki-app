import { useState, useEffect, useCallback } from 'react';
import { useInstitution } from '../../contexts/InstitutionContext';
import EventService, { Event, CreateEventRequest } from '../services/eventService';

export const useEvents = () => {
  const { selectedInstitution } = useInstitution();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);

  const loadEvents = useCallback(async () => {

    if (!selectedInstitution?.account?._id) {
      setEvents([]);
      setUpcomingEvents([]);
      setPastEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📅 [USE EVENTS] Cargando eventos para institución:', selectedInstitution.account._id);
      if (selectedInstitution?.division?._id) {
        console.log('📚 [USE EVENTS] Filtrando por división:', selectedInstitution.division._id);
      }
      
      const response = await EventService.getEventsByInstitution(
        selectedInstitution.account._id,
        1,
        20,
        selectedInstitution?.division?._id
      );
      setEvents(response.events);

      // Separar eventos próximos y pasados
      const now = new Date();
      const upcoming = response.events.filter(event => new Date(event.fecha) > now);
      const past = response.events.filter(event => new Date(event.fecha) <= now);

      setUpcomingEvents(upcoming);
      setPastEvents(past);

      console.log('📅 [USE EVENTS] Eventos cargados:', {
        total: response.events.length,
        upcoming: upcoming.length,
        past: past.length
      });

    } catch (err) {
      console.error('❌ [USE EVENTS] Error al cargar eventos:', err);
      setError('Error al cargar eventos');
      setEvents([]);
      setUpcomingEvents([]);
      setPastEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedInstitution?.account?._id]);

  const createEvent = useCallback(async (eventData: CreateEventRequest): Promise<boolean> => {
    if (!selectedInstitution?.account?._id) {
      setError('No hay institución seleccionada');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📅 [USE EVENTS] Creando evento:', eventData);
      
      const payload = {
        ...eventData,
        institutionId: selectedInstitution.account._id,
        divisionId: selectedInstitution?.division?._id,
      };
      const newEvent = await EventService.createEvent(payload);
      
      // Agregar el nuevo evento a la lista
      setEvents(prev => [newEvent, ...prev]);
      
      // Actualizar eventos próximos si es un evento futuro
      const now = new Date();
      if (new Date(newEvent.fecha) > now) {
        setUpcomingEvents(prev => [newEvent, ...prev]);
      } else {
        setPastEvents(prev => [newEvent, ...prev]);
      }

      console.log('📅 [USE EVENTS] Evento creado exitosamente:', newEvent._id);
      return true;

    } catch (err: any) {
      console.error('❌ [USE EVENTS] Error al crear evento:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al crear evento';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [selectedInstitution?.account?._id]);

  const refreshEvents = useCallback(() => {
    loadEvents();
  }, [loadEvents]);

  // Cargar eventos cuando cambie la institución seleccionada
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    upcomingEvents,
    pastEvents,
    loading,
    error,
    createEvent,
    refreshEvents,
    loadEvents
  };
};
