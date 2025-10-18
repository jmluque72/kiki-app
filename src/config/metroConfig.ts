// Configuración de Metro para desarrollo
export const METRO_CONFIG = {
  // IP de tu computadora en la red local
  HOST: '192.168.68.106',
  PORT: 8081,
  
  // URL completa del servidor de Metro
  get METRO_URL() {
    return `http://${this.HOST}:${this.PORT}`;
  },
  
  // URL del bundle
  get BUNDLE_URL() {
    return `${this.METRO_URL}/index.bundle?platform=ios&dev=true&minify=false`;
  }
};

// Configuración para diferentes entornos
export const getMetroConfig = () => {
  // En desarrollo, usar la IP de la red local
  return METRO_CONFIG;
};
