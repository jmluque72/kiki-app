import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useApiErrorHandler } from './ApiErrorHandler';
import EventService from '../src/services/eventService';

export const ExampleWithErrorHandling: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const { showError } = useApiErrorHandler();

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Ejemplo de llamada que podría fallar con 401
      const eventsData = await EventService.getEventsByInstitution('institution-id');
      setEvents(eventsData.events);
    } catch (error: any) {
      // El interceptor ya maneja automáticamente los errores 401
      // Este showError es para mostrar mensajes personalizados
      const errorInfo = showError(error, 'Error al cargar eventos');
      
      // Si no es un error 401, podemos hacer algo específico
      if (!errorInfo.shouldLogout) {
        console.log('Error no relacionado con autenticación:', errorInfo.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async () => {
    try {
      const newEvent = await EventService.createEvent({
        titulo: 'Evento de prueba',
        descripcion: 'Descripción del evento',
        fecha: '2024-12-31',
        hora: '18:00'
      });
      
      Alert.alert('Éxito', 'Evento creado correctamente');
    } catch (error: any) {
      // El interceptor maneja automáticamente los errores 401
      showError(error, 'Error al crear evento');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Ejemplo de Manejo de Errores
      </Text>
      
      <Button 
        title={loading ? "Cargando..." : "Cargar Eventos"} 
        onPress={loadEvents}
        disabled={loading}
      />
      
      <View style={{ marginTop: 10 }}>
        <Button 
          title="Crear Evento" 
          onPress={createEvent}
        />
      </View>
      
      <Text style={{ marginTop: 20 }}>
        Eventos cargados: {events.length}
      </Text>
    </View>
  );
};
