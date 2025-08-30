import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface WeeklyCalendarProps {
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  eventsByDate: Record<string, any[]>;
  onDayPress: (date: Date) => void;
  selectedDate?: Date;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  currentWeek,
  onWeekChange,
  eventsByDate,
  onDayPress,
  selectedDate
}) => {
  // Obtener el inicio de la semana (lunes)
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea 0
    return new Date(d.setDate(diff));
  };

  // Generar días de la semana
  const getWeekDays = (weekStart: Date): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Formatear fecha para comparación
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    onWeekChange(newWeek);
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    onWeekChange(newWeek);
  };

  // Obtener el rango de fechas de la semana
  const weekStart = getWeekStart(currentWeek);
  const weekDays = getWeekDays(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Formatear el rango de fechas para mostrar
  const formatWeekRange = () => {
    const startFormatted = weekStart.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
    const endFormatted = weekEnd.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${startFormatted} - ${endFormatted}`;
  };

  // Nombres de los días de la semana
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <View style={styles.container}>
      {/* Header con navegación */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.weekRangeText}>{formatWeekRange()}</Text>
        
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.weekContainer}>
        {/* Nombres de los días */}
        <View style={styles.dayNamesRow}>
          {dayNames.map((dayName, index) => (
            <View key={index} style={styles.dayNameContainer}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>

        {/* Días del calendario */}
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => {
            const dayFormatted = formatDate(day);
            const hasEvents = eventsByDate[dayFormatted]?.length > 0;
            const isSelected = selectedDate && formatDate(selectedDate) === dayFormatted;
            const isToday = formatDate(new Date()) === dayFormatted;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayContainer,
                  isSelected && styles.selectedDay,
                  isToday && styles.today
                ]}
                onPress={() => onDayPress(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.selectedDayText,
                  isToday && styles.todayText
                ]}>
                  {day.getDate()}
                </Text>
                
                {/* Indicador de eventos */}
                {hasEvents && (
                  <View style={[
                    styles.eventIndicator,
                    isSelected && styles.selectedEventIndicator
                  ]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 20,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  weekRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  weekContainer: {
    gap: 12,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayNameContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 8,
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  selectedDay: {
    backgroundColor: '#0E5FCE',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  today: {
    backgroundColor: '#FF8C42',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF8C42',
  },
  selectedEventIndicator: {
    backgroundColor: '#FFFFFF',
  },
});

export default WeeklyCalendar;
