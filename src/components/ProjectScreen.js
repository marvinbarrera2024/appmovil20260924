import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { apiClient, getAuthHeaders } from '../services/api';

const emptyProject = {
  titulo: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  categoriaId: '',
};

export default function ProjectScreen({ token, onBack }) {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [editingId, setEditingId] = useState(null);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/api/categorias/lista', {
        headers: getAuthHeaders(token),
      });
      const fetchedCategories = response.data || [];
      setCategories(fetchedCategories);

      if (fetchedCategories.length > 0 && !form.categoriaId) {
        setForm((prev) => ({ ...prev, categoriaId: String(fetchedCategories[0].id) }));
      }
    } catch (error) {
      console.log('Error categorías:', error.response?.data || error.message);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/api/proyectos/lista', {
        headers: getAuthHeaders(token),
      });
      setProjects(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los proyectos.');
    }
  };

  useEffect(() => {
    if (token) {
      loadCategories();
      loadProjects();
    }
  }, [token]);

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      Alert.alert('Validación', 'Completa título y descripción del proyecto.');
      return;
    }

    if (!form.fechaInicio || !form.fechaFin) {
      Alert.alert('Validación', 'Debes ingresar fecha de inicio y fin.');
      return;
    }

    const categoriaId = Number(form.categoriaId);
    if (!categoriaId || Number.isNaN(categoriaId)) {
      Alert.alert('Validación', 'Ingresa un ID de categoría válido.');
      return;
    }

    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        fechaInicio: form.fechaInicio,
        fechaFin: form.fechaFin,
        categoriaId,
      };

      if (editingId) {
        await apiClient.put(`/api/proyectos/${editingId}`, { id: editingId, ...payload }, {
          headers: getAuthHeaders(token),
        });
      } else {
        await apiClient.post('/api/proyectos', payload, {
          headers: getAuthHeaders(token),
        });
      }

      setForm(emptyProject);
      setEditingId(null);
      loadProjects();
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo guardar el proyecto.';
      Alert.alert('Error', message);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      titulo: project.titulo,
      descripcion: project.descripcion,
      fechaInicio: project.fechaInicio,
      fechaFin: project.fechaFin,
      categoriaId: String(project.categoria?.id || ''),
    });
  };

  const handleDelete = async (projectId) => {
    try {
      await apiClient.delete(`/api/proyectos/${projectId}`, {
        headers: getAuthHeaders(token),
      });
      if (editingId === projectId) {
        setEditingId(null);
        setForm(emptyProject);
      }
      loadProjects();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el proyecto.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proyectos</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{editingId ? 'Editar proyecto' : 'Nuevo proyecto'}</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          value={form.titulo}
          onChangeText={(value) => setForm({ ...form, titulo: value })}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          multiline
          numberOfLines={4}
          value={form.descripcion}
          onChangeText={(value) => setForm({ ...form, descripcion: value })}
        />

        <TextInput
          style={styles.input}
          placeholder="Fecha inicio (YYYY-MM-DD)"
          value={form.fechaInicio}
          onChangeText={(value) => setForm({ ...form, fechaInicio: value })}
        />

        <TextInput
          style={styles.input}
          placeholder="Fecha fin (YYYY-MM-DD)"
          value={form.fechaFin}
          onChangeText={(value) => setForm({ ...form, fechaFin: value })}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Categoría</Text>
          <Picker
            selectedValue={form.categoriaId}
            onValueChange={(value) => setForm({ ...form, categoriaId: value })}
            style={styles.picker}
            dropdownIconColor="#fff"
            enabled={categories.length > 0}
          >
            <Picker.Item label="Selecciona una categoría" value="" />
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.nombre} value={String(category.id)} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Text style={styles.primaryButtonText}>{editingId ? 'Actualizar' : 'Guardar'}</Text>
        </TouchableOpacity>

        {editingId ? (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setEditingId(null);
              setForm(emptyProject);
            }}
          >
            <Text style={styles.secondaryButtonText}>Cancelar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.listCard}>
        <Text style={styles.sectionTitle}>Listado</Text>
        {projects.length === 0 ? (
          <Text style={styles.emptyText}>No hay proyectos registrados.</Text>
        ) : (
          projects.map((project) => (
            <View key={project.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{project.titulo}</Text>
                <Text style={styles.itemMeta}>Categoría: {project.categoria?.nombre || 'Sin categoría'}</Text>
                <Text style={styles.itemMeta}>{project.fechaInicio} - {project.fechaFin}</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.smallButton} onPress={() => handleEdit(project)}>
                  <Text style={styles.smallButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.smallButton, styles.deleteButton]} onPress={() => handleDelete(project.id)}>
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
  pickerContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
    overflow: 'hidden',
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  picker: {
    color: '#fff',
    backgroundColor: '#1f2937',
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
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
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  itemMeta: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    marginTop: 10,
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
