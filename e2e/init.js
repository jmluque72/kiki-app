// Detox v19 - Configuración para Jest
const detox = require('detox');
const config = require('../detox.config');

beforeAll(async () => {
  await detox.init(config);
  await device.launchApp();
}, 300000);

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await detox.cleanup();
});
