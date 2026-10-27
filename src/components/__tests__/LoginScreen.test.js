import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import LoginScreen from '../LoginScreen';
import { loginUser, registerUser } from '../../services/authService';

jest.mock('../../services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

describe('LoginScreen', () => {
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('muestra el formulario para iniciar sesión', async () => {
    await render(<LoginScreen onLogin={jest.fn()} />);

    expect(screen.getByText('Iniciar sesión')).toBeTruthy();
    expect(screen.getByPlaceholderText('Usuario')).toBeTruthy();
    expect(screen.getByPlaceholderText('Contraseña')).toBeTruthy();
  });

  it('valida campos vacíos antes de llamar al servicio', async () => {
    await render(<LoginScreen onLogin={jest.fn()} />);

    await fireEvent.press(screen.getByText('Entrar'));

    expect(alertSpy).toHaveBeenCalledWith('Validación', 'Debes ingresar usuario y contraseña.');
    expect(loginUser).not.toHaveBeenCalled();
  });

  it('envía las credenciales y notifica el token recibido', async () => {
    const onLogin = jest.fn();
    loginUser.mockResolvedValue({ token: 'token-de-prueba' });
    await render(<LoginScreen onLogin={onLogin} />);

    await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), ' ana ');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), ' clave ');
    await fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('token-de-prueba'));
    expect(loginUser).toHaveBeenCalledWith('ana', 'clave');
  });

  it('valida los campos obligatorios al registrarse', async () => {
    await render(<LoginScreen onLogin={jest.fn()} />);

    await fireEvent.press(screen.getByText('¿No tienes cuenta? · Regístrate'));
    await fireEvent.press(screen.getAllByText('Crear cuenta')[1]);

    expect(alertSpy).toHaveBeenCalledWith(
      'Validación',
      'Completa nombre, apellido, usuario y contraseña.'
    );
    expect(registerUser).not.toHaveBeenCalled();
  });

  it('registra una cuenta sin token e informa que ya puede iniciar sesión', async () => {
    const onLogin = jest.fn();
    registerUser.mockResolvedValue({});
    await render(<LoginScreen onLogin={onLogin} />);

    await fireEvent.press(screen.getByText('¿No tienes cuenta? · Regístrate'));
    await fireEvent.changeText(screen.getByPlaceholderText('Nombre'), ' Ana ');
    await fireEvent.changeText(screen.getByPlaceholderText('Apellido'), ' Pérez ');
    await fireEvent.changeText(screen.getByPlaceholderText('Teléfono (opcional)'), ' 123 ');
    await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), ' ana ');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), ' clave ');
    await fireEvent.press(screen.getAllByText('Crear cuenta')[1]);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Registro completado',
        'Ya puedes iniciar sesión con tu cuenta.'
      )
    );
    expect(registerUser).toHaveBeenCalledWith({
      nombre: 'Ana',
      apellido: 'Pérez',
      telefono: '123',
      login: 'ana',
      clave: 'clave',
      rolId: 2,
    });
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText('Iniciar sesión')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Nombre')).toBeNull();
  });

  it('inicia sesión con una respuesta sin token y muestra el error alternativo', async () => {
    loginUser.mockResolvedValue({});
    await render(<LoginScreen onLogin={jest.fn()} />);

    await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), 'ana');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'clave');
    await fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        'Error de inicio de sesión',
        'Credenciales inválidas o error del servidor.'
      )
    );
  });

  it.each([
    [{ response: { data: { message: 'Usuario bloqueado' } } }, 'Usuario bloqueado'],
    [{ response: { data: { error: 'Error de acceso' } } }, 'Error de acceso'],
    [new Error('fallo de red'), 'Credenciales inválidas o error del servidor.'],
  ])('muestra el error de inicio de sesión correspondiente', async (error, message) => {
    loginUser.mockRejectedValue(error);
    await render(<LoginScreen onLogin={jest.fn()} />);

    await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), 'ana');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'clave');
    await fireEvent.press(screen.getByText('Entrar'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error de inicio de sesión', message)
    );
  });

  it.each([
    [{ response: { data: { message: 'Usuario ya existe' } } }, 'Usuario ya existe'],
    [{ response: { data: { error: 'Registro rechazado' } } }, 'Registro rechazado'],
    [new Error('fallo de red'), 'No se pudo crear la cuenta. Verifica los datos e inténtalo de nuevo.'],
  ])('muestra el error de registro correspondiente', async (error, message) => {
    registerUser.mockRejectedValue(error);
    await render(<LoginScreen onLogin={jest.fn()} />);

    await fireEvent.press(screen.getByText('¿No tienes cuenta? · Regístrate'));
    await fireEvent.changeText(screen.getByPlaceholderText('Nombre'), 'Ana');
    await fireEvent.changeText(screen.getByPlaceholderText('Apellido'), 'Pérez');
    await fireEvent.changeText(screen.getByPlaceholderText('Usuario'), 'ana');
    await fireEvent.changeText(screen.getByPlaceholderText('Contraseña'), 'clave');
    await fireEvent.press(screen.getAllByText('Crear cuenta')[1]);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Error de registro', message));
  });
});