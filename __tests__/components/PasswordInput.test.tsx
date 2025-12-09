import { vi } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PasswordInput } from '../../src/components/PasswordInput';

describe('PasswordInput', () => {
  const defaultProps = {
    value: '',
    onChangeText: vi.fn(),
    placeholder: 'Contraseña',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar correctamente', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} />
    );

    expect(getByPlaceholderText('Contraseña')).toBeTruthy();
  });

  it('debe mostrar/ocultar contraseña al presionar el icono de ojo', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <PasswordInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Contraseña');
    const eyeIcon = getByTestId('eye-icon');

    // Verificar que inicialmente la contraseña está oculta
    expect(input.props.secureTextEntry).toBe(true);

    // Presionar el icono para mostrar la contraseña
    fireEvent.press(eyeIcon);

    // Verificar que ahora la contraseña es visible
    expect(input.props.secureTextEntry).toBe(false);

    // Presionar nuevamente para ocultar
    fireEvent.press(eyeIcon);

    // Verificar que está oculta nuevamente
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('debe llamar onChangeText cuando el texto cambia', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} />
    );

    const input = getByPlaceholderText('Contraseña');
    const newText = 'newPassword123';

    fireEvent.changeText(input, newText);

    expect(defaultProps.onChangeText).toHaveBeenCalledWith(newText);
  });

  it('debe mostrar el valor proporcionado', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} value="testPassword" />
    );

    const input = getByPlaceholderText('Contraseña');
    expect(input.props.value).toBe('testPassword');
  });

  it('debe aplicar estilos personalizados', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} style={customStyle} />
    );

    const input = getByPlaceholderText('Contraseña');
    expect(input.props.style).toMatchObject(
      expect.objectContaining({
        backgroundColor: 'red',
      })
    );
  });

  it('debe pasar props adicionales al TextInput', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput 
        {...defaultProps} 
        autoCapitalize="none"
        autoCorrect={false}
      />
    );

    const input = getByPlaceholderText('Contraseña');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });
});