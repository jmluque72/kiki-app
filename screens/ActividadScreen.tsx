import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from "../contexts/AuthContextHybrid";
import { useStudents } from '../src/hooks/useStudents';
import { API_FULL_URL } from '../src/config/apiConfig';
import { apiClient } from '../src/services/api';
import CommonHeader from '../components/CommonHeader';
import withSideMenu from '../components/withSideMenu';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import { processActivityImages, prepareImagesForUpload } from '../src/services/activityImageService';
import { simpleProcessMultipleImages } from '../src/services/simpleImageProcessor';
import { prepareVideosForUpload, filterValidVideos } from '../src/services/activityVideoService';
import ImageResizer from 'react-native-image-resizer';
import { useVideoConversion } from '../src/hooks/useVideoConversion';
import VideoConversionModal from '../src/components/VideoConversionModal';

const ActividadScreen = ({ onOpenNotifications, onOpenMenu }: { onOpenNotifications: () => void; onOpenMenu?: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  
  // Usar la primera institución si no hay ninguna seleccionada (igual que InicioScreen)
  const effectiveInstitution = selectedInstitution || (userAssociations.length > 0 ? userAssociations[0] : null);
  
  // Debug logs para ver qué institución se está usando
  console.log('🔍 [ActividadScreen] effectiveInstitution:', effectiveInstitution ? {
    id: effectiveInstitution._id,
    account: effectiveInstitution.account?.nombre,
    student: effectiveInstitution.student ? {
      id: effectiveInstitution.student._id,
      name: effectiveInstitution.student.nombre,
      avatar: effectiveInstitution.student.avatar
    } : null
  } : null);
  const { user, token } = useAuth();
  const { students, loading: studentsLoading } = useStudents(
    effectiveInstitution?.account._id,
    effectiveInstitution?.division?._id
  );
  
  const [selectedImages, setSelectedImages] = useState([]);
  const [showVideoConversion, setShowVideoConversion] = useState(false);
  const [videoConversionResult, setVideoConversionResult] = useState(null);
  
  // Función para copiar archivo temporal a lugar permanente en Android
  const copyImageToPermanentLocation = async (imageUri: string): Promise<string> => {
    if (Platform.OS !== 'android') {
      return imageUri; // En iOS, retornar URI original
    }

    try {
      console.log('📱 [ACTIVIDAD] Copiando archivo temporal a lugar permanente:', imageUri);
      
      // Si ya es un archivo permanente (no temporal), retornar tal cual
      if (!imageUri.includes('rn_image_picker_lib_temp')) {
        console.log('✅ [ACTIVIDAD] Archivo ya es permanente, no necesita copia');
        return imageUri;
      }

      // Usar ImageResizer para copiar el archivo (sin redimensionar, solo copiar)
      // Esto crea una copia permanente en el cache de la app
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const outputPath = `permanent_${timestamp}_${random}.jpg`;
      
      console.log('📁 [ACTIVIDAD] Creando copia permanente con outputPath:', outputPath);
      
      const result = await ImageResizer.createResizedImage(
        imageUri,
        10000, // Dimensiones muy grandes para no redimensionar (solo copiar)
        10000,
        'JPEG',
        100, // Calidad máxima para no perder calidad
        0,
        outputPath, // outputPath explícito para crear archivo permanente
        true, // keepMetadata
        { mode: 'contain' }
      );

      console.log('✅ [ACTIVIDAD] Archivo copiado exitosamente a:', result.uri);
      return result.uri;
    } catch (error: any) {
      console.error('❌ [ACTIVIDAD] Error copiando archivo, usando URI original:', error);
      // Si falla la copia, retornar URI original (puede funcionar si el archivo aún existe)
      return imageUri;
    }
  };

  // Función para copiar video temporal a lugar permanente en Android
  // IMPORTANTE: En Android, las URIs content:// no funcionan directamente con FormData
  // Esta función valida y normaliza la URI para que funcione correctamente
  const copyVideoToPermanentLocation = async (videoUri: string, mimeType: string = 'video/mp4'): Promise<string> => {
    if (Platform.OS !== 'android') {
      return videoUri; // En iOS, retornar URI original
    }

    try {
      console.log('📹 [ACTIVIDAD] Procesando video para Android');
      console.log('🔗 [ACTIVIDAD] URI original:', videoUri);
      console.log('📄 [ACTIVIDAD] MIME type:', mimeType);
      
      // Si ya es un archivo file:// permanente, retornar tal cual
      if (videoUri.startsWith('file://') && !videoUri.includes('rn_image_picker_lib_temp')) {
        console.log('✅ [ACTIVIDAD] Video ya es file:// permanente, no necesita procesamiento');
        return videoUri;
      }

      // Para URIs content://, intentar leer el archivo para validar que esté disponible
      // Nota: FormData en React Native debería manejar content:// URIs, pero a veces falla
      if (videoUri.startsWith('content://')) {
        console.log('📥 [ACTIVIDAD] URI es content://, validando acceso...');
        try {
          const response = await fetch(videoUri);
          if (!response.ok) {
            throw new Error(`Error al leer el video: ${response.status} ${response.statusText}`);
          }
          const blob = await response.blob();
          console.log('✅ [ACTIVIDAD] Video accesible, tamaño:', blob.size, 'bytes');
          console.log('✅ [ACTIVIDAD] URI content:// debería funcionar con FormData');
          // Retornar URI original - FormData debería manejarlo
          return videoUri;
        } catch (fetchError: any) {
          console.error('❌ [ACTIVIDAD] Error validando video con fetch:', fetchError);
          console.warn('⚠️ [ACTIVIDAD] Intentando usar URI original de todas formas');
          // Retornar URI original - puede funcionar si el problema es solo con fetch
          return videoUri;
        }
      }

      // Para archivos temporales, intentar leer para validar
      if (videoUri.includes('rn_image_picker_lib_temp')) {
        console.log('⚠️ [ACTIVIDAD] URI es archivo temporal, validando acceso...');
        try {
          const response = await fetch(videoUri);
          if (!response.ok) {
            throw new Error(`Error al leer el video temporal: ${response.status}`);
          }
          const blob = await response.blob();
          console.log('✅ [ACTIVIDAD] Video temporal accesible, tamaño:', blob.size, 'bytes');
          console.log('⚠️ [ACTIVIDAD] ADVERTENCIA: Archivo temporal puede desaparecer antes de la subida');
          return videoUri;
        } catch (fetchError: any) {
          console.error('❌ [ACTIVIDAD] Error validando video temporal:', fetchError);
          throw new Error('El archivo temporal ya no es accesible. Por favor, selecciona el video nuevamente.');
        }
      }

      // Si no es content:// ni temporal, retornar tal cual
      console.log('✅ [ACTIVIDAD] URI no requiere procesamiento especial');
      return videoUri;
    } catch (error: any) {
      console.error('❌ [ACTIVIDAD] Error procesando video:', error);
      console.error('❌ [ACTIVIDAD] Error details:', error.message);
      throw error; // Re-lanzar el error para que se maneje arriba
    }
  };
  
  // Hook para conversión de video
  const {
    isConverting,
    conversionProgress,
    convertVideo,
    lastResult,
    error: conversionError,
    clearError
  } = useVideoConversion();
  
  const [formData, setFormData] = useState({
    titulo: '',
    participantes: '',
    descripcion: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el autocompletar de participantes
  const [participantesSearch, setParticipantesSearch] = useState('');
  const [showParticipantesDropdown, setShowParticipantesDropdown] = useState(false);
  const [selectedParticipantes, setSelectedParticipantes] = useState<string[]>([]);
  
  // Custom Alert hook
  const { showSuccess, showError, isVisible, alertConfig } = useCustomAlert();
  
  // Estado para detectar cuando el teclado está visible
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Referencias para scroll automático
  const scrollViewRef = useRef<ScrollView>(null);
  const descripcionInputRef = useRef<TextInput>(null);
  const descripcionContainerRef = useRef<View>(null);
  
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Efecto para hacer scroll al final cuando se seleccionan imágenes/videos
  useEffect(() => {
    if (selectedImages.length > 0 && scrollViewRef.current) {
      // Delay más largo para asegurar que el contenido se haya renderizado completamente
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [selectedImages.length]);

  const handleImagePicker = () => {
    // Abrir directamente la galería para seleccionar imagen
    openGallery();
  };

  const openCamera = () => {
    const options = {
      mediaType: 'mixed', // Permite tanto fotos como videos
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.error) {
        console.log('Error de cámara:', response.error);
        console.log('Error: No se pudo abrir la cámara');
      } else if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        
        // Validar videos
        if (asset.type?.startsWith('video/')) {
          // Validar duración (máximo 30 segundos)
          const durationSeconds = asset.duration ? asset.duration / 1000 : 0; // duration viene en milisegundos
          if (durationSeconds > 30) {
            showError(
              'Video demasiado largo',
              `El video tiene ${Math.round(durationSeconds)} segundos. El límite máximo es de 30 segundos. Por favor, selecciona un video más corto.`
            );
            return;
          }
          
          // Validar tamaño de videos (máximo 50MB para videos de ~30 segundos)
          const fileSizeMB = (asset.fileSize || 0) / (1024 * 1024);
          if (fileSizeMB > 50) {
            showError(
              'Video demasiado pesado',
              `El video pesa ${fileSizeMB.toFixed(2)}MB. El límite máximo es de 50MB.\n\nPor favor, selecciona un video más liviano o comprímelo antes de subirlo.`
            );
            return;
          }
          
          // Mostrar modal de conversión para videos
          setShowVideoConversion(true);
        }
        
        // En Android, copiar archivo temporal a lugar permanente inmediatamente
        if (Platform.OS === 'android' && asset.uri) {
          if (asset.type?.startsWith('video/')) {
            // Procesar video con fetch para asegurar disponibilidad
            console.log('📱 [ACTIVIDAD] Android detectado - procesando video inmediatamente');
            console.log('🔗 [ACTIVIDAD] URI original:', asset.uri);
            copyVideoToPermanentLocation(asset.uri, asset.type).then((processedUri) => {
              console.log('✅ [ACTIVIDAD] Video procesado exitosamente');
              console.log('🔗 [ACTIVIDAD] URI procesado:', processedUri);
              const processedAsset = { ...asset, uri: processedUri };
              setSelectedImages(prev => [...prev, processedAsset]);
            }).catch((error) => {
              console.error('❌ [ACTIVIDAD] Error procesando video, usando original:', error);
              console.error('❌ [ACTIVIDAD] Error details:', error);
              // Usar original de todas formas - puede funcionar si el archivo aún existe
              setSelectedImages(prev => [...prev, asset]);
            });
          } else {
            // Procesar imagen
            console.log('📱 [ACTIVIDAD] Android detectado - copiando imagen inmediatamente');
            console.log('🔗 [ACTIVIDAD] URI original:', asset.uri);
            copyImageToPermanentLocation(asset.uri).then((permanentUri) => {
              console.log('✅ [ACTIVIDAD] Imagen copiada exitosamente');
              console.log('🔗 [ACTIVIDAD] URI permanente:', permanentUri);
              const permanentAsset = { ...asset, uri: permanentUri };
              setSelectedImages(prev => [...prev, permanentAsset]);
            }).catch((error) => {
              console.error('❌ [ACTIVIDAD] Error copiando imagen, usando original:', error);
              console.error('❌ [ACTIVIDAD] Error details:', error);
              // Usar original de todas formas - puede funcionar si el archivo aún existe
              setSelectedImages(prev => [...prev, asset]);
            });
          }
        } else {
          setSelectedImages(prev => [...prev, asset]);
        }
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'mixed', // Permite tanto imágenes como videos
      includeBase64: false, // No usar base64 - copiaremos archivos a lugar permanente
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 5,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la galería');
      } else if (response.error) {
        console.log('Error de galería:', response.error);
        console.log('Error: No se pudo abrir la galería');
      } else if (response.assets) {
        // Validar videos
        const validAssets = [];
        const rejectedVideos = [];
        
        for (const asset of response.assets) {
          if (asset.type?.startsWith('video/')) {
            // Validar duración (máximo 30 segundos)
            const durationSeconds = asset.duration ? asset.duration / 1000 : 0; // duration viene en milisegundos
            if (durationSeconds > 30) {
              rejectedVideos.push({
                fileName: asset.fileName || 'Video',
                reason: `duración (${Math.round(durationSeconds)} segundos, máximo 30)`
              });
              continue;
            }
            
            // Validar tamaño de videos (máximo 50MB para videos de ~30 segundos)
            const fileSizeMB = (asset.fileSize || 0) / (1024 * 1024);
            if (fileSizeMB > 50) {
              rejectedVideos.push({
                fileName: asset.fileName || 'Video',
                reason: `tamaño (${fileSizeMB.toFixed(2)}MB, máximo 50MB)`
              });
              continue;
            }
          }
          
          validAssets.push(asset);
        }
        
        // Mostrar mensajes de error para videos rechazados
        if (rejectedVideos.length > 0) {
          const videoNames = rejectedVideos.map(v => v.fileName).join(', ');
          const reasons = rejectedVideos.map(v => `${v.fileName}: ${v.reason}`).join('\n');
          showError(
            `${rejectedVideos.length} video${rejectedVideos.length > 1 ? 's' : ''} rechazado${rejectedVideos.length > 1 ? 's' : ''}`,
            `Los siguientes videos no se pudieron agregar:\n\n${reasons}\n\nRequisitos:\n- Duración máxima: 30 segundos\n- Tamaño máximo: 50MB\n\nPor favor, selecciona videos que cumplan con estos requisitos.`
          );
        }
        
        // En Android, copiar archivos temporales a lugar permanente inmediatamente
        if (Platform.OS === 'android') {
          console.log('📱 [ACTIVIDAD] Android detectado - procesando', validAssets.length, 'archivos inmediatamente');
          const copyPromises = validAssets.map(async (asset, index) => {
            if (asset.uri) {
              if (asset.type?.startsWith('video/')) {
                // Procesar video con fetch
                console.log(`📹 [ACTIVIDAD] Procesando video ${index + 1}/${validAssets.length}:`, asset.uri.substring(0, 50) + '...');
                try {
                  const processedUri = await copyVideoToPermanentLocation(asset.uri, asset.type);
                  console.log(`✅ [ACTIVIDAD] Video ${index + 1} procesado:`, processedUri.substring(0, 50) + '...');
                  return { ...asset, uri: processedUri };
                } catch (error) {
                  console.error(`❌ [ACTIVIDAD] Error procesando video ${index + 1}, usando original:`, error);
                  return asset;
                }
              } else {
                // Procesar imagen
                console.log(`📱 [ACTIVIDAD] Copiando imagen ${index + 1}/${validAssets.length}:`, asset.uri.substring(0, 50) + '...');
                try {
                  const permanentUri = await copyImageToPermanentLocation(asset.uri);
                  console.log(`✅ [ACTIVIDAD] Imagen ${index + 1} copiada a:`, permanentUri.substring(0, 50) + '...');
                  return { ...asset, uri: permanentUri };
                } catch (error) {
                  console.error(`❌ [ACTIVIDAD] Error copiando imagen ${index + 1}, usando original:`, error);
                  return asset;
                }
              }
            }
            return asset;
          });
          
          Promise.all(copyPromises).then((processedAssets) => {
            console.log('✅ [ACTIVIDAD] Todos los archivos procesados, agregando a selectedImages');
            setSelectedImages(prev => [...prev, ...processedAssets]);
          });
        } else {
          setSelectedImages(prev => [...prev, ...validAssets]);
        }
      }
    });
  };

  // Funciones para el autocompletar de participantes
  console.log('🔍 Debug - effectiveInstitution:', effectiveInstitution);
  console.log('🔍 Debug - students:', students);
  console.log('🔍 Debug - studentsLoading:', studentsLoading);
  console.log('🔍 Debug - participantesSearch:', participantesSearch);
  
  const filteredStudents = students.filter(student => {
    const searchTerm = participantesSearch?.toLowerCase() || '';
    const nombre = student.nombre?.toLowerCase() || '';
    const apellido = student.apellido?.toLowerCase() || '';
    const dni = student.dni || '';
    
    return nombre.includes(searchTerm) ||
           apellido.includes(searchTerm) ||
           dni.includes(participantesSearch || '');
  });
  
  console.log('🔍 Debug - filteredStudents:', filteredStudents);

  const handleSelectParticipante = (studentId: string) => {
    if (selectedParticipantes.includes(studentId)) {
      // Si ya está seleccionado, lo deseleccionamos
      setSelectedParticipantes(prev => prev.filter(id => id !== studentId));
    } else {
      // Si no está seleccionado, lo agregamos
      setSelectedParticipantes(prev => [...prev, studentId]);
    }
    setParticipantesSearch('');
    setShowParticipantesDropdown(false);
  };

  const toggleAllStudents = () => {
    if (students.length > 0 && students.every(student => selectedParticipantes.includes(student._id))) {
      // Si todos están seleccionados, deseleccionar todos
      setSelectedParticipantes([]);
    } else {
      // Si no todos están seleccionados, seleccionar todos
      setSelectedParticipantes(students.map(student => student._id));
    }
  };

  const handleRemoveParticipante = (studentId: string) => {
    setSelectedParticipantes(prev => prev.filter(id => id !== studentId));
  };

  const getSelectedParticipantesNames = () => {
    return selectedParticipantes
      .map(id => {
        const student = students.find(s => s._id === id);
        return student ? `${student.nombre} ${student.apellido}` : '';
      })
      .filter(name => name)
      .join(', ');
  };

  const validateForm = () => {
    // Validar título
    if (!formData.titulo.trim()) {
      showError(
        'Campo obligatorio',
        'No completaste el título de la actividad. Por favor, ingresa un título antes de continuar.'
      );
      return false;
    }
    
    // Validar participantes
    if (selectedParticipantes.length === 0) {
      showError(
        'Campo obligatorio',
        'No seleccionaste ningún participante. Por favor, selecciona al menos un estudiante antes de continuar.'
      );
      return false;
    }
    
    // Validar descripción
    if (!formData.descripcion.trim()) {
      showError(
        'Campo obligatorio',
        'No completaste la descripción de la actividad. Por favor, ingresa una descripción antes de continuar.'
      );
      return false;
    }
    
    // La imagen/video ya no es obligatoria - se puede crear actividad sin media
    return true;
  };

  const uploadImages = async () => {
    const uploadedImages = [];

    console.log('🖼️ [ACTIVIDAD] ===== INICIANDO UPLOAD DE IMÁGENES =====');
    console.log('📸 [ACTIVIDAD] Número de imágenes a subir:', selectedImages.length);
    console.log('🔍 [ACTIVIDAD] selectedImages:', selectedImages);

    try {
      // TEST DIRECTO: Verificar si el procesamiento funciona
      console.log('🧪 [ACTIVIDAD] ===== TEST DIRECTO DE PROCESAMIENTO =====');
      
      if (selectedImages.length > 0) {
        console.log('🧪 [ACTIVIDAD] Probando procesamiento con primera imagen...');
        try {
          const testResult = await simpleProcessMultipleImages([selectedImages[0].uri], 800, 85);
          console.log('✅ [ACTIVIDAD] TEST EXITOSO:', testResult);
          console.log('📦 [ACTIVIDAD] Tamaño procesado:', testResult[0].size, 'bytes');
        } catch (testError) {
          console.error('❌ [ACTIVIDAD] TEST FALLÓ:', testError);
        }
      }
      
      // Procesar todas las imágenes antes de subirlas
      console.log('🖼️ [ACTIVIDAD] Procesando imágenes...');
      console.log('📸 [ACTIVIDAD] Imágenes seleccionadas:', selectedImages.map(img => ({ uri: img.uri, fileSize: img.fileSize })));
      
      const imageUris = selectedImages.map(img => img.uri);
      console.log('🔗 [ACTIVIDAD] URIs a procesar:', imageUris);
      
      console.log('🔄 [ACTIVIDAD] ===== PROCESAMIENTO PRINCIPAL =====');
      let processedImages;
      
      // USAR SOLO EL PROCESADOR SIMPLIFICADO POR AHORA
      console.log('🔄 [ACTIVIDAD] Usando simpleProcessMultipleImages directamente...');
      processedImages = await simpleProcessMultipleImages(imageUris, 800, 85);
      console.log('✅ [ACTIVIDAD] Procesamiento con simpleProcessMultipleImages exitoso');
      
      console.log('✅ [ACTIVIDAD] Imágenes procesadas:', processedImages.length);
      console.log('🔍 [ACTIVIDAD] Verificando resultados del procesamiento...');
      
      // Verificar que las imágenes procesadas tienen las propiedades esperadas
      processedImages.forEach((img, index) => {
        console.log(`🔍 [ACTIVIDAD] Imagen ${index + 1} procesada:`, {
          uri: img.uri,
          width: img.width,
          height: img.height,
          size: img.size
        });
      });
      console.log('📊 [ACTIVIDAD] Reducción de tamaño:');
      processedImages.forEach((img, index) => {
        const originalSize = selectedImages[index].fileSize || 0;
        const processedSize = img.size;
        const reduction = originalSize > 0 ? ((1 - processedSize / originalSize) * 100).toFixed(1) : 'N/A';
        console.log(`📦 [ACTIVIDAD] Imagen ${index + 1}: ${originalSize} → ${processedSize} bytes (${reduction}% reducción)`);
        console.log(`🔗 [ACTIVIDAD] URI procesada ${index + 1}:`, img.uri);
      });

      // Preparar las imágenes para subir
      console.log('📦 [ACTIVIDAD] ===== PREPARANDO IMÁGENES PROCESADAS =====');
      console.log('📦 [ACTIVIDAD] Usando imágenes procesadas:', processedImages.length);
      const formDataArray = prepareProcessedImagesForUpload(processedImages);
      console.log('📦 [ACTIVIDAD] FormDataArray preparado:', formDataArray.length, 'elementos');

      // Subir cada imagen procesada
      for (let i = 0; i < formDataArray.length; i++) {
        try {
          console.log(`📤 [ACTIVIDAD] Subiendo imagen ${i + 1}/${formDataArray.length}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

          const response = await fetch(`${API_FULL_URL}/upload/s3/image`, {
            method: 'POST',
            body: formDataArray[i],
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log('📡 [ACTIVIDAD] Respuesta del servidor:', response.status, response.statusText);

          if (response.ok) {
            const result = await response.json();
            console.log('✅ [ACTIVIDAD] Imagen subida exitosamente:', result);
            uploadedImages.push(result.imageKey);
          } else {
            const errorText = await response.text();
            console.error('❌ [ACTIVIDAD] Error del servidor:', errorText);
            throw new Error(`Error al subir imagen: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error('❌ [ACTIVIDAD] Error uploading image:', error);
          throw new Error(`Error al subir imagen: ${error.message}`);
        }
      }

      console.log('✅ [ACTIVIDAD] Todas las imágenes subidas exitosamente');
      return uploadedImages;
    } catch (error) {
      console.error('❌ [ACTIVIDAD] Error procesando imágenes:', error);
      console.error('❌ [ACTIVIDAD] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Si hay error en el procesamiento, intentar subir las imágenes originales como fallback
      console.log('⚠️ [ACTIVIDAD] Fallback: subiendo imágenes originales sin procesar');
      return await uploadOriginalImages();
    }
  };

  // Función para preparar imágenes procesadas para subir
  const prepareProcessedImagesForUpload = (processedImages: any[]) => {
    const formDataArray = [];
    
    console.log('🔍 [ACTIVIDAD] ===== PREPARANDO FORM DATA =====');
    console.log('🔍 [ACTIVIDAD] Imágenes procesadas recibidas:', processedImages);
    
    for (let i = 0; i < processedImages.length; i++) {
      const image = processedImages[i];
      const formData = new FormData();
      
      console.log(`🔍 [ACTIVIDAD] Procesando imagen ${i + 1}:`, {
        uri: image.uri,
        width: image.width,
        height: image.height,
        size: image.size
      });
      
      // Obtener el nombre del archivo de la URI
      const fileName = image.uri.split('/').pop() || `activity-image-${i}.jpg`;
      
      // Agregar la imagen al FormData
      const imageFile = {
        uri: image.uri,
        type: 'image/jpeg',
        name: fileName,
      } as any;
      
      console.log(`🔍 [ACTIVIDAD] Archivo a subir ${i + 1}:`, {
        uri: imageFile.uri,
        type: imageFile.type,
        name: imageFile.name
      });
      
      formData.append('image', imageFile);
      formDataArray.push(formData);
      
      console.log(`📦 [ACTIVIDAD] Preparada imagen ${i + 1}:`, fileName);
    }
    
    console.log('📦 [ACTIVIDAD] Preparadas', formDataArray.length, 'imágenes para subir');
    return formDataArray;
  };

  // Función fallback para subir imágenes originales sin procesar
  const uploadOriginalImages = async () => {
    const uploadedImages = [];
    console.log('⚠️ [ACTIVIDAD] Subiendo imágenes originales sin procesar...');

    for (const image of selectedImages) {
      try {
        console.log('📤 [ACTIVIDAD] Subiendo imagen original:', image.uri);

        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || 'image.jpg'
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${API_FULL_URL}/upload/s3/image`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          console.log('✅ [ACTIVIDAD] Imagen original subida:', result);
          uploadedImages.push(result.imageKey);
        } else {
          const errorText = await response.text();
          console.error('❌ [ACTIVIDAD] Error subiendo imagen original:', errorText);
          throw new Error(`Error al subir imagen: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('❌ [ACTIVIDAD] Error uploading original image:', error);
        throw new Error(`Error al subir imagen: ${error.message}`);
      }
    }

    return uploadedImages;
  };

  const uploadMedia = async () => {
    const uploadedMedia = [];

    console.log('📱 [ACTIVIDAD] ===== INICIANDO UPLOAD DE MEDIA =====');
    console.log('📸 [ACTIVIDAD] Número de archivos a subir:', selectedImages.length);
    console.log('🔍 [ACTIVIDAD] selectedImages:', selectedImages);

    // Verificar y refrescar token si es necesario antes de subir
    if (Platform.OS === 'android' && token) {
      try {
        const RefreshTokenService = require('../src/services/refreshTokenService').default;
        // Verificar si el token está próximo a expirar
        const currentToken = await RefreshTokenService.getAccessToken();
        if (currentToken) {
          console.log('🔑 [ACTIVIDAD] Token disponible, verificando validez...');
        } else {
          console.warn('⚠️ [ACTIVIDAD] No se pudo obtener token del storage');
        }
      } catch (tokenError) {
        console.error('❌ [ACTIVIDAD] Error verificando token:', tokenError);
      }
    }

    try {
      // Separar imágenes y videos
      const images = selectedImages.filter(media => !media.type?.startsWith('video/'));
      const videos = selectedImages.filter(media => media.type?.startsWith('video/'));
      
      console.log('🖼️ [ACTIVIDAD] Imágenes encontradas:', images.length);
      console.log('📹 [ACTIVIDAD] Videos encontrados:', videos.length);

      // Procesar y subir imágenes
      if (images.length > 0) {
        console.log('🖼️ [ACTIVIDAD] ===== PROCESANDO IMÁGENES =====');
        
        const imageUris = images.map(img => img.uri);
        console.log('🔗 [ACTIVIDAD] URIs a procesar:', imageUris);
        
        let processedImages: any[] = [];
        let useOriginalImages = false;
        
        try {
          processedImages = await simpleProcessMultipleImages(imageUris, 800, 85);
          console.log('✅ [ACTIVIDAD] Imágenes procesadas:', processedImages.length);
          console.log('🔍 [ACTIVIDAD] Detalles de imágenes procesadas:', processedImages.map(img => ({
            uri: img.uri.substring(0, 50) + '...',
            width: img.width,
            height: img.height,
            size: img.size
          })));
          
          if (processedImages.length === 0) {
            console.warn('⚠️ [ACTIVIDAD] No se procesaron imágenes, usando imágenes originales');
            useOriginalImages = true;
          }
        } catch (processError: any) {
          console.error('❌ [ACTIVIDAD] Error procesando imágenes:', processError);
          console.warn('⚠️ [ACTIVIDAD] Fallback: usando imágenes originales sin procesar');
          useOriginalImages = true;
        }
        
        // Si falló el procesamiento, usar imágenes originales
        if (useOriginalImages) {
          console.log('📤 [ACTIVIDAD] Subiendo imágenes originales sin procesar');
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            try {
              console.log(`📤 [ACTIVIDAD] Subiendo imagen original ${i + 1}/${images.length}`);
              console.log(`🔗 [ACTIVIDAD] URI de imagen original:`, image.uri);
              console.log(`📱 [ACTIVIDAD] Tipo de imagen:`, image.type);
              console.log(`📄 [ACTIVIDAD] Nombre de archivo:`, image.fileName);
              
              const formData = new FormData();
              
              // Usar URI directamente - en Android puede fallar con archivos temporales
              let imageUri = image.uri;
              if (Platform.OS === 'android') {
                if (imageUri.includes('rn_image_picker_lib_temp')) {
                  console.warn('⚠️ [ACTIVIDAD] ADVERTENCIA: URI es archivo temporal en Android');
                  console.warn('⚠️ [ACTIVIDAD] Esto puede causar "Network Error" si el archivo ya no es accesible');
                }
                if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
                  imageUri = `file://${imageUri}`;
                }
              }
              
              const imageFile = {
                uri: imageUri,
                type: image.type || 'image/jpeg',
                name: image.fileName || `activity-image-${i}.jpg`,
              } as any;
              
              console.log(`📦 [ACTIVIDAD] Preparando FormData:`, {
                uri: imageFile.uri.substring(0, 80) + '...',
                type: imageFile.type,
                name: imageFile.name,
                hasBase64: !!image.base64
              });
              
              formData.append('image', imageFile);
              
              console.log(`📤 [ACTIVIDAD] Enviando request a /upload/s3/image...`);
              
              // En Android, usar fetch directamente (más confiable para archivos)
              // En iOS, usar apiClient (funciona bien)
              let responseData: any;
              
              if (Platform.OS === 'android') {
                console.log('📱 [ACTIVIDAD] Android - usando fetch directamente');
                
                // Función auxiliar para obtener el token actual
                const getAuthToken = async (): Promise<string> => {
                  const RefreshTokenService = require('../src/services/refreshTokenService').default;
                  let authToken = token;
                  
                  if (!authToken) {
                    authToken = await RefreshTokenService.getAccessToken();
                  }
                  
                  if (!authToken) {
                    throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
                  }
                  
                  // Verificar si el token está próximo a expirar (5 minutos antes)
                  const isExpiringSoon = await RefreshTokenService.isTokenExpiringSoon();
                  if (isExpiringSoon) {
                    console.log('⚠️ [ACTIVIDAD] Token próximo a expirar, refrescando preventivamente...');
                    try {
                      authToken = await RefreshTokenService.refreshAccessToken();
                      console.log('✅ [ACTIVIDAD] Token refrescado preventivamente');
                    } catch (refreshError: any) {
                      console.warn('⚠️ [ACTIVIDAD] No se pudo refrescar preventivamente, usando token actual:', refreshError?.message);
                    }
                  }
                  
                  return authToken;
                };
                
                // Función auxiliar para hacer la petición con retry en caso de 401
                // IMPORTANTE: formData no es reutilizable después de la primera petición
                const uploadWithRetry = async (retryCount = 0): Promise<Response> => {
                  const authToken = await getAuthToken();
                  
                  console.log(`📤 [ACTIVIDAD] Intentando subir imagen (intento ${retryCount + 1})`);
                  
                  // Si es un retry, recrear el FormData desde la imagen original
                  let formDataToUse = formData;
                  if (retryCount > 0) {
                    console.log('🔄 [ACTIVIDAD] Recreando FormData para retry...');
                    const newFormData = new FormData();
                    let imageUri = image.uri;
                    if (Platform.OS === 'android') {
                      if (!imageUri.startsWith('file://') && !imageUri.startsWith('content://')) {
                        imageUri = `file://${imageUri}`;
                      }
                    }
                    const imageFile = {
                      uri: imageUri,
                      type: image.type || 'image/jpeg',
                      name: image.fileName || `activity-image-${i}.jpg`,
                    } as any;
                    newFormData.append('image', imageFile);
                    formDataToUse = newFormData;
                  }
                  
                  const fetchResponse = await fetch(`${API_FULL_URL}/upload/s3/image`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${authToken}`,
                      // NO incluir Content-Type - fetch lo establecerá automáticamente con multipart/form-data y boundary
                    },
                    body: formDataToUse,
                  });
                  
                  // Si recibimos 401 y no hemos reintentado, intentar refresh del token
                  if (fetchResponse.status === 401 && retryCount === 0) {
                    console.log('🔄 [ACTIVIDAD] Token expirado (401), intentando refresh...');
                    const RefreshTokenService = require('../src/services/refreshTokenService').default;
                    
                    try {
                      const refreshToken = await RefreshTokenService.getRefreshToken();
                      if (!refreshToken) {
                        throw new Error('No hay refresh token disponible. Por favor, inicia sesión nuevamente.');
                      }
                      
                      const newToken = await RefreshTokenService.refreshAccessToken();
                      if (newToken) {
                        console.log('✅ [ACTIVIDAD] Token renovado exitosamente');
                        
                        // Actualizar el token en AsyncStorage y apiClient
                        const { setAuthToken } = require('../src/services/api');
                        setAuthToken(newToken);
                        const AsyncStorage = require('../src/utils/storage').default;
                        await AsyncStorage.setItem('auth_token', newToken);
                        
                        // Reintentar con el nuevo token (el FormData se recreará en el retry)
                        return uploadWithRetry(1);
                      } else {
                        throw new Error('No se pudo obtener un nuevo token después del refresh');
                      }
                    } catch (refreshError: any) {
                      console.error('❌ [ACTIVIDAD] Error al refrescar token:', refreshError);
                      const errorText = await fetchResponse.text();
                      throw new Error(`Error al renovar la sesión: ${refreshError?.message || 'Error desconocido'}. Por favor, inicia sesión nuevamente.`);
                    }
                  }
                  
                  return fetchResponse;
                };
                
                const fetchResponse = await uploadWithRetry(0);
                
                if (!fetchResponse.ok) {
                  const errorText = await fetchResponse.text();
                  console.error(`❌ [ACTIVIDAD] Error del servidor (${fetchResponse.status}):`, errorText);
                  throw new Error(`Error al subir la imagen: ${fetchResponse.status} ${fetchResponse.statusText}`);
                }
                
                const rawResponseText = await fetchResponse.text();
                try {
                  responseData = JSON.parse(rawResponseText);
                  console.log('✅ [ACTIVIDAD] Imagen subida con fetch:', responseData);
                } catch (jsonError: any) {
                  console.error('❌ [ACTIVIDAD] Error al parsear JSON:', jsonError);
                  console.error('❌ [ACTIVIDAD] Respuesta raw:', rawResponseText);
                  throw new Error(`Error al procesar la respuesta del servidor: ${jsonError.message}`);
                }
              } else {
                // iOS - usar apiClient
                const response = await apiClient.post('/upload/s3/image', formData, {
                  timeout: 120000,
                });
                responseData = response.data;
                console.log('✅ [ACTIVIDAD] Imagen subida con apiClient:', responseData);
              }
              
              if (responseData.imageKey) {
                uploadedMedia.push(responseData.imageKey);
                console.log('✅ [ACTIVIDAD] ImageKey agregado. Total:', uploadedMedia.length);
              } else {
                console.error('❌ [ACTIVIDAD] ERROR: response.data.imageKey no existe');
                throw new Error('El servidor no retornó imageKey en la respuesta');
              }
            } catch (error: any) {
              console.error('❌ [ACTIVIDAD] Error subiendo imagen original:', error);
              console.error('❌ [ACTIVIDAD] Error details:', {
                message: error?.message,
                code: error?.code,
                response: error?.response?.data,
                status: error?.response?.status,
                uri: image.uri.substring(0, 100) + '...'
              });
              
              // Si es un Network Error, puede ser que el archivo temporal no sea accesible
              if (error?.message?.includes('Network Error') || error?.code === 'NETWORK_ERROR') {
                console.error('❌ [ACTIVIDAD] Network Error - El archivo temporal puede no ser accesible');
                console.error('❌ [ACTIVIDAD] URI problemática:', image.uri);
                throw new Error('No se pudo acceder al archivo de imagen. Esto puede ocurrir en Android con archivos temporales. Por favor, selecciona la imagen nuevamente justo antes de enviar la actividad.');
              }
              
              throw new Error(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
            }
          }
        } else {
          // Usar imágenes procesadas
          const formDataArray = prepareImagesForUpload(processedImages);
          console.log('📦 [ACTIVIDAD] FormData array preparado:', formDataArray.length, 'elementos');

          for (let i = 0; i < formDataArray.length; i++) {
            try {
            console.log(`📤 [ACTIVIDAD] Subiendo imagen ${i + 1}/${formDataArray.length}`);

            // En Android, usar fetch directamente (más confiable para archivos)
            // En iOS, usar apiClient
            let responseData: any;
            
            if (Platform.OS === 'android') {
              console.log('📱 [ACTIVIDAD] Android - usando fetch directamente para imagen procesada');
              
              // Función auxiliar para obtener el token actual
              const getAuthToken = async (): Promise<string> => {
                const RefreshTokenService = require('../src/services/refreshTokenService').default;
                let authToken = token;
                
                if (!authToken) {
                  authToken = await RefreshTokenService.getAccessToken();
                }
                
                if (!authToken) {
                  throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
                }
                
                // Verificar si el token está próximo a expirar (5 minutos antes)
                const isExpiringSoon = await RefreshTokenService.isTokenExpiringSoon();
                if (isExpiringSoon) {
                  console.log('⚠️ [ACTIVIDAD] Token próximo a expirar, refrescando preventivamente...');
                  try {
                    authToken = await RefreshTokenService.refreshAccessToken();
                    console.log('✅ [ACTIVIDAD] Token refrescado preventivamente');
                  } catch (refreshError: any) {
                    console.warn('⚠️ [ACTIVIDAD] No se pudo refrescar preventivamente, usando token actual:', refreshError?.message);
                  }
                }
                
                return authToken;
              };
              
              // Función auxiliar para hacer la petición con retry en caso de 401
              // IMPORTANTE: formData no es reutilizable después de la primera petición
              const uploadWithRetry = async (retryCount = 0): Promise<Response> => {
                const authToken = await getAuthToken();
                
                console.log(`📤 [ACTIVIDAD] Intentando subir imagen procesada (intento ${retryCount + 1})`);
                
                // Si es un retry, recrear el FormData desde la imagen procesada original
                let formDataToUse = formDataArray[i];
                if (retryCount > 0) {
                  console.log('🔄 [ACTIVIDAD] Recreando FormData para retry de imagen procesada...');
                  const processedImage = processedImages[i];
                  const newFormData = new FormData();
                  const imageFile = {
                    uri: processedImage.uri,
                    type: 'image/jpeg',
                    name: processedImage.uri.split('/').pop() || `activity-image-${i}.jpg`,
                  } as any;
                  newFormData.append('image', imageFile);
                  formDataToUse = newFormData;
                }
                
                const fetchResponse = await fetch(`${API_FULL_URL}/upload/s3/image`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${authToken}`,
                    // NO incluir Content-Type - fetch lo establecerá automáticamente con multipart/form-data y boundary
                  },
                  body: formDataToUse,
                });
                
                // Si recibimos 401 y no hemos reintentado, intentar refresh del token
                if (fetchResponse.status === 401 && retryCount === 0) {
                  console.log('🔄 [ACTIVIDAD] Token expirado (401), intentando refresh...');
                  const RefreshTokenService = require('../src/services/refreshTokenService').default;
                  
                  try {
                    const refreshToken = await RefreshTokenService.getRefreshToken();
                    if (!refreshToken) {
                      throw new Error('No hay refresh token disponible. Por favor, inicia sesión nuevamente.');
                    }
                    
                    const newToken = await RefreshTokenService.refreshAccessToken();
                    if (newToken) {
                      console.log('✅ [ACTIVIDAD] Token renovado exitosamente');
                      
                      // Actualizar el token en AsyncStorage y apiClient
                      const { setAuthToken } = require('../src/services/api');
                      setAuthToken(newToken);
                      const AsyncStorage = require('../src/utils/storage').default;
                      await AsyncStorage.setItem('auth_token', newToken);
                      
                      // Reintentar con el nuevo token (el FormData se recreará en el retry)
                      return uploadWithRetry(1);
                    } else {
                      throw new Error('No se pudo obtener un nuevo token después del refresh');
                    }
                  } catch (refreshError: any) {
                    console.error('❌ [ACTIVIDAD] Error al refrescar token:', refreshError);
                    const errorText = await fetchResponse.text();
                    throw new Error(`Error al renovar la sesión: ${refreshError?.message || 'Error desconocido'}. Por favor, inicia sesión nuevamente.`);
                  }
                }
                
                return fetchResponse;
              };
              
              const fetchResponse = await uploadWithRetry(0);
              
              if (!fetchResponse.ok) {
                const errorText = await fetchResponse.text();
                console.error(`❌ [ACTIVIDAD] Error del servidor (${fetchResponse.status}):`, errorText);
                throw new Error(`Error al subir la imagen procesada: ${fetchResponse.status} ${fetchResponse.statusText}`);
              }
              
              const rawResponseText = await fetchResponse.text();
              try {
                responseData = JSON.parse(rawResponseText);
                console.log('✅ [ACTIVIDAD] Imagen procesada subida con fetch:', responseData);
              } catch (jsonError: any) {
                console.error('❌ [ACTIVIDAD] Error al parsear JSON:', jsonError);
                console.error('❌ [ACTIVIDAD] Respuesta raw:', rawResponseText);
                throw new Error(`Error al procesar la respuesta del servidor: ${jsonError.message}`);
              }
            } else {
              // iOS - usar apiClient
              const response = await apiClient.post('/upload/s3/image', formDataArray[i], {
                timeout: 120000,
              });
              responseData = response.data;
              console.log('✅ [ACTIVIDAD] Imagen procesada subida con apiClient:', responseData);
            }
            
            console.log('🔑 [ACTIVIDAD] ImageKey recibido:', responseData.imageKey);
            
            // Verificar que imageKey existe
            if (responseData.imageKey) {
              uploadedMedia.push(responseData.imageKey);
              console.log('✅ [ACTIVIDAD] ImageKey agregado a uploadedMedia. Total:', uploadedMedia.length);
            } else {
              console.error('❌ [ACTIVIDAD] ERROR: response.data.imageKey no existe');
              console.error('❌ [ACTIVIDAD] Response completa:', JSON.stringify(responseData, null, 2));
              throw new Error('El servidor no retornó imageKey en la respuesta');
            }
          } catch (error: any) {
            console.error('❌ [ACTIVIDAD] Error uploading image:', error);
            
            // Detectar si es un error de timeout
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
              throw new Error('La imagen es demasiado grande o la conexión es lenta. Por favor, intenta con una imagen más pequeña o verifica tu conexión a internet.');
            }
            
            // Detectar si es un error de red
            if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
              throw new Error('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
            }
            
            throw new Error(`Error al subir imagen: ${error.message || 'Error desconocido'}`);
            }
          }
        }
      }

      // Procesar y subir videos
      if (videos.length > 0) {
        console.log('📹 [ACTIVIDAD] ===== PROCESANDO VIDEOS =====');
        
        // Filtrar videos válidos por duración y tamaño (30 segundos, 50MB)
        const validVideos = filterValidVideos(videos, 30, 50);
        console.log('📹 [ACTIVIDAD] Videos válidos:', validVideos.length, 'de', videos.length);
        
        if (validVideos.length !== videos.length) {
          const rejectedCount = videos.length - validVideos.length;
          const rejectedVideos = videos.filter(v => !validVideos.includes(v));
          const reasons = rejectedVideos.map(v => {
            const durationSeconds = v.duration ? v.duration / 1000 : 0;
            const fileSizeMB = (v.fileSize || 0) / (1024 * 1024);
            const issues = [];
            if (durationSeconds > 30) {
              issues.push(`duración (${Math.round(durationSeconds)}s, máximo 30s)`);
            }
            if (fileSizeMB > 50) {
              issues.push(`tamaño (${fileSizeMB.toFixed(2)}MB, máximo 50MB)`);
            }
            return `• ${v.fileName || 'Video'}: ${issues.join(', ')}`;
          }).join('\n');
          
          showError(
            `${rejectedCount} video${rejectedCount > 1 ? 's' : ''} rechazado${rejectedCount > 1 ? 's' : ''}`,
            `Los siguientes videos no se pudieron subir:\n\n${reasons}\n\nRequisitos:\n- Duración máxima: 30 segundos\n- Tamaño máximo: 50MB\n\nPor favor, selecciona videos que cumplan con estos requisitos.`
          );
        }

        const formDataArray = prepareVideosForUpload(validVideos);

        for (let i = 0; i < formDataArray.length; i++) {
          const startTime = Date.now();
          try {
            const video = validVideos[i];
            
            // Validar que el video tenga las propiedades necesarias
            if (!video || !video.uri) {
              console.error(`❌ [ACTIVIDAD] Video ${i + 1} no tiene URI válida`);
              throw new Error(`El video ${i + 1} no es válido. Por favor, selecciónalo nuevamente.`);
            }
            
            const videoSizeMB = video.fileSize ? (video.fileSize / (1024 * 1024)).toFixed(2) : 'desconocido';
            const videoDuration = video.duration ? (video.duration / 1000).toFixed(1) : 'desconocido';
            
            console.log(`📤 [ACTIVIDAD] Subiendo video ${i + 1}/${formDataArray.length}`);
            console.log(`📊 [ACTIVIDAD] Video info: ${videoSizeMB}MB, ${videoDuration}s`);
            console.log(`📊 [ACTIVIDAD] Video URI: ${video.uri.substring(0, 50)}...`);
            console.log(`📊 [ACTIVIDAD] Video type: ${video.type || 'desconocido'}`);
            console.log(`⏱️ [ACTIVIDAD] Timeout configurado: 300000ms (5 minutos)`);

            // Validar que el FormData tenga el campo 'video'
            const formData = formDataArray[i];
            if (!formData) {
              console.error(`❌ [ACTIVIDAD] FormData ${i + 1} no está definido`);
              throw new Error(`Error al preparar el video ${i + 1} para subir. Por favor, intenta nuevamente.`);
            }

            // Verificar que formData sea una instancia de FormData
            if (!(formData instanceof FormData) && !formData.append) {
              console.error(`❌ [ACTIVIDAD] FormData ${i + 1} no es una instancia válida de FormData`);
              throw new Error(`Error al preparar el video ${i + 1} para subir. Por favor, intenta nuevamente.`);
            }

            console.log(`📤 [ACTIVIDAD] FormData preparado, enviando a /upload/s3/video`);
            console.log(`📤 [ACTIVIDAD] FormData es instancia de FormData: ${formData instanceof FormData}`);

            // Usar fetch directamente en lugar de axios para videos
            // React Native maneja mejor FormData con fetch, evitando el error "multipart != application/x-www-form-urlencoded"
            const uploadUrl = `${API_FULL_URL}/upload/s3/video`;
            
            console.log(`📤 [ACTIVIDAD] URL de upload: ${uploadUrl}`);
            console.log(`📤 [ACTIVIDAD] Token disponible: ${token ? 'Sí' : 'No'}`);
            
            // Función auxiliar para obtener el token actual
            const getAuthToken = async (): Promise<string> => {
              const RefreshTokenService = require('../src/services/refreshTokenService').default;
              let authToken = token;
              
              console.log(`🔑 [ACTIVIDAD] Obteniendo token - token del contexto: ${authToken ? 'Sí' : 'No'}`);
              
              if (!authToken) {
                console.log('🔑 [ACTIVIDAD] Token del contexto no disponible, obteniendo de AsyncStorage...');
                authToken = await RefreshTokenService.getAccessToken();
              }
              
              if (!authToken) {
                console.error('❌ [ACTIVIDAD] No hay token disponible ni en contexto ni en AsyncStorage');
                throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
              }
              
              // Verificar si el token está próximo a expirar (5 minutos antes)
              const isExpiringSoon = await RefreshTokenService.isTokenExpiringSoon();
              if (isExpiringSoon) {
                console.log('⚠️ [ACTIVIDAD] Token próximo a expirar, refrescando preventivamente...');
                try {
                  authToken = await RefreshTokenService.refreshAccessToken();
                  console.log('✅ [ACTIVIDAD] Token refrescado preventivamente');
                } catch (refreshError: any) {
                  console.warn('⚠️ [ACTIVIDAD] No se pudo refrescar preventivamente, usando token actual:', refreshError?.message);
                  // Continuar con el token actual si el refresh preventivo falla
                }
              }
              
              console.log(`✅ [ACTIVIDAD] Token obtenido (primeros 20 chars): ${authToken.substring(0, 20)}...`);
              return authToken;
            };
            
            // Función auxiliar para hacer la petición con retry en caso de 401
            // IMPORTANTE: formData no es reutilizable después de la primera petición
            // Necesitamos recrearlo desde el video original si hacemos retry
            const uploadWithRetry = async (retryCount = 0): Promise<Response> => {
              const authToken = await getAuthToken();
              
              console.log(`📤 [ACTIVIDAD] Intentando subir video (intento ${retryCount + 1})`);
              console.log(`📤 [ACTIVIDAD] Token (primeros 20 chars): ${authToken.substring(0, 20)}...`);
              
              // Si es un retry, recrear el FormData desde el video original
              let formDataToUse = formData;
              if (retryCount > 0) {
                console.log('🔄 [ACTIVIDAD] Recreando FormData para retry...');
                const { prepareVideoForUpload } = require('../src/services/activityVideoService');
                formDataToUse = prepareVideoForUpload(video);
              }
              
              const fetchResponse = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  // NO incluir Content-Type aquí - React Native lo establecerá automáticamente con multipart/form-data y boundary
                },
                body: formDataToUse,
              });
              
              // Si recibimos 401 y no hemos reintentado, intentar refresh del token
              if (fetchResponse.status === 401 && retryCount === 0) {
                console.log('🔄 [ACTIVIDAD] Token expirado (401), intentando refresh...');
                const RefreshTokenService = require('../src/services/refreshTokenService').default;
                
                try {
                  // Verificar si hay refresh token disponible antes de intentar refresh
                  const refreshToken = await RefreshTokenService.getRefreshToken();
                  if (!refreshToken) {
                    console.error('❌ [ACTIVIDAD] No hay refresh token disponible');
                    throw new Error('No hay refresh token disponible. Por favor, inicia sesión nuevamente.');
                  }
                  
                  console.log('🔄 [ACTIVIDAD] Refresh token encontrado, intentando renovar access token...');
                  const newToken = await RefreshTokenService.refreshAccessToken();
                  
                  if (newToken) {
                    console.log('✅ [ACTIVIDAD] Token renovado exitosamente');
                    console.log('✅ [ACTIVIDAD] Nuevo token (primeros 20 chars):', newToken.substring(0, 20) + '...');
                    
                    // Actualizar el token en AsyncStorage (el contexto lo leerá en el próximo render)
                    // También actualizar el token en apiClient para futuras peticiones
                    const { setAuthToken } = require('../src/services/api');
                    setAuthToken(newToken);
                    
                    // Guardar el token en AsyncStorage con la misma key que usa el contexto
                    const AsyncStorage = require('../src/utils/storage').default;
                    await AsyncStorage.setItem('auth_token', newToken);
                    
                    console.log('✅ [ACTIVIDAD] Token actualizado en AsyncStorage y apiClient');
                    
                    // Reintentar con el nuevo token (el FormData se recreará en el retry)
                    return uploadWithRetry(1);
                  } else {
                    throw new Error('No se pudo obtener un nuevo token después del refresh');
                  }
                } catch (refreshError: any) {
                  console.error('❌ [ACTIVIDAD] Error completo al refrescar token:');
                  console.error('❌ [ACTIVIDAD] Error message:', refreshError?.message);
                  console.error('❌ [ACTIVIDAD] Error name:', refreshError?.name);
                  console.error('❌ [ACTIVIDAD] Error stack:', refreshError?.stack);
                  
                  // Si el error es específico sobre el refresh token, mostrar mensaje más claro
                  if (refreshError?.message?.includes('refresh token') || 
                      refreshError?.message?.includes('No hay refresh token')) {
                    throw new Error('Tu sesión ha expirado completamente. Por favor, inicia sesión nuevamente.');
                  }
                  
                  throw new Error(`Error al renovar la sesión: ${refreshError?.message || 'Error desconocido'}. Por favor, inicia sesión nuevamente.`);
                }
              }
              
              return fetchResponse;
            };
            
            // Hacer la petición con retry automático
            const fetchResponse = await uploadWithRetry();
            const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);
            
            if (!fetchResponse.ok) {
              let errorText = '';
              try {
                errorText = await fetchResponse.text();
              } catch (e) {
                errorText = 'No se pudo leer el mensaje de error';
              }
              console.error(`❌ [ACTIVIDAD] Error del servidor (${fetchResponse.status}):`, errorText);
              
              if (fetchResponse.status === 401) {
                throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
              }
              
              throw new Error(`Error al subir el video: ${fetchResponse.status} ${fetchResponse.statusText}`);
            }
            
            // Parsear la respuesta JSON de forma segura
            let responseData: any;
            try {
              const responseText = await fetchResponse.text();
              console.log(`📦 [ACTIVIDAD] Respuesta raw (primeros 200 chars):`, responseText.substring(0, 200));
              
              if (!responseText || responseText.trim() === '') {
                throw new Error('La respuesta del servidor está vacía');
              }
              
              responseData = JSON.parse(responseText);
            } catch (parseError: any) {
              console.error('❌ [ACTIVIDAD] Error parseando respuesta JSON:', parseError);
              console.error('❌ [ACTIVIDAD] Error message:', parseError?.message);
              throw new Error(`Error al procesar la respuesta del servidor: ${parseError?.message || 'Respuesta inválida'}`);
            }
            
            console.log(`✅ [ACTIVIDAD] Video subido exitosamente en ${uploadTime}s`);
            console.log(`📦 [ACTIVIDAD] Respuesta completa:`, JSON.stringify(responseData, null, 2));
            
            // Validar que la respuesta sea exitosa
            if (!responseData || typeof responseData !== 'object') {
              console.error('❌ [ACTIVIDAD] Respuesta inválida del servidor');
              console.error('❌ [ACTIVIDAD] responseData:', responseData);
              throw new Error('El servidor no devolvió una respuesta válida. Por favor, intenta nuevamente.');
            }
            
            // El servidor puede devolver videoKey en diferentes lugares
            // Intentar obtenerlo de la respuesta de forma robusta
            let videoKey: string | undefined;
            
            try {
              videoKey = responseData?.videoKey || 
                        responseData?.data?.videoKey || 
                        (responseData?.data && typeof responseData.data === 'object' && responseData.data.videoKey);
            } catch (accessError: any) {
              console.error('❌ [ACTIVIDAD] Error accediendo a videoKey:', accessError);
              console.error('❌ [ACTIVIDAD] responseData keys:', responseData ? Object.keys(responseData) : 'null');
            }
            
            if (!videoKey) {
              console.error('❌ [ACTIVIDAD] No se encontró videoKey en la respuesta');
              console.error('❌ [ACTIVIDAD] Estructura de responseData:', responseData);
              console.error('❌ [ACTIVIDAD] Tipo de responseData:', typeof responseData);
              console.error('❌ [ACTIVIDAD] Keys en responseData:', responseData ? Object.keys(responseData) : 'responseData es null/undefined');
              
              // Si responseData.data existe, mostrar sus keys también
              if (responseData?.data && typeof responseData.data === 'object') {
                console.error('❌ [ACTIVIDAD] Keys en responseData.data:', Object.keys(responseData.data));
              }
              
              throw new Error('El servidor no devolvió la clave del video. Por favor, intenta nuevamente.');
            }
            
            console.log(`✅ [ACTIVIDAD] Video key obtenido: ${videoKey}`);
            uploadedMedia.push(videoKey);
          } catch (error: any) {
            const uploadTime = Date.now() - startTime;
            
            // Log detallado del error para debug
            console.error('❌ [ACTIVIDAD] Error al subir video:', error);
            console.error('❌ [ACTIVIDAD] Error type:', typeof error);
            console.error('❌ [ACTIVIDAD] Error message:', error?.message);
            console.error('❌ [ACTIVIDAD] Error name:', error?.name);
            console.error('❌ [ACTIVIDAD] Error stack:', error?.stack);
            
            // Detectar si es un error de timeout (fetch no tiene code, pero puede tener message)
            if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT') || error.name === 'AbortError') {
              console.error('⏱️ [ACTIVIDAD] ERROR DE TIMEOUT detectado');
              throw new Error(`El video es demasiado grande o la conexión es lenta (timeout después de ${(uploadTime / 1000).toFixed(1)}s). Por favor, intenta con un video más pequeño o verifica tu conexión a internet.`);
            }
            
            // Detectar si es un error de red (con fetch, los errores de red son diferentes)
            if (error.message?.includes('Network Error') || 
                error.message?.includes('network') || 
                error.message?.includes('Failed to fetch') ||
                error.message?.includes('Network request failed')) {
              console.error('🌐 [ACTIVIDAD] ERROR DE RED detectado');
              console.error('🌐 [ACTIVIDAD] URI del video:', video?.uri);
              
              // Mensaje más específico para Android
              if (Platform.OS === 'android' && video?.uri) {
                if (video.uri.startsWith('content://')) {
                  throw new Error('Error al acceder al video. Por favor, intenta seleccionar el video nuevamente desde la galería.');
                } else if (video.uri.includes('rn_image_picker_lib_temp')) {
                  throw new Error('El archivo temporal ya no está disponible. Por favor, selecciona el video nuevamente.');
                } else {
                  throw new Error('Error de conexión al subir el video. Por favor, verifica tu conexión a internet e intenta nuevamente.');
                }
              } else {
                throw new Error('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
              }
            }
            
            // Si el error tiene un mensaje específico, usarlo
            if (error.message) {
              // Verificar si el mensaje menciona "video" - podría ser el error que vemos
              if (error.message.includes("Property 'video' doesn't exist") || error.message.includes("video doesn't exist")) {
                console.error('❌ [ACTIVIDAD] Error relacionado con propiedad video - probablemente error de parsing de respuesta');
                throw new Error('Error al procesar la respuesta del servidor. El video puede haberse subido correctamente. Por favor, verifica si la actividad se creó correctamente.');
              }
              throw new Error(`Error al subir video: ${error.message}`);
            }
            
            // Error genérico
            throw new Error(`Error al subir video: ${error?.toString() || 'Error desconocido'}`);
          }
        }
      }

      console.log('✅ [ACTIVIDAD] Todos los archivos subidos exitosamente');
      console.log('📦 [ACTIVIDAD] uploadedMedia final:', uploadedMedia);
      console.log('📊 [ACTIVIDAD] Total de archivos subidos:', uploadedMedia.length);
      
      if (uploadedMedia.length === 0 && selectedImages.length > 0) {
        console.warn('⚠️ [ACTIVIDAD] ADVERTENCIA: No se subió ningún archivo aunque había imágenes seleccionadas');
      }
      
      return uploadedMedia;
    } catch (error) {
      console.error('❌ [ACTIVIDAD] Error procesando media:', error);
      throw error;
    }
  };

  const submitActivity = async () => {
    console.log('Iniciando submitActivity...');

    // Validar formulario y mostrar mensajes específicos
    if (!validateForm()) {
      console.log('Validación del formulario falló');
      return;
    }

    if (!user) {
      showError(
        'Error de autenticación',
        'No hay usuario autenticado. Por favor, inicia sesión nuevamente.'
      );
      return;
    }

    if (!effectiveInstitution?.account._id) {
      showError(
        'Institución no seleccionada',
        'No has seleccionado una institución. Por favor, selecciona una institución antes de continuar.'
      );
      return;
    }

    // Verificar que se tenga una división seleccionada si el usuario tiene división
    if (effectiveInstitution.division && !effectiveInstitution.division._id) {
      showError(
        'División no seleccionada',
        'No has seleccionado una división. Por favor, selecciona una división antes de continuar.'
      );
      return;
    }

    console.log('Usuario:', user._id);
    console.log('Institución:', effectiveInstitution.account._id);
    console.log('División:', effectiveInstitution.division?._id || 'Sin división');
    console.log('Datos del formulario:', formData);

    setIsSubmitting(true);

    try {
      console.log('Iniciando upload de media...');
      console.log('📸 [SUBMIT] Imágenes seleccionadas:', selectedImages.length);
      
      // 1. Subir media (imágenes y videos)
      const uploadedMedia = await uploadMedia();
      console.log('✅ [SUBMIT] Media subida:', uploadedMedia);
      console.log('📊 [SUBMIT] Total de archivos subidos:', uploadedMedia.length);
      
      if (uploadedMedia.length === 0 && selectedImages.length > 0) {
        console.warn('⚠️ [SUBMIT] ADVERTENCIA: No se subió ningún archivo aunque había imágenes seleccionadas');
        showError('Error', 'No se pudieron subir las imágenes. Por favor, intenta nuevamente.');
        return;
      }

      // 2. Enviar datos de la actividad
      const activityData = {
        titulo: formData.titulo,
        participantes: selectedParticipantes, // Array de IDs de estudiantes
        descripcion: formData.descripcion,
        imagenes: uploadedMedia,
        accountId: effectiveInstitution.account._id,
        divisionId: effectiveInstitution.division?._id,
        userId: user._id
      };

      console.log('Datos de actividad a enviar:', activityData);

      // Usar apiClient en lugar de fetch para que el interceptor maneje el refresh del token
      const response = await apiClient.post('/activities', activityData);

      console.log('Actividad enviada exitosamente:', response.data);
      showSuccess('Actividad', 'Actividad enviada correctamente');
      // Limpiar formulario
      setFormData({
        titulo: '',
        participantes: '',
        descripcion: ''
      });
      setSelectedImages([]);
      setSelectedParticipantes([]); // Limpiar participantes seleccionados
    } catch (error) {
      console.error('Error submitting activity:', error);
      showError('Error', error.message || 'Error al enviar la actividad');
    } finally {
      console.log('Finalizando submitActivity, estableciendo isSubmitting a false');
      setIsSubmitting(false);
    }
  };

  const getInstitutionName = () => {
    if (effectiveInstitution) {
      return effectiveInstitution.account.nombre;
    }
    if (userAssociations.length === 1) {
      return userAssociations[0].account.nombre;
    }
    return 'La Salle'; // Fallback
  };

  const getDivisionName = () => {
    if (effectiveInstitution?.division) {
      return effectiveInstitution.division.nombre;
    }
    return 'Todas las divisiones';
  };

  return (
    <View style={styles.homeContainer}>
      <CommonHeader 
        onOpenNotifications={onOpenNotifications} 
        onOpenMenu={onOpenMenu}
        activeStudent={getActiveStudent()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={Platform.OS === 'ios'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContentContainer,
            keyboardVisible && styles.scrollContentContainerKeyboardVisible
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          bounces={false}
          onContentSizeChange={() => {
            // Asegurar scroll al final cuando el contenido cambia
            if (selectedImages.length > 0) {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
          }}
        >
        {/* Título ACTIVIDAD */}
        <View style={styles.headerContainer}>
          <Text style={styles.actividadTitle}>ACTIVIDAD</Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Título de la actividad */}
          <View style={styles.formFieldContainer}>
            <Text style={styles.formLabel}>Título de la actividad <Text style={styles.requiredAsterisk}>*</Text></Text>
            <TextInput
              style={styles.formInput}
              placeholder=""
              placeholderTextColor="#B3D4F1"
              value={formData.titulo}
              onChangeText={(text) => setFormData(prev => ({ ...prev, titulo: text }))}
            />
          </View>

          {/* Descripción */}
          <View 
            ref={descripcionContainerRef}
            style={styles.formFieldContainer}
          >
            <Text style={styles.formLabel}>Descripción de la tarea</Text>
            <TextInput
              ref={descripcionInputRef}
              style={styles.formTextArea}
              placeholder=""
              placeholderTextColor="#B3D4F1"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={formData.descripcion}
              onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
            />
          </View>

          {/* Participantes */}
          <View style={styles.formFieldContainer}>
            <Text style={styles.formLabel}>Participantes <Text style={styles.requiredAsterisk}>*</Text> <Text style={styles.formSubtext}>(seleccionar los alumnos)</Text></Text>
            
            {/* Selección de participantes */}
            <View style={styles.studentsSection}>
              <View style={styles.studentsHeader}>
                <TouchableOpacity onPress={toggleAllStudents} style={styles.selectAllButton}>
                  <Text style={styles.selectAllButtonText}>
                    {students.length > 0 && students.every(student => selectedParticipantes.includes(student._id)) 
                      ? 'Deseleccionar todos' 
                      : 'Seleccionar todos'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {studentsLoading ? (
                <Text style={styles.loadingText}>Cargando alumnos...</Text>
              ) : students.length === 0 ? (
                <Text style={styles.noStudentsText}>No hay alumnos disponibles en esta división</Text>
              ) : (
                <View style={styles.studentsGrid}>
                  {students.map((student) => (
                    <TouchableOpacity
                      key={student._id}
                      style={styles.studentItem}
                      onPress={() => handleSelectParticipante(student._id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.studentAvatar}>
                        {student.avatar ? (
                          <Image 
                            source={{ uri: student.avatar }} 
                            style={styles.studentAvatarImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.studentIcon}>👤</Text>
                        )}
                        {selectedParticipantes.includes(student._id) && (
                          <View style={styles.checkMark}>
                            <Text style={styles.checkText}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.studentNombre}>{student.nombre}</Text>
                      <Text style={styles.studentApellido}>{student.apellido}</Text>
                      <Text style={styles.studentDivision}>{student.division?.nombre}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Sección de selección de imágenes/videos */}
        <View style={styles.mediaSectionContainer}>
          <Text style={styles.mediaSectionTitle}>Agregar imágenes o videos</Text>
          
          <TouchableOpacity style={styles.mediaButton} onPress={handleImagePicker}>
            <View style={styles.mediaButtonCircle}>
              <Image
                source={require('../assets/design/icons/camera.png')}
                style={styles.mediaButtonImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.mediaPlusBadge}>
              <Text style={styles.mediaPlusText}>+</Text>
            </View>
          </TouchableOpacity>

          {/* Media seleccionada (imágenes y videos) */}
          {selectedImages.length > 0 && (
            <View style={styles.selectedImagesContainer}>
              <Text style={styles.selectedImagesTitle}>Media seleccionada:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((media, index) => (
                  <View key={index} style={styles.selectedImageContainer}>
                    {media.type?.startsWith('video/') ? (
                      <View style={styles.videoContainer}>
                        <Image source={{ uri: media.uri }} style={styles.selectedImage} />
                        <View style={styles.videoOverlay}>
                          <Text style={styles.videoIcon}>▶️</Text>
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: media.uri }} style={styles.selectedImage} />
                    )}
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* Botón de enviar - Al final del contenido */}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={submitActivity}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Enviar Actividad'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          isVisible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
        />
      )}
      
      {/* Video Conversion Modal */}
      <VideoConversionModal
        visible={showVideoConversion}
        isConverting={isConverting}
        progress={conversionProgress}
        result={lastResult}
        error={conversionError}
        onClose={() => {
          setShowVideoConversion(false);
          clearError();
        }}
        onRetry={() => {
          // Implementar reintento de conversión si es necesario
          clearError();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 200, // Espacio generoso para el botón al final y evitar que se corte
    // Removido flexGrow: 1 para permitir que el contenido se expanda naturalmente
  },
  scrollContentContainerKeyboardVisible: {
    paddingBottom: 200, // Mantener espacio suficiente incluso con el teclado visible
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 15,
  },
  mediaSectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  mediaSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 20,
    textAlign: 'center',
  },
  actividadTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0E5FCE',
    textAlign: 'center',
    marginBottom: 0,
  },
  mediaButton: {
    position: 'relative',
  },
  mediaButtonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtonImage: {
    width: 45,
    height: 45,
    tintColor: '#FFFFFF',
  },
  mediaPlusBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF8C42',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  mediaPlusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  selectedImagesContainer: {
    marginTop: 10,
    marginBottom: 30, // Aumentado para dar más espacio antes del botón
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 15,
    maxHeight: 150,
  },
  selectedImagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginBottom: 15,
    textAlign: 'center',
  },
  selectedImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginRight: 10,
    position: 'relative',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 1000,
    borderColor: '#FFFFFF',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    paddingTop: 15,
    paddingBottom: 20,
  },
  formFieldContainer: {
    marginBottom: 25,
  },
  formLabel: {
    fontSize: 16,
    color: '#FF8C42',
    marginBottom: 10,
    fontWeight: '600',
  },
  requiredAsterisk: {
    fontSize: 16,
    color: '#FF8C42',
  },
  formSubtext: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: 'normal',
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    minHeight: 50,
    color: '#0E5FCE',
  },
  formTextArea: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    minHeight: 120,
    color: '#0E5FCE',
  },
  submitButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 20, // Espacio antes del botón
    marginBottom: 20, // Espacio después del botón
    width: '100%', // Asegurar que ocupe todo el ancho
  },
  submitButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    // Sombra para el botón
    shadowColor: '#FF8C42',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Para Android
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#B3D4F1',
    opacity: 0.7,
  },
  // Estilos para el autocompletar de participantes


  selectedParticipantesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF8C42',

    
    marginBottom: 10,
  },
  selectedParticipanteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedParticipanteText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  removeParticipanteButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeParticipanteText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },


  // Estilos para la cuadrícula de estudiantes
  studentsLoadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  studentsLoadingText: {
    fontSize: 16,
    color: '#666666',
  },
  studentsEmptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  studentsEmptyText: {
    fontSize: 16,
    color: '#666666',
  },
  studentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingVertical: 20,
  },
  studentItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 4,
  },
  studentItemSelected: {
    opacity: 0.7,
  },
  studentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  studentAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  studentIcon: {
    fontSize: 24,
    color: '#666666',
  },
  checkMark: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0E5FCE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  studentNombre: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  studentApellido: {
    fontSize: 12,
    color: '#0E5FCE',
    textAlign: 'center',
  },
  studentDivision: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 1,
  },
  selectedParticipantesList: {
    marginTop: 10,
  },
  // Estilos adicionales para el nuevo diseño
  studentsSection: {
    marginBottom: 20,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectAllButton: {
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  selectAllButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noStudentsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  // Estilos para videos
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  videoIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});

export default withSideMenu(ActividadScreen); 
export default withSideMenu(ActividadScreen); 