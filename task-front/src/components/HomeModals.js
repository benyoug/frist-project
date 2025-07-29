import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../styles/homeStyles';

const HomeModals = ({
  // Filter Modal
  showFilters,
  setShowFilters,
  isLate,
  setIsLate,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  selectedType,
  setSelectedType,
  priorities,
  statuses,
  types,
  getPriorityColor,
  getStatusColor,
  
  // Date Picker Modal
  showDatePicker,
  setShowDatePicker,
  datePickerType,
  tempDate,
  setTempDate,
  dateRange,
  setDateRange,
  applySelectedDate,
  formatDate,
  
  // Status Modal
  showStatusModal,
  setShowStatusModal,
  selectedTask,
  tempStatus,
  setTempStatus,
  tempComment,
  setTempComment,
  updateTaskStatus,
  
  // Priority Modal
  showPriorityModal,
  setShowPriorityModal,
  updateTaskPriority,
  
  // Suivi Modal
  showSuiviModal,
  setShowSuiviModal,
  
  // Custom Alert
  customAlert,
  hideCustomAlert,
}) => {
  
  // ===== CUSTOM ALERT =====
  const CustomAlert = () => {
    const getAlertIcon = () => {
      switch (customAlert.type) {
        case 'success': return { name: 'checkmark-circle', color: '#10b981' };
        case 'warning': return { name: 'warning', color: '#f59e0b' };
        case 'error': return { name: 'alert-circle', color: '#ef4444' };
        case 'confirm': return { name: 'help-circle', color: '#3b82f6' };
        default: return { name: 'information-circle', color: '#3b82f6' };
      }
    };

    const getAlertColors = () => {
      switch (customAlert.type) {
        case 'success': return { border: '#10b981', bg: '#ecfdf5' };
        case 'warning': return { border: '#f59e0b', bg: '#fffbeb' };
        case 'error': return { border: '#ef4444', bg: '#fef2f2' };
        case 'confirm': return { border: '#3b82f6', bg: '#eff6ff' };
        default: return { border: '#3b82f6', bg: '#eff6ff' };
      }
    };

    const icon = getAlertIcon();
    const colors = getAlertColors();

    return (
      <Modal transparent={true} visible={customAlert.visible} animationType="fade" onRequestClose={hideCustomAlert}>
        <View style={homeStyles.alertOverlay}>
          <View style={homeStyles.alertContainer}>
            <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={homeStyles.alertHeader}>
              <View style={[homeStyles.alertIconContainer, { backgroundColor: colors.bg }]}>
                <Ionicons name={icon.name} size={32} color={icon.color} />
              </View>
              <Text style={homeStyles.alertTitle}>{customAlert.title}</Text>
            </LinearGradient>
            <View style={homeStyles.alertContent}>
              <Text style={homeStyles.alertMessage}>{customAlert.message}</Text>
            </View>
            <View style={homeStyles.alertButtons}>
              {customAlert.type === 'confirm' ? (
                <>
                  <TouchableOpacity style={[homeStyles.alertButton, homeStyles.alertButtonCancel]} onPress={customAlert.onCancel}>
                    <Text style={homeStyles.alertButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[homeStyles.alertButton, homeStyles.alertButtonConfirm]} onPress={customAlert.onConfirm}>
                    <LinearGradient colors={['#dc2626', '#ef4444']} style={homeStyles.alertButtonGradient}>
                      <Text style={homeStyles.alertButtonTextConfirm}>Confirmer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[homeStyles.alertButton, homeStyles.alertButtonSingle]} onPress={customAlert.onConfirm || hideCustomAlert}>
                  <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={homeStyles.alertButtonGradient}>
                    <Text style={homeStyles.alertButtonTextConfirm}>OK</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ===== FILTER MODAL =====
  const FilterModal = () => (
    <Modal transparent={true} visible={showFilters} onRequestClose={() => setShowFilters(false)} animationType="slide">
      <View style={homeStyles.modalOverlay}>
        <View style={homeStyles.filterModal}>
          <View style={homeStyles.modalHeader}>
            <Text style={homeStyles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={homeStyles.filterContent}>
            <View style={homeStyles.filterSection}>
              <TouchableOpacity style={homeStyles.checkboxRow} onPress={() => setIsLate(!isLate)}>
                <View style={[homeStyles.checkbox, isLate && homeStyles.checkboxChecked]}>
                  {isLate && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </View>
                <Text style={homeStyles.checkboxLabel}>En retard</Text>
              </TouchableOpacity>
            </View>
            <View style={homeStyles.filterSection}>
              <Text style={homeStyles.filterTitle}>Priorité</Text>
              {priorities.map((priority) => (
                <TouchableOpacity key={priority} style={homeStyles.filterOption} onPress={() => setSelectedPriority(selectedPriority === priority ? '' : priority)}>
                  <View style={[homeStyles.radioButton, selectedPriority === priority && homeStyles.radioButtonSelected]}>
                    {selectedPriority === priority && <View style={[homeStyles.radioDot, { backgroundColor: getPriorityColor(priority) }]} />}
                  </View>
                  <Text style={homeStyles.filterOptionText}>{priority}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={homeStyles.filterSection}>
              <Text style={homeStyles.filterTitle}>État</Text>
              {statuses.map((status) => (
                <TouchableOpacity key={status.value} style={homeStyles.filterOption} onPress={() => setSelectedStatus(selectedStatus === status.value ? '' : status.value)}>
                  <View style={[homeStyles.radioButton, selectedStatus === status.value && homeStyles.radioButtonSelected]}>
                    {selectedStatus === status.value && <View style={[homeStyles.radioDot, { backgroundColor: getStatusColor(status.value) }]} />}
                  </View>
                  <Text style={homeStyles.filterOptionText}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={homeStyles.filterSection}>
              <Text style={homeStyles.filterTitle}>Type</Text>
              {types.map((type) => (
                <TouchableOpacity key={type} style={homeStyles.filterOption} onPress={() => setSelectedType(selectedType === type ? '' : type)}>
                  <View style={[homeStyles.radioButton, selectedType === type && homeStyles.radioButtonSelected]}>
                    {selectedType === type && <View style={homeStyles.radioDot} />}
                  </View>
                  <Text style={homeStyles.filterOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={homeStyles.modalFooter}>
            <TouchableOpacity style={homeStyles.clearButton} onPress={() => { setIsLate(false); setSelectedPriority(''); setSelectedStatus(''); setSelectedType(''); }}>
              <Text style={homeStyles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={homeStyles.applyButton} onPress={() => setShowFilters(false)}>
              <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={homeStyles.applyButtonGradient}>
                <Text style={homeStyles.applyButtonText}>Appliquer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ===== DATE PICKER MODAL =====
  const DatePickerModal = () => {
    const currentMonth = tempDate.getMonth();
    const currentYear = tempDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                       'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const dayNames = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'];

    return (
      <Modal transparent={true} visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)} animationType="slide">
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.datePickerModal}>
            <View style={homeStyles.modalHeader}>
              <Text style={homeStyles.modalTitle}>{datePickerType === 'start' ? 'Date de début' : 'Date de fin'}</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={homeStyles.datePickerContent}>
              <View style={homeStyles.monthNavigation}>
                <TouchableOpacity onPress={() => setTempDate(new Date(currentYear, currentMonth - 1, tempDate.getDate()))} style={homeStyles.navButton}>
                  <Ionicons name="chevron-back" size={24} color="#3b82f6" />
                </TouchableOpacity>
                <Text style={homeStyles.monthTitle}>{monthNames[currentMonth]} {currentYear}</Text>
                <TouchableOpacity onPress={() => setTempDate(new Date(currentYear, currentMonth + 1, tempDate.getDate()))} style={homeStyles.navButton}>
                  <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                </TouchableOpacity>
              </View>
              <View style={homeStyles.weekDays}>
                {dayNames.map((day, index) => <Text key={index} style={homeStyles.weekDayText}>{day}</Text>)}
              </View>
              <View style={homeStyles.calendarGrid}>
                {days.map((day, index) => (
                  <TouchableOpacity key={index} style={[homeStyles.dayCell, day === tempDate.getDate() && homeStyles.selectedDay, !day && homeStyles.emptyDay]} onPress={() => day && setTempDate(new Date(currentYear, currentMonth, day))} disabled={!day}>
                    {day && <Text style={[homeStyles.dayText, day === tempDate.getDate() && homeStyles.selectedDayText]}>{day}</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={homeStyles.modalFooter}>
              <TouchableOpacity style={homeStyles.clearButton} onPress={() => { if (datePickerType === 'start') { setDateRange(prev => ({ ...prev, start: '' })); } else { setDateRange(prev => ({ ...prev, end: '' })); } setShowDatePicker(false); }}>
                <Text style={homeStyles.clearButtonText}>Effacer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={homeStyles.applyButton} onPress={applySelectedDate}>
                <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={homeStyles.applyButtonGradient}>
                  <Text style={homeStyles.applyButtonText}>Appliquer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // ===== STATUS MODAL =====
  // Dans HomeModals.js, remplacez la partie StatusModal par ce code corrigé :

const StatusModal = () => (
  <Modal
    transparent={false}
    visible={showStatusModal}
    onRequestClose={() => setShowStatusModal(false)}
    animationType="slide"
  >
    <SafeAreaView style={homeStyles.fullScreenModal}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={homeStyles.modalHeader}
      >
        <View style={homeStyles.fullScreenHeader}>
          <TouchableOpacity
            style={homeStyles.backButton}
            onPress={() => setShowStatusModal(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={homeStyles.fullScreenTitle}>Changer l'état</Text>
          <TouchableOpacity 
            style={homeStyles.closeButton} 
            onPress={() => setShowStatusModal(false)}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={homeStyles.fullScreenContent}>
        <ScrollView style={homeStyles.modalContentFull} showsVerticalScrollIndicator={false}>
          <View style={homeStyles.fieldGroup}>
            <Text style={homeStyles.fieldLabel}>État *</Text>
            <View style={homeStyles.statusOptions}>
              {statuses.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    homeStyles.statusOption,
                    tempStatus === status.value && homeStyles.selectedStatusOption
                  ]}
                  onPress={() => setTempStatus(status.value)}
                >
                  <View style={[homeStyles.statusDot, { backgroundColor: status.color }]} />
                  <Text style={homeStyles.statusOptionText}>{status.label}</Text>
                  {tempStatus === status.value && (
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={homeStyles.fieldGroup}>
            <Text style={homeStyles.fieldLabel}>Commentaire</Text>
            <TextInput
              style={homeStyles.commentInput}
              placeholder="Ajouter un commentaire..."
              value={tempComment}
              onChangeText={setTempComment}
              multiline={true}
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor="#94a3b8"
              // ✅ IMPORTANT: Empêcher la fermeture automatique
              autoCorrect={false}
              autoCapitalize="sentences"
              blurOnSubmit={false}
              // ✅ Garder le focus
              selectTextOnFocus={false}
            />
          </View>
        </ScrollView>

        <View style={homeStyles.fullScreenFooter}>
          <TouchableOpacity
            style={homeStyles.saveButtonFull}
            onPress={updateTaskStatus}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={homeStyles.saveButtonGradient}
            >
              <Ionicons name="save-outline" size={20} color="#ffffff" />
              <Text style={homeStyles.saveButtonText}>Enregistrer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  </Modal>
);
  // ===== PRIORITY MODAL =====
  const PriorityModal = () => (
    <Modal
      transparent={true}
      visible={showPriorityModal}
      onRequestClose={() => setShowPriorityModal(false)}
      animationType="slide"
    >
      <View style={homeStyles.modalOverlay}>
        <View style={homeStyles.priorityModalContainer}>
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
            style={homeStyles.priorityModalHeader}
          >
            <View style={homeStyles.priorityHeaderContent}>
              <Text style={homeStyles.priorityModalTitle}>Sélectionner la priorité</Text>
              <TouchableOpacity 
                style={homeStyles.priorityCloseButton}
                onPress={() => setShowPriorityModal(false)}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={homeStyles.priorityModalContent}>
            <Text style={homeStyles.prioritySubtitle}>
              Choisissez le niveau de priorité pour cette tâche
            </Text>
            
            <View style={homeStyles.priorityGrid}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    homeStyles.priorityCard,
                    selectedTask?.priority === priority && homeStyles.selectedPriorityCard
                  ]}
                  onPress={() => updateTaskPriority(priority)}
                >
                  <LinearGradient
                    colors={selectedTask?.priority === priority 
                      ? ['#ecfdf5', '#f0fdf4'] 
                      : ['#ffffff', '#f8fafc']
                    }
                    style={homeStyles.priorityCardGradient}
                  >
                    <View style={[
                      homeStyles.priorityIconContainer, 
                      { backgroundColor: `${getPriorityColor(priority)}15` }
                    ]}>
                      <Ionicons 
                        name="flag" 
                        size={28} 
                        color={getPriorityColor(priority)} 
                      />
                    </View>
                    
                    <Text style={[
                      homeStyles.priorityCardTitle, 
                      { color: getPriorityColor(priority) }
                    ]}>
                      {priority}
                    </Text>
                    
                    <View style={[
                      homeStyles.priorityLevel,
                      { backgroundColor: getPriorityColor(priority) }
                    ]}>
                      <Text style={homeStyles.priorityLevelText}>
                        {priority === 'Urgente' ? 'Niveau 4' :
                         priority === 'Haute' ? 'Niveau 3' :
                         priority === 'Moyenne' ? 'Niveau 2' : 'Niveau 1'}
                      </Text>
                    </View>

                    {selectedTask?.priority === priority && (
                      <View style={homeStyles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ===== SUIVI MODAL =====
  const SuiviModal = () => (
    <Modal
      transparent={false}
      visible={showSuiviModal}
      onRequestClose={() => setShowSuiviModal(false)}
      animationType="slide"
    >
      <SafeAreaView style={homeStyles.fullScreenModal}>
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#334155']}
          style={homeStyles.modalHeader}
        >
          <View style={homeStyles.fullScreenHeader}>
            <TouchableOpacity
              style={homeStyles.backButton}
              onPress={() => setShowSuiviModal(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={homeStyles.fullScreenTitle}>Suivi des tâches</Text>
            <TouchableOpacity 
              style={homeStyles.closeButton} 
              onPress={() => setShowSuiviModal(false)}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={homeStyles.fullScreenContent}>
          <View style={homeStyles.tableContainer}>
            <View style={homeStyles.tableHeader}>
              <View style={homeStyles.headerCell}>
                <Text style={homeStyles.headerText}>Commentaire</Text>
                <Ionicons name="chevron-up" size={16} color="#64748b" />
              </View>
              <View style={homeStyles.headerCell}>
                <Text style={homeStyles.headerText}>État</Text>
                <Ionicons name="chevron-up" size={16} color="#64748b" />
              </View>
              <View style={homeStyles.headerCell}>
                <Text style={homeStyles.headerText}>Date</Text>
              </View>
            </View>

            <ScrollView style={homeStyles.tableContent}>
              {selectedTask?.history?.length > 0 ? (
                selectedTask.history.map((entry, index) => (
                  <View key={index} style={homeStyles.tableRow}>
                    <View style={homeStyles.tableCell}>
                      <Text style={homeStyles.cellText}>{entry.comment}</Text>
                    </View>
                    <View style={homeStyles.tableCell}>
                      <View style={[homeStyles.statusBadgeTable, { backgroundColor: `${getStatusColor(entry.status)}20` }]}>
                        <Text style={[homeStyles.statusText, { color: getStatusColor(entry.status) }]}>
                          {entry.status}
                        </Text>
                      </View>
                    </View>
                    <View style={homeStyles.tableCell}>
                      <Text style={homeStyles.cellText}>{entry.date}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={homeStyles.noDataState}>
                  <Ionicons name="document-outline" size={80} color="#cbd5e1" />
                  <Text style={homeStyles.noDataText}>Aucun historique disponible</Text>
                </View>
              )}
            </ScrollView>

            {/* <View style={homeStyles.pagination}>
              <Text style={homeStyles.paginationText}>
                1 à {selectedTask?.history?.length || 0} sur {selectedTask?.history?.length || 0} éléments
              </Text>
              <View style={homeStyles.paginationControls}>
                <TouchableOpacity style={homeStyles.paginationButton}>
                  <Ionicons name="chevron-back" size={16} color="#64748b" />
                </TouchableOpacity>
                <View style={homeStyles.currentPage}>
                  <Text style={homeStyles.currentPageText}>1</Text>
                </View>
                <TouchableOpacity style={homeStyles.paginationButton}>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View> */}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <>
      <CustomAlert />
      <FilterModal />
      <DatePickerModal />
      <StatusModal />
      <PriorityModal />
      <SuiviModal />
    </>
  );
};

export default HomeModals;