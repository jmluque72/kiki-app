import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { fonts } from '../src/config/fonts';

const { width } = Dimensions.get('window');

interface CustomCalendarProps {
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({ onDateSelect, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Agregar días vacíos para alinear el primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Agregar todos los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    } else {
      // Solo permitir navegar hacia adelante si no es el mes actual
      const today = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      
      // Si no estamos en el mes actual, permitir navegar hacia adelante
      if (currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth)) {
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
      }
    }
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Incluir todo el día de hoy
    return date > today;
  };

  const days = getDaysInMonth(currentDate);

  // Verificar si se puede navegar hacia adelante
  const canNavigateNext = () => {
    const today = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    return currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth);
  };

  return (
    <View style={styles.calendarContainer}>
      {/* Header del calendario */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthYearText}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.navButton,
            !canNavigateNext() && styles.navButtonDisabled
          ]}
          onPress={() => navigateMonth('next')}
          disabled={!canNavigateNext()}
        >
          <Text style={[
            styles.navButtonText,
            !canNavigateNext() && styles.navButtonTextDisabled
          ]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Días de la semana */}
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day) => (
          <Text key={day} style={styles.dayOfWeekText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid de días */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={index} style={styles.dayCell} />;
          }

          const isTodayDate = isToday(day);
          const isSelectedDate = isSelected(day);
          const isPast = isPastDate(day);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                isTodayDate && styles.todayCell,
                isSelectedDate && styles.selectedCell,
                isPast && styles.pastDateCell,
              ]}
              onPress={() => !isPast && handleDatePress(day)}
              disabled={isPast}
            >
              <Text
                style={[
                  styles.dayText,
                  isTodayDate && styles.todayText,
                  isSelectedDate && styles.selectedText,
                  isPast && styles.pastDateText,
                ]}
              >
                {day.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.todayButton}
          onPress={() => handleDatePress(new Date())}
        >
          <Text style={styles.todayButtonText}>Hoy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '95%',
    maxWidth: 400,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: '#0E5FCE',
    fontWeight: 'bold',
  },
  navButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
  navButtonTextDisabled: {
    color: '#CCCCCC',
  },
  monthYearText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: '#0E5FCE',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#666666',
    marginBottom: 5,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: (width * 0.95 - 60) / 7, // Ancho total menos padding dividido por 7 días
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  dayText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: '#333333',
  },
  todayCell: {
    backgroundColor: '#FF8C42',
    borderRadius: 20,
  },
  todayText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  selectedCell: {
    backgroundColor: '#0E5FCE',
    borderRadius: 20,
  },
  selectedText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
  },
  pastDateCell: {
    opacity: 0.3,
  },
  pastDateText: {
    color: '#CCCCCC',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: '#666666',
  },
  todayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: '#FFFFFF',
  },
});

export default CustomCalendar;
