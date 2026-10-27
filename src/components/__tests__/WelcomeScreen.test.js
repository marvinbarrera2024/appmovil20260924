import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import WelcomeScreen from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  it('muestra las secciones disponibles', async () => {
    await render(<WelcomeScreen onNavigate={jest.fn()} onLogout={jest.fn()} />);

    expect(screen.getByText('Panel principal')).toBeTruthy();
    expect(screen.getByText('Tareas')).toBeTruthy();
    expect(screen.getByText('Proyectos')).toBeTruthy();
    expect(screen.getByText('Categorías')).toBeTruthy();
  });

  it('navega a una sección y permite cerrar sesión', async () => {
    const onNavigate = jest.fn();
    const onLogout = jest.fn();
    await render(<WelcomeScreen onNavigate={onNavigate} onLogout={onLogout} />);

    await fireEvent.press(screen.getByText('Proyectos'));
    await fireEvent.press(screen.getByText('Cerrar sesión'));

    expect(onNavigate).toHaveBeenCalledWith('projects');
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});