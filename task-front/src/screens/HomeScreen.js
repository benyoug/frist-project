import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';
import { taskApi } from '../config/axios';

const { width } = Dimensions.get('window');


const IsolatedStatusModal = React.memo(({ 
  isVisible, 
  task, 
  supportData, 
  onClose, 
  onSave 
}) => {
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const commentRef = useRef(null);

  
  useEffect(() => {
    if (isVisible && task) {
      setStatus(task.tsk_state_id);
      setComment('');
    }
  }, [isVisible, task]);

  const handleSave = () => {
    if (!status) {
      Alert.alert('Erreur', 'Veuillez sélectionner un état');
      return;
    }
    onSave(status, comment);
  };

  const handleClose = () => {
    setStatus('');
    setComment('');
    onClose();
  };

  if (!isVisible || !task) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={modalStyles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={modalStyles.header}
        >
          <View style={modalStyles.headerContent}>
            <TouchableOpacity style={modalStyles.backButton} onPress={handleClose}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Modifier l'état</Text>
            <TouchableOpacity style={modalStyles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={modalStyles.content}>
          <ScrollView 
            style={modalStyles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            {/* Task Info */}
            <View style={modalStyles.taskInfo}>
              <Text style={modalStyles.taskTitle}>
                {task.libelle_fr || task.libelle}
              </Text>
            </View>

            {/* Status Selection */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Nouvel état *</Text>
              <View style={modalStyles.statusGrid}>
                {supportData.states.map((state) => (
                  <TouchableOpacity
                    key={state.id}
                    style={[
                      modalStyles.statusCard,
                      status === state.id && modalStyles.statusCardSelected
                    ]}
                    onPress={() => setStatus(state.id)}
                  >
                    <View style={[modalStyles.statusDot, { backgroundColor: state.color }]} />
                    <Text style={modalStyles.statusText}>{state.name}</Text>
                    {status === state.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment Section */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Commentaire (optionnel)</Text>
              <View style={modalStyles.commentContainer}>
                <TextInput
                  ref={commentRef}
                  style={modalStyles.commentInput}
                  placeholder="Ajoutez vos observations..."
                  placeholderTextColor="#9ca3af"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  scrollEnabled={false}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={modalStyles.footer}>
            <TouchableOpacity style={modalStyles.cancelButton} onPress={handleClose}>
              <Text style={modalStyles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={modalStyles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={modalStyles.saveButtonGradient}
              >
                <Ionicons name="checkmark" size={20} color="#ffffff" />
                <Text style={modalStyles.saveButtonText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
});

// Styles du modal isolé
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  taskInfo: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    lineHeight: 24,
  },
  section: {
    marginBottom: 36,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  statusGrid: {
    gap: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  statusCardSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  commentContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 4,
  },
  commentInput: {
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 120,
    backgroundColor: 'transparent',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});

const HomeScreen = ({ navigation }) => {
  // ============================================================================
  // STATES
  // ============================================================================
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [supportData, setSupportData] = useState({
    states: [],
    priorities: [],
    types: [],
  });
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI States
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [searchText, setSearchText] = useState('');
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Modal States - Version ultra-simplifiée
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start');
  const [tempDate, setTempDate] = useState(new Date());
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { user, logout } = useAuthStore();

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSupportData(),
        fetchTasks(),
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportData = async () => {
    try {
      const response = await taskApi.getSupportData();
      setSupportData(response.data);
    } catch (error) {
      console.error('Erreur support data:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskApi.getTasks();
      setTasks(response.data.tasks || []);
      setProjects(response.data.tsk_list.tsk_project || []);
    } catch (error) {
      console.error('Erreur tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isTaskLate = (task) => {
    if (!task.date_fin_prev) return false;
    const finDate = new Date(task.date_fin_prev);
    const now = new Date();
    return finDate < now && task.tsk_state_id !== 3;
  };

  const getStatusText = (statusId) => {
    const status = supportData.states.find(s => s.id === statusId);
    return status ? status.name : 'Inconnu';
  };

  const getPriorityText = (priorityId) => {
    const priority = supportData.priorities.find(p => p.id === priorityId);
    return priority ? priority.name : 'Normale';
  };

  const getStatusColor = (statusId) => {
    const status = supportData.states.find(s => s.id === statusId);
    return status ? status.color : '#6b7280';
  };

  const getPriorityColor = (priorityId) => {
    const priority = supportData.priorities.find(p => p.id === priorityId);
    return priority ? priority.color : '#6b7280';
  };

  const getProjectName = (task) => {
    const project = task.tsk_list.tsk_project;
    return project ? project.libelle_fr : `Projet ${task.tsk_list_id}`;
  };

  // ============================================================================
  // STATISTICS & FILTERING
  // ============================================================================
  
  const getStats = () => {
    const total = tasks.length;
    const inProgress = tasks.filter(t => t.tsk_state_id === 2).length;
    const completed = tasks.filter(t => t.tsk_state_id === 3).length;
    const late = tasks.filter(t => isTaskLate(t)).length;
    return { total, inProgress, completed, late };
  };

  const getFilteredTasks = () => {
    if (!tasks.length) return [];
    
    let filtered = [...tasks];

    if (searchText) {
      filtered = filtered.filter(task => 
        (task.libelle_fr && task.libelle_fr.toLowerCase().includes(searchText.toLowerCase())) ||
        (task.code && task.code.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    if (isLate) {
      filtered = filtered.filter(task => isTaskLate(task));
    }

    if (selectedPriority) {
      filtered = filtered.filter(task => task.tsk_priority_id === selectedPriority);
    }

    if (selectedStatus) {
      filtered = filtered.filter(task => task.tsk_state_id === selectedStatus);
    }

    return filtered;
  };

  // ============================================================================
  // CALLBACK FUNCTIONS - SUPPRIMÉS CAR PAS NÉCESSAIRES
  // ============================================================================
  
  // Plus besoin de fonctions callback complexes

  // ============================================================================
  // DRAWER FUNCTIONS
  // ============================================================================
  
  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(slideAnim, { 
        toValue: -width, 
        duration: 300, 
        useNativeDriver: true 
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(slideAnim, { 
        toValue: 0, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const handleMenuPress = (menuItem) => {
    setDrawerVisible(false);
    setTimeout(() => {
      switch(menuItem) {
        case 'dailyTracking':
          navigation.navigate('DailyTracking');
          break;
        default:
          Alert.alert('Info', 'Fonctionnalité en développement');
      }
    }, 300);
  };

  // ============================================================================
  // MODAL FUNCTIONS - VERSION ULTRA-SIMPLIFIÉE
  // ============================================================================
  
  const openStatusModal = (task) => {
    setSelectedTask(task);
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedTask(null);
  };

  const handleStatusSave = async (statusId, comment) => {
    if (!selectedTask) return;
    
    try {
      await taskApi.changeTaskRef(selectedTask.id, statusId, 1);
      closeStatusModal();
      await fetchTasks();
      Alert.alert('Succès', 'État mis à jour avec succès');
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'état');
    }
  };

  const openPriorityModal = (task) => {
    setSelectedTask(task);
    setShowPriorityModal(true);
  };

  const closePriorityModal = () => {
    setShowPriorityModal(false);
    setSelectedTask(null);
  };

  const updateTaskPriority = async (priorityId) => {
    if (!selectedTask) return;
    
    try {
      await taskApi.changeTaskRef(selectedTask.id, priorityId, 2);
      closePriorityModal();
      await fetchTasks();
      Alert.alert('Succès', 'Priorité mise à jour avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la priorité');
    }
  };

  // ============================================================================
  // COMPONENTS
  // ============================================================================
  
  const StatCard = ({ number, label, color }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const TaskCard = ({ task }) => {
    const taskStatus = getStatusText(task.tsk_state_id);
    const taskPriority = getPriorityText(task.tsk_priority_id);
    const isLate = isTaskLate(task);

    return (
      <View style={styles.taskCard}>
        {/* Header */}
        <View style={styles.taskHeader}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: getStatusColor(task.tsk_state_id) }
            ]} />
            <Text style={[
              styles.statusLabel, 
              { color: getStatusColor(task.tsk_state_id) }
            ]}>
              {taskStatus}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.priorityBadge,
              { 
                backgroundColor: `${getPriorityColor(task.tsk_priority_id)}15`,
                borderColor: getPriorityColor(task.tsk_priority_id)
              }
            ]}
            onPress={() => openPriorityModal(task)}
          >
            <Text style={[
              styles.priorityLabel,
              { color: getPriorityColor(task.tsk_priority_id) }
            ]}>
              {taskPriority}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Titre */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {task.libelle_fr || task.libelle}
        </Text>

        {/* Métadonnées */}
        <View style={styles.metaContainer}>
          <View style={styles.projectBadge}>
            <Ionicons name="briefcase-outline" size={12} color="#6366f1" />
            <Text style={styles.projectLabel} numberOfLines={1}>
              {getProjectName(task)}
            </Text>
          </View>
          
          <View style={styles.dateInfo}>
            <Ionicons name="calendar-outline" size={12} color={isLate ? "#ef4444" : "#10b981"} />
            <Text style={[
              styles.dateLabel,
              { color: isLate ? "#ef4444" : "#10b981" }
            ]}>
              {formatDate(task.date_fin_prev)}
            </Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => openStatusModal(task)}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.buttonGradient}
            >
              <Ionicons name="create-outline" size={16} color="#ffffff" />
              <Text style={styles.buttonText}>Modifier</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Indicateur de retard */}
        {isLate && (
          <View style={styles.lateIndicator}>
            <View style={styles.lateAccent} />
          </View>
        )}
      </View>
    );
  };

  const DrawerComponent = () => (
    <Modal 
      transparent={true} 
      visible={drawerVisible} 
      onRequestClose={toggleDrawer}
      animationType="none"
    >
      <View style={styles.drawerOverlay}>
        <TouchableOpacity 
          style={styles.drawerBackground} 
          onPress={toggleDrawer}
          activeOpacity={1}
        />
        <Animated.View 
          style={[
            styles.drawerContainer, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <LinearGradient 
            colors={['#1e3a8a', '#2563eb', '#3b82f6']} 
            style={styles.drawerGradient}
          >
            {/* Header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>DCS</Text>
              </View>
              <Text style={styles.drawerTitle}>Taches</Text>
              <TouchableOpacity style={styles.closeButton} onPress={toggleDrawer}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuPress('home')}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons name="home-outline" size={24} color="#e0e7ff" />
                  <Text style={styles.menuItemText}>Taches</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuPress('dailyTracking')}
              >
                <View style={styles.menuItemContent}>
                  <Ionicons name="calendar-outline" size={24} color="#e0e7ff" />
                  <Text style={styles.menuItemText}>Suivi journalier</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.drawerFooter}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>
                    {user?.nom?.charAt(0)?.toUpperCase() || 'A'}
                    {user?.prenom?.charAt(0)?.toUpperCase() || 'D'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user?.nom || 'Admin'} {user?.prenom || 'DCS'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {user?.email || 'admin@dcs.com'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );

  const FilterModal = () => (
    <Modal 
      transparent={true} 
      visible={showFilters} 
      onRequestClose={() => setShowFilters(false)}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Checkbox En retard */}
            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setIsLate(!isLate)}
              >
                <View style={[styles.checkbox, isLate && styles.checkboxChecked]}>
                  {isLate && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>
                <Text style={styles.checkboxLabel}>En retard</Text>
              </TouchableOpacity>
            </View>

            {/* Filtre Priorité */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Priorité</Text>
              {supportData.priorities.map((priority) => (
                <TouchableOpacity 
                  key={priority.id} 
                  style={styles.filterOption}
                  onPress={() => setSelectedPriority(
                    selectedPriority === priority.id ? '' : priority.id
                  )}
                >
                  <View style={[
                    styles.radioButton, 
                    selectedPriority === priority.id && styles.radioButtonSelected
                  ]}>
                    {selectedPriority === priority.id && (
                      <View style={[
                        styles.radioDot, 
                        { backgroundColor: priority.color }
                      ]} />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>{priority.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtre État */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>État</Text>
              {supportData.states.map((state) => (
                <TouchableOpacity 
                  key={state.id} 
                  style={styles.filterOption}
                  onPress={() => setSelectedStatus(
                    selectedStatus === state.id ? '' : state.id
                  )}
                >
                  <View style={[
                    styles.radioButton, 
                    selectedStatus === state.id && styles.radioButtonSelected
                  ]}>
                    {selectedStatus === state.id && (
                      <View style={[
                        styles.radioDot, 
                        { backgroundColor: state.color }
                      ]} />
                    )}
                  </View>
                  <Text style={styles.filterOptionText}>{state.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setIsLate(false);
                setSelectedPriority('');
                setSelectedStatus('');
                setSelectedType('');
              }}
            >
              <Text style={styles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <LinearGradient 
                colors={['#1e3a8a', '#3b82f6']} 
                style={styles.buttonGradient}
              >
                <Text style={styles.applyButtonText}>Appliquer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ============================================================================
  // STATUS MODAL - SUPPRIMÉ, MAINTENANT COMPOSANT ISOLÉ AU DÉBUT DU FICHIER
  // ============================================================================

  const PriorityModal = () => (
    <Modal
      transparent={true}
      visible={showPriorityModal}
      onRequestClose={closePriorityModal}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.priorityModal}>
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            style={styles.modalHeaderGradient}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleWhite}>Sélectionner la priorité</Text>
              <TouchableOpacity onPress={closePriorityModal}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalContent}>
            <View style={styles.priorityGrid}>
              {supportData.priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.id}
                  style={styles.priorityCard}
                  onPress={() => updateTaskPriority(priority.id)}
                >
                  <View style={[
                    styles.priorityIconContainer,
                    { backgroundColor: `${priority.color}15` }
                  ]}>
                    <Ionicons name="flag" size={24} color={priority.color} />
                  </View>
                  <Text style={[
                    styles.priorityCardTitle,
                    { color: priority.color }
                  ]}>
                    {priority.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const NoTasksState = () => (
    <View style={styles.noTasksState}>
      <Ionicons name="document-outline" size={64} color="#cbd5e1" />
      <Text style={styles.noTasksTitle}>Aucune tâche trouvée</Text>
      <Text style={styles.noTasksSubtitle}>
        {searchText || isLate || selectedPriority || selectedStatus
          ? 'Aucune tâche ne correspond à vos critères'
          : 'Vous n\'avez pas encore de tâches'
        }
      </Text>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  const filteredTasks = getFilteredTasks();
  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.gradient}>
        
        {/* ========== HEADER ========== */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.menuButton} onPress={toggleDrawer}>
              <Ionicons name="menu" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>DCS Management</Text>
            
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
              <Ionicons name="options-outline" size={24} color="#ffffff" />
              {(isLate || selectedPriority || selectedStatus) && 
                <View style={styles.filterIndicator} />
              }
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une tâche..."
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="#94a3b8"
              />
              {searchText !== '' && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close" size={18} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* ========== CONTENT ========== */}
        <View style={styles.content}>
          
          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statsRow}>
                <StatCard number={stats.total.toString()} label="Total" color="#0ea5e9" />
                <StatCard number={stats.inProgress.toString()} label="En cours" color="#f59e0b" />
                <StatCard number={stats.completed.toString()} label="Terminées" color="#10b981" />
                <StatCard number={stats.late.toString()} label="En retard" color="#ef4444" />
              </View>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Mes Tâches</Text>
            <ScrollView 
              style={styles.tasksList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              showsVerticalScrollIndicator={false}
            >
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              ) : (
                <NoTasksState />
              )}
            </ScrollView>
          </View>
        </View>
      </LinearGradient>

      {/* ========== MODALS ========== */}
      <DrawerComponent />
      <FilterModal />
      
      {/* Modal StatusModal complètement isolé */}
      <IsolatedStatusModal
        isVisible={showStatusModal}
        task={selectedTask}
        supportData={supportData}
        onClose={closeStatusModal}
        onSave={handleStatusSave}
      />
      
      <PriorityModal />
      
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // ============================================================================
  // BASE STYLES
  // ============================================================================
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb' 
  },
  gradient: { 
    flex: 1 
  },
  
  // ============================================================================
  // HEADER STYLES
  // ============================================================================
  header: { 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 30 
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  menuButton: { 
    padding: 10, 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 12 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#ffffff', 
    flex: 1,
    textAlign: 'center',
  },
  filterButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    padding: 10, 
    borderRadius: 12, 
    position: 'relative' 
  },
  filterIndicator: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    width: 8, 
    height: 8, 
    backgroundColor: '#ef4444', 
    borderRadius: 4 
  },

  // ============================================================================
  // SEARCH STYLES
  // ============================================================================
  searchContainer: { 
    marginTop: 15 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 50, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  searchIcon: { 
    marginRight: 12 
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#1e293b', 
    fontWeight: '500' 
  },

  // ============================================================================
  // CONTENT STYLES
  // ============================================================================
  content: { 
    flex: 1, 
    backgroundColor: '#f9fafb', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    paddingTop: 24 
  },

  // ============================================================================
  // STATISTICS STYLES
  // ============================================================================
  statsContainer: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  statsCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 20, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  statCard: { 
    alignItems: 'center', 
    flex: 1 
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: '800', 
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statLabel: { 
    fontSize: 12, 
    color: '#64748b', 
    fontWeight: '600', 
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  // ============================================================================
  // TASKS SECTION STYLES
  // ============================================================================
  tasksSection: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  tasksList: { 
    flex: 1 
  },

  // ============================================================================
  // TASK CARD STYLES
  // ============================================================================
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'relative',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    flex: 1,
    marginRight: 12,
  },
  projectLabel: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
    letterSpacing: 0.1,
  },
  lateIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  lateAccent: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ef4444',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  // ============================================================================
  // NO TASKS STATE STYLES
  // ============================================================================
  noTasksState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noTasksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  noTasksSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // ============================================================================
  // DRAWER STYLES
  // ============================================================================
  drawerOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)' 
  },
  drawerBackground: { 
    flex: 1 
  },
  drawerContainer: { 
    position: 'absolute', 
    left: 0, 
    top: 0, 
    bottom: 0, 
    width: width * 0.8, 
    maxWidth: 320 
  },
  drawerGradient: { 
    flex: 1 
  },
  drawerHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 30 
  },
  logoContainer: { 
    width: 100, 
    height: 60, 
    backgroundColor: '#ffffff', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 15,
  },
  logoText: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1e3a8a', 
    letterSpacing: 3 
  },
  drawerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#ffffff',
    flex: 1,
    marginLeft: 15,
  },
  closeButton: { 
    padding: 8 
  },
  menuContainer: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 18, 
    paddingHorizontal: 16, 
    marginBottom: 8, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 12 
  },
  menuItemContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  menuItemText: { 
    fontSize: 16, 
    color: '#ffffff', 
    fontWeight: '500',
    marginLeft: 16,
  },
  drawerFooter: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255, 255, 255, 0.2)' 
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  userAvatar: { 
    width: 50, 
    height: 50, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  userInitials: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  userDetails: { 
    flex: 1 
  },
  userName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 2 
  },
  userEmail: { 
    fontSize: 14, 
    color: '#e0e7ff' 
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(239, 68, 68, 0.2)', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.3)' 
  },
  logoutText: { 
    fontSize: 16, 
    color: '#ffffff', 
    marginLeft: 8, 
    fontWeight: '500' 
  },

  // ============================================================================
  // MODAL BASE STYLES
  // ============================================================================
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 20 
  },
  modalHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  modalTitleWhite: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#ffffff' 
  },
  modalContent: { 
    padding: 24 
  },
  modalFooter: { 
    flexDirection: 'row', 
    padding: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9' 
  },
  clearButton: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginRight: 12, 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  clearButtonText: { 
    fontSize: 16, 
    color: '#64748b', 
    fontWeight: '600' 
  },
  applyButton: { 
    flex: 2, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  applyButtonText: { 
    fontSize: 16, 
    color: '#ffffff', 
    fontWeight: '700' 
  },

  // ============================================================================
  // FILTER MODAL STYLES
  // ============================================================================
  filterModal: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    maxHeight: '85%' 
  },
  filterSection: { 
    marginBottom: 28 
  },
  filterTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  checkboxRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  checkbox: { 
    width: 22, 
    height: 22, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: '#cbd5e1', 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  checkboxChecked: { 
    backgroundColor: '#3b82f6', 
    borderColor: '#3b82f6' 
  },
  checkboxLabel: { 
    fontSize: 16, 
    color: '#374151', 
    fontWeight: '500' 
  },
  filterOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10 
  },
  radioButton: { 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    borderWidth: 2, 
    borderColor: '#cbd5e1', 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  radioButtonSelected: { 
    borderColor: '#3b82f6' 
  },
  radioDot: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    backgroundColor: '#3b82f6' 
  },
  filterOptionText: { 
    fontSize: 16, 
    color: '#374151', 
    fontWeight: '500' 
  },

  // ============================================================================
  // STATUS MODAL STYLES
  // ============================================================================
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeaderGradient: {
    paddingVertical: 16,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  fullScreenContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
  },
  fullScreenFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
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
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },

  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 6,
  },

  
  priorityModal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  priorityGrid: {
    gap: 16,
  },
  priorityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priorityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default HomeScreen;

