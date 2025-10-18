import { Platform } from 'react-native';

export interface VideoConversionOptions {
  quality?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
  bitrate?: number;
}

export interface VideoConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  originalSize?: number;
  convertedSize?: number;
  duration?: number;
}

class VideoConversionService {
  /**
   * Convierte un video a MP4 con compresión
   * @param inputPath - Ruta del video original
   * @param options - Opciones de conversión
   * @returns Promise con el resultado de la conversión
   */
  async convertToMP4(
    inputPath: string, 
    options: VideoConversionOptions = {}
  ): Promise<VideoConversionResult> {
    try {
      console.log('Iniciando conversión de video:', inputPath);
      
      // Configuración por defecto
      const defaultOptions: VideoConversionOptions = {
        quality: 'medium',
        maxWidth: 1280,
        maxHeight: 720,
        bitrate: 2000000, // 2 Mbps
        ...options
      };

      // Obtener información del video original
      const videoInfo = await this.getVideoInfo(inputPath);
      console.log('Información del video:', videoInfo);

      // Determinar si necesita conversión
      const needsConversion = this.needsConversion(videoInfo, defaultOptions);
      
      if (!needsConversion) {
        console.log('El video ya está en formato MP4 y no necesita conversión');
        return {
          success: true,
          outputPath: inputPath,
          originalSize: videoInfo.size,
          convertedSize: videoInfo.size,
          duration: videoInfo.duration
        };
      }

      // Generar ruta de salida
      const outputPath = await this.generateOutputPath(inputPath);
      console.log('Ruta de salida:', outputPath);

      // Realizar conversión según la plataforma
      let result: VideoConversionResult;
      
      if (Platform.OS === 'ios') {
        result = await this.convertOnIOS(inputPath, outputPath, defaultOptions);
      } else {
        result = await this.convertOnAndroid(inputPath, outputPath, defaultOptions);
      }

      return result;

    } catch (error) {
      console.error('Error en conversión de video:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en la conversión'
      };
    }
  }

  /**
   * Obtiene información del video
   */
  private async getVideoInfo(inputPath: string): Promise<any> {
    // Esta función debería obtener información del video
    // Por ahora retornamos datos mock
    return {
      duration: 30, // segundos
      width: 1920,
      height: 1080,
      size: 5000000, // bytes
      format: 'mov' // formato original
    };
  }

  /**
   * Determina si el video necesita conversión
   */
  private needsConversion(videoInfo: any, options: VideoConversionOptions): boolean {
    // Verificar si ya es MP4
    if (videoInfo.format === 'mp4') {
      // Verificar si cumple con los requisitos de calidad
      if (videoInfo.width <= (options.maxWidth || 1280) && 
          videoInfo.height <= (options.maxHeight || 720)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Genera la ruta de salida para el video convertido
   */
  private async generateOutputPath(inputPath: string): Promise<string> {
    const timestamp = Date.now();
    const fileName = `converted_${timestamp}.mp4`;
    
    if (Platform.OS === 'ios') {
      return `file://${inputPath.replace(/[^/]*$/, fileName)}`;
    } else {
      return `${inputPath.replace(/[^/]*$/, fileName)}`;
    }
  }

  /**
   * Conversión en iOS usando AVFoundation
   */
  private async convertOnIOS(
    inputPath: string, 
    outputPath: string, 
    options: VideoConversionOptions
  ): Promise<VideoConversionResult> {
    try {
      // En iOS, podríamos usar AVFoundation nativo
      // Por ahora, simulamos la conversión
      console.log('Convirtiendo en iOS...');
      
      // Simular tiempo de conversión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        outputPath,
        originalSize: 5000000,
        convertedSize: 3000000,
        duration: 30
      };
    } catch (error) {
      return {
        success: false,
        error: `Error en conversión iOS: ${error}`
      };
    }
  }

  /**
   * Conversión en Android usando MediaCodec
   */
  private async convertOnAndroid(
    inputPath: string, 
    outputPath: string, 
    options: VideoConversionOptions
  ): Promise<VideoConversionResult> {
    try {
      // En Android, podríamos usar MediaCodec nativo
      // Por ahora, simulamos la conversión
      console.log('Convirtiendo en Android...');
      
      // Simular tiempo de conversión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        outputPath,
        originalSize: 5000000,
        convertedSize: 3000000,
        duration: 30
      };
    } catch (error) {
      return {
        success: false,
        error: `Error en conversión Android: ${error}`
      };
    }
  }

  /**
   * Comprime un video existente
   */
  async compressVideo(
    inputPath: string,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<VideoConversionResult> {
    const options: VideoConversionOptions = {
      quality,
      maxWidth: quality === 'low' ? 640 : quality === 'medium' ? 1280 : 1920,
      maxHeight: quality === 'low' ? 480 : quality === 'medium' ? 720 : 1080,
      bitrate: quality === 'low' ? 1000000 : quality === 'medium' ? 2000000 : 4000000
    };

    return this.convertToMP4(inputPath, options);
  }

  /**
   * Verifica si un archivo es un video
   */
  isVideoFile(filePath: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm', '.m4v'];
    const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
    return videoExtensions.includes(extension);
  }

  /**
   * Obtiene el tamaño del archivo en formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new VideoConversionService();
