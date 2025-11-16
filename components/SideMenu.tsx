import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useInstitution } from '../contexts/InstitutionContext';
import { getRoleDisplayName } from '../src/utils/roleTranslations';

interface SideMenuProps {
  navigation: any;
  onClose: () => void;
  onOpenActiveAssociation?: () => void;
  onOpenAssociations?: () => void;
  onOpenQuienRetira?: () => void;
  onOpenFamilyViewers?: () => void;
  onOpenAcercaDe?: () => void;
  onOpenTerminosCondiciones?: () => void;
  onOpenAcciones?: () => void;
  onOpenRetirar?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ navigation, onClose, onOpenActiveAssociation, onOpenAssociations, onOpenQuienRetira, onOpenFamilyViewers, onOpenAcercaDe, onOpenTerminosCondiciones, onOpenAcciones, onOpenRetirar }) => {
  const { user, logout, associations, activeAssociation } = useAuth();
  const { selectedInstitution } = useInstitution();

  // Verificar si el usuario es familyadmin (padre)
  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  
  // Verificar si el usuario es coordinador
  const isCoordinador = activeAssociation?.role?.nombre === 'coordinador';
  
  // Verificar si el usuario puede ver Acciones (coordinador, familyadmin, familyviewer)
  const canViewAcciones = ['coordinador', 'familyadmin', 'familyviewer'].includes(
    activeAssociation?.role?.nombre || user?.role?.nombre || ''
  );

  const menuItems = [
    // Mostrar "Acciones" para coordinadores y familias
    ...(canViewAcciones ? [{
      id: 'acciones',
      title: 'Acciones',
      onPress: () => {
        onClose();
        onOpenAcciones?.();
      }
    }] : []),
    // Solo mostrar "Retirar" para coordinadores
    ...(isCoordinador ? [{
      id: 'retirar',
      title: 'Retirar',
      onPress: () => {
        onClose();
        onOpenRetirar?.();
      }
    }] : []),
    // Solo mostrar "Quien Retira" para padres (familyadmin)
    ...(isFamilyAdmin ? [{
      id: 'quienRetira',
      title: 'Quien Retira',
      onPress: () => {
        onClose();
        onOpenQuienRetira?.();
      }
    }] : []),
    // Solo mostrar "Family Viewers" para padres (familyadmin)
    ...(isFamilyAdmin ? [{
      id: 'familyViewers',
      title: 'Visualizadores',
      onPress: () => {
        onClose();
        onOpenFamilyViewers?.();
      }
    }] : []),
        {
          id: 'documentos',
          title: 'Documentos',
          onPress: () => {
            onClose();
            onOpenTerminosCondiciones?.();
          }
        },
    {
      id: 'associations',
      title: 'Asociaciones',
      onPress: () => {
        onClose();
        onOpenAssociations?.();
      }
    },
    {
      id: 'acercaDe',
      title: 'Acerca de',
      onPress: () => {
        onClose();
        onOpenAcercaDe?.();
      }
    }
  ];

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Botón de cerrar - REMOVIDO (se cierra tocando fuera) */}
      
      {/* Header del menú */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {/* Avatar del usuario */}
          {user?.avatar ? (
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name || user?.nombre || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            {selectedInstitution && (
              <Text style={styles.institutionName}>
                {selectedInstitution.account.nombre}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Lista de opciones del menú */}
      <ScrollView style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuTitle}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer con botón de cerrar sesión */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Estilos del botón de cerrar - REMOVIDOS (ya no se usan)
  header: {
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0E5FCE',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  userEmail: {
    fontSize: 13,
    color: '#E8F0FE',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#E8F0FE',
    marginBottom: 2,
  },
  institutionName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 15,
  },
  menuItem: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    // Borde izquierdo azul removido
  },
  menuTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#F8F9FA',
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SideMenu;
