import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PasswordValidationService, { PasswordValidationResult } from '../services/passwordValidationService';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  showValidation?: boolean;
  onValidationChange?: (result: PasswordValidationResult) => void;
  style?: any;
  inputStyle?: any;
  label?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Contraseña',
  showValidation = false,
  onValidationChange,
  style,
  inputStyle,
  label,
  required = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
  const [showStrengthBar, setShowStrengthBar] = useState(false);
  const [strengthAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (showValidation && value.length > 0) {
      const result = PasswordValidationService.validatePassword(value);
      setValidation(result);
      setShowStrengthBar(true);
      
      if (onValidationChange) {
        onValidationChange(result);
      }

      // Animar la barra de fortaleza
      Animated.timing(strengthAnimation, {
        toValue: result.score,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setValidation(null);
      setShowStrengthBar(false);
      strengthAnimation.setValue(0);
    }
  }, [value, showValidation, onValidationChange, strengthAnimation]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const getStrengthColor = () => {
    if (!validation) return '#e0e0e0';
    return PasswordValidationService.getPasswordStrengthColor(validation.score);
  };

  const getStrengthText = () => {
    if (!validation) return '';
    return PasswordValidationService.getPasswordStrength(validation.score);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[styles.inputContainer, inputStyle]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={toggleVisibility}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={isVisible ? 'visibility-off' : 'visibility'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {showValidation && showStrengthBar && validation && (
        <View style={styles.validationContainer}>
          <View style={styles.strengthContainer}>
            <Text style={styles.strengthLabel}>Fortaleza:</Text>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
              {getStrengthText()}
            </Text>
          </View>
          
          <View style={styles.strengthBarContainer}>
            <View style={styles.strengthBarBackground}>
              <Animated.View
                style={[
                  styles.strengthBar,
                  {
                    width: strengthAnimation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: getStrengthColor(),
                  },
                ]}
              />
            </View>
          </View>

          {validation.errors.length > 0 && (
            <View style={styles.errorsContainer}>
              {validation.errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>
                  • {error}
                </Text>
              ))}
            </View>
          )}

          {validation.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Sugerencias:</Text>
              {validation.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  strengthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  strengthBarContainer: {
    marginBottom: 12,
  },
  strengthBarBackground: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  errorsContainer: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginBottom: 2,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default PasswordInput;
