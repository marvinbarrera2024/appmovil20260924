import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import CategoryScreen from '../CategoryScreen';
import { createCategory, fetchCategories } from '../../services/categoryService';

jest.mock('../../services/categoryService', () => ({
  createCategory: jest.fn(),
  deleteCategory: jest.fn(),
  fetchCategories: jest.fn(),
  updateCategory: jest.fn(),
}));

describe('CategoryScreen', () => {
  let alertSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchCategories.mockResolvedValue([]);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('carga y muestra el estado vacío de categorías', async () => {
    await render(<CategoryScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchCategories).toHaveBeenCalledWith('token-prueba'));
    expect(screen.getByText('Categorías')).toBeTruthy();
    expect(screen.getByText('No hay categorías registradas.')).toBeTruthy();
  });

  it('valida el nombre antes de crear una categoría', async () => {
    await render(<CategoryScreen token="token-prueba" onBack={jest.fn()} />);

    await waitFor(() => expect(fetchCategories).toHaveBeenCalled());
    await fireEvent.press(screen.getByText('Guardar'));

    expect(alertSpy).toHaveBeenCalledWith('Validación', 'Ingresa el nombre de la categoría.');
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('ejecuta la acción para volver', async () => {
    const onBack = jest.fn();
    await render(<CategoryScreen token="" onBack={onBack} />);

    await fireEvent.press(screen.getByText('← Volver'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});