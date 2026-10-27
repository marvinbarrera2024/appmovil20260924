import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import TaskScreen from '../TaskScreen';
import { fetchProjects } from '../../services/projectService';
import { createTask, fetchTasks } from '../../services/taskService';

jest.mock('../../services/projectService', () => ({
  fetchProjects: jest.fn(),
}));

jest.mock('../../services/taskService', () => ({
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  fetchTasks: jest.fn(),
  toggleTaskState: jest.fn(),
}));

describe('TaskScreen', () => {
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchProjects.mockResolvedValue([]);
    fetchTasks.mockResolvedValue([]);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('carga y muestra el estado vacío de tareas y proyectos', async () => {
    await render(<TaskScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchTasks).toHaveBeenCalledWith('token-prueba'));
    expect(fetchProjects).toHaveBeenCalledWith('token-prueba');
    expect(screen.getByText('Aún no hay tareas registradas.')).toBeTruthy();
    expect(screen.getByText('No hay proyectos cargados.')).toBeTruthy();
  });

  it('valida el formulario antes de crear una tarea', async () => {
    await render(<TaskScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchTasks).toHaveBeenCalled());
    await fireEvent.press(screen.getByText('Guardar tarea'));

    expect(alertSpy).toHaveBeenCalledWith('Validación', 'Completa nombre, descripción y duración.');
    expect(createTask).not.toHaveBeenCalled();
  });

  it('ejecuta la acción para volver', async () => {
    const onBack = jest.fn();
    await render(<TaskScreen token="" onBack={onBack} />);

    await fireEvent.press(screen.getByText('← Volver'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});