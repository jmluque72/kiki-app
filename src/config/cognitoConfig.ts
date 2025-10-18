// Configuración de Cognito para la app móvil (AWS SDK v3)
export const cognitoConfig = {
  userPoolId: 'us-east-1_0i4cEgcF',
  userPoolClientId: '5grvl5dpfv8dgfggcunttu45ege',
  region: 'us-east-1'
};

// Función para configurar (no necesaria con AWS SDK v3)
export const configureAmplify = () => {
  console.log('✅ [CognitoConfig] Usando AWS SDK v3 directamente');
  return true;
};

// Función para obtener la URL de Cognito
export const getCognitoUrl = () => {
  return `https://cognito-idp.${cognitoConfig.region}.amazonaws.com/${cognitoConfig.userPoolId}`;
};

export default cognitoConfig;
