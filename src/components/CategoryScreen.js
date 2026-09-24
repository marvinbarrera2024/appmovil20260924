import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { apiClient, getAuthHeaders } from '../services/api';

const emptyCategory = { nombre: '' };

export default function CategoryScreen({ token, onBack }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/api/categorias/lista', {
        headers: getAuthHeaders(token),
      });
      setCategories(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las categorías.');
    }
  };

  useEffect(() => {
    if (token) {
      loadCategories();
    }
  }, [token]);

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Alert.alert('Validación', 'Ingresa el nombre de la categoría.');
      return;
    }

    try {
      if (editingId) {
        await apiClient.put(
          `/api/categorias/${editingId}`,
          { id: editingId, nombre: form.nombre.trim() },
          { headers: getAuthHeaders(token) }
        );
      } else {
        await apiClient.post(
          '/api/categorias',
          { nombre: form.nombre.trim() },
          { headers: getAuthHeaders(token) }
        );
      }

      setForm(emptyCategory);
      setEditingId(null);
      loadCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo guardar la categoría.';
      Alert.alert('Error', message);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({ nombre: category.nombre });
  };

  const handleDelete = async (categoryId) => {
    try {
      await apiClient.delete(`/api/categorias/${categoryId}`, {
        headers: getAuthHeaders(token),
      });
      if (editingId === categoryId) {
        setEditingId(null);
        setForm(emptyCategory);
      }
      loadCategories();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la categoría.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorías</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{editingId ? 'Editar categoría' : 'Nueva categoría'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre de la categoría"
          value={form.nombre}
          onChangeText={(value) => setForm({ nombre: value })}
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>{editingId ? 'Actualizar' : 'Guardar'}</Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setEditingId(null);
              setForm(emptyCategory);
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Listado</Text>
        {categories.length === 0 ? (
          <Text style={styles.emptyText}>No hay categorías registradas.</Text>
        ) : (
          categories.map((category) => (
            <View key={category.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{category.nombre}</Text>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.smallButton} onPress={() => handleEdit(category)}>
                  <Text style={styles.smallButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDelete(category.id)}>
                  <Text style={styles.smallButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 18,
    backgroundColor: '#111827',
  },
  backText: {
    color: '#7dd3fc',
    fontWeight: '700',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    margin: 16,
  },
  listCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    color: '#cbd5e1',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
