declare module 'react-native-push-notification' {
  interface PushNotificationPermissions {
    alert: boolean;
    badge: boolean;
    sound: boolean;
  }

  interface PushNotificationToken {
    token: string;
  }

  interface PushNotificationOptions {
    onNotification?: (notification: any) => void;
    onRegister?: (token: PushNotificationToken) => void;
    onRegistrationError?: (error: any) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  interface PushNotificationData {
    title: string;
    message: string;
    data?: any;
  }

  interface PushNotificationStatic {
    configure(options: PushNotificationOptions): void;
    requestPermissions(): Promise<PushNotificationPermissions>;
    localNotification(data: PushNotificationData): void;
    openSettings(): void;
  }

  const PushNotification: PushNotificationStatic;
  export default PushNotification;
}
