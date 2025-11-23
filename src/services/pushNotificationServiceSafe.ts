import { Platform, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '../utils/storage';

export interface PushNotificationData {
  title: string;
  message: string;
  data?: any;
}

class SafePushNotificationService {
  private isInitialized = false;
  private deviceToken: string | null = null;
  private static instance: SafePushNotificationService;
  private pushNotificationModule: any = null;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): SafePushNotificationService {
    if (!SafePushNotificationService.instance) {
      SafePushNotificationService.instance = new SafePushNotificationService();
    }
    return SafePushNotificationService.instance;
  }

  /**
   * Inicializa el módulo de push notifications de forma segura
   */
  private async initializeModule(): Promise<void> {
    if (this.pushNotificationModule) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise(async (resolve) => {
      try {
        // Intentar importar el módulo de forma segura
        const module = await import('react-native-push-notification');
        this.pushNotificationModule = module.default;
        console.log('✅ PushNotification module cargado correctamente');
        resolve();
      } catch (error) {
        console.warn('⚠️ No se pudo cargar react-native-push-notification:', error);
        this.pushNotificationModule = null;
        resolve();
      }
    });

    return this.initializationPromise;
  }

  /**
   * Inicializa el servicio de notificaciones push
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔔 SafePushNotificationService ya inicializado');
      return;
    }

    console.log('🔔 Inicializando SafePushNotificationService...');

    // Inicializar el módulo de forma segura
    await this.initializeModule();

    if (!this.pushNotificationModule) {
      console.warn('⚠️ PushNotification module no disponible, continuando sin notificaciones');
      this.isInitialized = true;
      return;
    }

    try {
      // Solicitar permisos primero
      const permissions = await this.pushNotificationModule.requestPermissions();
      console.log('🔔 [INIT] Permisos solicitados:', permissions);
      
      if (!permissions.alert || !permissions.badge || !permissions.sound) {
        console.log('🔔 [INIT] Permisos NO concedidos:', permissions);
        this.isInitialized = true;
        return;
      }

      console.log('🔔 [INIT] Permisos concedidos, configurando...');

      this.pushNotificationModule.configure({
        onNotification: (notification: any) => {
          console.log('🔔 Push notification received:', notification);
          
          if (notification.userInteraction) {
            console.log('🔔 User interacted with notification:', notification);
          }
        },
        
        onRegister: (token: any) => {
          console.log('🔔 [ONREGISTER] Push notification token registered:', token);
          
          if (token.token) {
            this.deviceToken = token.token;
            console.log('🔔 [ONREGISTER] Token guardado:', token.token.substring(0, 20) + '...');
            
            // Guardar en AsyncStorage
            AsyncStorage.setItem('push_token', token.token).catch((error) => {
              console.error('🔔 [ONREGISTER] Error guardando token:', error);
            });
          }
        },

        onRegistrationError: (err: any) => {
          console.error('🔔 Push notification registration error:', err);
        },

        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        popInitialNotification: true,
        requestPermissions: true,
      });

      this.isInitialized = true;
      console.log('🔔 [INIT] SafePushNotificationService inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando SafePushNotificationService:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Obtiene el token del dispositivo
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
   * Solicita permisos para notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.pushNotificationModule) {
      console.warn('⚠️ PushNotification module no disponible');
      return false;
    }

    try {
      const permissions = await this.pushNotificationModule.requestPermissions();
      return permissions.alert && permissions.badge && permissions.sound;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Envía una notificación local
   */
  sendLocalNotification(data: PushNotificationData) {
    if (!this.pushNotificationModule) {
      console.warn('⚠️ PushNotification module no disponible');
      return;
    }

    try {
      this.pushNotificationModule.localNotification({
        title: data.title,
        message: data.message,
        data: data.data,
      });
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
    }
  }

  /**
   * Abre la configuración de notificaciones
   */
  openNotificationSettings() {
    if (!this.pushNotificationModule) {
      console.warn('⚠️ PushNotification module no disponible');
      return;
    }

    try {
      this.pushNotificationModule.openSettings();
    } catch (error) {
      console.error('❌ Error abriendo configuración:', error);
    }
  }
}

export default SafePushNotificationService.getInstance();
