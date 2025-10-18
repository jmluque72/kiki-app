import { useState, useCallback } from 'react';
import videoConversionService, { VideoConversionOptions, VideoConversionResult } from '../services/videoConversionService';

export interface UseVideoConversionReturn {
  isConverting: boolean;
  conversionProgress: number;
  convertVideo: (inputPath: string, options?: VideoConversionOptions) => Promise<VideoConversionResult>;
  compressVideo: (inputPath: string, quality?: 'low' | 'medium' | 'high') => Promise<VideoConversionResult>;
  lastResult: VideoConversionResult | null;
  error: string | null;
  clearError: () => void;
}

export const useVideoConversion = (): UseVideoConversionReturn => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [lastResult, setLastResult] = useState<VideoConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const convertVideo = useCallback(async (
    inputPath: string, 
    options?: VideoConversionOptions
  ): Promise<VideoConversionResult> => {
    try {
      setIsConverting(true);
      setConversionProgress(0);
      setError(null);
      setLastResult(null);

      // Simular progreso de conversión
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await videoConversionService.convertToMP4(inputPath, options);
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Error desconocido en la conversión');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      const errorResult: VideoConversionResult = {
        success: false,
        error: errorMessage
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsConverting(false);
      setTimeout(() => setConversionProgress(0), 1000);
    }
  }, []);

  const compressVideo = useCallback(async (
    inputPath: string, 
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<VideoConversionResult> => {
    try {
      setIsConverting(true);
      setConversionProgress(0);
      setError(null);
      setLastResult(null);

      // Simular progreso de compresión
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 150);

      const result = await videoConversionService.compressVideo(inputPath, quality);
      
      clearInterval(progressInterval);
      setConversionProgress(100);
      setLastResult(result);

      if (!result.success) {
        setError(result.error || 'Error desconocido en la compresión');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      const errorResult: VideoConversionResult = {
        success: false,
        error: errorMessage
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsConverting(false);
      setTimeout(() => setConversionProgress(0), 1000);
    }
  }, []);

  return {
    isConverting,
    conversionProgress,
    convertVideo,
    compressVideo,
    lastResult,
    error,
    clearError
  };
};
