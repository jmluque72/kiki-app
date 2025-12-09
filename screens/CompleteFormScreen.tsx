import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Platform
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useAuth } from '../contexts/AuthContextHybrid';
import { useInstitution } from '../contexts/InstitutionContext';
import FormRequestService, { FormRequest, FormQuestion, FormResponse } from '../src/services/formRequestService';
import { toastService } from '../src/services/toastService';
import { API_FULL_URL } from '../src/config/apiConfig';
import { checkImagePermissions } from '../src/utils/permissionUtils';
import { apiClient, setAuthToken } from '../src/services/api';
// Iconos reemplazados con texto/emoji ya que lucide-react-native no está instalado

interface CompleteFormScreenProps {
  formRequest: FormRequest;
  onBack: () => void;
  onComplete: () => void;
}

const CompleteFormScreen: React.FC<CompleteFormScreenProps> = ({ formRequest, onBack, onComplete }) => {
  const { user, token } = useAuth();
  const { getActiveStudent } = useInstitution();
  
  const activeStudent = getActiveStudent();
  
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [estado, setEstado] = useState<'en_progreso' | 'completado' | 'aprobado' | 'rechazado'>('en_progreso');
  const [motivoRechazo, setMotivoRechazo] = useState<string | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const currentStudent = getActiveStudent();
    if (currentStudent) {
      loadExistingResponse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formRequest._id]);

  const loadExistingResponse = async () => {
    const currentStudent = getActiveStudent();
    if (!user?._id || !currentStudent?._id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const existingResponse = await FormRequestService.getFormResponse(
        formRequest.formRequest._id,
        currentStudent._id,
        user._id
      );

      if (existingResponse) {
        const responsesMap: Record<string, string | string[]> = {};
        existingResponse.respuestas.forEach((resp) => {
          // Asegurar que el valor se guarda correctamente
          responsesMap[resp.preguntaId] = resp.valor;
        });
        setResponses(responsesMap);
        setHasDraft(!existingResponse.completado);
        setIsCompleted(existingResponse.completado);
        setEstado(existingResponse.estado || (existingResponse.completado ? 'completado' : 'en_progreso'));
        setMotivoRechazo(existingResponse.motivoRechazo);
      } else {
        // Si no hay respuesta pero el formulario viene marcado como completado, verificar
        setIsCompleted(formRequest.completado || false);
        setEstado(formRequest.estado || (formRequest.completado ? 'completado' : 'en_progreso'));
        setMotivoRechazo(formRequest.motivoRechazo);
      }
    } catch (error: any) {
      console.error('Error cargando respuesta existente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (preguntaId: string, value: string | string[]) => {
    setResponses(prev => ({
      ...prev,
      [preguntaId]: value
    }));
  };

  const uploadFileToS3 = async (fileUri: string, fileName: string, mimeType: string): Promise<string> => {
    const startTime = Date.now();
    const uploadUrl = `${API_FULL_URL}/upload/s3/file`;
    
    try {
      console.log('📤 [UPLOAD] Iniciando upload de archivo:', { fileName, mimeType, uri: fileUri.substring(0, 50) + '...' });
      
      // Función auxiliar para obtener el token actual
      const getAuthToken = async (): Promise<string> => {
        const RefreshTokenService = require('../src/services/refreshTokenService').default;
        let authToken = token;
        
        console.log(`🔑 [UPLOAD] Obteniendo token - token del contexto: ${authToken ? 'Sí' : 'No'}`);
        
        if (!authToken) {
          console.log('🔑 [UPLOAD] Token del contexto no disponible, obteniendo de AsyncStorage...');
          authToken = await RefreshTokenService.getAccessToken();
        }
        
        if (!authToken) {
          console.error('❌ [UPLOAD] No hay token disponible ni en contexto ni en AsyncStorage');
          throw new Error('No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.');
        }
        
        // Verificar si el token está próximo a expirar (5 minutos antes)
        const isExpiringSoon = await RefreshTokenService.isTokenExpiringSoon();
        if (isExpiringSoon) {
          console.log('⚠️ [UPLOAD] Token próximo a expirar, refrescando preventivamente...');
          try {
            authToken = await RefreshTokenService.refreshAccessToken();
            console.log('✅ [UPLOAD] Token refrescado preventivamente');
          } catch (refreshError: any) {
            console.warn('⚠️ [UPLOAD] No se pudo refrescar preventivamente, usando token actual:', refreshError?.message);
            // Continuar con el token actual si el refresh preventivo falla
          }
        }
        
        console.log(`✅ [UPLOAD] Token obtenido (primeros 20 chars): ${authToken.substring(0, 20)}...`);
        return authToken;
      };
      
      // Función auxiliar para preparar FormData
      const prepareFormData = () => {
        const formData = new FormData();
        
        // Normalizar URI para Android
        let normalizedUri = fileUri;
        if (Platform.OS === 'android') {
          if (!normalizedUri.startsWith('file://') && !normalizedUri.startsWith('content://')) {
            normalizedUri = `file://${normalizedUri}`;
          }
        }
        
        formData.append('file', {
          uri: normalizedUri,
          type: mimeType,
          name: fileName || 'file',
        } as any);
        
        return formData;
      };
      
      // Función auxiliar para hacer la petición con retry en caso de 401
      const uploadWithRetry = async (retryCount = 0): Promise<Response> => {
        const authToken = await getAuthToken();
        
        console.log(`📤 [UPLOAD] Intentando subir archivo (intento ${retryCount + 1})`);
        console.log(`📤 [UPLOAD] Token (primeros 20 chars): ${authToken.substring(0, 20)}...`);
        
        // Recrear FormData para cada intento, ya que no es reutilizable
        const formDataToUse = prepareFormData();
        
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
          console.log('🔄 [UPLOAD] Token expirado (401), intentando refresh...');
          const RefreshTokenService = require('../src/services/refreshTokenService').default;
          
          try {
            // Verificar si hay refresh token disponible antes de intentar refresh
            const refreshToken = await RefreshTokenService.getRefreshToken();
            if (!refreshToken) {
              console.error('❌ [UPLOAD] No hay refresh token disponible');
              throw new Error('No hay refresh token disponible. Por favor, inicia sesión nuevamente.');
            }
            
            console.log('🔄 [UPLOAD] Refresh token encontrado, intentando renovar access token...');
            const newToken = await RefreshTokenService.refreshAccessToken();
            
            if (newToken) {
              console.log('✅ [UPLOAD] Token renovado exitosamente');
              console.log('✅ [UPLOAD] Nuevo token (primeros 20 chars):', newToken.substring(0, 20) + '...');
              
              // Actualizar el token en AsyncStorage (el contexto lo leerá en el próximo render)
              // También actualizar el token en apiClient para futuras peticiones
              setAuthToken(newToken);
              
              // Guardar el token en AsyncStorage con la misma key que usa el contexto
              const AsyncStorage = require('../src/utils/storage').default;
              await AsyncStorage.setItem('auth_token', newToken);
              
              console.log('✅ [UPLOAD] Token actualizado en AsyncStorage y apiClient');
              
              // Reintentar con el nuevo token (el FormData se recreará en el retry)
              return uploadWithRetry(1);
            } else {
              throw new Error('No se pudo obtener un nuevo token después del refresh');
            }
          } catch (refreshError: any) {
            console.error('❌ [UPLOAD] Error completo al refrescar token:');
            console.error('❌ [UPLOAD] Error message:', refreshError?.message);
            console.error('❌ [UPLOAD] Error name:', refreshError?.name);
            console.error('❌ [UPLOAD] Error stack:', refreshError?.stack);
            
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
      
      // En Android, usar fetch directamente (más confiable para FormData)
      // En iOS, también usar fetch para mantener consistencia
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        const fetchResponse = await uploadWithRetry(0);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          console.error(`❌ [UPLOAD] Error del servidor (${fetchResponse.status}):`, errorText);
          throw new Error(`Error al subir el archivo: ${fetchResponse.status} ${fetchResponse.statusText}`);
        }
        
        const rawResponseText = await fetchResponse.text();
        console.log(`📦 [UPLOAD] Respuesta raw (primeros 200 chars):`, rawResponseText.substring(0, 200));
        
        let responseData: any;
        try {
          responseData = JSON.parse(rawResponseText);
        } catch (jsonError: any) {
          console.error('❌ [UPLOAD] Error al parsear JSON de la respuesta:', jsonError);
          console.error('❌ [UPLOAD] Respuesta raw completa:', rawResponseText);
          throw new Error(`Error al procesar la respuesta del servidor: ${jsonError.message}`);
        }
        
        const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ [UPLOAD] Archivo subido exitosamente en ${uploadTime}s`);
        console.log(`📦 [UPLOAD] Respuesta completa:`, JSON.stringify(responseData, null, 2));
        
        // Validar que la respuesta sea exitosa
        if (!responseData || !responseData.fileKey) {
          console.error('❌ [UPLOAD] Respuesta inválida del servidor');
          throw new Error('El servidor no devolvió una respuesta válida. Por favor, intenta nuevamente.');
        }
        
        return responseData.fileKey;
      } else {
        // Fallback para otras plataformas (no debería llegar aquí en React Native)
        throw new Error('Plataforma no soportada');
      }
    } catch (error: any) {
      const uploadTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`❌ [UPLOAD] Error en upload después de ${uploadTime}s:`, error);
      
      if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
        throw new Error(`El archivo es demasiado grande o la conexión es lenta (timeout después de ${uploadTime}s). Por favor, intenta con un archivo más pequeño o verifica tu conexión a internet.`);
      } else if (error.message?.includes('Network Error') || error.message?.includes('network')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.');
      } else if (error.message?.includes('Error al acceder al archivo')) {
        throw new Error('Error al acceder al archivo. Por favor, intenta seleccionar el archivo nuevamente.');
      } else {
        throw new Error(`Error al subir archivo: ${error.message || 'Error desconocido'}`);
      }
    }
  };

  const handleSelectImage = async (preguntaId: string) => {
    try {
      console.log('📷 [FORM] Iniciando selección de imagen para pregunta:', preguntaId);
      
      // Verificar permisos, pero no bloquear si falla - react-native-image-picker puede manejarlo
      const hasPermission = await checkImagePermissions();
      console.log('📷 [FORM] Permiso verificado:', hasPermission);
      
      // Intentar abrir la galería de todas formas
      // react-native-image-picker puede manejar los permisos internamente en algunos casos
      console.log('📷 [FORM] Abriendo galería de imágenes...');
      
      launchImageLibrary(
        {
          mediaType: 'photo' as MediaType,
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          quality: 0.8,
        },
        async (response: ImagePickerResponse) => {
          console.log('📷 [FORM] Respuesta del selector:', {
            didCancel: response.didCancel,
            errorCode: response.errorCode,
            errorMessage: response.errorMessage,
            hasAssets: !!response.assets?.length
          });
          
          if (response.didCancel) {
            console.log('📷 [FORM] Usuario canceló la selección');
            return;
          }
          
          if (response.errorCode) {
            console.error('📷 [FORM] Error en selector:', response.errorCode, response.errorMessage);
            toastService.error(`Error al seleccionar imagen: ${response.errorMessage || response.errorCode}`);
            return;
          }
          
          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              try {
                console.log('📷 [FORM] Imagen seleccionada, iniciando upload...');
                setSaving(true);
                const fileKey = await uploadFileToS3(
                  asset.uri,
                  asset.fileName || 'image.jpg',
                  asset.type || 'image/jpeg'
                );
                handleResponseChange(preguntaId, fileKey);
                toastService.success('Imagen subida exitosamente');
                console.log('✅ [FORM] Imagen subida exitosamente:', fileKey);
              } catch (error: any) {
                console.error('❌ [FORM] Error subiendo imagen:', error);
                toastService.error('Error al subir la imagen');
              } finally {
                setSaving(false);
              }
            }
          } else {
            console.warn('⚠️ [FORM] No se seleccionó ninguna imagen');
          }
        }
      );
    } catch (error: any) {
      console.error('❌ [FORM] Error seleccionando imagen:', error);
      toastService.error('Error al seleccionar imagen');
    }
  };

  const handleSelectFile = async (preguntaId: string) => {
    try {
      const hasPermission = await checkImagePermissions();
      if (!hasPermission) {
        return;
      }

      launchImageLibrary(
        {
          mediaType: 'mixed' as MediaType,
          includeBase64: false,
        },
        async (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorCode) {
            return;
          }
          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              try {
                setSaving(true);
                const fileKey = await uploadFileToS3(
                  asset.uri,
                  asset.fileName || 'file',
                  asset.type || 'application/octet-stream'
                );
                handleResponseChange(preguntaId, fileKey);
                toastService.success('Archivo subido exitosamente');
              } catch (error: any) {
                console.error('Error subiendo archivo:', error);
                toastService.error('Error al subir el archivo');
              } finally {
                setSaving(false);
              }
            }
          }
        }
      );
    } catch (error: any) {
      console.error('Error seleccionando archivo:', error);
      toastService.error('Error al seleccionar archivo');
    }
  };

  const getFileUrl = (fileKey: string): string => {
    // Generar URL de S3 usando la key
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey; // Ya es una URL completa
    }
    return `https://kiki-bucket-app.s3.amazonaws.com/${fileKey}`;
  };

  const validateResponses = (): boolean => {
    for (const pregunta of formRequest.formRequest.preguntas) {
      if (pregunta.requerido) {
        const respuesta = responses[pregunta._id];
        if (!respuesta || 
            (typeof respuesta === 'string' && !respuesta.trim()) ||
            (Array.isArray(respuesta) && respuesta.length === 0)) {
          // Encontrar el índice de la pregunta para navegar a ella
          const questionIndex = formRequest.formRequest.preguntas.findIndex(p => p._id === pregunta._id);
          setCurrentQuestionIndex(questionIndex);
          Alert.alert(
            'Campos requeridos',
            `La pregunta "${pregunta.texto}" es obligatoria`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < formRequest.formRequest.preguntas.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const canGoNext = currentQuestionIndex < formRequest.formRequest.preguntas.length - 1;
  const canGoPrevious = currentQuestionIndex > 0;
  const currentQuestion = formRequest.formRequest.preguntas[currentQuestionIndex];
  const totalQuestions = formRequest.formRequest.preguntas.length;

  const handleSaveDraft = async () => {
    const currentStudent = getActiveStudent();
    if (!user?._id || !currentStudent?._id) {
      toastService.error('Error: Usuario o estudiante no encontrado');
      return;
    }

    try {
      setSaving(true);
      await FormRequestService.saveFormResponse(formRequest.formRequest._id, {
        studentId: currentStudent._id,
        respuestas: Object.entries(responses).map(([preguntaId, valor]) => ({
          preguntaId,
          valor
        })),
        completado: false
      });
      toastService.success('Borrador guardado exitosamente');
      setHasDraft(true);
    } catch (error: any) {
      console.error('Error guardando borrador:', error);
      toastService.error('Error al guardar borrador');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!validateResponses()) {
      return;
    }

    const currentStudent = getActiveStudent();
    if (!user?._id || !currentStudent?._id) {
      toastService.error('Error: Usuario o estudiante no encontrado');
      return;
    }

    Alert.alert(
      'Completar Formulario',
      '¿Estás seguro de que deseas completar este formulario? No podrás editarlo después.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          style: 'default',
          onPress: async () => {
            try {
              setSaving(true);
              await FormRequestService.saveFormResponse(formRequest.formRequest._id, {
                studentId: currentStudent._id,
                respuestas: Object.entries(responses).map(([preguntaId, valor]) => ({
                  preguntaId,
                  valor
                })),
                completado: true
              });
              toastService.success('Formulario completado exitosamente');
              onComplete();
            } catch (error: any) {
              console.error('Error completando formulario:', error);
              toastService.error('Error al completar formulario');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderQuestion = (pregunta: FormQuestion, index: number) => {
    const respuesta = responses[pregunta._id];

    return (
      <View key={pregunta._id} style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionText}>
            {pregunta.texto}
            {pregunta.requerido && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
        <Text style={styles.questionType}>
          {pregunta.tipo === 'texto' ? 'Texto' : 
           pregunta.tipo === 'opcion_multiple' ? 'Opción Múltiple' : 
           pregunta.tipo === 'checkbox' ? 'Checkbox' :
           pregunta.tipo === 'imagen' ? 'Imagen' :
           'Archivo'}
        </Text>

        {pregunta.tipo === 'texto' && (
          (isCompleted && estado === 'aprobado') ? (
            <View style={styles.readOnlyContainer}>
              <Text style={styles.readOnlyText}>
                {typeof respuesta === 'string' && respuesta ? respuesta : 'Sin respuesta'}
              </Text>
            </View>
          ) : (
            <TextInput
              style={styles.textInput}
              value={typeof respuesta === 'string' ? respuesta : ''}
              onChangeText={(text) => handleResponseChange(pregunta._id, text)}
              placeholder="Escribe tu respuesta aquí..."
              multiline
              numberOfLines={4}
            />
          )
        )}

        {pregunta.tipo === 'opcion_multiple' && pregunta.opciones && (
          <View style={styles.optionsContainer}>
            {pregunta.opciones.map((opcion, optIndex) => {
              const isSelected = respuesta === opcion;
              const isReadOnly = isCompleted && estado === 'aprobado';
              return (
                <TouchableOpacity
                  key={optIndex}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                    isReadOnly && styles.optionButtonReadOnly
                  ]}
                  onPress={() => !isReadOnly && handleResponseChange(pregunta._id, opcion)}
                  disabled={isReadOnly}
                >
                  <View style={[
                    styles.radioButton,
                    isSelected && styles.radioButtonSelected
                  ]}>
                    {isSelected && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {pregunta.tipo === 'checkbox' && pregunta.opciones && (
          <View style={styles.optionsContainer}>
            {pregunta.opciones.map((opcion, optIndex) => {
              const selectedOptions = Array.isArray(respuesta) ? respuesta : [];
              const isSelected = selectedOptions.includes(opcion);
              const isReadOnly = isCompleted && estado === 'aprobado';
              return (
                <TouchableOpacity
                  key={optIndex}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                    isReadOnly && styles.optionButtonReadOnly
                  ]}
                  onPress={() => {
                    if (!isReadOnly) {
                      const currentOptions = Array.isArray(respuesta) ? respuesta : [];
                      const newOptions = isSelected
                        ? currentOptions.filter(opt => opt !== opcion)
                        : [...currentOptions, opcion];
                      handleResponseChange(pregunta._id, newOptions);
                    }
                  }}
                  disabled={isReadOnly}
                >
                  <View style={[
                    styles.checkbox,
                    isSelected && styles.checkboxSelected
                  ]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {pregunta.tipo === 'imagen' && (
          <View style={styles.fileContainer}>
            {typeof respuesta === 'string' && respuesta ? (
              <View style={styles.filePreviewContainer}>
                <Image
                  source={{ uri: getFileUrl(respuesta) }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                {!(isCompleted && estado === 'aprobado') && (
                  <TouchableOpacity
                    style={styles.removeFileButton}
                    onPress={() => handleResponseChange(pregunta._id, '')}
                  >
                    <Text style={styles.removeFileText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              !(isCompleted && estado === 'aprobado') && (
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => handleSelectImage(pregunta._id)}
                  disabled={saving}
                >
                  <Text style={styles.fileButtonText}>
                    {saving ? 'Subiendo...' : '📷 Seleccionar Imagen'}
                  </Text>
                </TouchableOpacity>
              )
            )}
            {!(isCompleted && estado === 'aprobado') && !respuesta && (
              <Text style={styles.fileHint}>
                Puedes seleccionar una imagen desde la galería
              </Text>
            )}
          </View>
        )}

        {pregunta.tipo === 'archivo' && (
          <View style={styles.fileContainer}>
            {typeof respuesta === 'string' && respuesta ? (
              <View style={styles.fileInfoContainer}>
                <Text style={styles.fileName}>📄 Archivo seleccionado</Text>
                <Text style={styles.fileKey}>{respuesta}</Text>
                {!(isCompleted && estado === 'aprobado') && (
                  <TouchableOpacity
                    style={styles.removeFileButton}
                    onPress={() => handleResponseChange(pregunta._id, '')}
                  >
                    <Text style={styles.removeFileText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              !(isCompleted && estado === 'aprobado') && (
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() => handleSelectFile(pregunta._id)}
                  disabled={saving}
                >
                  <Text style={styles.fileButtonText}>
                    {saving ? 'Subiendo...' : '📁 Seleccionar Archivo'}
                  </Text>
                </TouchableOpacity>
              )
            )}
            {!(isCompleted && estado === 'aprobado') && !respuesta && (
              <Text style={styles.fileHint}>
                Puedes seleccionar un archivo desde tu dispositivo
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completar Formulario</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0E5FCE" />
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {formRequest.formRequest.nombre}
          </Text>
        </View>

      <View style={styles.content}>
        {/* Contador de preguntas */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </Text>
        </View>

        {/* Descripción y avisos solo en la primera pregunta */}
        {currentQuestionIndex === 0 && (
          <View style={styles.infoContainer}>
            {formRequest.formRequest.descripcion && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  {formRequest.formRequest.descripcion}
                </Text>
              </View>
            )}

        {formRequest.requerido && (
          <View style={styles.requiredNotice}>
            <Text style={styles.requiredNoticeText}>
              ⚠️ Este formulario es requerido y debe ser completado
            </Text>
          </View>
        )}

        {estado === 'rechazado' && motivoRechazo && (
          <View style={styles.rejectedNotice}>
            <Text style={styles.rejectedNoticeTitle}>
              ✗ Formulario Rechazado
            </Text>
            <Text style={styles.rejectedNoticeText}>
              Motivo: {motivoRechazo}
            </Text>
            <Text style={styles.rejectedNoticeSubtext}>
              Por favor, completa el formulario nuevamente.
            </Text>
          </View>
        )}

        {estado === 'aprobado' && (
          <View style={styles.approvedNotice}>
            <Text style={styles.approvedNoticeText}>
              ✓ Formulario Aprobado
            </Text>
          </View>
        )}

        {hasDraft && estado !== 'rechazado' && (
          <View style={styles.draftNotice}>
            <Text style={styles.draftNoticeText}>
              Tienes un borrador guardado. Puedes continuar completándolo.
            </Text>
          </View>
        )}
          </View>
        )}

        {/* Pregunta actual */}
        <ScrollView 
          style={styles.questionScrollView}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={true}
        >
          {currentQuestion && renderQuestion(currentQuestion, currentQuestionIndex)}
        </ScrollView>

        {/* Navegación entre preguntas */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
            onPress={handlePreviousQuestion}
            disabled={!canGoPrevious}
          >
            <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
              ← Anterior
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
            onPress={handleNextQuestion}
            disabled={!canGoNext}
          >
            <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
              Siguiente →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {estado !== 'aprobado' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.draftButton,
              currentQuestionIndex !== totalQuestions - 1 && styles.draftButtonFullWidth
            ]}
            onPress={handleSaveDraft}
            disabled={saving}
          >
            <Text style={styles.draftButtonIcon}>💾</Text>
            <Text style={styles.draftButtonText}>
              {saving ? 'Guardando...' : 'Guardar Borrador'}
            </Text>
          </TouchableOpacity>
          {currentQuestionIndex === totalQuestions - 1 && (
            <TouchableOpacity
              style={[styles.button, styles.completeButton]}
              onPress={handleComplete}
              disabled={saving}
            >
              <Text style={styles.completeButtonIcon}>✓</Text>
              <Text style={styles.completeButtonText}>
                {saving ? 'Completando...' : 'Completar'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {estado === 'aprobado' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.completeButton, { flex: 1 }]}
            onPress={onBack}
          >
            <Text style={styles.completeButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  content: {
    flex: 1
  },
  counterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center'
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 16
  },
  questionScrollView: {
    flex: 1
  },
  questionScrollContent: {
    padding: 16,
    paddingBottom: 20
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButtonDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.5
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E5FCE'
  },
  navButtonTextDisabled: {
    color: '#9CA3AF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280'
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  descriptionText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },
  requiredNotice: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  requiredNoticeText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500'
  },
  draftNotice: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7'
  },
  draftNoticeText: {
    fontSize: 14,
    color: '#D97706',
    fontWeight: '500'
  },
  rejectedNotice: {
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2'
  },
  rejectedNoticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8
  },
  rejectedNoticeText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 8,
    lineHeight: 20
  },
  rejectedNoticeSubtext: {
    fontSize: 12,
    color: '#B91C1C',
    fontStyle: 'italic'
  },
  approvedNotice: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  approvedNoticeText: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600'
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  questionHeader: {
    flexDirection: 'row',
    marginBottom: 8
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginRight: 8
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1
  },
  required: {
    color: '#EF4444'
  },
  questionType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top'
  },
  optionsContainer: {
    gap: 8
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF'
  },
  optionButtonSelected: {
    borderColor: '#0E5FCE',
    backgroundColor: '#EFF6FF'
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioButtonSelected: {
    borderColor: '#0E5FCE'
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0E5FCE'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  checkboxSelected: {
    borderColor: '#0E5FCE',
    backgroundColor: '#0E5FCE'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold'
  },
  optionText: {
    fontSize: 14,
    color: '#111827',
    flex: 1
  },
  optionTextSelected: {
    color: '#0E5FCE',
    fontWeight: '500'
  },
  readOnlyContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    minHeight: 100
  },
  readOnlyText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20
  },
  optionButtonReadOnly: {
    opacity: 0.7
  },
  fileContainer: {
    marginTop: 12
  },
  fileButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  fileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  fileHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  filePreviewContainer: {
    position: 'relative',
    marginTop: 8
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  fileInfoContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  fileKey: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  removeFileButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    alignItems: 'center'
  },
  removeFileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 24, // Más padding abajo para evitar que quede pegado al borde
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minHeight: 50 // Altura mínima para mejor toque
  },
  draftButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  draftButtonFullWidth: {
    flex: 1
  },
  draftButtonIcon: {
    fontSize: 20
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280'
  },
  completeButton: {
    backgroundColor: '#0E5FCE'
  },
  completeButtonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default CompleteFormScreen;

