import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
// import Ionicons from 'react-native-just-timeline/node_modules/react-native-vector-icons/Ionicons';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../src/hooks/useEvents';
import CommonHeader from '../components/CommonHeader';
import WeeklyCalendar from '../components/WeeklyCalendar';

const EventosScreen = ({ onOpenNotifications }: { onOpenNotifications: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  const { user } = useAuth();
  const { events, upcomingEvents, pastEvents, loading, error, createEvent } = useEvents();
  const [selectedTab, setSelectedTab] = useState<'crear' | 'visualizar' | 'notificaciones'>('visualizar');

  // Estados para el calendario semanal
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

  // Estados para crear evento
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventoFecha, setEventoFecha] = useState('');
  const [eventoHora, setEventoHora] = useState('');
  const [eventoTitulo, setEventoTitulo] = useState('');
  const [eventoDescripcion, setEventoDescripcion] = useState('');
  const [eventoLugar, setEventoLugar] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const toLocalISO = (d: Date) => {
    const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().split('T')[0];
  };

  const [selectedDateValue, setSelectedDateValue] = useState(toLocalISO(new Date()));

  // Estados para notificaciones
  const [activeNotificationTab, setActiveNotificationTab] = useState('recibidas');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    target: 'all'
  });

  // Funciones para el calendario semanal
  const handleWeekChange = (date: Date) => {
    setCurrentWeek(date);
  };

  const handleDayPress = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  // Formatear fecha para comparación
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Mapear eventos por día para el calendario semanal
  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {};
    events.forEach((ev) => {
      const evDate = new Date(ev.fecha);
      const iso = formatDate(evDate);
      if (!map[iso]) map[iso] = [] as any;
      (map[iso] as any).push(ev);
    });
    return map;
  }, [events]);

  const getInstitutionName = () => {
    if (selectedInstitution) {
      return selectedInstitution.account.nombre;
    }
    if (userAssociations.length === 1) {
      return userAssociations[0].account.nombre;
    }
    return 'La Salle';
  };

  // Verificar si el usuario es coordinador
  const isCoordinador = user?.role?.nombre === 'coordinador';
  // Verificar si el usuario es tutor (familyadmin)

  // Debug temporal para verificar el rol
  console.log('EventosScreen - Usuario:', user?.nombre);
  console.log('EventosScreen - Rol completo:', user?.role);
  console.log('EventosScreen - Rol nombre:', user?.role?.nombre);
  console.log('EventosScreen - Es coordinador:', isCoordinador);

  // Mock de notificaciones
  const notifications = [
    {
      id: '1',
      title: 'Nuevo evento creado',
      message: 'Se ha creado un nuevo evento: Visita al ZOO',
      time: 'Hace 2 horas',
      read: false,
    },
    {
      id: '2',
      title: 'Recordatorio de actividad',
      message: 'No olvides completar la actividad de hoy',
      time: 'Hace 1 día',
      read: true,
    },
    {
      id: '3',
      title: 'Asociación aprobada',
      message: 'Tu asociación con la institución ha sido aprobada',
      time: 'Hace 3 días',
      read: true,
    },
  ];

  // Función para enviar notificaciones
  const handleSendNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    Alert.alert('Éxito', 'Notificación enviada correctamente');
    setNewNotification({ title: '', message: '', target: 'all' });
  };

  // Funciones para manejar selectores de fecha y hora
  const showDateSelector = () => {
    setShowDatePicker(true);
  };

  const showTimeSelector = () => {
    setShowTimePicker(true);
  };

  const resetForm = () => {
    setEventoFecha('');
    setEventoHora('');
    setEventoTitulo('');
    setEventoDescripcion('');
    setEventoLugar('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setSelectedDateValue(new Date().toISOString().split('T')[0]);
  };

  // Generar opciones de fecha (próximos 30 días)
  const generateDateOptions = () => {
    const options = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const displayDate = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      options.push({ value: dateString, label: displayDate });
    }
    return options;
  };

  // Generar opciones de hora (cada 15 minutos)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push({ value: timeString, label: timeString });
      }
    }
    return options;
  };

  const handleCreateEvent = async () => {
    if (!eventoFecha || !eventoHora || !eventoTitulo || !eventoDescripcion) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      // Formatear fecha para el backend
      const fecha = selectedDateValue;
      const hora = eventoHora;

      const success = await createEvent({
        titulo: eventoTitulo,
        descripcion: eventoDescripcion,
        fecha: fecha,
        hora: hora,
        lugar: eventoLugar
      });

      if (success) {
        resetForm();
        setSelectedTab('visualizar');
      } else {
        Alert.alert('Error', 'No se pudo crear el evento');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el evento';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.homeContainer}>
              <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          activeStudent={getActiveStudent()}
        />

      <ScrollView style={styles.scrollContainer}>
        {/* Título EVENTOS */}
        <View style={styles.eventosTitle}>
          <Text style={styles.eventosTitleText}>EVENTOS</Text>
        </View>

        {/* Pestañas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'visualizar' && styles.tabActive]}
            onPress={() => setSelectedTab('visualizar')}
          >
            <Text style={[styles.tabText, selectedTab === 'visualizar' && styles.tabTextActive]}>
              Eventos
            </Text>
          </TouchableOpacity>
          
          {isCoordinador && (
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'crear' && styles.tabActive]}
              onPress={() => setSelectedTab('crear')}
            >
              <Text style={[styles.tabText, selectedTab === 'crear' && styles.tabTextActive]}>
                Crear
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'notificaciones' && styles.tabActive]}
            onPress={() => setSelectedTab('notificaciones')}
          >
            <Text style={[styles.tabText, selectedTab === 'notificaciones' && styles.tabTextActive]}>
              Notificaciones
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido de las pestañas */}
        {selectedTab === 'visualizar' ? (
          // PESTAÑA DE VISUALIZACIÓN (para todos)
          <View>
            {/* Calendario semanal */}
            <WeeklyCalendar
              currentWeek={currentWeek}
              onWeekChange={handleWeekChange}
              eventsByDate={eventsByDate}
              onDayPress={handleDayPress}
              selectedDate={selectedCalendarDate}
            />

            {/* Lista de eventos del día seleccionado */}
            <View style={styles.eventosContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Cargando eventos...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.dayListTitle}>
                    {selectedCalendarDate ?
                      selectedCalendarDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) :
                      new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                    }
                  </Text>
                  {(eventsByDate[selectedCalendarDate ? formatDate(selectedCalendarDate) : formatDate(new Date())] || []).length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No hay eventos este día</Text>
                    </View>
                  ) : (
                    (eventsByDate[selectedCalendarDate ? formatDate(selectedCalendarDate) : formatDate(new Date())] || []).map((event) => (
                      <View key={event._id} style={styles.eventoCard}>
                        {/* Header del evento */}
                        

                        {/* Contenido del evento */}
                        <View style={styles.eventoContent}>
                          {/* Hora del evento */}
                          <View style={styles.eventoTimeDisplay}>
                            <Text style={styles.eventoTimeDisplayText}>{event.hora}</Text>
                          </View>
                          <Text style={styles.eventoTitulo}>{event.titulo}</Text>
                          <Text style={styles.eventoDescripcion}>{event.descripcion}</Text>

                                                    {event.lugar && (
                            <View style={styles.eventoLocationContainer}>
                              <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>📍</Text>
                              </View>
                              <Text style={styles.eventoLocationText}>{event.lugar}</Text>
                            </View>
                          )}
                          
                          <View style={styles.eventoInstitutionContainer}>
                            <View style={styles.iconContainer}>
                              <Text style={styles.iconText}>🏫</Text>
                            </View>
                            <Text style={styles.eventoInstitutionText}>{getInstitutionName()}</Text>
                          </View>
                        </View>


                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          </View>
        ) : selectedTab === 'crear' ? (
          // PESTAÑA DE CREACIÓN (solo para coordinadores)
          <View style={styles.crearContainer}>
            <Text style={styles.crearTitle}>Crear Nuevo Evento</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Fecha</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={showDateSelector}
                >
                  <Text style={styles.selectorButtonText}>
                    {eventoFecha || 'Seleccionar fecha'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Hora</Text>
                <TouchableOpacity
                  style={styles.selectorButton}
                  onPress={showTimeSelector}
                >
                  <Text style={styles.selectorButtonText}>
                    {eventoHora || 'Seleccionar hora'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Título del Evento</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Visita al ZOO"
                  value={eventoTitulo}
                  onChangeText={setEventoTitulo}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Describe el evento..."
                  value={eventoDescripcion}
                  onChangeText={setEventoDescripcion}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Lugar (opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: ZOO Córdoba"
                  value={eventoLugar}
                  onChangeText={setEventoLugar}
                />
              </View>

              <View style={styles.formButtons}>


                <TouchableOpacity
                  style={[styles.createButton, (!eventoFecha || !eventoHora || !eventoTitulo || !eventoDescripcion) && styles.createButtonDisabled]}
                  onPress={handleCreateEvent}
                  disabled={!eventoFecha || !eventoHora || !eventoTitulo || !eventoDescripcion}
                >
                  <Text style={styles.createButtonText}>Crear Evento</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // PESTAÑA DE NOTIFICACIONES
          <View style={styles.notificationsContainer}>
            {/* Pestañas de notificaciones (solo para coordinadores) */}
            {isCoordinador && (
              <View style={styles.notificationTabsContainer}>
                <TouchableOpacity
                  style={[styles.notificationTab, activeNotificationTab === 'recibidas' && styles.notificationTabActive]}
                  onPress={() => setActiveNotificationTab('recibidas')}
                >
                  <Text style={[styles.notificationTabText, activeNotificationTab === 'recibidas' && styles.notificationTabTextActive]}>
                    Recibidas
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.notificationTab, activeNotificationTab === 'enviar' && styles.notificationTabActive]}
                  onPress={() => setActiveNotificationTab('enviar')}
                >
                  <Text style={[styles.notificationTabText, activeNotificationTab === 'enviar' && styles.notificationTabTextActive]}>
                    Enviar
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Contenido de notificaciones */}
            {(!isCoordinador || activeNotificationTab === 'recibidas') && (
              <View style={styles.notificationsList}>
                <Text style={styles.notificationsTitle}>
                  {isCoordinador ? 'Notificaciones Recibidas' : 'Notificaciones'}
                </Text>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                  >
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                      <Text style={styles.notificationMessage}>{notification.message}</Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
                {notifications.length === 0 && (
                  <View style={styles.emptyNotificationsContainer}>
                    <Text style={styles.emptyNotificationsText}>No hay notificaciones</Text>
                  </View>
                )}
              </View>
            )}

            {/* Formulario para enviar notificaciones (solo coordinadores) */}
            {isCoordinador && activeNotificationTab === 'enviar' && (
              <View style={styles.sendNotificationContainer}>
                <Text style={styles.sendNotificationTitle}>Enviar Nueva Notificación</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Título</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newNotification.title}
                    onChangeText={(text) => setNewNotification({...newNotification, title: text})}
                    placeholder="Ingresa el título de la notificación"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mensaje</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newNotification.message}
                    onChangeText={(text) => setNewNotification({...newNotification, message: text})}
                    placeholder="Ingresa el mensaje"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.sendNotificationButton} onPress={handleSendNotification}>
                  <Text style={styles.sendNotificationButtonText}>Enviar Notificación</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Selectores modales para fecha y hora */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.pickerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedDateValue}
                onValueChange={(itemValue) => {
                  const newDate = new Date(itemValue);
                  setSelectedDate(newDate);
                  setSelectedDateValue(itemValue);
                  setEventoFecha(newDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }));
                }}
              >
                {generateDateOptions().map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.pickerConfirmButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={eventoHora || '09:00'}
                onValueChange={(itemValue) => {
                  setEventoHora(itemValue);
                  const [hours, minutes] = itemValue.split(':');
                  const newTime = new Date();
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setSelectedTime(newTime);
                }}
              >
                {generateTimeOptions().map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.pickerConfirmButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50, // Reducido para eliminar espacio extra
    paddingBottom: 100, // Agregar padding inferior para evitar que se tape con la barra
  },
  scrollContainer: {
    flex: 1,
  },
  eventosTitle: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  eventosTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  // Pestañas
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  tabActive: {
    backgroundColor: '#0E5FCE',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  // Navegación de eventos
  eventosNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthArrow: {
    paddingHorizontal: 10,
  },
  monthArrowText: {
    fontSize: 20,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginHorizontal: 15,
  },
  // Calendario
  calendarContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  weekHeaderText: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#666666',
    fontWeight: 'bold',
  },
  weeksWrapper: {
    paddingHorizontal: 6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dayCellSelected: {
    backgroundColor: '#E8F0FE',
  },
  dayText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  dayTextFaded: {
    color: '#BBBBBB',
  },
  dayTextSelected: {
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C42',
  },
  dayListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  // Contenedor de eventos
  eventosContainer: {
    paddingHorizontal: 20,
    marginBottom: 100, // Agregar margen inferior para evitar que se tape con la barra
  },
  eventoItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventoFecha: {
    alignItems: 'center',
    marginRight: 15,
    minWidth: 60,
  },
  eventoMes: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'bold',
  },
  eventoDia: {
    fontSize: 16,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  eventoHora: {
    fontSize: 12,
    color: '#666666',
  },
  eventoMesActivo: {
    fontSize: 12,
    color: '#FF8C42',
    fontWeight: 'bold',
  },
  eventoDiaActivo: {
    fontSize: 16,
    color: '#FF8C42',
    fontWeight: 'bold',
  },
  eventoHoraActivo: {
    fontSize: 12,
    color: '#FF8C42',
  },
  eventoInfo: {
    flex: 1,
  },
  eventoLugar: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },

  eventoLugarActivo: {
    fontSize: 12,
    color: '#FF8C42',
    marginBottom: 5,
  },
  eventoTituloActivo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginBottom: 5,
  },
  eventoDescripcionActivo: {
    fontSize: 14,
    color: '#FF8C42',
  },
  eventoEditIcon: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editIconImage: {
    width: 16,
    height: 16
  },
  eventoFinalizadoButton: {
    backgroundColor: '#666666',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  eventoFinalizadoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventoSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  eventoLugarButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  eventoLugarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Nuevos estilos para diseño mejorado de eventos
  eventoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  eventoTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },


  eventoTimeInfo: {
    flex: 1,
  },
  eventoTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 2,
  },
  eventoDateText: {
    fontSize: 14,
    color: '#666666',
  },
  eventoStatusBadge: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventoStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventoContent: {
    padding: 16,
  },
  eventoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  eventoDescripcion: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  eventoLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  eventoLocationText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  eventoInstitutionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventoInstitutionText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  iconContainer: {
    width: 16,
    height: 16,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  eventoTimeDisplay: {
    marginBottom: 8,
  },
  eventoTimeDisplayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E5FCE',
  },
  eventoFooter: {
    padding: 16,
    paddingTop: 0,
  },
  eventoActionButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  eventoActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Sección de crear evento
  crearContainer: {
    paddingHorizontal: 20,
    marginBottom: 150, // Aumentar margen inferior para evitar que se tape con la barra
    marginTop: 10,
  },
  nuevoEventoButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nuevoEventoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  crearInfo: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  crearInfoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  crearTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    paddingBottom: 40, // Agregar padding inferior adicional
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButtonDisabled: {
    backgroundColor: '#B3D4F1',
    opacity: 0.7,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666666',
  },
  modalContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#0E5FCE',
    alignItems: 'center',
  },
  modalCreateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Estados de carga y error
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  // Estilos para selectores de fecha y hora
  selectorButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
  },
  selectorButtonText: {
    fontSize: 14,
    color: '#333333',
  },
  // Estilos para los pickers
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  pickerCloseText: {
    fontSize: 20,
    color: '#666666',
  },
  pickerConfirmButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Estilos para notificaciones
  notificationsContainer: {
    padding: 20,
  },
  notificationTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 20,
  },
  notificationTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  notificationTabActive: {
    backgroundColor: '#0E5FCE',
  },
  notificationTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  notificationTabTextActive: {
    color: '#FFFFFF',
  },
  notificationsList: {
    marginBottom: 20,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0E5FCE',
    alignSelf: 'center',
  },
  emptyNotificationsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#666666',
  },
  sendNotificationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendNotificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  sendNotificationButton: {
    backgroundColor: '#0E5FCE',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  sendNotificationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventosScreen; 