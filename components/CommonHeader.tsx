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
import { useNotifications } from '../src/hooks/useNotifications';
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
  const { selectedInstitution, userAssociations, getActiveInstitution } = useInstitution();
  const { user, activeAssociation } = useAuth();
  const { unreadCount } = useNotifications();

  // Obtener la institución activa desde la asociación activa
  const activeInstitution = getActiveInstitution();

  // Debug logs
  const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
  console.log('🔍 [CommonHeader] Props recibidas:', {
    userRole: user?.role?.nombre,
    activeAssociationRole: activeAssociation?.role?.nombre,
    currentRole: currentRole,
    activeStudent: activeStudent ? {
      id: activeStudent._id,
      name: activeStudent.nombre,
      avatar: activeStudent.avatar
    } : null,
    activeAssociationStudent: activeAssociation?.student ? {
      id: activeAssociation.student._id,
      name: activeAssociation.student.nombre,
      avatar: activeAssociation.student.avatar
    } : null,
    userAssociationsCount: userAssociations.length
  });

  const getInstitutionName = () => {
    if (activeInstitution?.account) {
      return activeInstitution.account.nombre;
    }
    return 'La Salle'; // Fallback
  };

  const getDivisionName = () => {
    if (activeInstitution?.division?.nombre) {
      return activeInstitution.division.nombre;
    }
    return 'Todas';
  };

  const getRoleDisplayNameLocal = () => {
    if (activeAssociation?.role?.nombre) {
      return getRoleDisplayName(activeAssociation.role.nombre);
    }
    if (user?.role?.nombre) {
      return getRoleDisplayName(user.role.nombre);
    }
    return '';
  };

  const getStudentData = () => {
    // Obtener el rol actual (priorizar el rol de la asociación activa)
    const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
    
    console.log('🔍 [CommonHeader] getStudentData - currentRole:', currentRole);
    
    // Solo mostrar datos del estudiante para roles familiares
    if (currentRole === 'familyadmin' || currentRole === 'familyviewer') {
      // Usar el estudiante de la asociación activa si está disponible
      if (activeAssociation?.student) {
        console.log('🔍 [CommonHeader] getStudentData - Usando estudiante de asociación activa:', {
          nombre: activeAssociation.student.nombre,
          apellido: activeAssociation.student.apellido
        });
        return {
          nombre: activeAssociation.student.nombre,
          apellido: activeAssociation.student.apellido
        };
      }
      
      // Fallback al activeStudent prop
      if (activeStudent) {
        console.log('🔍 [CommonHeader] getStudentData - Usando activeStudent prop:', {
          nombre: activeStudent.nombre,
          apellido: activeStudent.apellido
        });
        return {
          nombre: activeStudent.nombre,
          apellido: activeStudent.apellido
        };
      }
    }
    
    // Para coordinadores y otros roles, no mostrar datos del estudiante
    console.log('🔍 [CommonHeader] getStudentData - No mostrar estudiante para rol:', currentRole);
    return null;
  };

  const getStudentName = () => {
    const studentData = getStudentData();
    if (studentData) {
      return `${studentData.nombre} ${studentData.apellido}`;
    }
    return '';
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
          {/* Badge de notificaciones sin leer */}
          {(() => {
            const currentRole = activeInstitution?.role?.nombre || user?.role?.nombre;
            return (currentRole === 'familyadmin' || currentRole === 'familyviewer') ? (
              unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )
            ) : null;
          })()}
        </TouchableOpacity>
      </View>

      {/* Sección azul dividida en 3 partes */}
      <View style={styles.greetingSection}>
        {/* Nombre del Estudiante y Rol */}
        <View style={styles.sectionPart}>
          {(() => {
            const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
            const studentData = getStudentData();
            
            // Para roles familiares, mostrar nombre y apellido en líneas separadas
            if ((currentRole === 'familyadmin' || currentRole === 'familyviewer') && studentData) {
              return (
                <>
                  <Text style={styles.sectionValue}>
                    {studentData.nombre}
                  </Text>
                  <Text style={styles.sectionValue}>
                    {studentData.apellido}
                  </Text>
                  {getRoleDisplayNameLocal() && (
                    <Text style={styles.roleText}>
                      {getRoleDisplayNameLocal()}
                    </Text>
                  )}
                </>
              );
            }
            
            // Para otros roles, mostrar el nombre completo en una línea
            if (getStudentName()) {
              return (
                <>
                  <Text style={styles.sectionValue}>
                    {getStudentName()}
                  </Text>
                  {getRoleDisplayNameLocal() && (
                    <Text style={styles.roleText}>
                      {getRoleDisplayNameLocal()}
                    </Text>
                  )}
                </>
              );
            }
            
            // Si no hay estudiante, solo mostrar el rol
            if (getRoleDisplayNameLocal()) {
              return (
                <Text style={styles.roleText}>
                  {getRoleDisplayNameLocal()}
                </Text>
              );
            }
            
            return null;
          })()}
        </View>
        
        {/* Avatar centrado */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            {(() => {
              const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
              
              console.log('🖼️ [CommonHeader] Avatar logic - currentRole:', currentRole);
              console.log('🖼️ [CommonHeader] Avatar logic - user?.avatar:', user?.avatar);
              console.log('🖼️ [CommonHeader] Avatar logic - activeAssociation?.student?.avatar:', activeAssociation?.student?.avatar);
              console.log('🖼️ [CommonHeader] Avatar logic - activeStudent?.avatar:', activeStudent?.avatar);
              
              if (currentRole === 'coordinador' && user?.avatar) {
                console.log('🖼️ [CommonHeader] Mostrando avatar del coordinador');
                return (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                );
              } else if ((currentRole === 'familyadmin' || currentRole === 'familyviewer') && activeAssociation?.student?.avatar) {
                console.log('🖼️ [CommonHeader] Mostrando avatar del estudiante desde activeAssociation');
                return (
                  <Image 
                    source={{ uri: activeAssociation.student.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                );
              } else if ((currentRole === 'familyadmin' || currentRole === 'familyviewer') && activeStudent?.avatar) {
                console.log('🖼️ [CommonHeader] Mostrando avatar del estudiante desde activeStudent prop');
                return (
                  <Image 
                    source={{ uri: activeStudent.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                );
              } else {
                console.log('🖼️ [CommonHeader] Mostrando placeholder - no se encontró avatar');
                return <Text style={styles.avatarIcon}>👤</Text>;
              }
            })()}
          </View>
        </View>
        
        {/* Institución y División */}
        <View style={styles.sectionPart}>
          <Text style={styles.sectionValue}>{getInstitutionName()}</Text>
          <Text style={styles.divisionText}>
            {getDivisionName()}
          </Text>
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
  studentNameText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  divisionText: {
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
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CommonHeader; 