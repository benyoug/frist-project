import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const TaskTrackingScreen = ({ navigation, route }) => {
  const { projectId, projectName } = route.params || {};

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "test tekwine (espace direction )",
      project: "TEKWINE",
      status: "Suivi",
      priority: "Moyenne",
      dueDate: "09-05-2025",
      comment: "",
      assignee: "Ai",
      projectId: 1,
      history: [
        { date: "2025-05-02 13:38:25", status: "Ouvert", comment: "-" },
        { date: "2025-06-11 11:07:09", status: "En cours", comment: "-" }
      ]
    },
    {
      id: 2,
      title: "Tests et déploiement du système DIWANE pour El Mina",
      project: "DIWANE",
      status: "Suivi",
      priority: "Urgente",
      dueDate: "15-05-2025",
      comment: "",
      assignee: "Ai",
      projectId: 4,
      history: [
        { date: "2025-05-01 09:00:00", status: "Ouvert", comment: "Début du projet" },
        { date: "2025-05-15 14:30:00", status: "En cours", comment: "Phase de développement" }
      ]
    },
    {
      id: 3,
      title: "TEKWINE (modification pointage )",
      project: "TEKWINE",
      status: "Suivi",
      priority: "Haute",
      dueDate: "20-05-2025",
      comment: "",
      assignee: "Ai",
      projectId: 1,
      history: [
        { date: "2025-05-10 10:15:00", status: "Ouvert", comment: "-" }
      ]
    }
  ]);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSuiviModal, setShowSuiviModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempComment, setTempComment] = useState('');
  const [tempStatus, setTempStatus] = useState('');

  const statuses = [
    { value: 'Ouvert', color: '#6b7280', label: 'Ouvert' },
    { value: 'En cours', color: '#3b82f6', label: 'En cours' },
    { value: 'Terminé', color: '#10b981', label: 'Terminé' }
  ];

  const priorities = [
    { value: 'Urgente', color: '#ef4444', label: 'Urgente' },
    { value: 'Haute', color: '#f59e0b', label: 'Haute' },
    { value: 'Moyenne', color: '#3b82f6', label: 'Moyenne' },
    { value: 'Basse', color: '#6b7280', label: 'Basse' }
  ];

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.color : '#6b7280';
  };

  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6b7280';
  };

  const openStatusModal = (task) => {
    setSelectedTask(task);
    setTempComment('');
    setTempStatus(task.status);
    setShowStatusModal(true);
  };

  const openSuiviModal = (task) => {
    setSelectedTask(task);
    setShowSuiviModal(true);
  };

  const updateTaskStatus = () => {
    if (!tempStatus || !selectedTask) return;

    const newHistoryEntry = {
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      status: tempStatus,
      comment: tempComment || '-'
    };

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === selectedTask.id
          ? { 
              ...task, 
              status: tempStatus, 
              comment: tempComment,
              history: [...(task.history || []), newHistoryEntry]
            }
          : task
      )
    );
    
    setShowStatusModal(false);
    setSelectedTask(null);
    setTempComment('');
    setTempStatus('');
  };

  // Filtrer les tâches par projet si un projectId est fourni
  const filteredTasks = projectId 
    ? tasks.filter(task => task.projectId === projectId)
    : tasks;

  const TaskCard = ({ task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(task.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>{task.status}</Text>
        </View>
        <TouchableOpacity
          style={styles.priorityButton}
          onPress={() => {}}
        >
          <Ionicons name="flag" size={16} color={getPriorityColor(task.priority)} />
        </TouchableOpacity>
      </View>

      <Text style={styles.taskTitle}>{task.title}</Text>
      
      <View style={styles.taskMeta}>
        <Text style={styles.dueDateText}>{task.dueDate}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.suiviButton}
          onPress={() => openSuiviModal(task)}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.suiviButtonGradient}
          >
            <Ionicons name="list-outline" size={16} color="#ffffff" />
            <Text style={styles.suiviButtonText}>Suivi</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openStatusModal(task)}
        >
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            style={styles.editButtonGradient}
          >
            <Ionicons name="create-outline" size={16} color="#ffffff" />
            <Text style={styles.editButtonText}>État</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const SuiviModal = () => (
    <Modal
      transparent={true}
      visible={showSuiviModal}
      onRequestClose={() => setShowSuiviModal(false)}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.suiviModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Suivi des tâches</Text>
            <TouchableOpacity onPress={() => setShowSuiviModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.tableContainer}>
            {/* En-têtes du tableau */}
            <View style={styles.tableHeader}>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Commentaire</Text>
                <Ionicons name="chevron-up" size={16} color="#64748b" />
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>État</Text>
                <Ionicons name="chevron-up" size={16} color="#64748b" />
              </View>
              <View style={styles.headerCell}>
                <Text style={styles.headerText}>Date</Text>
              </View>
            </View>

            {/* Contenu du tableau */}
            <ScrollView style={styles.tableContent}>
              {selectedTask?.history?.length > 0 ? (
                selectedTask.history.map((entry, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.tableCell}>
                      <Text style={styles.cellText}>{entry.comment}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(entry.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(entry.status) }]}>
                          {entry.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tableCell}>
                      <Text style={styles.cellText}>{entry.date}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.noDataState}>
                  <Ionicons name="document-outline" size={50} color="#cbd5e1" />
                  <Text style={styles.noDataText}>Aucun historique disponible</Text>
                </View>
              )}
            </ScrollView>

            {/* Pagination */}
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>
                1 à {selectedTask?.history?.length || 0} sur {selectedTask?.history?.length || 0} éléments
              </Text>
              <View style={styles.paginationControls}>
                <TouchableOpacity style={styles.paginationButton}>
                  <Ionicons name="chevron-back" size={16} color="#64748b" />
                </TouchableOpacity>
                <View style={styles.currentPage}>
                  <Text style={styles.currentPageText}>1</Text>
                </View>
                <TouchableOpacity style={styles.paginationButton}>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const StatusModal = () => (
    <Modal
      transparent={true}
      visible={showStatusModal}
      onRequestClose={() => setShowStatusModal(false)}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.statusModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Changer l'état</Text>
            <TouchableOpacity onPress={() => setShowStatusModal(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>État *</Text>
              <View style={styles.statusOptions}>
                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusOption,
                      tempStatus === status.value && styles.selectedStatusOption
                    ]}
                    onPress={() => setTempStatus(status.value)}
                  >
                    <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                    <Text style={styles.statusOptionText}>{status.label}</Text>
                    {tempStatus === status.value && (
                      <Ionicons name="checkmark" size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Commentaire</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Ajouter un commentaire..."
                value={tempComment}
                onChangeText={setTempComment}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={updateTaskStatus}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.saveButtonGradient}
              >
                <Ionicons name="save-outline" size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {projectName ? `Suivi - ${projectName}` : 'Suivi des tâches'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <ScrollView style={styles.tasksList} showsVerticalScrollIndicator={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <View style={styles.noTasksState}>
              <Ionicons name="list-outline" size={80} color="#cbd5e1" />
              <Text style={styles.noTasksTitle}>Aucune tâche</Text>
              <Text style={styles.noTasksSubtitle}>
                Aucune tâche n'est disponible pour ce projet
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <SuiviModal />
      <StatusModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  tasksList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  priorityButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginLeft: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 22,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  dueDateText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suiviButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  suiviButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  suiviButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  editButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
  noTasksState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noTasksTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  noTasksSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  suiviModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  statusModal: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },

  // Table styles
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  tableContent: {
    flex: 1,
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  noDataState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  paginationText: {
    fontSize: 14,
    color: '#64748b',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationButton: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currentPage: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  currentPageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Status Modal
  modalContent: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusOptions: {
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedStatusOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  commentInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#374151',
    minHeight: 80,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
  },
});

export default TaskTrackingScreen;