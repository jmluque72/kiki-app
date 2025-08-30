import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotificationCenter from '../components/NotificationCenter';
import SuccessPopup from '../components/SuccessPopup';
import InstitutionSelector from '../components/InstitutionSelector';
import InicioScreen from './InicioScreen';
import AsistenciaScreen from './AsistenciaScreen';
import ActividadScreen from './ActividadScreen';
import EventosScreen from './EventosScreen';
import PerfilScreen from './PerfilScreen';

import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';

const Tab = createBottomTabNavigator();

const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const { selectedInstitution, userAssociations } = useInstitution();
  const [notificationCenterVisible, setNotificationCenterVisible] = useState(false);
  const [showInstitutionSelector, setShowInstitutionSelector] = useState(false);
  
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
      Alert.alert(
        'Sin Opciones',
        'Solo tienes una institución asociada.',
        [{ text: 'OK' }]
      );
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
  const getUserRole = () => user?.role?.nombre || '';
  
  const getVisibleTabs = () => {
    const role = getUserRole();
    
    // Pestañas base que todos ven
    const baseTabs = ['Inicio', 'Perfil'];
    
    // Pestañas específicas por rol
    if (role === 'coordinador') {
      // Coordinadores ven todas las pestañas: Inicio, Asistencia, Actividad, Eventos, Perfil
      return ['Inicio', 'Asistencia', 'Actividad', 'Eventos', 'Perfil'];
    } else if (role === 'familyadmin') {
      // Familyadmin ven: Inicio, Eventos, Perfil
      return ['Inicio', 'Eventos', 'Perfil'];
    } else if (role === 'familyviewer') {
      // Familyviewer ven: Inicio, Eventos, Perfil
      return ['Inicio', 'Eventos', 'Perfil'];
    } else {
      // Para otros roles, solo mostrar pestañas base
      return baseTabs;
    }
  };
  
  const visibleTabs = getVisibleTabs();
  
  // Debug: Log del rol del usuario y pestañas visibles
  console.log('🔍 [HomeScreen] Rol del usuario:', getUserRole());
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
          component={() => <InicioScreen onOpenNotifications={handleOpenNotifications} />}
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
        
        {/* Pestaña Asistencia - Solo para coordinadores */}
        {visibleTabs.includes('Asistencia') && (
          <Tab.Screen
            name="Asistencia"
            component={() => <AsistenciaScreen onOpenNotifications={handleOpenNotifications} />}
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
            component={() => <ActividadScreen onOpenNotifications={handleOpenNotifications} />}
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
        
        {/* Pestaña Eventos - Para coordinadores, familyadmin y familyviewer */}
        {visibleTabs.includes('Eventos') && (
          <Tab.Screen
            name="Eventos"
            component={() => <EventosScreen onOpenNotifications={handleOpenNotifications} />}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <View style={styles.tabIconContainer}>
                  <Image
                    source={require('../assets/design/icons/home_tab_4_star.png')}
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
          component={() => <PerfilScreen onOpenNotifications={handleOpenNotifications} />}
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
});

export default HomeScreen; 