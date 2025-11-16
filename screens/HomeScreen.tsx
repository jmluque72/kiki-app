import React, { useState, useEffect } from 'react';
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
// import PushNotificationService from '../src/services/pushNotificationService';

const Tab = createBottomTabNavigator();

interface HomeScreenProps {
  onOpenActiveAssociation?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenActiveAssociation }) => {
  const { user, activeAssociation } = useAuth();
  const { selectedInstitution, userAssociations, getActiveInstitution } = useInstitution();
  const { showMenu, openMenu, closeMenu } = useSideMenu();
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  const [showAssociations, setShowAssociations] = useState(false);
  const [showQuienRetira, setShowQuienRetira] = useState(false);
  const [showRetirar, setShowRetirar] = useState(false);
  const [showAcercaDe, setShowAcercaDe] = useState(false);
  const [showTerminosCondiciones, setShowTerminosCondiciones] = useState(false);
  const [showAcciones, setShowAcciones] = useState(false);
  
  // Re-renderizar cuando cambie la asociación activa
  useEffect(() => {
    console.log('🔄 [HomeScreen] Asociación activa cambió:', activeAssociation);
  }, [activeAssociation]);

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
});

export default HomeScreen; 