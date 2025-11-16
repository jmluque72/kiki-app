import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useNotifications } from '../src/hooks/useNotifications';
import { getRoleDisplayName } from '../src/utils/roleTranslations';

interface CommonHeaderProps {
  onOpenNotifications: () => void;
  onOpenMenu?: () => void;
  showMenuButton?: boolean;
  activeStudent?: {
    _id: string;
    nombre: string;
    apellido: string;
    avatar?: string;
  } | null;
  onOpenActiveAssociation?: () => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({ onOpenNotifications, onOpenMenu, showMenuButton = false, activeStudent, onOpenActiveAssociation }) => {
  const { selectedInstitution, userAssociations, getActiveInstitution, getActiveStudent } = useInstitution();
  
  // Verificación de seguridad para useAuth
  let user, activeAssociation;
  try {
    const authContext = useAuth();
    user = authContext.user;
    activeAssociation = authContext.activeAssociation;
  } catch (error) {
    console.error('❌ [CommonHeader] Error accediendo a useAuth:', error);
    // Valores por defecto si hay error
    user = null;
    activeAssociation = null;
  }
  
  const { unreadCount } = useNotifications();

  // Obtener la institución activa desde la asociación activa
  const activeInstitution = getActiveInstitution();

  // Debug: Log para verificar onOpenActiveAssociation
  console.log('🔍 [CommonHeader] onOpenActiveAssociation prop:', !!onOpenActiveAssociation);
  console.log('🔍 [CommonHeader] activeAssociation?.role?.nombre:', activeAssociation?.role?.nombre);
  console.log('🔍 [CommonHeader] user?.role?.nombre:', user?.role?.nombre);

  // Debug logs
  const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
  console.log('🔍 [CommonHeader] ===== PROPS RECIBIDAS =====');
  console.log('🔍 [CommonHeader] userRole:', user?.role?.nombre);
  console.log('🔍 [CommonHeader] activeAssociationRole:', activeAssociation?.role?.nombre);
  console.log('🔍 [CommonHeader] currentRole:', currentRole);
  console.log('🔍 [CommonHeader] activeStudent:', activeStudent ? {
    id: activeStudent._id,
    name: activeStudent.nombre,
    avatar: activeStudent.avatar
  } : null);
  console.log('🔍 [CommonHeader] activeAssociationStudent:', activeAssociation?.student ? {
    id: activeAssociation.student._id,
    name: activeAssociation.student.nombre,
    avatar: activeAssociation.student.avatar,
    avatarType: activeAssociation.student.avatar ? (activeAssociation.student.avatar.startsWith('http') ? 'URL completa' : 'Key de S3') : 'Sin avatar'
  } : null);
  console.log('🔍 [CommonHeader] userAssociationsCount:', userAssociations.length);

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
          apellido: activeAssociation.student.apellido,
          avatar: activeAssociation.student.avatar,
          avatarType: activeAssociation.student.avatar ? (activeAssociation.student.avatar.startsWith('http') ? 'URL completa' : 'Key de S3') : 'Sin avatar'
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
        {/* Nombre del Estudiante/Coordinador y Rol */}
        <View style={styles.sectionPart}>
          {(() => {
            const currentRole = activeAssociation?.role?.nombre || user?.role?.nombre;
            const studentData = getStudentData();
            
            // Para coordinadores, mostrar nombre del coordinador
            if (currentRole === 'coordinador' && user?.name) {
              return (
                <>
                  <Text style={styles.sectionValue}>
                    {user.name}
                  </Text>
                  {getRoleDisplayNameLocal() && (
                    <Text style={styles.roleText}>
                      {getRoleDisplayNameLocal()}
                    </Text>
                  )}
                </>
              );
            }
            
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
                <>
                  <Text style={styles.roleText}>
                    {getRoleDisplayNameLocal()}
                  </Text>
                </>
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
              
              // Para coordinadores, mostrar su propio avatar
              if (currentRole === 'coordinador' && user?.avatar) {
                console.log('🖼️ [CommonHeader] Mostrando avatar del coordinador');
                return (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('❌ [CommonHeader] Error cargando avatar del coordinador:', {
                        message: error?.message || 'Error desconocido',
                        nativeEvent: error?.nativeEvent || null,
                        uri: user?.avatar || 'Sin URI'
                      });
                    }}
                  />
                );
              } 
              
              // Para familyadmin y familyviewer, mostrar avatar del estudiante
              if (currentRole === 'familyadmin' || currentRole === 'familyviewer') {
                console.log('🖼️ [CommonHeader] ===== PROCESANDO AVATAR PARA ROL FAMILIAR =====');
                console.log('🖼️ [CommonHeader] activeAssociation?.student?.avatar:', activeAssociation?.student?.avatar);
                console.log('🖼️ [CommonHeader] activeStudent?.avatar:', activeStudent?.avatar);
                
                // Prioridad 1: Avatar del estudiante desde activeAssociation
                if (activeAssociation?.student?.avatar) {
                  console.log('✅ [CommonHeader] Mostrando avatar del estudiante desde activeAssociation');
                  console.log('🔗 [CommonHeader] URI del avatar:', activeAssociation.student.avatar);
                  return (
                    <Image 
                      source={{ uri: activeAssociation.student.avatar }} 
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onLoad={() => {
                        console.log('✅ [CommonHeader] Avatar del estudiante cargado exitosamente');
                      }}
                      onError={(error) => {
                        console.error('❌ [CommonHeader] Error cargando avatar del estudiante desde activeAssociation:', error);
                        console.error('❌ [CommonHeader] URI que falló:', activeAssociation.student.avatar);
                      }}
                    />
                  );
                }
                
                // Prioridad 2: Avatar del estudiante desde activeStudent prop
                if (activeStudent?.avatar) {
                  console.log('✅ [CommonHeader] Mostrando avatar del estudiante desde activeStudent prop');
                  console.log('🔗 [CommonHeader] URI del avatar:', activeStudent.avatar);
                  return (
                    <Image 
                      source={{ uri: activeStudent.avatar }} 
                      style={styles.avatarImage}
                      resizeMode="cover"
                      onLoad={() => {
                        console.log('✅ [CommonHeader] Avatar del estudiante cargado exitosamente');
                      }}
                      onError={(error) => {
                        console.error('❌ [CommonHeader] Error cargando avatar del estudiante desde activeStudent:', error);
                        console.error('❌ [CommonHeader] URI que falló:', activeStudent.avatar);
                      }}
                    />
                  );
                }
                
                // Si no hay avatar del estudiante, mostrar placeholder
                console.log('⚠️ [CommonHeader] No se encontró avatar del estudiante para', currentRole);
                console.log('⚠️ [CommonHeader] activeAssociation?.student:', activeAssociation?.student);
                console.log('⚠️ [CommonHeader] activeStudent:', activeStudent);
                return <Text style={styles.avatarIcon}>👤</Text>;
              }
              
              // Para otros roles, mostrar placeholder
              console.log('🖼️ [CommonHeader] Mostrando placeholder para rol:', currentRole);
              return <Text style={styles.avatarIcon}>👤</Text>;
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
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 10,
    top: 50,
  },
  menuIconText: {
    fontSize: 38,
    color: '#0E5FCE',
    fontWeight: '900',
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
  activeProfileText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
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
    overflow: 'hidden',
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