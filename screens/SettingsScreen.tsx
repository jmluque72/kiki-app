import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import CommonHeader from '../components/CommonHeader';

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const settingsSections = [
    {
      title: 'Notificaciones',
      items: [
        {
          id: 'notifications',
          title: 'Notificaciones push',
          subtitle: 'Recibir notificaciones de eventos y actividades',
          type: 'switch',
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Apariencia',
      items: [
        {
          id: 'darkMode',
          title: 'Modo oscuro',
          subtitle: 'Cambiar entre tema claro y oscuro',
          type: 'switch',
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
        },
      ],
    },
    {
      title: 'Sincronización',
      items: [
        {
          id: 'autoSync',
          title: 'Sincronización automática',
          subtitle: 'Sincronizar datos automáticamente',
          type: 'switch',
          value: autoSyncEnabled,
          onValueChange: setAutoSyncEnabled,
        },
        {
          id: 'manualSync',
          title: 'Sincronizar ahora',
          subtitle: 'Sincronizar datos manualmente',
          type: 'button',
          onPress: () => {
            Alert.alert('Sincronización', 'Sincronizando datos...');
          },
        },
      ],
    },
    {
      title: 'Datos',
      items: [
        {
          id: 'clearCache',
          title: 'Limpiar caché',
          subtitle: 'Eliminar datos temporales de la aplicación',
          type: 'button',
          onPress: () => {
            Alert.alert(
              'Limpiar caché',
              '¿Estás seguro de que quieres limpiar la caché?',
              [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Limpiar', style: 'destructive' },
              ]
            );
          },
        },
        {
          id: 'exportData',
          title: 'Exportar datos',
          subtitle: 'Exportar tus datos personales',
          type: 'button',
          onPress: () => {
            Alert.alert('Exportar datos', 'Funcionalidad en desarrollo');
          },
        },
      ],
    },
    {
      title: 'Información',
      items: [
        {
          id: 'version',
          title: 'Versión de la aplicación',
          subtitle: '1.0.0',
          type: 'info',
        },
        {
          id: 'terms',
          title: 'Términos y condiciones',
          subtitle: 'Leer términos y condiciones',
          type: 'button',
          onPress: () => {
            Alert.alert('Términos y condiciones', 'Funcionalidad en desarrollo');
          },
        },
        {
          id: 'privacy',
          title: 'Política de privacidad',
          subtitle: 'Leer política de privacidad',
          type: 'button',
          onPress: () => {
            Alert.alert('Política de privacidad', 'Funcionalidad en desarrollo');
          },
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'switch':
        return (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#E0E0E0', true: '#0E5FCE' }}
              thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        );
      case 'button':
        return (
          <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        );
      case 'info':
        return (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>{item.title}</Text>
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
              <CommonHeader onOpenNotifications={() => {}} activeStudent={null} />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Configuración</Text>
        </View>

        <View style={styles.settingsContainer}>
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <View key={item.id}>
                    {renderSettingItem(item)}
                    {itemIndex < section.items.length - 1 && (
                      <View style={styles.separator} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
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
  settingsContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 18,
    color: '#999999',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 20,
  },
});

export default SettingsScreen;
