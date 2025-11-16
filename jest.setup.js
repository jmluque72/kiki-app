// Mock de React Native
import 'react-native-gesture-handler/jestSetup';

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock de React Native Push Notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  popInitialNotification: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  getApplicationIconBadgeNumber: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  checkPermissions: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  presentLocalNotification: jest.fn(),
  scheduleLocalNotification: jest.fn(),
}));

// Mock de React Native Permissions
jest.mock('react-native-permissions', () => require('react-native-permissions/mock'));

// Mock de React Native Image Picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

// Mock de React Native Camera Kit
jest.mock('react-native-camera-kit', () => ({
  Camera: {
    requestDeviceCameraAuthorization: jest.fn(() => Promise.resolve(true)),
    checkDeviceCameraAuthorizationStatus: jest.fn(() => Promise.resolve(true)),
  },
}));

// Mock de React Native Video
jest.mock('react-native-video', () => 'Video');

// Mock de React Native WebView
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Mock de Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock de AWS Amplify
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
  Auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
    confirmSignUp: jest.fn(),
    forgotPassword: jest.fn(),
    forgotPasswordSubmit: jest.fn(),
    currentAuthenticatedUser: jest.fn(),
    currentUserInfo: jest.fn(),
    resendSignUp: jest.fn(),
  },
}));

// Mock de React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock de React Native Screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock de React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock global de fetch
global.fetch = jest.fn();

// Mock de console.error para tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
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
  jest.clearAllMocks();
});