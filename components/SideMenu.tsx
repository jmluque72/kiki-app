import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useInstitution } from '../contexts/InstitutionContext';
import { getRoleDisplayName } from '../src/utils/roleTranslations';

interface SideMenuProps {
  navigation: any;
  onClose: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ navigation, onClose }) => {
  const { user, logout } = useAuth();
  const { selectedInstitution } = useInstitution();

  const menuItems = [
    {
      id: 'profile',
      title: 'Perfil',
      onPress: () => {
        onClose();
        // Navegar a la pantalla de perfil
      }
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      onPress: () => {
        onClose();
        // Navegar a notificaciones
      }
    },
    {
      id: 'associations',
      title: 'Asociaciones',
      onPress: () => {
        onClose();
        // Navegar a asociaciones
      }
    },
    {
      id: 'settings',
      title: 'Configuración',
      onPress: () => {
        onClose();
        // Navegar a configuración
      }
    },
    {
      id: 'help',
      title: 'Ayuda',
      onPress: () => {
        onClose();
        // Navegar a ayuda
      }
    },
    {
      id: 'about',
      title: 'Acerca de',
      onPress: () => {
        onClose();
        // Navegar a acerca de
      }
    }
  ];

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <View style={styles.container}>
      {/* Header del menú */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text>
            <Text style={styles.userRole}>{getRoleDisplayName(user?.role?.nombre || '') || 'Usuario'}</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0E5FCE',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#E8F0FE',
    marginBottom: 2,
  },
  institutionName: {
    fontSize: 12,
    color: '#E8F0FE',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  logoutButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SideMenu;
