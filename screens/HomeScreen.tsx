import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationCenter from '../components/NotificationCenter';
import SuccessPopup from '../components/SuccessPopup';
import InstitutionSelector from '../components/InstitutionSelector';
import InicioScreen from './InicioScreen';
import AsistenciaScreen from './AsistenciaScreen';
import FamilyAttendanceScreen from './FamilyAttendanceScreen';
import ActividadScreen from './ActividadScreen';
import EventosScreen from './EventosScreen';
import PerfilScreen from './PerfilScreen';
import AlbumScreen from './AlbumScreen';

import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import { useSideMenu } from '../src/hooks/useSideMenu';
import SideMenu from '../components/SideMenu';
import AssociationsScreen from './AssociationsScreen';
import QuienRetiraScreen from './QuienRetiraScreen';
import RetirarScreen from './RetirarScreen';
import AcercaDeScreen from './AcercaDeScreen';
import TerminosCondicionesScreen from './TerminosCondicionesScreen';
import StudentActionsScreen from '../src/screens/StudentActionsScreen';
import FamilyActionsCalendarScreen from '../src/screens/FamilyActionsCalendarScreen';
import FormulariosScreen from './FormulariosScreen';
import CompleteFormScreen from './CompleteFormScreen';
import FormRequestService, { FormRequest } from '../src/services/formRequestService';
// import PushNotificationService from '../src/services/pushNotificationService';

const Tab = createBottomTabNavigator();

