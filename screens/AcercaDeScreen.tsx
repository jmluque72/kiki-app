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
        <Text style={styles.headerTitle}>ACERCA DE KIKI</Text>
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

        {/* Información de contacto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto y soporte</Text>
          <View style={styles.contactList}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('mailto:contacto.kikiapp@gmail.com')}
            >
              <Text style={styles.contactIcon}>📧</Text>
              <Text style={styles.contactText}>contacto.kikiapp@gmail.com</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={() => handleOpenLink('https://www.kiki.com.ar')}
            >
              <Text style={styles.contactIcon}>🌐</Text>
              <Text style={styles.contactText}>www.kiki.com.ar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOBRE KIKI</Text>
          <Text style={styles.description}>
            Kiki App es una plataforma que conecta a las familias con las instituciones educativas de forma segura, simple y emocional.{'\n\n'}
            A través de un entorno cuidado y privado, los profesores pueden compartir fotos, videos y momentos únicos del día a día en el aula, para que los padres disfruten, se emocionen y acompañen el crecimiento de sus hijos desde cualquier lugar.{'\n\n'}
            En Kiki, cada familia accede únicamente al contenido relacionado con su hijo.{'\n\n'}
            De esta manera, garantizamos un espacio de comunicación íntimo, confiable y lleno de alegría, donde la seguridad y la privacidad son prioridad. No se pueden descargar imágenes ni realizar capturas de pantalla, porque creemos que los recuerdos más valiosos merecen estar protegidos.{'\n\n'}
            Los profesores cuentan con una interfaz ágil e intuitiva que les permite subir contenido de manera rápida y organizada, asignando cada imagen o video a los alumnos correspondientes.{'\n'}
            Las instituciones, por su parte, disponen de un panel de control desde el cual pueden aprobar y supervisar las publicaciones, gestionar divisiones y mantener una comunicación fluida con docentes y familias.{'\n\n'}
            Para los padres, Kiki se convierte en una ventana emocional al aula, donde pueden revivir momentos inolvidables y guardar sus favoritos en un álbum personalizado, ordenado por fecha.{'\n'}
            Cada publicación puede marcarse con un corazón ❤️, generando una colección de recuerdos única, creada con amor.{'\n\n'}
            Kiki App nació con un propósito claro: fortalecer el vínculo entre familias, docentes e instituciones, acompañando la educación con emoción, transparencia y tecnología de última generación.{'\n\n'}
            Creemos que cada sonrisa, cada dibujo y cada logro merecen ser compartidos, y que la educación se construye juntos, día a día.
          </Text>
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
    backgroundColor: 'transparent', // Logo sin fondo
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