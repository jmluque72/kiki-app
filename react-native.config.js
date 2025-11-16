module.exports = { 
  assets: [
    "./assets/fonts/"
  ],
  dependencies: {
    '@aws-amplify/react-native': {
      platforms: {
        android: null, // Excluir del autolinking en Android
      },
    },
    '@react-native-picker/picker': {
      platforms: {
        android: null, // Excluir temporalmente del autolinking debido a problemas con código generado
      },
    },
  },
};
