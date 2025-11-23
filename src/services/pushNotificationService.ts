import { Platform, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '../utils/storage';

// Importación segura de PushNotification para evitar errores de NativeEventEmitter
let PushNotification: any = null;
try {
  PushNotification = require('react-native-push-notification');
} catch (error) {
  console.warn('⚠️ react-native-push-notification no disponible:', error);
}

export interface PushNotificationData {
  title: string;
  message: string;
  data?: any;
}

class PushNotificationService {
  private isInitialized = false;
  private deviceToken: string | null = null;
  private static instance: PushNotificationService;

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Inicializa el servicio de notificaciones push
   */
  initialize() {
    if (this.isInitialized) {
      console.log('🔔 PushNotificationService ya inicializado, token actual:', this.deviceToken ? this.deviceToken.substring(0, 20) + '...' : 'null');
      return;
    }

    // Verificar si PushNotification está disponible
    if (!PushNotification) {
      console.warn('⚠️ PushNotification no disponible, saltando inicialización');
      this.isInitialized = true;
      return;
    }

    console.log('🔔 Inicializando PushNotificationService por primera vez...');

    try {
      // Solicitar permisos primero
      PushNotification.requestPermissions().then((permissions) => {
        console.log('🔔 [INIT] Permisos solicitados:', permissions);
        if (permissions.alert && permissions.badge && permissions.sound) {
          console.log('🔔 [INIT] Permisos concedidos, configurando...');
        } else {
          console.log('🔔 [INIT] Permisos NO concedidos:', permissions);
        }
      });
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      this.isInitialized = true;
      return;
    }

    try {
      PushNotification.configure({
        // (required) Called when a remote or local notification is opened or received

        onNotification: function(notification: any) {
          console.log('🔔 Push notification received:', notification);
          
          // Manejar la notificación cuando la app está en primer plano
          if (notification.userInteraction) {
            console.log('🔔 User interacted with notification:', notification);
          }
        },
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function(token: any) {
          console.log('🔔 [ONREGISTER] Push notification token registered:', token);
          console.log('🔔 [ONREGISTER] Token object:', JSON.stringify(token, null, 2));
          console.log('🔔 [ONREGISTER] Token.token:', token.token);
          console.log('🔔 [ONREGISTER] Instancia actual:', PushNotificationService.instance);
          
          // Guardar el token en la instancia
          PushNotificationService.instance.deviceToken = token.token;
          console.log('🔔 [ONREGISTER] Token guardado en deviceToken:', PushNotificationService.instance.deviceToken ? PushNotificationService.instance.deviceToken.substring(0, 20) + '...' : 'null');
          
          // También guardar en AsyncStorage para persistencia
          if (token.token) {
            AsyncStorage.setItem('push_token', token.token).then(() => {
              console.log('🔔 [ONREGISTER] Token guardado en AsyncStorage:', token.token.substring(0, 20) + '...');
            }).catch((error) => {
              console.error('🔔 [ONREGISTER] Error guardando token en AsyncStorage:', error);
            });
          }
        },

        // (optional) Called when the user fails to register for remote notifications.
        onRegistrationError: function(err: any) {
          console.error('🔔 Push notification registration error:', err);
        },

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        // Should the initial notification be popped automatically
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         */
        requestPermissions: true,
      });
    } catch (error) {
      console.error('❌ Error configurando PushNotification:', error);
      this.isInitialized = true;
      return;
    }

    this.isInitialized = true;
    console.log('🔔 [INIT] PushNotificationService inicializado correctamente');
    console.log('🔔 [INIT] Configuración completada, esperando token...');
    // Para iOS, usar un delay para dar tiempo a que el token nativo esté listo
    if (Platform.OS === 'ios') {
      console.log('🔔 [INIT] iOS detectado, configurando delay para token...');
      // Dar tiempo para que el token nativo se genere y se envíe
      setTimeout(() => {
        console.log('🔔 [INIT] Delay completado, verificando si hay token cacheado...');
        
        // Intentar obtener el token directamente del módulo nativo
        this.getTokenFromUserDefaults();
        
        // También intentar obtener el token de AsyncStorage por si ya llegó
        AsyncStorage.getItem('push_token').then((storedToken) => {
          if (storedToken && !this.deviceToken) {
            console.log('🔔 [INIT] Token encontrado en AsyncStorage después del delay:', storedToken.substring(0, 20) + '...');
            this.deviceToken = storedToken;
          }
        });
      }, 3000); // 3 segundos de delay
    }
    
    // Escuchar eventos nativos de iOS
    if (Platform.OS === 'ios') {
      console.log('🔔 [INIT] Configurando listener para eventos nativos...');
      
      // Función para procesar el token
      const processToken = (token: string) => {
        console.log('🔔 [TOKEN] ¡TOKEN RECIBIDO! Token:', token);
        
        // Verificar si es un token simulado (desarrollo sin certificados APNs)
        if (token.includes('simulated_token')) {
          console.log('🔔 [TOKEN] Token simulado detectado - APNs no configurado');
          alert(`Token simulado recibido (APNs no configurado): ${token.substring(0, 20)}...`);
        } else {
          console.log('🔔 [TOKEN] Token real de APNs recibido');
          alert(`Token real recibido: ${token.substring(0, 20)}...`);
        }
        
        this.deviceToken = token;
        AsyncStorage.setItem('push_token', token).then(() => {
          console.log('🔔 [TOKEN] Token guardado en AsyncStorage:', token.substring(0, 20) + '...');
        }).catch((error) => {
          console.error('🔔 [TOKEN] Error guardando token en AsyncStorage:', error);
        });
      };
      
      // Listener: DeviceEventEmitter
      const deviceListener = DeviceEventEmitter.addListener('remoteNotificationRegistered', (event) => {
        console.log('🔔 [DEVICE_EVENT] Evento recibido:', event);
        console.log('🔔 [DEVICE_EVENT] Event completo:', JSON.stringify(event, null, 2));
        
        if (event.token) {
          processToken(event.token);
        } else {
          console.log('🔔 [DEVICE_EVENT] No hay token en el evento');
        }
      });
      
      console.log('🔔 [INIT] Listener configurado:', deviceListener);
    }
  }

  /**
   * Obtiene el token del dispositivo
   */
  getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      console.log('🔔 [GETTOKEN] Getting push token:', this.deviceToken ? this.deviceToken.substring(0, 20) + '...' : 'null');
      
      if (this.deviceToken) {
        console.log('🔔 [GETTOKEN] Token ya disponible, devolviendo:', this.deviceToken.substring(0, 20) + '...');
        resolve(this.deviceToken);
        return;
      }
      
      // Si no tenemos token guardado, intentar obtenerlo de AsyncStorage
      console.log('🔔 [GETTOKEN] No hay token guardado, intentando obtener de AsyncStorage...');
      AsyncStorage.getItem('push_token').then((storedToken) => {
        if (storedToken) {
          console.log('🔔 [GETTOKEN] Token encontrado en AsyncStorage:', storedToken.substring(0, 20) + '...');
          this.deviceToken = storedToken;
          resolve(storedToken);
        } else {
          console.log('🔔 [GETTOKEN] No hay token en AsyncStorage, intentando desde UserDefaults...');
          // Intentar obtener desde UserDefaults (iOS)
          this.getTokenFromUserDefaults().then((userDefaultsToken) => {
            if (userDefaultsToken) {
              console.log('🔔 [GETTOKEN] Token encontrado en UserDefaults:', userDefaultsToken.substring(0, 20) + '...');
              this.deviceToken = userDefaultsToken;
              // Guardar en AsyncStorage para futuras consultas
              AsyncStorage.setItem('push_token', userDefaultsToken);
              resolve(userDefaultsToken);
            } else {
              console.log('🔔 [GETTOKEN] No hay token disponible, devolviendo null');
              resolve(null);
            }
          });
        }
      }).catch((error) => {
        console.error('🔔 [GETTOKEN] Error obteniendo token:', error);
        resolve(null);
      });
    });
  }

  /**
   * Obtiene el token desde UserDefaults (iOS)
   */
  private async getTokenFromUserDefaults(): Promise<string | null> {
    try {
      // Para iOS, intentar obtener el token desde AsyncStorage que puede acceder a UserDefaults
      const token = await AsyncStorage.getItem('push_token');
      if (token) {
        console.log('🔔 [USERDEFAULTS] Token obtenido desde AsyncStorage/UserDefaults:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.log('🔔 [USERDEFAULTS] No hay token en AsyncStorage/UserDefaults');
        return null;
      }
    } catch (error) {
      console.error('🔔 [USERDEFAULTS] Error obteniendo token desde UserDefaults:', error);
      return null;
    }
  }

  /**
   * Intenta obtener el token del sistema nativo
   */
  private async tryGetTokenFromNativeSystem(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        // Intentar obtener el token usando diferentes métodos
        if (Platform.OS === 'ios') {
          // Para iOS, intentar obtener el token usando el método nativo
          PushNotification.getToken((token: string) => {
            if (token) {
              console.log('🔔 [NATIVE] Token obtenido para iOS:', token.substring(0, 20) + '...');
              resolve(token);
            } else {
              console.log('🔔 [NATIVE] No se pudo obtener token para iOS');
              resolve(null);
            }
          });
        } else {
          // Para Android, intentar obtener el token usando el método nativo
          PushNotification.getToken((token: string) => {
            if (token) {
              console.log('🔔 [NATIVE] Token obtenido para Android:', token.substring(0, 20) + '...');
              resolve(token);
            } else {
              console.log('🔔 [NATIVE] No se pudo obtener token para Android');
              resolve(null);
            }
          });
        }
      } catch (error) {
        console.error('🔔 [NATIVE] Error obteniendo token del sistema nativo:', error);
        resolve(null);
      }
    });
  }

  /**
   * Solicita permisos para notificaciones
   */
  async requestPermissions(): Promise<boolean> {
    if (!PushNotification) {
      console.warn('⚠️ PushNotification no disponible para solicitar permisos');
      return false;
    }

    try {
      return new Promise((resolve) => {
        PushNotification.requestPermissions().then((permissions: any) => {
          console.log('🔔 Permisos solicitados:', permissions);
          resolve(permissions.alert && permissions.badge && permissions.sound);
        });
      });
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Envía una notificación local
   */
  sendLocalNotification(data: PushNotificationData) {
    if (!PushNotification) {
      console.warn('⚠️ PushNotification no disponible para enviar notificación local');
      return;
    }

    try {
      PushNotification.localNotification({
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
    if (!PushNotification) {
      console.warn('⚠️ PushNotification no disponible para abrir configuración');
      return;
    }

    try {
      PushNotification.openSettings();
    } catch (error) {
      console.error('❌ Error abriendo configuración de notificaciones:', error);
    }
  }
}

export default PushNotificationService.getInstance();