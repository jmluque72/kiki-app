import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

interface MonthlyCalendarProps {
  visible: boolean;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  visible,
  selectedDate,
  onDateSelect,
  onClose,
  minDate = new Date(),
  maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año desde hoy
}) => {
  // Validar que selectedDate sea una fecha válida
  const validSelectedDate = selectedDate && !isNaN(selectedDate.getTime()) 
    ? selectedDate 
    : new Date();
  
  // Asegurar que minDate y maxDate sean válidos
  const validMinDate = minDate && !isNaN(minDate.getTime()) ? minDate : new Date();
  const validMaxDate = maxDate && !isNaN(maxDate.getTime()) 
    ? maxDate 
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  
  // Asegurar que selectedDate esté dentro del rango válido
  const clampedSelectedDate = validSelectedDate < validMinDate 
    ? validMinDate 
    : (validSelectedDate > validMaxDate ? validMaxDate : validSelectedDate);
  
  const [currentMonth, setCurrentMonth] = useState(clampedSelectedDate);

  // Actualizar currentMonth cuando cambie selectedDate o visible
  useEffect(() => {
    if (visible && clampedSelectedDate && !isNaN(clampedSelectedDate.getTime())) {
      setCurrentMonth(clampedSelectedDate);
    }
  }, [visible, clampedSelectedDate]);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    // Validar que la fecha sea válida
    if (!date || isNaN(date.getTime())) {
      const today = new Date();
      date = today;
    }
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Validar que el año y mes sean válidos
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) {
      const today = new Date();
      const validYear = today.getFullYear();
      const validMonth = today.getMonth();
      const firstDay = new Date(validYear, validMonth, 1);
      const lastDay = new Date(validYear, validMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(validYear, validMonth, day);
        if (!isNaN(dayDate.getTime())) {
          days.push(dayDate);
        }
      }
      return days;
    }
    
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
      const dayDate = new Date(year, month, day);
      // Validar que la fecha creada sea válida
      if (!isNaN(dayDate.getTime())) {
        days.push(dayDate);
      }
    }

    return days;
  };

  const isDateDisabled = (date: Date) => {
    if (!date || isNaN(date.getTime())) return true;
    return date < validMinDate || date > validMaxDate;
  };

  const isDateSelected = (date: Date) => {
    if (!date || isNaN(date.getTime()) || !clampedSelectedDate || isNaN(clampedSelectedDate.getTime())) {
      return false;
    }
    return date.toDateString() === clampedSelectedDate.toDateString();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDatePress = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const canGoPrevious = () => {
    if (!currentMonth || isNaN(currentMonth.getTime())) return false;
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prevMonth >= new Date(validMinDate.getFullYear(), validMinDate.getMonth(), 1);
  };

  const canGoNext = () => {
    if (!currentMonth || isNaN(currentMonth.getTime())) return false;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return nextMonth <= new Date(validMaxDate.getFullYear(), validMaxDate.getMonth(), 1);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.navButton, !canGoPrevious() && styles.navButtonDisabled]}
              onPress={goToPreviousMonth}
              disabled={!canGoPrevious()}
            >
              <Text style={[styles.navButtonText, !canGoPrevious() && styles.navButtonTextDisabled]}>
                ‹
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            
            <TouchableOpacity
              style={[styles.navButton, !canGoNext() && styles.navButtonDisabled]}
              onPress={goToNextMonth}
              disabled={!canGoNext()}
            >
              <Text style={[styles.navButtonText, !canGoNext() && styles.navButtonTextDisabled]}>
                ›
              </Text>
            </TouchableOpacity>
          </View>

          {/* Day names */}
          <View style={styles.dayNamesRow}>
            {dayNames.map((dayName) => (
              <Text key={dayName} style={styles.dayName}>
                {dayName}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {days.map((date, index) => {
              if (!date) {
                return <View key={index} style={styles.dayCell} />;
              }

              const disabled = isDateDisabled(date);
              const selected = isDateSelected(date);
              const today = isToday(date);

              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[
                    styles.dayCell,
                    today && styles.todayCell,
                    selected && styles.selectedCell,
                    disabled && styles.disabledCell,
                  ]}
                  onPress={() => handleDatePress(date)}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.dayText,
                      today && styles.todayText,
                      selected && styles.selectedText,
                      disabled && styles.disabledText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onDateSelect(clampedSelectedDate);
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');
const calendarWidth = width * 0.9;
const daySize = (calendarWidth - 40) / 7; // 40px de padding total

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: calendarWidth,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCell: {
    width: daySize,
    height: daySize,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
    borderRadius: daySize / 2,
  },
  selectedCell: {
    backgroundColor: '#2196f3',
    borderRadius: daySize / 2,
  },
  disabledCell: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayText: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledText: {
    color: '#ccc',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#2196f3',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default MonthlyCalendar;
