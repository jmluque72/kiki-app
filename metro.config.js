const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Agregamos las extensiones de imágenes y cualquier otra que uses
defaultConfig.resolver.assetExts = [
  ...defaultConfig.resolver.assetExts,
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
];

// Si querés agregar más rutas de assets:
defaultConfig.watchFolders = [
  ...defaultConfig.watchFolders,
  `${__dirname}/assets`,
];

module.exports = mergeConfig(defaultConfig, {});

