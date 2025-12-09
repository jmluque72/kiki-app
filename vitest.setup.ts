import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock de jest para compatibilidad con react-native-gesture-handler y otros módulos
// Esto debe estar antes de cualquier importación que use jest
(global as any).jest = {
  fn: vi.fn,
  mock: vi.mock,
  clearAllMocks: vi.clearAllMocks,
  useFakeTimers: vi.useFakeTimers,
  useRealTimers: vi.useRealTimers,
  setSystemTime: vi.setSystemTime,
  requireActual: vi.importActual,
  doMock: vi.doMock,
  spyOn: vi.spyOn,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
};

// Setup básico de react-native-gesture-handler sin usar jestSetup
// Esto evita el error de jest no definido
const globalAny = global as any;
if (globalAny.setImmediate === undefined) {
  globalAny.setImmediate = function(fn: any, ...args: any[]) {
    return setTimeout(fn, 0, ...args);
  };
  globalAny.clearImmediate = clearTimeout;
}

// Mock de AsyncStorage (versión personalizada para evitar dependencia de jest)
vi.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {};
  return {
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(storage[key] || null)),
      setItem: vi.fn((key: string, value: string) => {
        storage[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete storage[key];
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
      getAllKeys: vi.fn(() => Promise.resolve(Object.keys(storage))),
      multiGet: vi.fn((keys: string[]) => 
        Promise.resolve(keys.map(key => [key, storage[key] || null]))
      ),
      multiSet: vi.fn((keyValuePairs: [string, string][]) => {
        keyValuePairs.forEach(([key, value]) => {
          storage[key] = value;
        });
        return Promise.resolve();
      }),
      multiRemove: vi.fn((keys: string[]) => {
        keys.forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
    },
  };
});

// Mock de React Native Push Notification
vi.mock('react-native-push-notification', () => ({
  configure: vi.fn(),
  createChannel: vi.fn(),
  popInitialNotification: vi.fn(),
  localNotification: vi.fn(),
  localNotificationSchedule: vi.fn(),
  cancelAllLocalNotifications: vi.fn(),
  cancelLocalNotifications: vi.fn(),
  getApplicationIconBadgeNumber: vi.fn(),
  setApplicationIconBadgeNumber: vi.fn(),
  getScheduledLocalNotifications: vi.fn(),
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  subscribeToTopic: vi.fn(),
  unsubscribeFromTopic: vi.fn(),
  presentLocalNotification: vi.fn(),
  scheduleLocalNotification: vi.fn(),
}));

// Mock de React Native Permissions
vi.mock('react-native-permissions', () => require('react-native-permissions/mock'));

// Mock de React Native Image Picker
vi.mock('react-native-image-picker', () => ({
  launchImageLibrary: vi.fn(),
  launchCamera: vi.fn(),
}));

// Mock de React Native Camera Kit
vi.mock('react-native-camera-kit', () => ({
  Camera: {
    requestDeviceCameraAuthorization: vi.fn(() => Promise.resolve(true)),
    checkDeviceCameraAuthorizationStatus: vi.fn(() => Promise.resolve(true)),
  },
}));

// Mock de React Native Video
vi.mock('react-native-video', () => 'Video');

// Mock de React Native WebView
vi.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Mock de Toast
vi.mock('react-native-toast-message', () => ({
  show: vi.fn(),
  hide: vi.fn(),
}));

// Mock de AWS Amplify
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn(),
  },
  Auth: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    forgotPassword: vi.fn(),
    forgotPasswordSubmit: vi.fn(),
    currentAuthenticatedUser: vi.fn(),
    currentUserInfo: vi.fn(),
    resendSignUp: vi.fn(),
  },
}));

// Mock de React Native Screens
vi.mock('react-native-screens', () => ({
  enableScreens: vi.fn(),
}));

// Mock de React Navigation
vi.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: (props) => React.createElement('div', null, props.children),
    useNavigation: () => ({
      navigate: vi.fn(),
      goBack: vi.fn(),
      setOptions: vi.fn(),
      dispatch: vi.fn(),
      reset: vi.fn(),
      canGoBack: vi.fn(() => false),
      getParent: vi.fn(),
      getState: vi.fn(),
    }),
    useRoute: () => ({
      params: {},
      name: 'TestRoute',
      key: 'test-key',
    }),
    useFocusEffect: vi.fn(),
    useNavigationContainerRef: vi.fn(),
    createNavigationContainerRef: vi.fn(() => ({
      navigate: vi.fn(),
      goBack: vi.fn(),
      setOptions: vi.fn(),
    })),
  };
});

// Mock global de fetch
global.fetch = vi.fn() as any;

// Mock de console.error para tests
const originalError = console.error;
beforeAll(() => {
  console.error = function(...args: any[]) {
    const firstArg = args[0];
    if (
      firstArg &&
      typeof firstArg === 'string' &&
      firstArg.includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Limpiar mocks después de cada test
afterEach(() => {
  vi.clearAllMocks();
});
