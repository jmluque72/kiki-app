/**
 * Servicio para manejar la subida de videos de actividades
 */

import { Platform } from 'react-native';

/**
 * Prepara un video para subir a S3
 * @param video - Objeto de video con uri, type, etc.
 * @returns FormData listo para subir
 */
export const prepareVideoForUpload = (video: any) => {
  const formData = new FormData();
  
  // Obtener el nombre del archivo de la URI
  let fileName = video.fileName || video.uri.split('/').pop() || `activity-video-${Date.now()}.mp4`;
  
  // Limpiar el nombre del archivo (remover parámetros de query si existen)
  if (fileName.includes('?')) {
    fileName = fileName.split('?')[0];
  }
  
  // Determinar el tipo MIME basado en la extensión o tipo del archivo
  let mimeType = 'video/mp4'; // Por defecto
  if (video.type) {
    mimeType = video.type;
  } else if (fileName.includes('.mov')) {
    mimeType = 'video/quicktime';
  } else if (fileName.includes('.avi')) {
    mimeType = 'video/x-msvideo';
  } else if (fileName.includes('.webm')) {
    mimeType = 'video/webm';
  } else if (fileName.includes('.mp4')) {
    mimeType = 'video/mp4';
  }
  
  // Normalizar URI para Android
  let videoUri = video.uri;
  if (Platform.OS === 'android') {
    // Logging detallado para debug
    console.log('📱 [ACTIVITY VIDEO] Android - Preparando video');
    console.log('🔗 [ACTIVITY VIDEO] URI original:', videoUri);
    console.log('📄 [ACTIVITY VIDEO] File name:', fileName);
    console.log('🎬 [ACTIVITY VIDEO] MIME type:', mimeType);
    console.log('📊 [ACTIVITY VIDEO] File size:', video.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(2)}MB` : 'desconocido');
    
    // Verificar tipo de URI
    if (videoUri.startsWith('content://')) {
      console.log('⚠️ [ACTIVITY VIDEO] URI es content:// - FormData debería manejarlo');
    } else if (videoUri.startsWith('file://')) {
      console.log('✅ [ACTIVITY VIDEO] URI es file:// - debería funcionar correctamente');
    } else {
      console.log('⚠️ [ACTIVITY VIDEO] URI no tiene prefijo conocido, agregando file:// si es necesario');
      // Si no tiene prefijo y parece un path absoluto, agregar file://
      if (videoUri.startsWith('/')) {
        videoUri = `file://${videoUri}`;
        console.log('🔗 [ACTIVITY VIDEO] URI normalizada a:', videoUri);
      }
    }
  }
  
  // Agregar el video al FormData
  // IMPORTANTE: En React Native, el objeto debe tener esta estructura exacta
  const videoFile = {
    uri: videoUri,
    type: mimeType,
    name: fileName,
  } as any;
  
  // Verificar que el FormData tenga el método append
  if (typeof formData.append !== 'function') {
    console.error('❌ [ACTIVITY VIDEO] FormData no tiene método append');
    throw new Error('Error al preparar el FormData para el video');
  }
  
  try {
    formData.append('video', videoFile);
    console.log('✅ [ACTIVITY VIDEO] Video agregado al FormData con campo "video"');
  } catch (appendError: any) {
    console.error('❌ [ACTIVITY VIDEO] Error agregando video al FormData:', appendError);
    throw new Error(`Error al preparar el video para subir: ${appendError.message}`);
  }
  
  // Verificar que el campo se agregó correctamente (solo para debug)
  // Nota: En React Native, FormData no tiene métodos para verificar contenido
  console.log('📹 [ACTIVITY VIDEO] Video preparado para subir:', {
    fileName,
    mimeType,
    fileSize: video.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(2)}MB` : 'desconocido',
    uriType: videoUri.substring(0, 10) + '...',
    platform: Platform.OS,
    formDataField: 'video' // Confirmar que el campo se llama 'video'
  });
  
  return formData;
};

/**
 * Prepara múltiples videos para subir a S3
 * @param videos - Array de videos
 * @returns Array de FormData listos para subir
 */
export const prepareVideosForUpload = (videos: any[]) => {
  const formDataArray = [];
  
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const formData = prepareVideoForUpload(video);
    formDataArray.push(formData);
  }
  
  console.log('📹 [ACTIVITY VIDEO] Preparados', formDataArray.length, 'videos para subir');
  
  return formDataArray;
};

/**
 * Valida la duración de un video
 * @param video - Objeto de video
 * @param maxDurationSeconds - Duración máxima en segundos (por defecto 30)
 * @returns true si el video es válido, false si es demasiado largo
 */
export const validateVideoDuration = (video: any, maxDurationSeconds: number = 30): boolean => {
  if (!video.duration) {
    console.warn('📹 [ACTIVITY VIDEO] No se pudo determinar la duración del video');
    return true; // Permitir si no se puede determinar la duración
  }
  
  const durationSeconds = video.duration / 1000; // duration viene en milisegundos
  const isValid = durationSeconds <= maxDurationSeconds;
  
  if (!isValid) {
    console.warn(`📹 [ACTIVITY VIDEO] Video demasiado largo: ${Math.round(durationSeconds)} segundos (máximo ${maxDurationSeconds} segundos)`);
  }
  
  return isValid;
};

/**
 * Valida el tamaño de un video
 * @param video - Objeto de video
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 50MB para videos de ~30 segundos)
 * @returns true si el video es válido, false si es demasiado grande
 */
export const validateVideoSize = (video: any, maxSizeMB: number = 50): boolean => {
  if (!video.fileSize) {
    console.warn('📹 [ACTIVITY VIDEO] No se pudo determinar el tamaño del video');
    return true; // Permitir si no se puede determinar el tamaño
  }
  
  const fileSizeMB = video.fileSize / (1024 * 1024);
  const isValid = fileSizeMB <= maxSizeMB;
  
  if (!isValid) {
    console.warn(`📹 [ACTIVITY VIDEO] Video demasiado grande: ${fileSizeMB.toFixed(2)}MB (máximo ${maxSizeMB}MB)`);
  }
  
  return isValid;
};

/**
 * Filtra videos válidos por duración y tamaño
 * @param videos - Array de videos
 * @param maxDurationSeconds - Duración máxima en segundos (por defecto 30)
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 50MB para videos de ~30 segundos)
 * @returns Array de videos válidos
 */
export const filterValidVideos = (videos: any[], maxDurationSeconds: number = 30, maxSizeMB: number = 50): any[] => {
  return videos.filter(video => 
    validateVideoDuration(video, maxDurationSeconds) && 
    validateVideoSize(video, maxSizeMB)
  );
};
