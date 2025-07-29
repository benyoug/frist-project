import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const AddTaskModal = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    priority: '',
    project: '',
    startDate: new Date(),
    endDate: new Date(),
    comment: '',
  });

  // États pour contrôler l'affichage des sélecteurs
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const taskTypes = [
    { id: 1, value: 'Développement / Conception (DEV)', label: 'Développement / Conception (DEV)' },
    { id: 2, value: 'Teste / Assurance qualité (TST)', label: 'Teste / Assurance qualité (TST)' },
    { id: 3, value: 'Formation / déploiement (FRM)', label: 'Formation / déploiement (FRM)' },
    { id: 4, value: 'Administratif (ADM)', label: 'Administratif (ADM)' },
    { id: 5, value: 'Documentation (Dc)', label: 'Documentation (Dc)' },
    { id: 6, value: 'Absence non motivée', label: 'Absence non motivée' },
    { id: 7, value: 'Accueil Guichet', label: 'Accueil Guichet' },
    { id: 8, value: 'Animation atelier', label: 'Animation atelier' },
  ];

  const priorities = [
    { id: 1, value: 'Urgente', label: 'Urgente', color: '#ef4444' },
    { id: 2, value: 'Haute', label: 'Haute', color: '#f59e0b' },
    { id: 3, value: 'Moyenne', label: 'Moyenne', color: '#3b82f6' },
    { id: 4, value: 'Basse', label: 'Basse', color: '#6b7280' },
  ];

  const projects = [
    { id: 1, value: 'TEKWINE', label: 'TEKWINE' },
    { id: 2, value: 'Techghil', label: 'Techghil' },
    { id: 3, value: 'Packages', label: 'Packages' },
    { id: 4, value: 'Diwane', label: 'Diwane' },
    { id: 5, value: 'SMTD', label: 'SMTD' },
    { id: 6, value: 'SIMEDD', label: 'SIMEDD' },
    { id: 7, value: 'MCC', label: 'MCC' },
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Générer les options de date (les 30 prochains jours)
  const generateDateOptions = (startFromDate = new Date()) => {
    const dates = [];
    for (let i = 0; i < 90; i++) { // 90 jours
      const date = new Date(startFromDate);
      date.setDate(date.getDate() + i);
      dates.push({
        id: i,
        value: date,
        label: formatDate(date)
      });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();
  const endDateOptions = generateDateOptions(formData.startDate);

  const handleSave = () => {
    if (!formData.title.trim()) {
      Alert.alert('Erreur', 'Le libellé est requis');
      return;
    }
    if (!formData.type) {
      Alert.alert('Erreur', 'Le type est requis');
      return;
    }
    if (!formData.priority) {
      Alert.alert('Erreur', 'La priorité est requise');
      return;
    }
    if (!formData.project) {
      Alert.alert('Erreur', 'Le projet est requis');
      return;
    }

    // Créer un objet avec un ID unique et formatage des dates
    const taskData = {
      id: Date.now().toString(), // ID unique basé sur le timestamp
      title: formData.title.trim(),
      type: formData.type,
      priority: formData.priority,
      project: formData.project, // Projet simple (pas de tableau)
      projects: [formData.project], // Support pour projets multiples
      startDate: formData.startDate.toISOString(), // Format ISO pour compatibilité
      endDate: formData.endDate.toISOString(),
      comment: formData.comment.trim(),
      createdAt: new Date().toISOString(),
      status: 'Ouvert', // Statut par défaut
      dueDate: formatDate(formData.endDate), // Format d'affichage DD-MM-YYYY
      isLate: false,
      progress: 0,
      projectId: null, // Sera défini dans useHomeLogic
      history: []
    };

    try {
      onSave(taskData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      priority: '',
      project: '',
      startDate: new Date(),
      endDate: new Date(),
      comment: '',
    });
    // Fermer tous les sélecteurs
    setShowTypeSelector(false);
    setShowPrioritySelector(false);
    setShowProjectSelector(false);
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Composant pour afficher les options d'un sélecteur
  const OptionsList = ({ options, selectedValue, onSelect, showColors = false, isDate = false }) => {
    if (!options || !Array.isArray(options)) {
      return null; // Protection contre les arrays undefined
    }

    return (
      <ScrollView style={styles.optionsList} nestedScrollEnabled={true}>
        {options.map((option) => {
          if (!option) return null; // Protection contre les options null/undefined
          
          const isSelected = isDate 
            ? (selectedValue && formatDate(selectedValue) === option.label)
            : selectedValue === option.value;
          
          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionItem,
                isSelected && styles.selectedOption
              ]}
              onPress={() => onSelect(isDate ? option.value : option.value)}
            >
              {showColors && option.color && (
                <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
              )}
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedOptionText
              ]}>
                {option.label || ''}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={20} color="#10b981" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une tâche</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Type */}
            <View style={[styles.inputGroup, { position: 'relative', zIndex: showTypeSelector ? 9999 : 1 }]}>
              <Text style={styles.label}>Type *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setShowTypeSelector(!showTypeSelector);
                  setShowPrioritySelector(false);
                  setShowProjectSelector(false);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
              >
                <Text style={[styles.selectText, !formData.type && styles.placeholder]}>
                  {formData.type || 'Sélectionner le type'}
                </Text>
                <Ionicons 
                  name={showTypeSelector ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
              
              {showTypeSelector && (
                <View style={styles.dropdownContainer}>
                  <OptionsList
                    options={taskTypes}
                    selectedValue={formData.type}
                    onSelect={(value) => {
                      setFormData(prev => ({ ...prev, type: value }));
                      setShowTypeSelector(false);
                    }}
                  />
                </View>
              )}
            </View>

            {/* Libellé */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Libellé *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Entrer le titre de la tâche"
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Priorité */}
            <View style={[styles.inputGroup, { position: 'relative', zIndex: showPrioritySelector ? 9999 : 1 }]}>
              <Text style={styles.label}>Priorité *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setShowPrioritySelector(!showPrioritySelector);
                  setShowTypeSelector(false);
                  setShowProjectSelector(false);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
              >
                <View style={styles.priorityDisplay}>
                  {formData.priority && (
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: priorities.find(p => p.value === formData.priority)?.color }
                    ]} />
                  )}
                  <Text style={[styles.selectText, !formData.priority && styles.placeholder]}>
                    {formData.priority || 'Sélectionner la priorité'}
                  </Text>
                </View>
                <Ionicons 
                  name={showPrioritySelector ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
              
              {showPrioritySelector && (
                <View style={styles.dropdownContainer}>
                  <OptionsList
                    options={priorities}
                    selectedValue={formData.priority}
                    onSelect={(value) => {
                      setFormData(prev => ({ ...prev, priority: value }));
                      setShowPrioritySelector(false);
                    }}
                    showColors={true}
                  />
                </View>
              )}
            </View>

            {/* Projet */}
            <View style={[styles.inputGroup, { position: 'relative', zIndex: showProjectSelector ? 9999 : 1 }]}>
              <Text style={styles.label}>Projet *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  setShowProjectSelector(!showProjectSelector);
                  setShowTypeSelector(false);
                  setShowPrioritySelector(false);
                  setShowStartDatePicker(false);
                  setShowEndDatePicker(false);
                }}
              >
                <Text style={[styles.selectText, !formData.project && styles.placeholder]}>
                  {formData.project || 'Sélectionner le projet'}
                </Text>
                <Ionicons 
                  name={showProjectSelector ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#6b7280" 
                />
              </TouchableOpacity>
              
              {showProjectSelector && (
                <View style={styles.dropdownContainer}>
                  <OptionsList
                    options={projects}
                    selectedValue={formData.project}
                    onSelect={(value) => {
                      setFormData(prev => ({ ...prev, project: value }));
                      setShowProjectSelector(false);
                    }}
                  />
                </View>
              )}
            </View>

            {/* Date début/fin */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date début/fin *</Text>
              <View style={styles.dateRange}>
                {/* Date de début */}
                <View style={[styles.dateContainer, { position: 'relative', zIndex: showStartDatePicker ? 9999 : 1 }]}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setShowStartDatePicker(!showStartDatePicker);
                      setShowEndDatePicker(false);
                      setShowTypeSelector(false);
                      setShowPrioritySelector(false);
                      setShowProjectSelector(false);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
                    <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                    <Ionicons 
                      name={showStartDatePicker ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  
                  {showStartDatePicker && (
                    <View style={styles.dateDropdownContainer}>
                      <OptionsList
                        options={dateOptions}
                        selectedValue={formData.startDate}
                        onSelect={(value) => {
                          setFormData(prev => ({ 
                            ...prev, 
                            startDate: value,
                            endDate: value > prev.endDate ? value : prev.endDate
                          }));
                          setShowStartDatePicker(false);
                        }}
                        isDate={true}
                      />
                    </View>
                  )}
                </View>

                <Text style={styles.dateSeparator}>-</Text>

                {/* Date de fin */}
                <View style={[styles.dateContainer, { position: 'relative', zIndex: showEndDatePicker ? 9999 : 1 }]}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => {
                      setShowEndDatePicker(!showEndDatePicker);
                      setShowStartDatePicker(false);
                      setShowTypeSelector(false);
                      setShowPrioritySelector(false);
                      setShowProjectSelector(false);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
                    <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                    <Ionicons 
                      name={showEndDatePicker ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#6b7280" 
                    />
                  </TouchableOpacity>
                  
                  {showEndDatePicker && (
                    <View style={styles.dateDropdownContainer}>
                      <OptionsList
                        options={endDateOptions.filter(date => date && date.value && date.value >= formData.startDate)}
                        selectedValue={formData.endDate}
                        onSelect={(value) => {
                          if (value && value >= formData.startDate) {
                            setFormData(prev => ({ ...prev, endDate: value }));
                            setShowEndDatePicker(false);
                          } else {
                            Alert.alert('Erreur', 'La date de fin ne peut pas être antérieure à la date de début');
                          }
                        }}
                        isDate={true}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Commentaire */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Commentaire</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ajouter un commentaire..."
                value={formData.comment}
                onChangeText={(text) => setFormData(prev => ({ ...prev, comment: text }))}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient colors={['#10b981', '#059669']} style={styles.saveButtonGradient}>
                <Ionicons name="save-outline" size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '95%',
    height: '85%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    minHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1e293b',
    minHeight: 56,
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120,
  },
  selectButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  selectText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholder: {
    color: '#9ca3af',
  },
  priorityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dateContainer: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 56,
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  dateSeparator: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 16,
    backgroundColor: '#ffffff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 52,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    minHeight: 52,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },

  // Styles pour les listes d'options intégrées
  optionsList: {
    maxHeight: 180,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
    minHeight: 50,
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 20,
    marginLeft: 4,
  },
  selectedOptionText: {
    color: '#1e40af',
    fontWeight: '600',
  },

  dropdownContainer: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 180,
  },

  dateDropdownContainer: {
    position: 'absolute',
    top: 64,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 200,
  },
});

export default AddTaskModal;