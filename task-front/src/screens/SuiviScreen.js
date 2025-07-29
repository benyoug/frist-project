import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { suiviAPI, taskApi } from '../config/axios';
import useAuthStore from '../stores/useAuthStore';

const { width } = Dimensions.get('window');

const SuiviScreen = ({ navigation }) => {
  // ============================================================================
  // STATES
  // ============================================================================
  
  // Data States
  const [suivis, setSuivis] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [supportData, setSupportData] = useState({
    states: [],
    priorities: [],
    types: [],
    types_horaires: []
  });
  
  // Loading States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSuivi, setEditingSuivi] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [currentDateField, setCurrentDateField] = useState('');
  
  // Form States
  const [formData, setFormData] = useState({
    task_id: '',
    date_suivi: '',
    heure_debut: '',
    heure_fin: '',
    type_horaire_id: '',
    description: '',
    observations: ''
  });

  const { user } = useAuthStore();

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTask || dateStart || dateEnd) {
      fetchSuivis();
    }
  }, [selectedTask, dateStart, dateEnd]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================
  
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSupportData(),
        fetchTasks(),
        fetchSuivis(),
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
    } catch (error) {
      console.error('Erreur tasks:', error);
    }
  };

  const fetchSuivis = async () => {
    try {
      const filters = {};
      if (selectedTask) filters.task_id = selectedTask;
      if (dateStart) filters.date_start = dateStart;
      if (dateEnd) filters.date_end = dateEnd;
      
      const response = await suiviAPI.getSuivis(filters);
      setSuivis(response.data.suivis || []);
    } catch (error) {
      console.error('Erreur suivis:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  // ============================================================================
  // FORM FUNCTIONS
  // ============================================================================
  
  const resetForm = () => {
    setFormData({
      task_id: '',
      date_suivi: '',
      heure_debut: '',
      heure_fin: '',
      type_horaire_id: '',
      description: '',
      observations: ''
    });
  };

  const validateForm = () => {
    if (!formData.task_id) {
      Alert.alert('Erreur', 'Veuillez sélectionner une tâche');
      return false;
    }
    if (!formData.date_suivi) {
      Alert.alert('Erreur', 'Veuillez sélectionner une date');
      return false;
    }
    if (!formData.heure_debut) {
      Alert.alert('Erreur', 'Veuillez saisir l\'heure de début');
      return false;
    }
    if (!formData.heure_fin) {
      Alert.alert('Erreur', 'Veuillez saisir l\'heure de fin');
      return false;
    }
    if (!formData.type_horaire_id) {
      Alert.alert('Erreur', 'Veuillez sélectionner un type d\'horaire');
      return false;
    }
    return true;
  };

  const handleAddSuivi = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      await suiviAPI.addSuivi(formData);
      setShowAddModal(false);
      resetForm();
      await fetchSuivis();
      Alert.alert('Succès', 'Suivi ajouté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter le suivi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSuivi = async () => {
    if (!validateForm() || !editingSuivi) return;
    
    setSubmitting(true);
    try {
      await suiviAPI.updateSuivi(editingSuivi.id, formData);
      setShowEditModal(false);
      setEditingSuivi(null);
      resetForm();
      await fetchSuivis();
      Alert.alert('Succès', 'Suivi modifié avec succès');
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      Alert.alert('Erreur', 'Impossible de modifier le suivi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSuivi = (suivi) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce suivi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: async () => {
            try {
              await suiviAPI.deleteSuivi(suivi.id);
              await fetchSuivis();
              Alert.alert('Succès', 'Suivi supprimé avec succès');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le suivi');
            }
          }
        }
      ]
    );
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

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const calculateDuration = (heureDebut, heureFin) => {
    if (!heureDebut || !heureFin) return '0h00';
    
    const [debutH, debutM] = heureDebut.split(':').map(Number);
    const [finH, finM] = heureFin.split(':').map(Number);
    
    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;
    
    const diffMinutes = finMinutes - debutMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const getTaskName = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    return task ? (task.libelle_fr || task.libelle) : 'Tâche inconnue';
  };

  const getTypeHoraireName = (typeId) => {
    const type = supportData.types_horaires?.find(t => t.id === typeId);
    return type ? type.name : 'Type inconnu';
  };

  // ============================================================================
  // DATE PICKER FUNCTIONS
  // ============================================================================
  
  const openDatePicker = (field, mode = 'date') => {
    setCurrentDateField(field);
    setDatePickerMode(mode);
    setShowDatePicker(true);
    
    if (field === 'date_suivi' && formData.date_suivi) {
      setTempDate(new Date(formData.date_suivi));
    } else {
      setTempDate(new Date());
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    
    if (selectedDate && currentDateField) {
      if (datePickerMode === 'date') {
        const dateString = selectedDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, [currentDateField]: dateString }));
      } else if (datePickerMode === 'time') {
        const timeString = selectedDate.toTimeString().substring(0, 5);
        setFormData(prev => ({ ...prev, [currentDateField]: timeString }));
      }
    }
  };

  // ============================================================================
  // MODAL FUNCTIONS
  // ============================================================================
  
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (suivi) => {
    setEditingSuivi(suivi);
    setFormData({
      task_id: suivi.task_id || '',
      date_suivi: suivi.date_suivi || '',
      heure_debut: suivi.heure_debut || '',
      heure_fin: suivi.heure_fin || '',
      type_horaire_id: suivi.type_horaire_id || '',
      description: suivi.description || '',
      observations: suivi.observations || ''
    });
    setShowEditModal(true);
  };

  // ============================================================================
  // COMPONENTS
  // ============================================================================
  
  const SuiviCard = ({ suivi }) => {
    const duration = calculateDuration(suivi.heure_debut, suivi.heure_fin);
    const taskName = getTaskName(suivi.task_id);
    const typeHoraire = getTypeHoraireName(suivi.type_horaire_id);

    return (
      <View style={styles.suiviCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
            <Text style={styles.dateText}>{formatDate(suivi.date_suivi)}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => openEditModal(suivi)}
            >
              <Ionicons name="create-outline" size={18} color="#6366f1" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteSuivi(suivi)}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Task Info */}
        <Text style={styles.taskTitle} numberOfLines={2}>
          {taskName}
        </Text>

        {/* Time Info */}
        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={14} color="#64748b" />
            <Text style={styles.timeText}>
              {formatTime(suivi.heure_debut)} - {formatTime(suivi.heure_fin)}
            </Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{duration}</Text>
            </View>
          </View>
          
          <View style={styles.typeContainer}>
            <Text style={styles.typeLabel}>{typeHoraire}</Text>
          </View>
        </View>

        {/* Description */}
        {suivi.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={3}>
              {suivi.description}
            </Text>
          </View>
        )}

        {/* Observations */}
        {suivi.observations && (
          <View style={styles.observationsContainer}>
            <Text style={styles.observationsLabel}>Observations:</Text>
            <Text style={styles.observationsText} numberOfLines={2}>
              {suivi.observations}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const FormModal = ({ visible, onClose, onSubmit, title, isEdit = false }) => (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={styles.modalHeader}
        >
          <View style={styles.modalHeaderContent}>
            <TouchableOpacity style={styles.backButton} onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={{ width: 44 }} />
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Sélection de tâche */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Tâche *</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>
                {formData.task_id ? getTaskName(formData.task_id) : 'Sélectionner une tâche'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </View>
            <ScrollView style={styles.optionsList} nestedScrollEnabled>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.optionItem,
                    formData.task_id === task.id && styles.selectedOption
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, task_id: task.id }))}
                >
                  <Text style={[
                    styles.optionText,
                    formData.task_id === task.id && styles.selectedOptionText
                  ]}>
                    {task.libelle_fr || task.libelle}
                  </Text>
                  {formData.task_id === task.id && (
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date de suivi */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Date *</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => openDatePicker('date_suivi', 'date')}
            >
              <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
              <Text style={[
                styles.dateText,
                !formData.date_suivi && styles.placeholderText
              ]}>
                {formData.date_suivi ? formatDate(formData.date_suivi) : 'Sélectionner une date'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Heures */}
          <View style={styles.timeRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.fieldLabel}>Heure début *</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openDatePicker('heure_debut', 'time')}
              >
                <Ionicons name="time-outline" size={20} color="#9ca3af" />
                <Text style={[
                  styles.timeText,
                  !formData.heure_debut && styles.placeholderText
                ]}>
                  {formData.heure_debut || 'HH:MM'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Heure fin *</Text>
              <TouchableOpacity 
                style={styles.timeInput}
                onPress={() => openDatePicker('heure_fin', 'time')}
              >
                <Ionicons name="time-outline" size={20} color="#9ca3af" />
                <Text style={[
                  styles.timeText,
                  !formData.heure_fin && styles.placeholderText
                ]}>
                  {formData.heure_fin || 'HH:MM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Type horaire */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Type horaire *</Text>
            <View style={styles.typeGrid}>
              {supportData.types_horaires?.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    formData.type_horaire_id === type.id && styles.selectedTypeCard
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type_horaire_id: type.id }))}
                >
                  <Text style={[
                    styles.typeCardText,
                    formData.type_horaire_id === type.id && styles.selectedTypeCardText
                  ]}>
                    {type.name}
                  </Text>
                  {formData.type_horaire_id === type.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Description du travail effectué..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Observations */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Observations</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Observations particulières..."
              value={formData.observations}
              onChangeText={(text) => setFormData(prev => ({ ...prev, observations: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={onSubmit}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.submitButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {submitting ? 'En cours...' : (isEdit ? 'Modifier' : 'Ajouter')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode={datePickerMode}
          display="default"
          onChange={handleDateChange}
        />
      )}
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
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContent}>
            {/* Filtre par tâche */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Tâche</Text>
              <ScrollView style={styles.taskFilter} nestedScrollEnabled>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedTask === '' && styles.selectedFilterOption
                  ]}
                  onPress={() => setSelectedTask('')}
                >
                  <Text style={styles.filterOptionText}>Toutes les tâches</Text>
                </TouchableOpacity>
                {tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.filterOption,
                      selectedTask === task.id && styles.selectedFilterOption
                    ]}
                    onPress={() => setSelectedTask(task.id)}
                  >
                    <Text style={styles.filterOptionText} numberOfLines={2}>
                      {task.libelle_fr || task.libelle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Filtre par période */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Période</Text>
              
              <TouchableOpacity 
                style={styles.dateFilterInput}
                onPress={() => {
                  setCurrentDateField('dateStart');
                  setDatePickerMode('date');
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                <Text style={[
                  styles.dateFilterText,
                  !dateStart && styles.placeholderText
                ]}>
                  {dateStart ? formatDate(dateStart) : 'Date de début'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.dateFilterInput}
                onPress={() => {
                  setCurrentDateField('dateEnd');
                  setDatePickerMode('date');
                  setShowDatePicker(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#9ca3af" />
                <Text style={[
                  styles.dateFilterText,
                  !dateEnd && styles.placeholderText
                ]}>
                  {dateEnd ? formatDate(dateEnd) : 'Date de fin'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.filterFooter}>
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedTask('');
                setDateStart('');
                setDateEnd('');
              }}
            >
              <Text style={styles.clearFiltersText}>Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <LinearGradient 
                colors={['#1e3a8a', '#3b82f6']} 
                style={styles.applyFiltersGradient}
              >
                <Text style={styles.applyFiltersText}>Appliquer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Date Picker for filters */}
      {showDatePicker && (currentDateField === 'dateStart' || currentDateField === 'dateEnd') && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const dateString = selectedDate.toISOString().split('T')[0];
              if (currentDateField === 'dateStart') {
                setDateStart(dateString);
              } else if (currentDateField === 'dateEnd') {
                setDateEnd(dateString);
              }
            }
          }}
        />
      )}
    </Modal>
  );

  const NoSuivisState = () => (
    <View style={styles.noSuivisState}>
      <Ionicons name="time-outline" size={64} color="#cbd5e1" />
      <Text style={styles.noSuivisTitle}>Aucun suivi trouvé</Text>
      <Text style={styles.noSuivisSubtitle}>
        {selectedTask || dateStart || dateEnd
          ? 'Aucun suivi ne correspond à vos critères'
          : 'Commencez par ajouter un suivi de temps'
        }
      </Text>
      <TouchableOpacity style={styles.addFirstButton} onPress={openAddModal}>
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.addFirstGradient}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addFirstText}>Ajouter un suivi</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.gradient}>
        
        {/* ========== HEADER ========== */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Suivi des tâches</Text>
            
            <TouchableOpacity 
              style={styles.filterButton} 
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options-outline" size={24} color="#ffffff" />
              {(selectedTask || dateStart || dateEnd) && 
                <View style={styles.filterIndicator} />
              }
            </TouchableOpacity>
          </View>

          {/* Stats rapides */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{suivis.length}</Text>
              <Text style={styles.statLabel}>Suivis</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {suivis.reduce((total, suivi) => {
                  const duration = calculateDuration(suivi.heure_debut, suivi.heure_fin);
                  const hours = parseInt(duration.split('h')[0]) || 0;
                  const minutes = parseInt(duration.split('h')[1]) || 0;
                  return total + hours + (minutes / 60);
                }, 0).toFixed(1)}h
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* ========== CONTENT ========== */}
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.sectionTitle}>Historique des suivis</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={openAddModal}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={20} color="#ffffff" />
                <Text style={styles.addButtonText}>Ajouter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Liste des suivis */}
          <FlatList
            data={suivis}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <SuiviCard suivi={item} />}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={suivis.length === 0 ? styles.emptyList : styles.list}
            ListEmptyComponent={<NoSuivisState />}
          />
        </View>
      </LinearGradient>

      {/* ========== MODALS ========== */}
      <FormModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSuivi}
        title="Nouveau suivi"
        isEdit={false}
      />

      <FormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSuivi(null);
          resetForm();
        }}
        onSubmit={handleEditSuivi}
        title="Modifier le suivi"
        isEdit={true}
      />

      <FilterModal />
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
  backButton: { 
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
  // STATS STYLES
  // ============================================================================
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e7ff',
    fontWeight: '600',
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#1e293b',
    letterSpacing: -0.3,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // ============================================================================
  // LIST STYLES
  // ============================================================================
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },

  // ============================================================================
  // SUIVI CARD STYLES
  // ============================================================================
  suiviCard: {
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 12,
  },
  timeContainer: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  typeContainer: {
    alignSelf: 'flex-start',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  descriptionContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  observationsContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 12,
  },
  observationsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },

  // ============================================================================
  // NO SUIVIS STATE STYLES
  // ============================================================================
  noSuivisState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noSuivisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  noSuivisSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addFirstGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  addFirstText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },

  // ============================================================================
  // MODAL STYLES
  // ============================================================================
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    paddingVertical: 16,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 24,
  },
  modalFooter: {
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
  submitButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // ============================================================================
  // FORM STYLES
  // ============================================================================
  formGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionsList: {
    maxHeight: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectedOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  placeholderText: {
    color: '#9ca3af',
  },
  typeGrid: {
    gap: 12,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedTypeCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  typeCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedTypeCardText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },

  // ============================================================================
  // FILTER MODAL STYLES
  // ============================================================================
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    justifyContent: 'flex-end'
  },
  filterModal: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    maxHeight: '85%' 
  },
  filterHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  filterTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  filterContent: { 
    padding: 24 
  },
  filterSection: { 
    marginBottom: 28 
  },
  filterSectionTitle: { 
    fontSize: 17, 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: 16 
  },
  taskFilter: {
    maxHeight: 200,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterOption: { 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedFilterOption: { 
    backgroundColor: '#eff6ff'
  },
  filterOptionText: { 
    fontSize: 14, 
    color: '#374151', 
    fontWeight: '500' 
  },
  dateFilterInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 12,
  },
  dateFilterText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  filterFooter: { 
    flexDirection: 'row', 
    padding: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#f1f5f9',
    gap: 16,
  },
  clearFiltersButton: { 
    flex: 1, 
    backgroundColor: '#f8fafc', 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0' 
  },
  clearFiltersText: { 
    fontSize: 16, 
    color: '#64748b', 
    fontWeight: '600' 
  },
  applyFiltersButton: { 
    flex: 2, 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  applyFiltersGradient: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  applyFiltersText: { 
    fontSize: 16, 
    color: '#ffffff', 
    fontWeight: '700' 
  },
});

export default SuiviScreen;