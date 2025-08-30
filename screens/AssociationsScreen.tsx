import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useInstitution } from '../contexts/InstitutionContext';
import CommonHeader from '../components/CommonHeader';

const AssociationsScreen = ({ navigation }: { navigation: any }) => {
  const { userAssociations } = useInstitution();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#28A745';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#DC3545';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'pending':
        return 'Pendiente';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <View style={styles.container}>
              <CommonHeader onOpenNotifications={() => {}} activeStudent={null} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Mis Asociaciones</Text>
        </View>

        <View style={styles.associationsContainer}>
          {userAssociations.map((association) => (
            <View key={association._id} style={styles.associationItem}>
              <View style={styles.associationHeader}>
                <Text style={styles.institutionName}>
                  {association.account.nombre}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(association.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(association.status)}
                  </Text>
                </View>
              </View>
              
              {association.division && (
                <Text style={styles.divisionName}>
                  División: {association.division.nombre}
                </Text>
              )}
              
              <Text style={styles.roleName}>
                Rol: {association.role?.nombre || 'Usuario'}
              </Text>
              
              <Text style={styles.dateText}>
                Asociado desde: {new Date(association.createdAt).toLocaleDateString('es-ES')}
              </Text>
            </View>
          ))}
        </View>

        {userAssociations.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes asociaciones</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Agregar Asociación</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  associationsContainer: {
    padding: 20,
  },
  associationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  associationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  institutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divisionName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssociationsScreen;
