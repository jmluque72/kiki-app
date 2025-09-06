# Implementación de Procesamiento de Imágenes en App Móvil

## 🎯 **Objetivo**

Optimizar las imágenes antes de subirlas al servidor para:
- **Reducir el ancho de banda** utilizado
- **Acelerar las subidas** de imágenes
- **Mejorar la experiencia del usuario**
- **Reducir la carga del servidor**

## 📱 **Configuraciones por Tipo de Imagen**

### 1. **Avatares de Usuario**
```typescript
{
  maxWidth: 400,    // 400px de ancho máximo
  quality: 0.8,     // 80% de calidad
  format: 'JPEG'    // Formato JPEG
}
```

### 2. **Imágenes de Actividades**
```typescript
{
  maxWidth: 800,    // 800px de ancho máximo
  quality: 0.85,    // 85% de calidad
  format: 'JPEG'    // Formato JPEG
}
```

### 3. **Fotos de Estudiantes**
```typescript
{
  maxWidth: 600,    // 600px de ancho máximo
  quality: 0.8,     // 80% de calidad
  format: 'JPEG'    // Formato JPEG
}
```

## 🔧 **Servicios Implementados**

### 1. **ImageProcessor** (`src/services/imageProcessor.ts`)
- Procesamiento básico de imágenes
- Obtención de dimensiones
- Cálculo de proporciones
- Configuraciones predefinidas

### 2. **UserService** (`src/services/userService.ts`)
- Procesamiento de avatares de usuario
- Optimización automática antes de subir

### 3. **ActivityImageService** (`src/services/activityImageService.ts`)
- Procesamiento de imágenes de actividades
- Soporte para múltiples imágenes
- Preparación para subida a S3

### 4. **StudentImageService** (`src/services/studentImageService.ts`)
- Procesamiento de fotos de estudiantes
- Optimización específica para perfiles

## 📋 **Uso en la Aplicación**

### Para Avatares de Usuario
```typescript
import { UserService } from '../services/userService';

// En PerfilScreen.tsx
const handleUploadAvatar = async () => {
  if (!selectedImage) return;
  
  try {
    showLoading('Procesando y subiendo imagen...');
    
    // El procesamiento se hace automáticamente en UserService
    const response = await UserService.updateAvatar(selectedImage);
    
    if (response.success && response.data?.user) {
      await login(response.data.user);
      setUser(response.data.user);
      setSelectedImage(null);
    } else {
      Alert.alert('Error', response.message || 'Error al actualizar el avatar');
    }
  } catch (error) {
    console.error('Error al subir avatar:', error);
    Alert.alert('Error', 'Error al actualizar el avatar');
  } finally {
    hideLoading();
  }
};
```

### Para Imágenes de Actividades
```typescript
import { processActivityImages, prepareImagesForUpload } from '../services/activityImageService';

// En ActividadScreen.tsx
const handleUploadImages = async (imageUris: string[]) => {
  try {
    showLoading('Procesando imágenes...');
    
    // Procesar todas las imágenes
    const processedImages = await processActivityImages(imageUris);
    
    // Preparar para subida
    const formDataArray = prepareImagesForUpload(processedImages);
    
    // Subir cada imagen a S3
    const imageKeys = [];
    for (const formData of formDataArray) {
      const response = await apiClient.post('/upload/s3/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        imageKeys.push(response.data.imageKey);
      }
    }
    
    return imageKeys;
  } catch (error) {
    console.error('Error procesando imágenes:', error);
    throw error;
  } finally {
    hideLoading();
  }
};
```

### Para Fotos de Estudiantes
```typescript
import { processStudentImage, prepareStudentImageForUpload } from '../services/studentImageService';

// En StudentProfileScreen.tsx
const handleUploadStudentPhoto = async (imageUri: string, studentId: string) => {
  try {
    showLoading('Procesando foto...');
    
    // Procesar la imagen
    const processedImage = await processStudentImage(imageUri);
    
    // Preparar para subida
    const formData = prepareStudentImageForUpload(processedImage);
    
    // Subir al servidor
    const response = await apiClient.put(`/students/${studentId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      // Actualizar la UI
      setStudentPhoto(response.data.data.student.avatar);
    }
  } catch (error) {
    console.error('Error subiendo foto:', error);
    Alert.alert('Error', 'No se pudo subir la foto');
  } finally {
    hideLoading();
  }
};
```

## ✅ **Optimizaciones Implementadas**

### 1. **react-native-image-resizer Instalado**
La librería ya está instalada y funcionando:
```bash
yarn add react-native-image-resizer
```

### 2. **Compresión Real Implementada**
```typescript
import ImageResizer from 'react-native-image-resizer';

const result = await ImageResizer.createResizedImage(
  imageUri,
  newWidth,
  newHeight,
  format,
  quality * 100, // Convertir a porcentaje (0-100)
  0, // rotation
  undefined, // outputPath
  false, // keepMetadata
  { mode: 'contain' }
);
```

### 3. **Cache de imágenes procesadas**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const cacheProcessedImage = async (originalUri: string, processedUri: string) => {
  const cacheKey = `processed_${originalUri}`;
  await AsyncStorage.setItem(cacheKey, processedUri);
};

const getCachedProcessedImage = async (originalUri: string) => {
  const cacheKey = `processed_${originalUri}`;
  return await AsyncStorage.getItem(cacheKey);
};
```

## 📊 **Beneficios Esperados**

### Antes de la Optimización
- **Imágenes originales**: 2-10MB por imagen
- **Tiempo de subida**: 30-120 segundos
- **Uso de ancho de banda**: Alto
- **Experiencia de usuario**: Lenta

### Después de la Optimización
- **Imágenes optimizadas**: 50-200KB por imagen
- **Tiempo de subida**: 5-15 segundos
- **Uso de ancho de banda**: Reducido en 90%
- **Experiencia de usuario**: Rápida y fluida

## 🔍 **Monitoreo y Logs**

### Logs de Procesamiento
```typescript
console.log('🖼️ [IMAGE PROCESSOR] Procesando imagen:', imageUri);
console.log('📏 [IMAGE PROCESSOR] Ancho máximo:', maxWidth, 'px');
console.log('📊 [IMAGE PROCESSOR] Dimensiones originales:', width, 'x', height);
console.log('📐 [IMAGE PROCESSOR] Nuevas dimensiones:', newWidth, 'x', newHeight);
console.log('✅ [IMAGE PROCESSOR] Imagen procesada exitosamente');
```

### Métricas de Rendimiento
- Tiempo de procesamiento por imagen
- Reducción de tamaño en porcentaje
- Tiempo de subida antes y después
- Uso de ancho de banda

## 🎯 **Conclusión**

Esta implementación proporciona:
- ✅ **Optimización automática** de todas las imágenes
- ✅ **Configuraciones específicas** por tipo de contenido
- ✅ **Reducción significativa** del ancho de banda
- ✅ **Mejora en la experiencia** del usuario
- ✅ **Escalabilidad** para futuras optimizaciones

**Las imágenes ahora se procesan en el dispositivo móvil antes de subirse, reduciendo significativamente el tiempo de subida y el uso de ancho de banda.**
