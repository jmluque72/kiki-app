import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContext';
import { getRoleDisplayName } from '../src/utils/roleTranslations';

interface CommonHeaderProps {
  onOpenNotifications: () => void;
  onOpenMenu?: () => void;
  activeStudent?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ onOpenNotifications, onOpenMenu, activeStudent }) => {
  const { selectedInstitution, userAssociations } = useInstitution();
  const { user } = useAuth();

  // Debug logs
  console.log('🔍 [CommonHeader] Props recibidas:', {
    userRole: user?.role?.nombre,
    activeStudent: activeStudent ? {
      id: activeStudent._id,
      name: activeStudent.nombre,
      avatar: activeStudent.avatar
    } : null,
    userAssociationsCount: userAssociations.length
  });

  // Usar la primera institución si no hay ninguna seleccionada
  const effectiveInstitution = selectedInstitution || (userAssociations.length > 0 ? userAssociations[0] : null);

  const getInstitutionName = () => {
    if (effectiveInstitution) {
      return effectiveInstitution.account.nombre;
    }
    return 'La Salle'; // Fallback
  };

  const getDivisionName = () => {
    // Si hay una institución seleccionada con división, usarla
    if (selectedInstitution?.division?.nombre) {
      return selectedInstitution.division.nombre;
    }
    
    // Si no hay institución seleccionada, buscar una asociación con división
    if (userAssociations.length > 0) {
      const associationWithDivision = userAssociations.find(assoc => assoc.division?.nombre);
      if (associationWithDivision?.division?.nombre) {
        return associationWithDivision.division.nombre;
      }
    }
    
    return 'Todas';
  };

  const getRoleDisplayNameLocal = () => {
    if (!user?.role?.nombre) return '';
    return getRoleDisplayName(user.role.nombre);
  };

  return (
    <>
      {/* Header personalizado */}
      <View style={styles.homeHeader}>
        {onOpenMenu && (
          <TouchableOpacity style={styles.menuIcon} onPress={onOpenMenu}>
            <Text style={styles.menuIconText}>☰</Text>
          </TouchableOpacity>
        )}
        <Image
          source={require('../assets/design/icons/kiki_logo_header.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <TouchableOpacity style={styles.messageIcon} onPress={onOpenNotifications}>
          <Image
            source={require('../assets/design/icons/email.png')}
            style={[styles.messageIconImage, {}]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Sección azul dividida en 3 partes */}
      <View style={styles.greetingSection}>
        {/* División y Rol */}
        <View style={styles.sectionPart}>
          <Text style={styles.sectionValue}>
            {getDivisionName()}
          </Text>
          {getRoleDisplayNameLocal() && (
            <Text style={styles.roleText}>
              {getRoleDisplayNameLocal()}
            </Text>
          )}
        </View>
        
        {/* Avatar centrado */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {user?.role?.nombre === 'coordinador' && user?.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (user?.role?.nombre === 'familyadmin' || user?.role?.nombre === 'familyviewer') && activeStudent?.avatar ? (
              <Image 
                source={{ uri: activeStudent.avatar }} 
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarIcon}>👤</Text>
            )}
          </View>
        </View>
        
        {/* Institución */}
        <View style={styles.sectionPart}>
          <Text style={styles.sectionValue}>{getInstitutionName()}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 0, // Reducido de 15 a 0
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 5,
  },
  headerLogo: {
    width: 120,
    height: 45,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 60,
  },
  messageIconImage: {
    width: 32,
    height: 32
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
    top: 60,
  },
  menuIconText: {
    fontSize: 24,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },

  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0E5FCE',
    paddingHorizontal: 0,
    paddingVertical: 15,
    marginHorizontal: 0,
    marginTop: 60, // Reducido para que esté completamente pegado al header
  },
  sectionPart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  sectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  avatarSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
});

export default CommonHeader; 