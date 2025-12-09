module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/KikiApp.app',
      build: 'xcodebuild -workspace ios/KikiApp.xcworkspace -scheme KikiApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build -destination "generic/platform=iOS Simulator" CODE_SIGNING_ALLOWED=NO CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO ONLY_ACTIVE_ARCH=NO',
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/KikiApp.app',
      build:
        'xcodebuild -workspace ios/KikiApp.xcworkspace -scheme KikiApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    'ios.simulator': {
      type: 'ios.simulator',
      device: {
        id: 'DC881DF8-F081-40DC-A5CD-5B2DCEEDA85A', // iPhone 15 Pro específico
      },
    },
    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_5_API_31',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'ios.simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'ios.simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'android.emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'android.emulator',
      app: 'android.release',
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
      reinstallApp: true, // Reinstalar app si es necesario
      launchApp: 'auto', // Lanzar automáticamente
    },
    cleanup: {
      shutdownDevice: false,
      stopApp: false,
      terminateApp: false, // No terminar la app al finalizar (evita errores)
    },
  },
  artifacts: {
    rootDir: 'artifacts',
    plugins: {
      log: 'failing',
      screenshot: 'failing',
      video: 'failing',
      instruments: 'none',
      timeline: 'none',
    },
  },
};