interface HomeScreenProps {
  onOpenActiveAssociation?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenActiveAssociation }) => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution, userAssociations, getActiveInstitution, getActiveStudent } = useInstitution();
  const { showMenu, openMenu, closeMenu } = useSideMenu();
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  const [showAssociations, setShowAssociations] = useState(false);
  const [showQuienRetira, setShowQuienRetira] = useState(false);
  const [showRetirar, setShowRetirar] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showTerminosCondiciones, setShowTerminosCondiciones] = useState(false);
  const [showAcciones, setShowAcciones] = useState(false);
  const [showFormularios, setShowFormularios] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [selectedFormRequest, setSelectedFormRequest] = useState<FormRequest | null>(null);
  const [pendingFormsCount, setPendingFormsCount] = useState(0);
  const [hasRequiredPending, setHasRequiredPending] = useState(false);
  const [showRequiredFormsModal, setShowRequiredFormsModal] = useState(false);
  
  // Función para abrir formularios
  const handleOpenFormularios = () => {
    closeMenu();
    setShowFormularios(true);
  };
  
  // Debug: Ver cuando cambia showFormularios
  useEffect(() => {
    console.log('📋 [HomeScreen] 🔄 showFormularios cambió a:', showFormularios);
    console.log('📋 [HomeScreen] 🔄 Modal debería estar visible:', showFormularios);
  }, [showFormularios]);
  
  // Re-renderizar cuando cambie la asociación activa
  useEffect(() => {
    console.log('🔄 [HomeScreen] Asociación activa cambió:', activeAssociation);
  }, [activeAssociation]);

  // Cargar cantidad de formularios pendientes y verificar requeridos
  useEffect(() => {
    const loadPendingForms = async () => {
      const activeStudent = getActiveStudent();
      console.log('📋 [HomeScreen] Cargando formularios pendientes:', {
        userId: user?._id,
        studentId: activeStudent?._id,
        role: activeAssociation?.role?.nombre
      });
      
      if (user?._id && activeStudent?._id && activeAssociation?.role?.nombre === 'familyadmin') {
        try {
          const forms = await FormRequestService.getPendingForms(user._id, activeStudent._id);
          console.log('📋 [HomeScreen] Formularios pendientes encontrados:', forms.length);
          setPendingFormsCount(forms.length);
          
          // Verificar si hay formularios requeridos pendientes
          const hasRequired = await FormRequestService.checkRequiredFormsPending(user._id, activeStudent._id);
          console.log('📋 [HomeScreen] Hay formularios requeridos pendientes:', hasRequired);
          setHasRequiredPending(hasRequired);
          
          // Mostrar modal bloqueante si hay formularios requeridos pendientes
          if (hasRequired && forms.length > 0) {
            setShowRequiredFormsModal(true);
          }
        } catch (error) {
          console.error('❌ [HomeScreen] Error cargando formularios pendientes:', error);
        }
      } else {
        // Si no se cumplen las condiciones, resetear el contador
        setPendingFormsCount(0);
        setHasRequiredPending(false);
      }
    };

    loadPendingForms();
    // Refrescar cada 30 segundos
    const interval = setInterval(loadPendingForms, 30000);
    return () => clearInterval(interval);
  }, [user?._id, activeAssociation?.role?.nombre, selectedInstitution, activeAssociation?.student?._id]);

  // Inicializar notificaciones push cuando el usuario llega al Home
  // useEffect(() => {
  //   try {
  //     PushNotificationService.initialize();
  //     console.log('🔔 [HomeScreen] Push notifications initialized en HomeScreen');
  //   } catch (error) {
  //     console.error('❌ [HomeScreen] Error initializing push notifications:', error);
  //   }
  // }, []);
  
  const handleOpenNotifications = () => {
    setNotificationCenterVisible(true);
  };

  const handleCloseNotifications = () => {
    setNotificationCenterVisible(false);
  };

  const handleChangeInstitution = () => {
    if (userAssociations.length > 1) {
      setShowInstitutionSelector(true);
    } else {
      // Solo tienes una institución asociada - no mostrar alert
      console.log('Solo tienes una institución asociada');
    }
  };

  const handleInstitutionSelected = () => {
    setShowInstitutionSelector(false);
  };

  // Estado global para el popup de éxito
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');

  const showSuccessPopup = (message: string) => {
    setSuccessPopupMessage(message);
    setSuccessPopupVisible(true);
  };

  const hideSuccessPopup = () => {
    setSuccessPopupVisible(false);
    setSuccessPopupMessage('');
  };

  // Determinar qué pestañas mostrar según el rol
  const getUserRole = () => {
    // Priorizar el rol de la asociación activa si existe
    if (activeAssociation?.role) {
      return activeAssociation.role.nombre || activeAssociation.role;
    }
    // Fallback al rol del usuario si no hay asociación activa
    return user?.role?.nombre || '';
  };
  
  const getVisibleTabs = () => {
    const role = getUserRole();
    
    // Pestañas base que todos ven
    const baseTabs = ['Inicio', 'Perfil'];
    
    // Pestañas específicas por rol
    if (role === 'coordinador') {
      // Coordinadores ven todas las pestañas: Inicio, Asistencia, Actividad, Eventos, Perfil
      return ['Inicio', 'Asistencia', 'Actividad', 'Eventos', 'Perfil'];
    } else if (role === 'familyadmin') {
      // Familyadmin ven: Inicio, Álbum, Eventos, Perfil (sin Asistencias)
      return ['Inicio', 'Álbum', 'Eventos', 'Perfil'];
    } else if (role === 'familyviewer') {
      // Familyviewer ven: Inicio, Álbum, Eventos, Perfil (sin Asistencias)
      return ['Inicio', 'Álbum', 'Eventos', 'Perfil'];
    } else {
      // Para otros roles, solo mostrar pestañas base
      return baseTabs;
    }
  };
  
  const visibleTabs = getVisibleTabs();
  
  // Debug: Log del rol del usuario y pestañas visibles
  console.log('🔍 [HomeScreen] Usuario completo:', user);
  console.log('🔍 [HomeScreen] Asociación activa:', activeAssociation);
  console.log('🔍 [HomeScreen] Rol del usuario (fallback):', user?.role?.nombre);
  console.log('🔍 [HomeScreen] Rol de la asociación activa:', activeAssociation?.role);
  console.log('🔍 [HomeScreen] Rol final calculado:', getUserRole());
  console.log('🔍 [HomeScreen] Pestañas visibles:', visibleTabs);
  console.log('🔍 [HomeScreen] Número de pestañas:', visibleTabs.length);

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF8C42',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingBottom: 0,
            paddingTop: 0,
            height: 100,
            position: 'absolute',
            elevation: 0,
          },
          tabBarBackground: () => (
            <View style={styles.customTabBar}>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 0,
            marginBottom: 0,
          },
          headerStyle: {
            backgroundColor: '#0E5FCE',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarShowLabel: false,
        }}
      >
        {/* Pestaña Inicio - Siempre visible */}
        <Tab.Screen
          name="Inicio"
          component={() => <InicioScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} onOpenActiveAssociation={onOpenActiveAssociation} />}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../assets/design/icons/kiki_home.png')}
                  style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />
        
        {/* Pestaña Asistencias - Solo para familiares */}
        {visibleTabs.includes('Asistencias') && (
          <Tab.Screen
            name="Asistencias"
            component={() => <FamilyAttendanceScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/home_tab_2_join.png')}
                    style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />
        )}
        
        {/* Pestaña Asistencia - Solo para coordinadores */}
        {visibleTabs.includes('Asistencia') && (
          <Tab.Screen
            name="Asistencia"
            component={() => <AsistenciaScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/home_tab_2_join.png')}
                    style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />
        )}

        {/* Pestaña Actividad - Solo para coordinadores */}
        {visibleTabs.includes('Actividad') && (
          <Tab.Screen
            name="Actividad"
            component={() => <ActividadScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/kiki_tab_more.png')}
                    style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />
        )}

        {/* Pestaña Álbum - Solo para familyadmin y familyviewer */}
        {visibleTabs.includes('Álbum') && (
          <Tab.Screen
            name="Álbum"
            component={() => <AlbumScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/home_tab_favorite.png')}
                    style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />
        )}
        
        {/* Pestaña Eventos - Para coordinadores, familyadmin y familyviewer */}
        {visibleTabs.includes('Eventos') && (
          <Tab.Screen
            name="Eventos"
            component={() => <EventosScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/calendar.png')}
                    style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                    resizeMode="contain"
                  />
                </View>
              ),
            }}
          />
        )}
        
        {/* Pestaña Perfil - Siempre visible */}
        <Tab.Screen
          name="Perfil"
          component={() => <PerfilScreen onOpenNotifications={handleOpenNotifications} onOpenMenu={openMenu} onOpenActiveAssociation={onOpenActiveAssociation} />}
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Image
                  source={require('../assets/design/icons/home_tab_5_user.png')}
                  style={[styles.tabIconImage, { tintColor: focused ? '#FF8C42' : '#FFFFFF' }]}
                  resizeMode="contain"
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      
      {/* Centro de Notificaciones */}
      {notificationCenterVisible && (
        <NotificationCenter
          visible={notificationCenterVisible}
          onClose={handleCloseNotifications}
          onShowSuccess={showSuccessPopup}
        />
      )}
      
      {/* Popup de éxito global */}
      <SuccessPopup
        visible={successPopupVisible}
        message={successPopupMessage}
        onClose={hideSuccessPopup}
      />
      
      {/* Selector de Institución */}
      {showInstitutionSelector && (
        <InstitutionSelector onInstitutionSelected={handleInstitutionSelected} />
      )}

      {/* Modal del menú lateral global */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={closeMenu}
      >
        <View style={styles.menuModalOverlay}>
          {/* Overlay para cerrar el menú tocando fuera */}
          <View style={styles.overlayTouchable} onTouchEnd={closeMenu} />
          
          <View style={styles.menuModalContainer}>
            <SideMenu 
              navigation={{}} 
              onClose={closeMenu}
              onOpenActiveAssociation={() => {
                closeMenu();
                onOpenActiveAssociation?.();
              }}
              onOpenAssociations={() => {
                closeMenu();
                setShowAssociations(true);
              }}
              onOpenQuienRetira={() => {
                closeMenu();
                setShowQuienRetira(true);
              }}
              onOpenRetirar={() => {
                closeMenu();
                setShowRetirar(true);
              }}
              onOpenAcercaDe={() => {
                closeMenu();
                setShowAcercaDe(true);
              }}
              onOpenTerminosCondiciones={() => {
                closeMenu();
                setShowTerminosCondiciones(true);
              }}
              onOpenAcciones={() => {
                closeMenu();
                setShowAcciones(true);
              }}
              openFormularios={() => {
                closeMenu();
                setShowFormularios(true);
              }}
              pendingFormsCount={pendingFormsCount}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Asociaciones */}
      <Modal
        visible={showAssociations}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAssociations(false)}
      >
        <AssociationsScreen onBack={() => setShowAssociations(false)} />
      </Modal>

      {/* Modal de Quien Retira */}
      <Modal
        visible={showQuienRetira}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowQuienRetira(false)}
      >
        <QuienRetiraScreen onBack={() => setShowQuienRetira(false)} />
      </Modal>

      {/* Modal de Retirar */}
      <Modal
        visible={showRetirar}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowRetirar(false)}
      >
        <RetirarScreen onBack={() => setShowRetirar(false)} />
      </Modal>

      {/* Modal de Acerca de */}
      <Modal
        visible={showAcercaDe}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAcercaDe(false)}
      >
        <AcercaDeScreen onBack={() => setShowAcercaDe(false)} />
      </Modal>

      {/* Modal de Términos y Condiciones */}
      <Modal
        visible={showTerminosCondiciones}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowTerminosCondiciones(false)}
      >
        <TerminosCondicionesScreen onBack={() => setShowTerminosCondiciones(false)} />
      </Modal>

      {/* Modal de Acciones */}
      <Modal
        visible={showAcciones}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAcciones(false)}
      >
        {(() => {
          const getUserRole = () => {
            if (activeAssociation?.role) {
              return activeAssociation.role.nombre || activeAssociation.role;
            }
            return user?.role?.nombre || '';
          };
          
          const role = getUserRole();
          if (role === 'coordinador') {
            return <StudentActionsScreen onBack={() => setShowAcciones(false)} />;
          } else {
            return <FamilyActionsCalendarScreen onBack={() => setShowAcciones(false)} />;
          }
        })()}
      </Modal>

      {/* Modal de Formularios Pendientes */}
      <Modal
        visible={showFormularios}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowFormularios(false);
        }}
      >
        {showFormularios && (
          <FormulariosScreen
            onBack={() => {
              console.log('📋 [HomeScreen] Volviendo desde FormulariosScreen');
              setShowFormularios(false);
            }}
            onCompleteForm={(formRequest) => {
              console.log('📋 [HomeScreen] Formulario seleccionado para completar:', formRequest.formRequest.nombre);
              setSelectedFormRequest(formRequest);
              setShowFormularios(false);
              setShowCompleteForm(true);
            }}
          />
        )}
      </Modal>

      {/* Modal de Completar Formulario */}
      <Modal
        visible={showCompleteForm}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowCompleteForm(false);
          setSelectedFormRequest(null);
        }}
      >
        {selectedFormRequest && (
          <CompleteFormScreen
            formRequest={selectedFormRequest}
            onBack={() => {
              setShowCompleteForm(false);
              setSelectedFormRequest(null);
              setShowFormularios(true);
            }}
            onComplete={() => {
              setShowCompleteForm(false);
              setSelectedFormRequest(null);
              // Recargar cantidad de formularios pendientes
              const activeStudent = getActiveStudent();
              if (user?._id && activeStudent?._id) {
                FormRequestService.getPendingForms(user._id, activeStudent._id)
                  .then(forms => {
                    setPendingFormsCount(forms.length);
                    // Verificar si aún hay formularios requeridos pendientes
                    return FormRequestService.checkRequiredFormsPending(user._id, activeStudent._id);
                  })
                  .then(hasRequired => {
                    setHasRequiredPending(hasRequired);
                    if (!hasRequired) {
                      setShowRequiredFormsModal(false);
                    }
                  })
                  .catch(error => console.error('Error recargando formularios:', error));
              }
            }}
          />
        )}
      </Modal>

      {/* Modal bloqueante para formularios requeridos pendientes */}
      <Modal
        visible={showRequiredFormsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.blockingModalOverlay}>
          <View style={styles.blockingModalContent}>
            <Text style={styles.blockingModalTitle}>
              Formularios Requeridos Pendientes
            </Text>
            <Text style={styles.blockingModalText}>
              Tienes formularios requeridos que deben ser completados antes de continuar.
            </Text>
            <TouchableOpacity
              style={styles.blockingModalButton}
              onPress={() => {
                setShowRequiredFormsModal(false);
                setShowFormularios(true);
              }}
            >
              <Text style={styles.blockingModalButtonText}>
                Ver Formularios Pendientes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Estilos para los iconos del bottom tab
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
    marginTop: 45,
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconImage: {
    width: 32,
    height: 32,
  },
  // Estilos para el bottom tab personalizado
  customTabBar: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 15,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  // Estilos para el modal del menú
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  menuModalContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  blockingModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockingModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  blockingModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  blockingModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  blockingModalButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
  },
  blockingModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen; 