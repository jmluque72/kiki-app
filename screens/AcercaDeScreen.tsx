import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Image
} from 'react-native';

interface AcercaDeScreenProps {
  onBack: () => void;
}

const AcercaDeScreen: React.FC<AcercaDeScreenProps> = ({ onBack }) => {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Logo y título */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/design/icons/kiki_login.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Kiki App</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre la aplicación</Text>
          <Text style={styles.description}>
            Kiki App es una plataforma integral diseñada para facilitar la comunicación 
            entre instituciones educativas, familias y estudiantes. Nuestra misión es 
            crear un puente digital que conecte a toda la comunidad educativa de manera 
            segura y eficiente.
          </Text>
        </View>


        {/* Información de contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto y soporte</Text>
          <View style={styles.contactList}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:soporte@kikiapp.com')}
            >
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>soporte@kikiapp.com</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('tel:+5491123456789')}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>+54 9 11 2345-6789</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://www.kikiapp.com')}
            >
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={styles.contactText}>www.kikiapp.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información legal</Text>
          <Text style={styles.legalText}>
            © 2024 Kiki App. Todos los derechos reservados.{'\n'}
            Esta aplicación está protegida por las leyes de propiedad intelectual.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desarrollado con ❤️ para la comunidad educativa
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Agregar padding superior para el notch
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginLeft: 5, // Agregar margen izquierdo
  },
  backButtonText: {
    fontSize: 18,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  logoImage: {
    width: 200,
    height: 150,
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  contactList: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#0E5FCE',
    flex: 1,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default AcercaDeScreen;