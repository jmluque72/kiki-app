import { renderHook, act } from '@testing-library/react-hooks';
import { useActivities } from '../../src/hooks/useActivities';
import { activityService } from '../../src/services/activityService';

// Mock del servicio de actividades
jest.mock('../../src/services/activityService', () => ({
  activityService: {
    getActivities: jest.fn(),
    getActivityById: jest.fn(),
    createActivity: jest.fn(),
    updateActivity: jest.fn(),
    deleteActivity: jest.fn(),
  },
}));

describe('useActivities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivities', () => {
    it('debe cargar actividades exitosamente', async () => {
      const mockActivities = [
        {
          _id: '1',
          title: 'Actividad 1',
          description: 'Descripción 1',
          date: '2024-01-01',
        },
        {
          _id: '2',
          title: 'Actividad 2',
          description: 'Descripción 2',
          date: '2024-01-02',
        },
      ];

      (activityService.getActivities as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockActivities,
      });

      const { result, waitForNextUpdate } = renderHook(() => useActivities());

      expect(result.current.loading).toBe(false);
      expect(result.current.activities).toEqual([]);

      act(() => {
        result.current.getActivities();
      });

      expect(result.current.loading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.activities).toEqual(mockActivities);
      expect(result.current.error).toBeNull();
      expect(activityService.getActivities).toHaveBeenCalled();
    });

    it('debe manejar errores al cargar actividades', async () => {
      const errorMessage = 'Error al cargar actividades';
      (activityService.getActivities as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const { result, waitForNextUpdate } = renderHook(() => useActivities());

      act(() => {
        result.current.getActivities();
      });

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.activities).toEqual([]);
    });
  });

  describe('getActivityById', () => {
    it('debe obtener una actividad por ID', async () => {
      const mockActivity = {
        _id: '1',
        title: 'Actividad Específica',
        description: 'Descripción detallada',
        date: '2024-01-01',
        images: [],
        videos: [],
      };

      (activityService.getActivityById as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockActivity,
      });

      const { result } = renderHook(() => useActivities());

      let activity;
      await act(async () => {
        activity = await result.current.getActivityById('1');
      });

      expect(activity).toEqual(mockActivity);
      expect(activityService.getActivityById).toHaveBeenCalledWith('1');
    });

    it('debe manejar errores al obtener actividad por ID', async () => {
      const errorMessage = 'Actividad no encontrada';
      (activityService.getActivityById as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useActivities());

      let error;
      await act(async () => {
        try {
          await result.current.getActivityById('999');
        } catch (err: any) {
          error = err.message;
        }
      });

      expect(error).toBe(errorMessage);
    });
  });

  describe('createActivity', () => {
    it('debe crear una nueva actividad', async () => {
      const newActivity = {
        title: 'Nueva Actividad',
        description: 'Nueva descripción',
        date: '2024-01-15',
      };

      const createdActivity = {
        _id: '3',
        ...newActivity,
        createdAt: '2024-01-15T10:00:00Z',
      };

      (activityService.createActivity as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: createdActivity,
      });

      const { result } = renderHook(() => useActivities());

      let created;
      await act(async () => {
        created = await result.current.createActivity(newActivity);
      });

      expect(created).toEqual(createdActivity);
      expect(activityService.createActivity).toHaveBeenCalledWith(newActivity);
    });
  });

  describe('updateActivity', () => {
    it('debe actualizar una actividad existente', async () => {
      const updatedActivity = {
        _id: '1',
        title: 'Actividad Actualizada',
        description: 'Descripción actualizada',
        date: '2024-01-01',
      };

      (activityService.updateActivity as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedActivity,
      });

      const { result } = renderHook(() => useActivities());

      let updated;
      await act(async () => {
        updated = await result.current.updateActivity('1', updatedActivity);
      });

      expect(updated).toEqual(updatedActivity);
      expect(activityService.updateActivity).toHaveBeenCalledWith('1', updatedActivity);
    });
  });

  describe('deleteActivity', () => {
    it('debe eliminar una actividad', async () => {
      (activityService.deleteActivity as jest.Mock).mockResolvedValueOnce({
        success: true,
        message: 'Actividad eliminada',
      });

      const { result } = renderHook(() => useActivities());

      let deleted;
      await act(async () => {
        deleted = await result.current.deleteActivity('1');
      });

      expect(deleted).toEqual({ success: true, message: 'Actividad eliminada' });
      expect(activityService.deleteActivity).toHaveBeenCalledWith('1');
    });
  });

  describe('refreshActivities', () => {
    it('debe refrescar la lista de actividades', async () => {
      const mockActivities = [
        {
          _id: '1',
          title: 'Actividad Refrescada',
          description: 'Descripción refrescada',
          date: '2024-01-01',
        },
      ];

      (activityService.getActivities as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockActivities,
      });

      const { result, waitForNextUpdate } = renderHook(() => useActivities());

      act(() => {
        result.current.refreshActivities();
      });

      await waitForNextUpdate();

      expect(result.current.activities).toEqual(mockActivities);
      expect(activityService.getActivities).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estado del hook', () => {
    it('debe mantener el estado correctamente', async () => {
      const { result } = renderHook(() => useActivities());

      // Estado inicial
      expect(result.current.loading).toBe(false);
      expect(result.current.activities).toEqual([]);
      expect(result.current.error).toBeNull();

      // Verificar que las funciones estén definidas
      expect(typeof result.current.getActivities).toBe('function');
      expect(typeof result.current.getActivityById).toBe('function');
      expect(typeof result.current.createActivity).toBe('function');
      expect(typeof result.current.updateActivity).toBe('function');
      expect(typeof result.current.deleteActivity).toBe('function');
      expect(typeof result.current.refreshActivities).toBe('function');
    });
  });
});