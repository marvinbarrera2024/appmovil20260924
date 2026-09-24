import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { apiClient, getAuthHeaders } from '../services/api';

const emptyTask = {
  nombre: '',
  descripcion: '',
  duracion: '',
  proyectoId: '',
};

export default function TaskScreen({ token, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [loading, setLoading] = useState(false);

  const loadProjects = async () => {
    try {
      const response = await apiClient.get('/api/proyectos/lista', {
        headers: getAuthHeaders(token),
      });
      const fetchedProjects = response.data || [];
      setProjects(fetchedProjects);

      if (fetchedProjects.length > 0 && !taskForm.proyectoId) {
        setTaskForm((prev) => ({ ...prev, proyectoId: String(fetchedProjects[0].id) }));
      }
    } catch (error) {
      console.log('Error proyectos:', error.response?.data || error.message);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/tareas/lista', {
        headers: getAuthHeaders(token),
      });
      setTasks(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las tareas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProjects();
      loadTasks();
    }
  }, [token]);

  const handleCreateTask = async () => {
    if (!taskForm.nombre.trim() || !taskForm.descripcion.trim() || !taskForm.duracion.trim()) {
      Alert.alert('Validación', 'Completa nombre, descripción y duración.');
      return;
    }

    const proyectoId = Number(taskForm.proyectoId);
    if (!proyectoId || Number.isNaN(proyectoId)) {
      Alert.alert('Validación', 'Ingresa un ID de proyecto válido.');
      return;
    }

    try {
      await apiClient.post(
        '/api/tareas',
        {
          nombre: taskForm.nombre.trim(),
          descripcion: taskForm.descripcion.trim(),
          duracion: taskForm.duracion.trim(),
          proyectoId,
        },
        { headers: getAuthHeaders(token) }
      );

      Alert.alert('Éxito', 'Tarea creada correctamente.');
      setTaskForm(emptyTask);
      loadTasks();
    } catch (error) {
      const message = error.response?.data?.message || 'No se pudo crear la tarea.';
      Alert.alert('Error', message);
    }
  };

  const handleUpdateTaskState = async (taskId, currentState) => {
    const nextState = currentState === 'PENDIENTE' ? 'COMPLETADO' : 'PENDIENTE';
    try {
      await apiClient.patch(
        '/api/tareas',
        { id: taskId, estado: nextState },
        { headers: getAuthHeaders(token) }
      );
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado de la tarea.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await apiClient.delete(`/api/tareas/${taskId}`, {
        headers: getAuthHeaders(token),
      });
      loadTasks();
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la tarea.');
    }
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskCard} key={item.id?.toString()}>
      <View style={styles.taskHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskTitle}>{item.nombre}</Text>
          <Text style={styles.taskMeta}>Proyecto: {item.proyecto?.titulo || 'Sin proyecto'}</Text>
          <Text style={styles.taskMeta}>Estado: {item.estado || 'SIN_ESTADO'}</Text>
        </View>
        <View style={[styles.estadoBadge, item.estado === 'PENDIENTE' ? styles.pendingBadge : styles.doneBadge]}>
          <Text style={styles.estadoBadgeText}>{item.estado || 'N/A'}</Text>
        </View>
      </View>

      <Text style={styles.taskDescription}>{item.descripcion}</Text>
      <Text style={styles.taskMeta}>Duración: {item.duracion}</Text>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => handleUpdateTaskState(item.id, item.estado)}
        >
          <Text style={styles.actionButtonText}>Cambiar estado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={() => handleDeleteTask(item.id)}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tareas</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nueva tarea</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre de la tarea"
            value={taskForm.nombre}
            onChangeText={(value) => setTaskForm({ ...taskForm, nombre: value })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción"
            multiline
            numberOfLines={4}
            value={taskForm.descripcion}
            onChangeText={(value) => setTaskForm({ ...taskForm, descripcion: value })}
          />

          <TextInput
            style={styles.input}
            placeholder="Duración"
            value={taskForm.duracion}
            onChangeText={(value) => setTaskForm({ ...taskForm, duracion: value })}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Proyecto</Text>
            <Picker
              selectedValue={taskForm.proyectoId}
              onValueChange={(value) => setTaskForm({ ...taskForm, proyectoId: value })}
              style={styles.picker}
              dropdownIconColor="#fff"
              enabled={projects.length > 0}
            >
              <Picker.Item label="Selecciona un proyecto" value="" />
              {projects.map((project) => (
                <Picker.Item key={project.id} label={project.titulo} value={String(project.id)} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity style={styles.primaryButtonLarge} onPress={handleCreateTask}>
            <Text style={styles.primaryButtonText}>Guardar tarea</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Proyectos disponibles</Text>
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No hay proyectos cargados.</Text>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.titulo}</Text>
                <Text style={styles.projectMeta}>ID: {project.id}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Listado de tareas</Text>
          {loading ? (
            <Text style={styles.emptyText}>Cargando tareas...</Text>
          ) : tasks.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay tareas registradas.</Text>
          ) : (
            <FlatList
              data={tasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id?.toString()}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
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
  primaryButtonLarge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  projectItem: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  projectName: {
    color: '#fff',
    fontWeight: '700',
  },
  projectMeta: {
    color: '#cbd5e1',
    marginTop: 4,
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  taskCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  taskMeta: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4,
  },
  taskDescription: {
    color: '#e5e7eb',
    marginBottom: 8,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  estadoBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pendingBadge: {
    backgroundColor: '#fbbf24',
  },
  doneBadge: {
    backgroundColor: '#22c55e',
  },
  estadoBadgeText: {
    color: '#00130a',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
