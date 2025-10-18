/**
 * Servicio para manejar la subida de videos de actividades
 */

/**
 * Prepara un video para subir a S3
 * @param video - Objeto de video con uri, type, etc.
 * @returns FormData listo para subir
 */
export const prepareVideoForUpload = (video: any) => {
  const formData = new FormData();
  
  // Obtener el nombre del archivo de la URI
  const fileName = video.uri.split('/').pop() || `activity-video-${Date.now()}.mp4`;
  
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
  }
  
  // Agregar el video al FormData
  const videoFile = {
    uri: video.uri,
    type: mimeType,
    name: fileName,
  } as any;
  
  formData.append('video', videoFile);
  
  console.log('📹 [ACTIVITY VIDEO] Video preparado para subir:', {
    fileName,
    mimeType,
    fileSize: video.fileSize
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
 * Valida el tamaño de un video
 * @param video - Objeto de video
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 10MB)
 * @returns true si el video es válido, false si es demasiado grande
 */
export const validateVideoSize = (video: any, maxSizeMB: number = 10): boolean => {
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
 * Filtra videos válidos por tamaño
 * @param videos - Array de videos
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 10MB)
 * @returns Array de videos válidos
 */
export const filterValidVideos = (videos: any[], maxSizeMB: number = 10): any[] => {
  return videos.filter(video => validateVideoSize(video, maxSizeMB));
};
