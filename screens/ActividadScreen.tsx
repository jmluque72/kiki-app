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
import { useAuth } from "../contexts/AuthContextHybrid"
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
        
        setSelectedImages(prev => [...prev, asset]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'mixed', // Permite tanto imágenes como videos
      includeBase64: false,
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
        
        setSelectedImages(prev => [...prev, ...validAssets]);
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
        const processedImages = await simpleProcessMultipleImages(imageUris, 800, 85);
        const formDataArray = prepareImagesForUpload(processedImages);

        for (let i = 0; i < formDataArray.length; i++) {
          try {
            console.log(`📤 [ACTIVIDAD] Subiendo imagen ${i + 1}/${formDataArray.length}`);

            // Usar apiClient para que el interceptor maneje el refresh del token
            // axios maneja automáticamente el Content-Type para FormData
            const response = await apiClient.post('/upload/s3/image', formDataArray[i], {
              timeout: 120000, // 2 minutos para imágenes (por si son grandes)
            });

            console.log('✅ [ACTIVIDAD] Imagen subida exitosamente:', response.data);
            uploadedMedia.push(response.data.imageKey);
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
            const videoSizeMB = video.fileSize ? (video.fileSize / (1024 * 1024)).toFixed(2) : 'desconocido';
            const videoDuration = video.duration ? (video.duration / 1000).toFixed(1) : 'desconocido';
            
            console.log(`📤 [ACTIVIDAD] Subiendo video ${i + 1}/${formDataArray.length}`);
            console.log(`📊 [ACTIVIDAD] Video info: ${videoSizeMB}MB, ${videoDuration}s`);
            console.log(`⏱️ [ACTIVIDAD] Timeout configurado: 300000ms (5 minutos)`);

            // Usar apiClient para que el interceptor maneje el refresh del token
            // axios maneja automáticamente el Content-Type para FormData
            const response = await apiClient.post('/upload/s3/video', formDataArray[i], {
              timeout: 300000, // 5 minutos (300 segundos) para videos grandes
            });

            const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ [ACTIVIDAD] Video subido exitosamente en ${uploadTime}s:`, response.data);
            uploadedMedia.push(response.data.videoKey);
          } catch (error: any) {
            const uploadTime = Date.now() - startTime;
            
            // Detectar si es un error de timeout
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
              console.error('⏱️ [ACTIVIDAD] ERROR DE TIMEOUT detectado');
              throw new Error(`El video es demasiado grande o la conexión es lenta (timeout después de ${(uploadTime / 1000).toFixed(1)}s). Por favor, intenta con un video más pequeño o verifica tu conexión a internet.`);
            }
            
            // Detectar si es un error de red
            if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error') || error.message?.includes('network')) {
              console.error('🌐 [ACTIVIDAD] ERROR DE RED detectado');
              throw new Error('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
            }
            
            // Detectar errores del servidor
            if (error.response?.status) {
              console.error(`🔴 [ACTIVIDAD] Error del servidor: ${error.response.status}`);
              throw new Error(`Error del servidor (${error.response.status}): ${error.response.data?.message || error.message || 'Error desconocido'}`);
            }
            
            throw new Error(`Error al subir video: ${error.message || 'Error desconocido'}`);
          }
        }
      }

      console.log('✅ [ACTIVIDAD] Todos los archivos subidos exitosamente');
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
      // 1. Subir media (imágenes y videos)
      const uploadedMedia = await uploadMedia();
      console.log('Media subida:', uploadedMedia);

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