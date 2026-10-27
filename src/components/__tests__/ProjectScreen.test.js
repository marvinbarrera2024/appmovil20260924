import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ProjectScreen from '../ProjectScreen';
import { fetchCategories } from '../../services/categoryService';
import { fetchProjects, saveProject } from '../../services/projectService';

jest.mock('../../services/categoryService', () => ({
  fetchCategories: jest.fn(),
}));

jest.mock('../../services/projectService', () => ({
  deleteProject: jest.fn(),
  fetchProjects: jest.fn(),
  saveProject: jest.fn(),
}));

describe('ProjectScreen', () => {
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchCategories.mockResolvedValue([]);
    fetchProjects.mockResolvedValue([]);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('carga las listas y muestra el estado vacío', async () => {
    await render(<ProjectScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchProjects).toHaveBeenCalledWith('token-prueba'));
    expect(fetchCategories).toHaveBeenCalledWith('token-prueba');
    expect(screen.getByText('No hay proyectos registrados.')).toBeTruthy();
    expect(screen.getByText('Nuevo proyecto')).toBeTruthy();
  });

  it('valida los datos requeridos antes de guardar', async () => {
    await render(<ProjectScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchProjects).toHaveBeenCalled());
    await fireEvent.press(screen.getByText('Guardar'));

    expect(alertSpy).toHaveBeenCalledWith('Validación', 'Completa título y descripción del proyecto.');
    expect(saveProject).not.toHaveBeenCalled();
  });

  it('ejecuta la acción para volver', async () => {
    const onBack = jest.fn();
    await render(<ProjectScreen token="" onBack={onBack} />);

    await fireEvent.press(screen.getByText('← Volver'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});