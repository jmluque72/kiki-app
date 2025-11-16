import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock de servicios
const mockLogin = jest.fn();
const mockGetAvailableAccounts = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../src/services/authService', () => ({
  AuthService: {
    login: mockLogin,
    getAvailableAccounts: mockGetAvailableAccounts,
  },
}));

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock de Alert
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

describe('Flujo de Autenticación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Screen Integration', () => {
    it('debe manejar el flujo completo de login exitoso', async () => {
      // Mock de respuesta exitosa
      mockLogin.mockResolvedValueOnce({
        token: 'mock-token-123',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'parent',
        },
      });

      // Aquí iría el componente real de LoginScreen
      // Por ahora, creamos un componente simulado para demostrar el patrón
      const MockLoginScreen = () => {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [loading, setLoading] = React.useState(false);

        const handleLogin = async () => {
          setLoading(true);
          try {
            const result = await mockLogin({ email, password });
            mockNavigate('Home');
            return result;
          } catch (error) {
            // Error handling
          } finally {
            setLoading(false);
          }
        };

        return (
          <>
            {/* Inputs simulados */}
            <input testID="email-input" value={email} onChangeText={setEmail} />
            <input testID="password-input" value={password} onChangeText={setPassword} />
            <button testID="login-button" onPress={handleLogin} disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <MockLoginScreen />
        </NavigationContainer>
      );

      // Simular entrada de usuario
      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Simular login
      await act(async () => {
        fireEvent.press(loginButton);
      });

      // Verificar que se llamó al servicio
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verificar que se navegó a la pantalla principal
      expect(mockNavigate).toHaveBeenCalledWith('Home');
    });

    it('debe manejar errores de autenticación', async () => {
      // Mock de respuesta con error
      mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

      const MockLoginScreen = () => {
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [error, setError] = React.useState('');

        const handleLogin = async () => {
          try {
            await mockLogin({ email, password });
          } catch (err: any) {
            setError(err.message);
          }
        };

        return (
          <>
            <input testID="email-input" value={email} onChangeText={setEmail} />
            <input testID="password-input" value={password} onChangeText={setPassword} />
            <button testID="login-button" onPress={handleLogin}>
              Iniciar Sesión
            </button>
            {error ? <text testID="error-message">{error}</text> : null}
          </>
        );
      };

      const { getByTestId } = render(
        <NavigationContainer>
          <MockLoginScreen />
        </NavigationContainer>
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');
      const loginButton = getByTestId('login-button');

      fireEvent.changeText(emailInput, 'wrong@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');

      await act(async () => {
        fireEvent.press(loginButton);
      });

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
        expect(getByTestId('error-message').children[0]).toBe('Credenciales inválidas');
      });
    });
  });

  describe('Account Selection Flow', () => {
    it('debe cargar y mostrar cuentas disponibles', async () => {
      const mockAccounts = [
        {
          _id: '1',
          nombre: 'Escuela Primaria',
          razonSocial: 'Escuela Primaria S.A.',
        },
        {
          _id: '2',
          nombre: 'Colegio Secundario',
          razonSocial: 'Colegio Secundario S.A.',
        },
      ];

      mockGetAvailableAccounts.mockResolvedValueOnce(mockAccounts);

      const MockAccountSelection = () => {
        const [accounts, setAccounts] = React.useState([]);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          loadAccounts();
        }, []);

        const loadAccounts = async () => {
          try {
            const data = await mockGetAvailableAccounts();
            setAccounts(data);
          } catch (error) {
            // Error handling
          } finally {
            setLoading(false);
          }
        };

        if (loading) return <text testID="loading-text">Cargando...</text>;

        return (
          <>
            {accounts.map((account: any) => (
              <button key={account._id} testID={`account-${account._id}`}>
                {account.nombre}
              </button>
            ))}
          </>
        );
      };

      const { getByTestId, getByText } = render(
        <NavigationContainer>
          <MockAccountSelection />
        </NavigationContainer>
      );

      // Verificar que se muestra el loading inicialmente
      expect(getByTestId('loading-text')).toBeTruthy();

      // Esperar a que se carguen las cuentas
      await waitFor(() => {
        expect(getByText('Escuela Primaria')).toBeTruthy();
        expect(getByText('Colegio Secundario')).toBeTruthy();
      });

      // Verificar que se llamó al servicio
      expect(mockGetAvailableAccounts).toHaveBeenCalled();
    });
  });
});