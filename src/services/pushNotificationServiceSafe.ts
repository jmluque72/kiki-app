import { Platform, DeviceEventEmitter, NativeModules, NativeEventEmitter } from 'react-native';
import AsyncStorage from '../utils/storage';

// Importar módulo específico de iOS si está disponible
let PushNotificationIOS: any = null;
if (Platform.OS === 'ios') {
  try {
    const PushNotificationIOSModule = require('@react-native-community/push-notification-ios');
    // El módulo puede exportarse de diferentes formas
    PushNotificationIOS = PushNotificationIOSModule.default || PushNotificationIOSModule;
    console.log('✅ PushNotificationIOS module cargado');
    console.log('🔔 [INIT] PushNotificationIOS métodos disponibles:', Object.keys(PushNotificationIOS || {}));
  } catch (error) {
    console.warn('⚠️ PushNotificationIOS no disponible:', error);
  }
}

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
  private tokenPromise: Promise<string | null> | null = null;
  private tokenResolve: ((token: string | null) => void) | null = null;

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

      // Configurar el servicio ANTES de llamar a configure
      console.log('🔔 [INIT] Configurando react-native-push-notification...');
      
      // Para iOS, también necesitamos registrar para notificaciones remotas
      if (Platform.OS === 'ios') {
        console.log('🔔 [INIT] iOS detectado, registrando para notificaciones remotas...');
        // El módulo debería registrar automáticamente, pero podemos forzarlo
        try {
          // Importar el módulo nativo de iOS si está disponible
          if (PushNotificationIOS) {
            console.log('🔔 [INIT] PushNotificationIOS disponible, métodos:', Object.keys(PushNotificationIOS));
            
            // PushNotificationIOS no tiene getToken, pero podemos verificar si hay métodos útiles
            if (typeof PushNotificationIOS.requestPermissions === 'function') {
              PushNotificationIOS.requestPermissions().then(() => {
                console.log('🔔 [INIT] Permisos de PushNotificationIOS solicitados');
              }).catch((error) => {
                console.warn('🔔 [INIT] Error solicitando permisos con PushNotificationIOS:', error);
              });
            }
          } else {
            console.log('🔔 [INIT] PushNotificationIOS no está disponible');
          }
        } catch (error) {
          console.warn('🔔 [INIT] Error registrando con PushNotificationIOS:', error);
        }
      }
      
      this.pushNotificationModule.configure({
        onNotification: (notification: any) => {
          console.log('🔔 [NOTIFICATION] Push notification received:', notification);
          
          if (notification.userInteraction) {
            console.log('🔔 [NOTIFICATION] User interacted with notification:', notification);
          }
        },
        
        onRegister: (token: any) => {
          console.log('🔔 [ONREGISTER] ========== CALLBACK EJECUTADO ==========');
          console.log('🔔 [ONREGISTER] ✅ ¡El callback onRegister se ejecutó! Esto significa que los certificados APNs están configurados.');
          console.log('🔔 [ONREGISTER] Token recibido (completo):', JSON.stringify(token, null, 2));
          console.log('🔔 [ONREGISTER] Tipo de token:', typeof token);
          console.log('🔔 [ONREGISTER] token.token existe?', !!token?.token);
          console.log('🔔 [ONREGISTER] token existe?', !!token);
          
          // Manejar diferentes formatos de token
          let actualToken: string | null = null;
          
          if (token?.token) {
            actualToken = token.token;
          } else if (typeof token === 'string') {
            actualToken = token;
          } else if (token?.data?.token) {
            actualToken = token.data.token;
          }
          
          console.log('🔔 [ONREGISTER] Token extraído:', actualToken ? actualToken.substring(0, 30) + '...' : 'null');
          
          if (actualToken) {
            this.handleTokenReceived(actualToken);
          } else {
            console.error('🔔 [ONREGISTER] ❌ ERROR: No se pudo extraer el token del objeto recibido');
          }
        },

        onRegistrationError: (err: any) => {
          console.error('🔔 [REGISTRATION ERROR] Error registrando push notifications:', err);
          console.error('🔔 [REGISTRATION ERROR] Tipo de error:', typeof err);
          console.error('🔔 [REGISTRATION ERROR] Error completo:', JSON.stringify(err, null, 2));
          
          // Si hay una promesa esperando, resolverla con null
          if (this.tokenResolve) {
            console.log('🔔 [REGISTRATION ERROR] Resolviendo promesa con null debido a error');
            this.tokenResolve(null);
            this.tokenResolve = null;
            this.tokenPromise = null;
          }
        },

        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        popInitialNotification: true,
        requestPermissions: false, // Ya solicitamos permisos antes
      });
      
      // Para iOS, después de configurar, intentar registrar explícitamente
      if (Platform.OS === 'ios' && this.pushNotificationModule) {
        console.log('🔔 [INIT] iOS: Intentando registrar para notificaciones remotas explícitamente...');
        // El módulo react-native-push-notification debería manejar esto automáticamente
        // pero podemos verificar si hay algún método para forzarlo
        try {
          // Algunas versiones tienen un método para registrar
          if (typeof (this.pushNotificationModule as any).register === 'function') {
            (this.pushNotificationModule as any).register();
            console.log('🔔 [INIT] iOS: Método register() llamado');
          }
        } catch (error) {
          console.warn('🔔 [INIT] iOS: No se pudo llamar register() o no existe:', error);
        }
        
        // Intentar leer el token de UserDefaults directamente (por si el callback onRegister no se ejecuta)
        setTimeout(async () => {
          try {
            const { NativeModules } = require('react-native');
            // Intentar leer de UserDefaults usando un módulo nativo si está disponible
            if (NativeModules && NativeModules.RNPushNotification) {
              const storedToken = await AsyncStorage.getItem('push_token');
              if (storedToken && !this.deviceToken) {
                console.log('🔔 [INIT] iOS: Token encontrado en AsyncStorage (de UserDefaults):', storedToken.substring(0, 20) + '...');
                this.deviceToken = storedToken;
                // Simular el callback onRegister para que el flujo continúe
                if (this.tokenResolve) {
                  console.log('🔔 [INIT] iOS: Resolviendo promesa con token de AsyncStorage');
                  this.tokenResolve(storedToken);
                  this.tokenResolve = null;
                  this.tokenPromise = null;
                }
              }
            }
          } catch (error) {
            console.warn('🔔 [INIT] iOS: Error leyendo token de AsyncStorage:', error);
          }
        }, 2000); // Esperar 2 segundos para que el AppDelegate guarde el token
      }

      // Configurar listener para eventos nativos ANTES de marcar como inicializado
      if (Platform.OS === 'ios') {
        console.log('🔔 [INIT] Configurando listener para eventos nativos...');
        try {
          // Escuchar eventos de DeviceEventEmitter desde el AppDelegate
          const subscription = DeviceEventEmitter.addListener('remoteNotificationRegistered', (data: any) => {
            console.log('🔔 [NATIVE EVENT] ========== EVENTO RECIBIDO ==========');
            console.log('🔔 [NATIVE EVENT] Datos recibidos:', JSON.stringify(data, null, 2));
            console.log('🔔 [NATIVE EVENT] Tipo de data:', typeof data);
            console.log('🔔 [NATIVE EVENT] data es array?', Array.isArray(data));
            
            // El evento puede venir como objeto {token: "..."} o como array [eventName, {token: "..."}]
            let token = null;
            if (data && typeof data === 'object') {
              if (data.token) {
                token = data.token;
              } else if (Array.isArray(data) && data.length > 1 && data[1]?.token) {
                token = data[1].token;
              }
            } else if (typeof data === 'string') {
              // Si viene como string directo (poco probable)
              token = data;
            }
            
            if (token) {
              console.log('🔔 [NATIVE EVENT] ✅ Token extraído:', token.substring(0, 20) + '...');
              this.handleTokenReceived(token);
            } else {
              console.log('🔔 [NATIVE EVENT] ⚠️ No se pudo extraer el token de los datos recibidos');
              console.log('🔔 [NATIVE EVENT] Estructura completa:', data);
            }
          });
          console.log('🔔 [INIT] ✅ Listener configurado para eventos nativos (remoteNotificationRegistered)');
          console.log('🔔 [INIT] Subscription creada:', !!subscription);
        } catch (error) {
          console.warn('🔔 [INIT] Error configurando listener de eventos nativos:', error);
        }
      }

      this.isInitialized = true;
      console.log('🔔 [INIT] SafePushNotificationService inicializado correctamente');
      console.log('🔔 [INIT] Esperando callback onRegister o evento nativo...');
      
      // Para iOS, el token puede venir del callback onRegister O del AppDelegate
      if (Platform.OS === 'ios') {
        console.log('🔔 [INIT] ⚠️ IMPORTANTE PARA iOS:');
        console.log('   El token puede venir de:');
        console.log('   1. Callback onRegister (si react-native-push-notification lo recibe)');
        console.log('   2. Evento nativo remoteNotificationRegistered (desde AppDelegate)');
        console.log('   3. Polling de AsyncStorage/UserDefaults');
        console.log('');
        
        // Hacer polling para leer el token desde UserDefaults usando el módulo nativo
        console.log('🔔 [INIT] Iniciando polling para leer token desde UserDefaults...');
        
        let pollAttempts = 0;
        const maxPollAttempts = 10; // Intentar durante 20 segundos (10 intentos x 2 segundos)
        
        const pollForToken = async () => {
          pollAttempts++;
          console.log(`🔔 [POLL] Intento ${pollAttempts}/${maxPollAttempts} de leer token...`);
          
          try {
            // Primero intentar leer desde AsyncStorage (por si ya está ahí)
            const storedToken = await AsyncStorage.getItem('push_token');
            
            if (storedToken && !this.deviceToken) {
              console.log('🔔 [POLL] ✅ Token encontrado en AsyncStorage:', storedToken.substring(0, 20) + '...');
              this.handleTokenReceived(storedToken);
              return true; // Token encontrado, detener polling
            }
            
            // Si no está en AsyncStorage, intentar leer usando el módulo nativo PushTokenModule
            // Este módulo lee desde el archivo que escribió el AppDelegate
            try {
              // Intentar acceder al módulo de diferentes formas
              const PushTokenModule = (NativeModules as any).PushTokenModule;
              
              if (PushTokenModule && typeof PushTokenModule.getPushToken === 'function') {
                console.log('🔔 [POLL] Leyendo token usando PushTokenModule (lee desde archivo/UserDefaults)...');
                const fileToken = await PushTokenModule.getPushToken();
                
                if (fileToken && !this.deviceToken) {
                  console.log('🔔 [POLL] ✅ Token encontrado:', fileToken.substring(0, 20) + '...');
                  // Guardar también en AsyncStorage para futuras lecturas
                  await AsyncStorage.setItem('push_token', fileToken);
                  this.handleTokenReceived(fileToken);
                  return true; // Token encontrado, detener polling
                }
              } else {
                console.log('🔔 [POLL] PushTokenModule no disponible');
                console.log('🔔 [POLL] NativeModules:', Object.keys(NativeModules));
              }
            } catch (moduleError: any) {
              if (moduleError.code !== 'NO_TOKEN') {
                console.warn('🔔 [POLL] Error leyendo desde PushTokenModule:', moduleError.message);
              }
            }
            
            // Si no se encontró el token, continuar polling
            if (pollAttempts < maxPollAttempts && !this.deviceToken) {
              console.log(`🔔 [POLL] Token no encontrado aún, reintentando en 2 segundos...`);
              setTimeout(pollForToken, 2000); // Reintentar en 2 segundos
            } else if (!this.deviceToken) {
              console.log('🔔 [POLL] ⚠️ No se encontró token después de todos los intentos');
              console.log('🔔 [POLL] El callback onRegister debería ejecutarse cuando el token esté disponible');
            }
          } catch (error) {
            console.error('🔔 [POLL] Error en polling:', error);
            if (pollAttempts < maxPollAttempts) {
              setTimeout(pollForToken, 2000);
            }
          }
          
          return false;
        };
        
        // Iniciar polling después de 1 segundo
        setTimeout(pollForToken, 1000);
      }

    } catch (error) {
      console.error('❌ Error inicializando SafePushNotificationService:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Obtiene el token del dispositivo
   * Espera hasta 10 segundos si el token aún no está disponible
   */
  async getToken(timeout: number = 10000): Promise<string | null> {
    // Si ya tenemos el token, devolverlo inmediatamente
    if (this.deviceToken) {
      console.log('🔔 [GETTOKEN] Token ya disponible en memoria');
      return this.deviceToken;
    }

    // Intentar obtener de AsyncStorage primero
    try {
      const storedToken = await AsyncStorage.getItem('push_token');
      if (storedToken) {
        console.log('🔔 [GETTOKEN] ✅ Token encontrado en AsyncStorage:', storedToken.substring(0, 20) + '...');
        this.deviceToken = storedToken;
        
        // Si hay alguien esperando el token, resolver la promesa
        if (this.tokenResolve) {
          console.log('🔔 [GETTOKEN] Resolviendo promesa pendiente con token de AsyncStorage');
          this.tokenResolve(storedToken);
          this.tokenResolve = null;
          this.tokenPromise = null;
        }
        
        return storedToken;
      } else {
        console.log('🔔 [GETTOKEN] No hay token en AsyncStorage, intentando desde UserDefaults...');
      }
    } catch (error) {
      console.error('❌ Error obteniendo token de AsyncStorage:', error);
    }
    
    // Si no está en AsyncStorage, intentar leer usando el módulo nativo PushTokenModule
    // Este módulo lee desde el archivo que escribió el AppDelegate
    if (Platform.OS === 'ios') {
      try {
        const PushTokenModule = (NativeModules as any).PushTokenModule;
        
        if (PushTokenModule && typeof PushTokenModule.getPushToken === 'function') {
          console.log('🔔 [GETTOKEN] Leyendo token usando PushTokenModule (lee desde archivo/UserDefaults)...');
          const fileToken = await PushTokenModule.getPushToken();
          
          if (fileToken) {
            console.log('🔔 [GETTOKEN] ✅ Token encontrado:', fileToken.substring(0, 20) + '...');
            this.deviceToken = fileToken;
            
            // Guardar también en AsyncStorage para futuras lecturas
            await AsyncStorage.setItem('push_token', fileToken);
            
            // Si hay alguien esperando el token, resolver la promesa
            if (this.tokenResolve) {
              console.log('🔔 [GETTOKEN] Resolviendo promesa pendiente con token del módulo nativo');
              this.tokenResolve(fileToken);
              this.tokenResolve = null;
              this.tokenPromise = null;
            }
            
            return fileToken;
          }
        } else {
          console.log('🔔 [GETTOKEN] PushTokenModule no disponible');
        }
      } catch (moduleError: any) {
        if (moduleError.code !== 'NO_TOKEN') {
          console.warn('🔔 [GETTOKEN] Error leyendo desde PushTokenModule:', moduleError.message);
        }
      }
    }

    // Si no hay token y no hay promesa en curso, crear una nueva
    if (!this.tokenPromise) {
      console.log('🔔 [GETTOKEN] Esperando token del sistema...');
      this.tokenPromise = new Promise<string | null>((resolve) => {
        this.tokenResolve = resolve;
        
        // Timeout: si después de X segundos no llega el token, devolver null
        setTimeout(() => {
          if (this.tokenResolve === resolve) {
            console.log('⚠️ [GETTOKEN] Timeout esperando token');
            this.tokenResolve = null;
            this.tokenPromise = null;
            resolve(null);
          }
        }, timeout);
      });
    }

    // Esperar a que el token llegue o se agote el timeout
    return await this.tokenPromise;
  }

  /**
   * Maneja el token recibido (desde onRegister o desde eventos nativos)
   */
  private handleTokenReceived(token: string) {
    console.log('🔔 [HANDLE TOKEN] Procesando token recibido:', token.substring(0, 20) + '...');
    this.deviceToken = token;
    
    // Guardar en AsyncStorage
    AsyncStorage.setItem('push_token', token).then(() => {
      console.log('🔔 [HANDLE TOKEN] ✅ Token guardado en AsyncStorage exitosamente');
    }).catch((error) => {
      console.error('🔔 [HANDLE TOKEN] ❌ Error guardando token en AsyncStorage:', error);
    });
    
    // Resolver la promesa si hay alguien esperando
    if (this.tokenResolve) {
      console.log('🔔 [HANDLE TOKEN] ✅ Resolviendo promesa de token');
      this.tokenResolve(token);
      this.tokenResolve = null;
      this.tokenPromise = null;
    } else {
      console.log('🔔 [HANDLE TOKEN] ⚠️ No hay promesa esperando (token llegó después del timeout o ya estaba disponible)');
    }
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
