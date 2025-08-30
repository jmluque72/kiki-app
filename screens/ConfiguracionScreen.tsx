import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from 'react-native';
import CommonHeader from '../components/CommonHeader';

const ConfiguracionScreen = ({ onOpenNotifications }: { onOpenNotifications: () => void }) => {
  return (
    <View style={styles.homeContainer}>
              <CommonHeader onOpenNotifications={onOpenNotifications} activeStudent={null} />
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.configuracionContainer}>
          <Text style={styles.screenTitle}>Configuración</Text>
          <Text style={styles.screenText}>Pantalla de Configuración</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // Reducido para eliminar espacio extra
  },
  scrollContainer: {
    flex: 1,
  },
  configuracionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 10,
  },
  screenText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ConfiguracionScreen; 