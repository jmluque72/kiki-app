export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  forbiddenWords: string[];
  maxLength?: number;
}

export class PasswordValidationService {
  private static readonly DEFAULT_POLICY: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    forbiddenWords: [
      'password', '123456', 'qwerty', 'abc123', 'password123',
      'admin', 'user', 'test', 'demo', 'guest', 'root',
      'kiki', 'bambino', 'sala', 'roja', 'coordinador'
    ],
    maxLength: 128
  };

  /**
   * Validar contraseña según política de seguridad
   */
  static validatePassword(password: string, policy: PasswordPolicy = this.DEFAULT_POLICY): PasswordValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Verificar longitud mínima
    if (password.length < policy.minLength) {
      errors.push(`La contraseña debe tener al menos ${policy.minLength} caracteres`);
    } else {
      score += 20;
    }

    // Verificar longitud máxima
    if (policy.maxLength && password.length > policy.maxLength) {
      errors.push(`La contraseña no puede exceder ${policy.maxLength} caracteres`);
    }

    // Verificar mayúsculas
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    } else if (policy.requireUppercase) {
      score += 15;
    }

    // Verificar minúsculas
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    } else if (policy.requireLowercase) {
      score += 15;
    }

    // Verificar números
    if (policy.requireNumbers && !/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    } else if (policy.requireNumbers) {
      score += 15;
    }

    // Verificar caracteres especiales
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)');
    } else if (policy.requireSpecialChars) {
      score += 15;
    }

    // Verificar palabras prohibidas
    const lowerPassword = password.toLowerCase();
    const forbiddenFound = policy.forbiddenWords.find(word => 
      lowerPassword.includes(word.toLowerCase())
    );
    
    if (forbiddenFound) {
      errors.push(`La contraseña no puede contener la palabra "${forbiddenFound}"`);
    } else {
      score += 10;
    }

    // Verificar patrones comunes
    if (this.hasCommonPatterns(password)) {
      errors.push('La contraseña contiene patrones comunes (123, abc, qwerty, etc.)');
    } else {
      score += 10;
    }

    // Verificar secuencias
    if (this.hasSequentialChars(password)) {
      errors.push('La contraseña contiene secuencias de caracteres (abc, 123, etc.)');
    } else {
      score += 10;
    }

    // Verificar repetición de caracteres
    if (this.hasRepeatedChars(password)) {
      errors.push('La contraseña contiene muchos caracteres repetidos');
    } else {
      score += 5;
    }

    // Generar sugerencias
    if (score < 50) {
      suggestions.push('Usa una combinación de letras mayúsculas, minúsculas, números y símbolos');
    }
    if (password.length < 12) {
      suggestions.push('Considera usar una contraseña más larga (12+ caracteres)');
    }
    if (!this.hasSpecialChars(password)) {
      suggestions.push('Agrega caracteres especiales como !@#$%^&*');
    }
    if (this.hasCommonPatterns(password)) {
      suggestions.push('Evita patrones comunes como 123, abc, qwerty');
    }

    return {
      isValid: errors.length === 0,
      score: Math.min(score, 100),
      errors,
      suggestions
    };
  }

  /**
   * Verificar si la contraseña tiene patrones comunes
   */
  private static hasCommonPatterns(password: string): boolean {
    const commonPatterns = [
      '123', 'abc', 'qwe', 'asd', 'zxc',
      'password', 'admin', 'user', 'test'
    ];
    
    const lowerPassword = password.toLowerCase();
    return commonPatterns.some(pattern => lowerPassword.includes(pattern));
  }

  /**
   * Verificar si la contraseña tiene secuencias de caracteres
   */
  private static hasSequentialChars(password: string): boolean {
    const sequences = [
      'abcdefghijklmnopqrstuvwxyz',
      'zyxwvutsrqponmlkjihgfedcba',
      '0123456789',
      '9876543210'
    ];
    
    const lowerPassword = password.toLowerCase();
    return sequences.some(seq => {
      for (let i = 0; i <= seq.length - 3; i++) {
        const subseq = seq.substring(i, i + 3);
        if (lowerPassword.includes(subseq)) {
          return true;
        }
      }
      return false;
    });
  }

  /**
   * Verificar si la contraseña tiene caracteres repetidos
   */
  private static hasRepeatedChars(password: string): boolean {
    const charCount: { [key: string]: number } = {};
    
    for (const char of password) {
      charCount[char] = (charCount[char] || 0) + 1;
    }
    
    const maxCount = Math.max(...Object.values(charCount));
    const threshold = Math.ceil(password.length * 0.3); // 30% del total
    
    return maxCount > threshold;
  }

  /**
   * Verificar si la contraseña tiene caracteres especiales
   */
  private static hasSpecialChars(password: string): boolean {
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }

  /**
   * Generar contraseña segura
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + special;
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Obtener fortaleza de la contraseña en texto
   */
  static getPasswordStrength(score: number): string {
    if (score < 30) return 'Muy débil';
    if (score < 50) return 'Débil';
    if (score < 70) return 'Moderada';
    if (score < 90) return 'Fuerte';
    return 'Muy fuerte';
  }

  /**
   * Obtener color para mostrar la fortaleza
   */
  static getPasswordStrengthColor(score: number): string {
    if (score < 30) return '#ff4444'; // Rojo
    if (score < 50) return '#ff8800'; // Naranja
    if (score < 70) return '#ffbb00'; // Amarillo
    if (score < 90) return '#88cc00'; // Verde claro
    return '#00aa00'; // Verde
  }
}

export default PasswordValidationService;
