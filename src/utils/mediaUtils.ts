/**
 * Utilidades para manejar diferentes tipos de media (imágenes y videos)
 */

/**
 * Determina si una URL corresponde a un video basándose en la extensión
 * @param url - URL del archivo
 * @returns true si es video, false si es imagen
 */
export const isVideoUrl = (url: string): boolean => {
  if (!url) return false;
  
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v', '.quicktime'];
  const lowerUrl = url.toLowerCase();
  
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Obtiene el tipo de media basándose en la URL
 * @param url - URL del archivo
 * @returns 'video' | 'image' | 'unknown'
 */
export const getMediaType = (url: string): 'video' | 'image' | 'unknown' => {
  if (!url) return 'unknown';
  
  if (isVideoUrl(url)) {
    return 'video';
  }
  
  // Asumir que es imagen si no es video
  return 'image';
};

/**
 * Separa un array de URLs en imágenes y videos
 * @param urls - Array de URLs de media
 * @returns Objeto con arrays separados de imágenes y videos
 */
export const separateMediaByType = (urls: string[]) => {
  const images: string[] = [];
  const videos: string[] = [];
  
  urls.forEach(url => {
    if (isVideoUrl(url)) {
      videos.push(url);
    } else {
      images.push(url);
    }
  });
  
  return { images, videos };
};

/**
 * Obtiene la primera imagen de un array de URLs de media
 * @param urls - Array de URLs de media
 * @returns URL de la primera imagen o null si no hay imágenes
 */
export const getFirstImage = (urls: string[]): string | null => {
  const { images } = separateMediaByType(urls);
  return images.length > 0 ? images[0] : null;
};

/**
 * Obtiene el primer video de un array de URLs de media
 * @param urls - Array de URLs de media
 * @returns URL del primer video o null si no hay videos
 */
export const getFirstVideo = (urls: string[]): string | null => {
  const { videos } = separateMediaByType(urls);
  return videos.length > 0 ? videos[0] : null;
};

/**
 * Obtiene el primer elemento de media (imagen o video) de un array
 * @param urls - Array de URLs de media
 * @returns Objeto con la URL y el tipo del primer elemento
 */
export const getFirstMedia = (urls: string[]): { url: string; type: 'video' | 'image' } | null => {
  if (!urls || urls.length === 0) return null;
  
  const firstUrl = urls[0];
  const type = getMediaType(firstUrl);
  
  if (type === 'unknown') return null;
  
  return { url: firstUrl, type };
};
