import { Platform } from 'react-native';
import SafePushNotificationService from './pushNotificationServiceSafe';
import PushNotificationFallbackService from './pushNotificationServiceFallback';

export interface PushNotificationData {
  title: string;
  message: string;
  data?: any;
}

/**
 * Servicio automático que detecta si hay problemas con push notifications
 * y usa automáticamente el servicio de fallback si es necesario
 */
class AutoPushNotificationService {
  private isInitialized = false;
  private deviceToken: string | null = null;
  private static instance: AutoPushNotificationService;
  private useFallback = false;
  private service: any = null;

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): AutoPushNotificationService {
    if (!AutoPushNotificationService.instance) {
      AutoPushNotificationService.instance = new AutoPushNotificationService();
    }
    return AutoPushNotificationService.instance;
  }

  /**
   * Detecta si el servicio nativo está disponible
   */
  private async detectServiceAvailability(): Promise<boolean> {
    try {
      // Intentar importar el módulo de forma segura
      const module = await import('react-native-push-notification');
      if (module.default) {
        console.log('✅ PushNotification module detectado como disponible');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ PushNotification module no disponible:', error);
    }
    return false;
  }

  /**
   * Inicializa el servicio apropiado
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔔 AutoPushNotificationService ya inicializado');
      return;
    }

    console.log('🔔 Inicializando AutoPushNotificationService...');

    try {
      // Detectar disponibilidad del servicio nativo
      const isNativeAvailable = await this.detectServiceAvailability();
      
      if (isNativeAvailable) {
        console.log('🔔 Usando SafePushNotificationService (nativo disponible)');
        this.service = SafePushNotificationService;
        this.useFallback = false;
      } else {
        console.log('🔔 Usando PushNotificationFallbackService (nativo no disponible)');
        this.service = PushNotificationFallbackService;
        this.useFallback = true;
      }

      // Inicializar el servicio seleccionado
      await this.service.initialize();
      this.isInitialized = true;

      console.log('🔔 AutoPushNotificationService inicializado correctamente');
      console.log('🔔 Modo:', this.useFallback ? 'FALLBACK' : 'NATIVO');

    } catch (error) {
      console.error('❌ Error inicializando AutoPushNotificationService:', error);
      
      // En caso de error, usar fallback
      console.log('🔔 Cambiando a modo fallback debido a error');
      this.service = PushNotificationFallbackService;
      this.useFallback = true;
      
      try {
        await this.service.initialize();
        this.isInitialized = true;
        console.log('🔔 Fallback inicializado correctamente');
      } catch (fallbackError) {
        console.error('❌ Error inicializando fallback:', fallbackError);
        this.isInitialized = true;
      }
    }
  }

  /**
   * Obtiene el token del dispositivo
   * Pasa el timeout al servicio subyacente
   */
  async getToken(timeout?: number): Promise<string | null> {
    if (!this.service) {
      console.warn('⚠️ Servicio no inicializado');
      return null;
    }

    try {
      // Si el servicio tiene un método getToken con timeout, usarlo
      if (typeof this.service.getToken === 'function') {
        const token = await this.service.getToken(timeout);
        this.deviceToken = token;
        return token;
      } else {
        // Fallback para servicios que no soportan timeout
        const token = await this.service.getToken();
        this.deviceToken = token;
        return token;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Solicita permisos para notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.service) {
      console.warn('⚠️ Servicio no inicializado');
      return false;
    }

    try {
      return await this.service.requestPermissions();
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  /**
   * Envía una notificación local
   */
  sendLocalNotification(data: PushNotificationData) {
    if (!this.service) {
      console.warn('⚠️ Servicio no inicializado');
      return;
    }

    try {
      this.service.sendLocalNotification(data);
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
    }
  }

  /**
   * Abre la configuración de notificaciones
   */
  openNotificationSettings() {
    if (!this.service) {
      console.warn('⚠️ Servicio no inicializado');
      return;
    }

    try {
      this.service.openNotificationSettings();
    } catch (error) {
      console.error('❌ Error abriendo configuración:', error);
    }
  }

  /**
   * Obtiene información sobre el estado del servicio
   */
  getServiceInfo() {
    return {
      isInitialized: this.isInitialized,
      useFallback: this.useFallback,
      serviceType: this.useFallback ? 'FALLBACK' : 'NATIVE',
      hasToken: !!this.deviceToken
    };
  }
}

export default AutoPushNotificationService.getInstance();
