// Mock del error-guard para evitar problemas con Flow types en tests E2E
module.exports = {
  setErrorHandler: () => {},
  getErrorHandler: () => () => {},
};

