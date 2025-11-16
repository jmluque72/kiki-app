import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActivityCard } from '../../src/components/ActivityCard';
import { Activity } from '../../src/types/activity';

// Mock de dependencias
jest.mock('../../src/services/mediaService', () => ({
  mediaService: {
    getMediaUrl: jest.fn((filename) => `https://mock-url.com/${filename}`),
  },
}));

describe('ActivityCard', () => {
  const mockActivity: Activity = {
    _id: '1',
    title: 'Actividad de Prueba',
    description: 'Esta es una actividad de prueba para los tests',
    date: '2024-01-15',
    time: '14:30',
    location: 'Sala de Reuniones',
    type: 'reunion',
    images: ['image1.jpg', 'image2.jpg'],
    videos: ['video1.mp4'],
    attendees: ['user1', 'user2', 'user3'],
    maxAttendees: 20,
    isVirtual: false,
    createdBy: 'admin1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-10T15:30:00Z',
  };

  const defaultProps = {
    activity: mockActivity,
    onPress: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onAttend: jest.fn(),
    isLoading: false,
    currentUserId: 'user1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('debe renderizar el componente correctamente', () => {
      const { getByText, getByTestId } = render(
        <ActivityCard {...defaultProps} />
      );

      expect(getByText(mockActivity.title)).toBeTruthy();
      expect(getByText(mockActivity.description)).toBeTruthy();
      expect(getByText('Fecha: 15/01/2024')).toBeTruthy();
      expect(getByText('Hora: 14:30')).toBeTruthy();
      expect(getByText('Lugar: Sala de Reuniones')).toBeTruthy();
      expect(getByText('Tipo: reunión')).toBeTruthy();
      expect(getByTestId('activity-card')).toBeTruthy();
    });

    it('debe mostrar el número de asistentes correctamente', () => {
      const { getByText } = render(<ActivityCard {...defaultProps} />);

      expect(getByText('Asistentes: 3/20')).toBeTruthy();
    });

    it('debe mostrar "Sin límite" cuando maxAttendees es null', () => {
      const activityWithoutLimit = { ...mockActivity, maxAttendees: null };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithoutLimit} />
      );

      expect(getByText('Asistentes: 3/Sin límite')).toBeTruthy();
    });

    it('debe mostrar etiqueta de actividad virtual cuando es virtual', () => {
      const virtualActivity = { ...mockActivity, isVirtual: true };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={virtualActivity} />
      );

      expect(getByText('Actividad Virtual')).toBeTruthy();
    });

    it('debe mostrar imágenes cuando están disponibles', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      const imageGallery = getByTestId('image-gallery');
      expect(imageGallery).toBeTruthy();
    });

    it('debe mostrar mensaje cuando no hay imágenes', () => {
      const activityWithoutImages = { ...mockActivity, images: [] };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithoutImages} />
      );

      expect(getByText('No hay imágenes disponibles')).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('debe llamar onPress cuando se presiona la tarjeta', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      fireEvent.press(getByTestId('activity-card'));

      expect(defaultProps.onPress).toHaveBeenCalledWith(mockActivity);
    });

    it('debe llamar onEdit cuando se presiona el botón de editar', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      fireEvent.press(getByTestId('edit-button'));

      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockActivity);
    });

    it('debe llamar onDelete cuando se presiona el botón de eliminar', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      fireEvent.press(getByTestId('delete-button'));

      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockActivity._id);
    });

    it('debe mostrar confirmación antes de eliminar', async () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      fireEvent.press(getByTestId('delete-button'));

      await waitFor(() => {
        expect(getByTestId('delete-confirmation-modal')).toBeTruthy();
      });
    });

    it('debe llamar onAttend cuando se presiona el botón de asistir', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      fireEvent.press(getByTestId('attend-button'));

      expect(defaultProps.onAttend).toHaveBeenCalledWith(mockActivity._id);
    });

    it('debe mostrar botón de "No asistir" cuando el usuario ya está inscrito', () => {
      const { getByText } = render(<ActivityCard {...defaultProps} />);

      expect(getByText('No asistiré')).toBeTruthy();
    });

    it('debe mostrar botón de "Asistiré" cuando el usuario no está inscrito', () => {
      const { getByText } = render(
        <ActivityCard {...defaultProps} currentUserId="user999" />
      );

      expect(getByText('Asistiré')).toBeTruthy();
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar indicador de carga cuando isLoading es true', () => {
      const { getByTestId } = render(
        <ActivityCard {...defaultProps} isLoading={true} />
      );

      expect(getByTestId('loading-indicator')).toBeTruthy();
    });

    it('debe deshabilitar botones cuando isLoading es true', () => {
      const { getByTestId } = render(
        <ActivityCard {...defaultProps} isLoading={true} />
      );

      expect(getByTestId('edit-button').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('delete-button').props.accessibilityState.disabled).toBe(true);
      expect(getByTestId('attend-button').props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Formato de fecha y hora', () => {
    it('debe formatear la fecha correctamente', () => {
      const { getByText } = render(<ActivityCard {...defaultProps} />);

      expect(getByText('Fecha: 15/01/2024')).toBeTruthy();
    });

    it('debe formatear la hora correctamente', () => {
      const { getByText } = render(<ActivityCard {...defaultProps} />);

      expect(getByText('Hora: 14:30')).toBeTruthy();
    });

    it('debe manejar fecha inválida', () => {
      const invalidDateActivity = { ...mockActivity, date: 'invalid-date' };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={invalidDateActivity} />
      );

      expect(getByText('Fecha inválida')).toBeTruthy();
    });
  });

  describe('Estilos y apariencia', () => {
    it('debe aplicar estilos personalizados cuando se proporcionan', () => {
      const customStyles = {
        container: { backgroundColor: 'red' },
        title: { fontSize: 20 },
      };

      const { getByTestId } = render(
        <ActivityCard {...defaultProps} customStyles={customStyles} />
      );

      expect(getByTestId('activity-card').props.style).toMatchObject(
        expect.objectContaining({ backgroundColor: 'red' })
      );
    });

    it('debe mostrar el tipo de actividad con el color correcto', () => {
      const { getByText } = render(<ActivityCard {...defaultProps} />);
      const typeBadge = getByText('Tipo: reunión');

      expect(typeBadge.props.style).toMatchObject(
        expect.objectContaining({ backgroundColor: '#007AFF' })
      );
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener etiquetas de accesibilidad correctas', () => {
      const { getByTestId } = render(<ActivityCard {...defaultProps} />);

      expect(getByTestId('activity-card').props.accessibilityLabel).toBe(
        `Tarjeta de actividad: ${mockActivity.title}`
      );
      expect(getByTestId('edit-button').props.accessibilityLabel).toBe('Editar actividad');
      expect(getByTestId('delete-button').props.accessibilityLabel).toBe('Eliminar actividad');
      expect(getByTestId('attend-button').props.accessibilityLabel).toBe('Confirmar asistencia');
    });
  });

  describe('Casos límite', () => {
    it('debe manejar actividad sin descripción', () => {
      const activityWithoutDescription = { ...mockActivity, description: '' };
      const { queryByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithoutDescription} />
      );

      expect(queryByText(mockActivity.description)).toBeNull();
    });

    it('debe manejar actividad sin ubicación', () => {
      const activityWithoutLocation = { ...mockActivity, location: '' };
      const { queryByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithoutLocation} />
      );

      expect(queryByText('Lugar:')).toBeNull();
    });

    it('debe manejar actividad sin asistentes', () => {
      const activityWithoutAttendees = { ...mockActivity, attendees: [] };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithoutAttendees} />
      );

      expect(getByText('Asistentes: 0/20')).toBeTruthy();
    });

    it('debe manejar actividad con muchos asistentes', () => {
      const manyAttendees = Array(50).fill('user');
      const activityWithManyAttendees = { ...mockActivity, attendees: manyAttendees };
      const { getByText } = render(
        <ActivityCard {...defaultProps} activity={activityWithManyAttendees} />
      );

      expect(getByText('Asistentes: 50/20')).toBeTruthy();
    });
  });
});