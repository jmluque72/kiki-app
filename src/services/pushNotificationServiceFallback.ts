import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PushNotificationData {
  title: string;
  message: string;
  data?: any;
}

/**
 * Servicio de fallback para push notifications que no depende de módulos nativos
 * Se usa cuando react-native-push-notification no está disponible o causa errores
 */
class PushNotificationFallbackService {
  private isInitialized = false;
  private deviceToken: string | null = null;
  private static instance: PushNotificationFallbackService;

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PushNotificationFallbackService {
    if (!PushNotificationFallbackService.instance) {
      PushNotificationFallbackService.instance = new PushNotificationFallbackService();
    }
    return PushNotificationFallbackService.instance;
  }

  /**
   * Inicializa el servicio (versión de fallback)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔔 PushNotificationFallbackService ya inicializado');
      return;
    }

    console.log('🔔 Inicializando PushNotificationFallbackService (modo fallback)...');

    // Intentar obtener token guardado previamente
    try {
      const storedToken = await AsyncStorage.getItem('push_token');
      if (storedToken) {
        this.deviceToken = storedToken;
        console.log('🔔 [FALLBACK] Token encontrado en AsyncStorage:', storedToken.substring(0, 20) + '...');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token de AsyncStorage:', error);
    }

    this.isInitialized = true;
    console.log('🔔 [FALLBACK] PushNotificationFallbackService inicializado (sin funcionalidad nativa)');
  }

  /**
   * Obtiene el token del dispositivo (versión de fallback)
   */
  async getToken(): Promise<string | null> {
    if (this.deviceToken) {
      return this.deviceToken;
    }

    // Intentar obtener de AsyncStorage
    try {
      const storedToken = await AsyncStorage.getItem('push_token');
      if (storedToken) {
        this.deviceToken = storedToken;
        return storedToken;
      }
    } catch (error) {
      console.error('❌ Error obteniendo token de AsyncStorage:', error);
    }

    return null;
  }

  /**
   * Solicita permisos para notificaciones (versión de fallback)
   */
  async requestPermissions(): Promise<boolean> {
    console.log('🔔 [FALLBACK] requestPermissions - no disponible en modo fallback');
    return false;
  }

  /**
   * Envía una notificación local (versión de fallback)
   */
  sendLocalNotification(data: PushNotificationData) {
    console.log('🔔 [FALLBACK] sendLocalNotification - no disponible en modo fallback');
    console.log('🔔 [FALLBACK] Notificación que se habría enviado:', data);
  }

  /**
   * Abre la configuración de notificaciones (versión de fallback)
   */
  openNotificationSettings() {
    console.log('🔔 [FALLBACK] openNotificationSettings - no disponible en modo fallback');
  }
}

export default PushNotificationFallbackService.getInstance();
