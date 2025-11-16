module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/KikiApp.app',
      build:
        'xcodebuild -workspace ios/KikiApp.xcworkspace -scheme KikiApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
      },
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/KikiApp.app',
      build:
        'xcodebuild -workspace ios/KikiApp.xcworkspace -scheme KikiApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 14',
      },
    },
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      device: {
        avdName: 'Pixel_5_API_31',
      },
    },
    'android.emu.release': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
      device: {
        avdName: 'Pixel_5_API_31',
      },
    },
  },
  behavior: {
    init: {
      exposeGlobals: false,
    },
    cleanup: {
      shutdownDevice: false,
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
  testRunner: {
    retries: 1,
    forwardEnv: false,
  },
};