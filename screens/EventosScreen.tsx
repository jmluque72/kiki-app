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
  Platform,
  Switch,
  RefreshControl
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useInstitution } from '../contexts/InstitutionContext';
import { useAuth } from "../contexts/AuthContextHybrid"
import { useEvents } from '../src/hooks/useEvents';
import CommonHeader from '../components/CommonHeader';
import withSideMenu from '../components/withSideMenu';
import WeeklyCalendar from '../components/WeeklyCalendar';
import EventAuthorizationButton from '../components/EventAuthorizationButton';
import EventAuthorizationModal from '../components/EventAuthorizationModal';
import MonthlyCalendar from '../components/MonthlyCalendar';

const EventosScreen = ({ onOpenNotifications, onOpenMenu }: { onOpenNotifications: () => void; onOpenMenu?: () => void }) => {
  const { selectedInstitution, userAssociations, getActiveStudent } = useInstitution();
  const { user } = useAuth();
  const { events, upcomingEvents, pastEvents, loading, error, createEvent, refreshEvents } = useEvents();
  const [selectedTab, setSelectedTab] = useState<'crear' | 'visualizar'>('visualizar');
  
  // Estado para el pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Función para manejar el pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshEvents();
    } catch (error) {
      console.error('Error al refrescar eventos:', error);
    } finally {
      setRefreshing(false);
    }
  };

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
  const [requiereAutorizacion, setRequiereAutorizacion] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  
  // Estados para modal de autorizaciones
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedEventForAuth, setSelectedEventForAuth] = useState<{id: string, title: string} | null>(null);
  
  const toLocalISO = (d: Date) => {
    const tzAdjusted = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return tzAdjusted.toISOString().split('T')[0];
  };

  const [selectedDateValue, setSelectedDateValue] = useState(toLocalISO(new Date()));

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

  // Verificar si el usuario es coordinador usando la asociación activa
  const { activeAssociation } = useAuth();
  const isCoordinador = activeAssociation?.role?.nombre === 'coordinador';
  const isFamilyAdmin = activeAssociation?.role?.nombre === 'familyadmin';
  
  // Verificar si el usuario es de familia (familyadmin o familyviewer) usando la asociación activa
  const isFamilyUser = activeAssociation?.role?.nombre === 'familyadmin' || activeAssociation?.role?.nombre === 'familyviewer';

  // Funciones para manejar selectores de fecha y hora
  const showDateSelector = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateValue(date.toISOString().split('T')[0]);
    setEventoFecha(date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
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
    setRequiereAutorizacion(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setSelectedDateValue(new Date().toISOString().split('T')[0]);
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

  const handleShowAuthorizationDetails = (eventId: string, eventTitle: string) => {
    setSelectedEventForAuth({ id: eventId, title: eventTitle });
    setShowAuthorizationModal(true);
  };

  const handleCloseAuthorizationModal = () => {
    setShowAuthorizationModal(false);
    setSelectedEventForAuth(null);
  };

  const handleCreateEvent = async () => {
    if (!eventoFecha || !eventoHora || !eventoTitulo || !eventoDescripcion) {
      console.log('Error: Por favor completa todos los campos');
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
        lugar: eventoLugar,
        requiereAutorizacion: requiereAutorizacion
      });

      if (success) {
        resetForm();
        setSelectedTab('visualizar');
      } else {
        console.log('Error: No se pudo crear el evento');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el evento';
      console.log('Error:', errorMessage);
    }
  };

  return (
    <>
      <View style={styles.homeContainer}>
        <CommonHeader 
          onOpenNotifications={onOpenNotifications} 
          onOpenMenu={onOpenMenu}
          activeStudent={getActiveStudent()}
        />

        <ScrollView 
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0E5FCE']} // Color azul para Android
              tintColor="#0E5FCE" // Color azul para iOS
            />
          }
        >
          {/* Título EVENTOS */}
          <View style={styles.eventosTitle}>
            <Text style={styles.eventosTitleText}>EVENTOS</Text>
          </View>

          {/* Pestañas - Solo para coordinadores */}
          {!isFamilyUser && (
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
            </View>
          )}

          {/* Contenido de las pestañas */}
          {(selectedTab === 'visualizar' || isFamilyUser) && (
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
                      // Si no hay eventos para el día seleccionado, mostrar mensaje de no hay eventos
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No hay eventos programados para este día</Text>
                      </View>
                    ) : (
                      (eventsByDate[selectedCalendarDate ? formatDate(selectedCalendarDate) : formatDate(new Date())] || []).map((event) => (
                        <View key={event._id} style={styles.eventoCard}>
                          <View style={styles.eventoContent}>
                            <View style={styles.eventoTimeDisplay}>
                              <Text style={styles.eventoTimeDisplayText}>{event.hora}</Text>
                            </View>
                            <Text style={styles.eventoTitulo}>{event.titulo}</Text>
                            <Text style={styles.eventoDescripcion}>{event.descripcion}</Text>

                            {event.lugar && (
                              <View style={styles.eventoLocationContainer}>
                                <Text style={styles.eventoLocationText}>{event.lugar}</Text>
                              </View>
                            )}
                            
                            <View style={styles.eventoInstitutionContainer}>
                              <Text style={styles.eventoInstitutionText}>{getInstitutionName()}</Text>
                            </View>
                            
                            {/* Botones de autorización */}
                            <View style={styles.eventActionsContainer}>
                              {/* Botón de autorización solo para familyadmin */}
                              {isFamilyAdmin && (
                                <EventAuthorizationButton
                                  eventId={event._id}
                                  eventTitle={event.titulo}
                                  requiereAutorizacion={event.requiereAutorizacion || false}
                                />
                              )}
                              
                              {/* Botón de detalles para coordinadores en eventos que requieren autorización */}
                              {isCoordinador && event.requiereAutorizacion && (
                                <TouchableOpacity
                                  style={styles.detailsButton}
                                  onPress={() => handleShowAuthorizationDetails(event._id, event.titulo)}
                                >
                                  <Text style={styles.detailsButtonText}>Detalles</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {selectedTab === 'crear' && isCoordinador && (
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

                <View style={styles.inputContainer}>
                  <View style={styles.switchContainer}>
                    <Text style={styles.inputLabel}>Requiere autorización de padres</Text>
                    <Switch
                      value={requiereAutorizacion}
                      onValueChange={setRequiereAutorizacion}
                      trackColor={{ false: '#E0E0E0', true: '#0E5FCE' }}
                      thumbColor={requiereAutorizacion ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>
                  <Text style={styles.switchDescription}>
                    Si está activado, los padres deberán autorizar la participación de sus hijos
                  </Text>
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
          )}
        </ScrollView>
      </View>

      {/* Selectores modales para fecha y hora */}
      <MonthlyCalendar
        visible={showDatePicker}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onClose={() => setShowDatePicker(false)}
        minDate={new Date()}
        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 año desde hoy
      />

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

      {/* Modal de autorizaciones */}
      {selectedEventForAuth && (
        <EventAuthorizationModal
          visible={showAuthorizationModal}
          eventId={selectedEventForAuth.id}
          eventTitle={selectedEventForAuth.title}
          onClose={handleCloseAuthorizationModal}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 100,
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
  dayListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  upcomingEventsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E5FCE',
    marginBottom: 15,
    textAlign: 'center',
  },
  eventosContainer: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  eventoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#0E5FCE',
  },
  eventoContent: {
    padding: 18,
  },
  eventoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  eventoDescripcion: {
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventoLocationContainer: {
    marginBottom: 6,
  },
  eventoLocationText: {
    fontSize: 13,
    color: '#0E5FCE',
    fontWeight: '500',
  },
  eventoInstitutionContainer: {
    marginTop: 4,
  },
  eventoInstitutionText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '400',
  },

  eventoTimeDisplay: {
    marginBottom: 10,
  },
  eventoTimeDisplayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C42',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  crearContainer: {
    paddingHorizontal: 20,
    marginBottom: 150,
    marginTop: 10,
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
    paddingBottom: 40,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  eventActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  detailsButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default withSideMenu(EventosScreen); 