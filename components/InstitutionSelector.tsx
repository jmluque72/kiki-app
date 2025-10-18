import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { fonts } from '../src/config/fonts';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContextHybrid';

interface InstitutionSelectorProps {
  onInstitutionSelected: () => void;
}

const InstitutionSelector: React.FC<InstitutionSelectorProps> = ({ onInstitutionSelected }) => {
  const { userAssociations, selectedInstitution, setSelectedInstitution } = useInstitution();
  const { user } = useAuth();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleInstitutionSelect = (institution: any) => {
    console.log('🏫 [InstitutionSelector] Seleccionando institución:', {
      id: institution._id,
      account: institution.account.nombre,
      division: institution.division?.nombre,
      student: institution.student ? {
        name: institution.student.nombre,
        avatar: institution.student.avatar ? 'Sí' : 'No'
      } : null
    });
    
    setSelectedInstitution(institution);
    setIsSelecting(false);
    onInstitutionSelected();
  };

  const handleChangeInstitution = () => {
    setIsSelecting(true);
  };

  const getRoleDisplayName = (roleName: string) => {
    switch (roleName) {
      case 'familyviewer':
        return 'Visualizador';
      case 'familyadmin':
        return 'Administrador Familiar';
      case 'coordinador':
        return 'Coordinador';
      default:
        return roleName;
    }
  };

  if (userAssociations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Sin Asociaciones</Text>
          <Text style={styles.message}>
            No tienes asociaciones activas en el sistema.
          </Text>
          <Text style={styles.subMessage}>
            Contacta al administrador para que te asigne a una institución.
          </Text>
        </View>
      </View>
    );
  }

  if (userAssociations.length === 1 && !isSelecting) {
    const institution = userAssociations[0];
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.welcomeText}>
            {user?.name || 'Usuario'}
          </Text>
          
          <View style={styles.institutionCard}>
            <View style={styles.institutionHeader}>
              <Text style={styles.institutionName}>
                {institution.account.nombre}
              </Text>
              <Text style={styles.roleBadge}>
                {getRoleDisplayName(institution.role.nombre)}
              </Text>
            </View>
            
            {institution.division && (
              <Text style={styles.divisionText}>
                División: {institution.division.nombre}
              </Text>
            )}
            
            {institution.student && (
              <View style={styles.studentSection}>
                <View style={styles.studentAvatarContainer}>
                  {institution.student.avatar ? (
                    <Image
                      source={{ uri: institution.student.avatar }}
                      style={styles.studentAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.studentAvatarPlaceholder}>👤</Text>
                  )}
                </View>
                <Text style={styles.studentName}>
                  {institution.student.nombre} {institution.student.apellido}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => handleInstitutionSelect(institution)}
          >
            <Text style={styles.continueButtonText}>
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Selecciona una Institución</Text>
        <Text style={styles.subtitle}>
          Tienes {userAssociations.length} asociación{userAssociations.length > 1 ? 'es' : ''} disponible{userAssociations.length > 1 ? 's' : ''}
        </Text>
        
        <ScrollView style={styles.institutionsList} showsVerticalScrollIndicator={false}>
          {userAssociations.map((institution, index) => (
            <TouchableOpacity
              key={institution._id}
              style={styles.institutionCard}
              onPress={() => handleInstitutionSelect(institution)}
            >
              <View style={styles.institutionHeader}>
                <Text style={styles.institutionName}>
                  {institution.account.nombre}
                </Text>
                <Text style={styles.roleBadge}>
                  {getRoleDisplayName(institution.role.nombre)}
                </Text>
              </View>
              
              {institution.division && (
                <Text style={styles.divisionText}>
                  División: {institution.division.nombre}
                </Text>
              )}
              
              {institution.student && (
                <View style={styles.studentSection}>
                  <View style={styles.studentAvatarContainer}>
                    {institution.student.avatar ? (
                      <Image
                        source={{ uri: institution.student.avatar }}
                        style={styles.studentAvatar}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.studentAvatarPlaceholder}>👤</Text>
                    )}
                  </View>
                  <Text style={styles.studentName}>
                    {institution.student.nombre} {institution.student.apellido}
                  </Text>
                </View>
              )}
              
              <Text style={styles.selectText}>
                Seleccionar
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {selectedInstitution && !isSelecting && (
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangeInstitution}
          >
            <Text style={styles.changeButtonText}>
              Cambiar Institución
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E5FCE',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3D4F1',
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginBottom: 30,
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 15,
  },
  subMessage: {
    fontSize: 14,
    color: '#B3D4F1',
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  institutionsList: {
    flex: 1,
  },
  institutionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  institutionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  institutionName: {
    fontSize: 18,
    color: '#0E5FCE',
    fontFamily: fonts.bold,
    flex: 1,
  },
  roleBadge: {
    backgroundColor: '#FF8C42',
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.medium,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  divisionText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: fonts.regular,
    marginBottom: 15,
  },
  studentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  studentAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  studentAvatarPlaceholder: {
    fontSize: 20,
    color: '#999999',
  },
  studentName: {
    fontSize: 16,
    color: '#333333',
    fontFamily: fonts.medium,
  },
  selectText: {
    fontSize: 14,
    color: '#0E5FCE',
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: 10,
  },
  continueButton: {
    backgroundColor: '#FF8C42',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  changeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  changeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});

export default InstitutionSelector; 