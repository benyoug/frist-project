import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';

const { width } = Dimensions.get('window');

const ProjectDetailScreen = ({ navigation, route }) => {
  const { projectName } = route.params;
  const [activeTab, setActiveTab] = useState('info');
  const [searchText, setSearchText] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberIsResponsible, setNewMemberIsResponsible] = useState(false);
  const [newDocument, setNewDocument] = useState({
    libelle: '',
    type: 'PDF',
    fichier: null,
    date: new Date().toISOString().split('T')[0],
  });
  const [showDocumentTypePicker, setShowDocumentTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // États pour les alertes personnalisées
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  });

  // Données de test
  const [projectInfo, setProjectInfo] = useState({
    frenchName: projectName,
  });

  const [members, setMembers] = useState([
    { id: 1, name: 'Brahim', email: 'brahimjid@dcs-sarl.com', isResponsible: false, isController: false },
    { id: 2, name: 'Sidi Maarouf', email: 'sidimaarouf@dcs-sarl.com', isResponsible: false, isController: false },
    { id: 3, name: 'Mamouny', email: 'mamouny.ahmed@dcs-sarl.com', isResponsible: false, isController: false },
    { id: 4, name: 'Ahmedou', email: 'ahmedou@dcs-sarl.com', isResponsible: true, isController: false },
  ]);

  const [availableMembers] = useState([
    { id: 5, name: 'Abdelhay Mohamed', email: 'abdelhay@dcs-sarl.com' },
    { id: 6, name: 'Aichetou', email: 'aichetou@dcs-sarl.com' },
    { id: 7, name: 'soultana', email: 'soultana@dcs-sarl.com' },
    { id: 8, name: 'cheikh essouvi', email: 'cheikhessouvi@gmail.com' },
    { id: 9, name: 'Elheibe', email: '22083@supnum.mr' },
    { id: 10, name: 'Yahya', email: 'i17771.etu@iscae.mr' },
    { id: 11, name: 'Aiche', email: 'testadmin@dcs-sarl.com' },
  ]);

  // Fonction pour afficher une alerte personnalisée
  const showCustomAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      onCancel,
    });
  };

  // Fonction pour fermer l'alerte
  const hideCustomAlert = () => {
    setCustomAlert({
      visible: false,
      title: '',
      message: '',
      type: 'info',
      onConfirm: null,
      onCancel: null,
    });
  };

  const handleSave = () => {
    showCustomAlert(
      'Enregistrement',
      'Les modifications ont été enregistrées avec succès.',
      'success',
      hideCustomAlert
    );
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleInviteMember = () => {
    setShowInviteMemberModal(true);
  };

  const handleAddDocument = () => {
    setShowAddDocumentModal(true);
  };

  const handleSaveMembers = () => {
    showCustomAlert(
      'Enregistrement',
      'Les modifications des membres ont été enregistrées avec succès.',
      'success',
      hideCustomAlert
    );
  };

  const handleSaveDocument = () => {
    if (newDocument.libelle.trim()) {
      showCustomAlert(
        'Document ajouté',
        `Le document "${newDocument.libelle}" a été ajouté avec succès.`,
        'success',
        hideCustomAlert
      );
      setNewDocument({
        libelle: '',
        type: 'PDF',
        fichier: null,
        date: new Date().toISOString().split('T')[0],
      });
      setShowAddDocumentModal(false);
    }
  };

  const toggleMemberRole = (memberId, role) => {
    setMembers(prevMembers => 
      prevMembers.map(member => 
        member.id === memberId 
          ? { ...member, [role]: !member[role] }
          : member
      )
    );
  };

  const handleAddSelectedMember = (selectedMember) => {
    const newMember = {
      ...selectedMember,
      isResponsible: false,
      isController: false
    };
    setMembers(prevMembers => [...prevMembers, newMember]);
    setShowAddMemberModal(false);
    showCustomAlert(
      'Membre ajouté',
      `${selectedMember.name} a été ajouté au projet.`,
      'success',
      hideCustomAlert
    );
  };

  const handleDocumentTypeSelect = (type) => {
    setNewDocument({...newDocument, type: type});
    setShowDocumentTypePicker(false);
  };

  const handleDateSelect = (selectedDate) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setNewDocument({...newDocument, date: formattedDate});
    setShowDatePicker(false);
  };

  const handleInviteNewMember = () => {
    if (newMemberEmail.trim()) {
      showCustomAlert(
        'Invitation envoyée',
        `Une invitation a été envoyée à ${newMemberEmail}`,
        'success',
        hideCustomAlert
      );
      setNewMemberEmail('');
      setNewMemberIsResponsible(false);
      setShowInviteMemberModal(false);
    }
  };

  // Rendu de l'onglet Info
  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text style={styles.cardTitle}>Informations du projet</Text>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Libellé</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={projectInfo.frenchName}
              onChangeText={(text) => setProjectInfo({...projectInfo, frenchName: text})}
              placeholder="Nom du projet"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="save-outline" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Rendu de l'onglet Membres
  const renderMembersTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.membersCard}>
        {/* Header avec titre uniquement */}
        <View style={styles.membersHeader}>
          <View style={styles.membersHeaderLeft}>
            <Ionicons name="people" size={24} color="#3b82f6" />
            <Text style={styles.cardTitle}>Équipe du projet</Text>
          </View>
        </View>

        {/* Boutons d'action centrés */}
        <View style={styles.membersActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Ajouter</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteMember}>
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="person-add" size={16} color="#ffffff" />
              <Text style={styles.actionButtonText}>Inviter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* En-tête du tableau professionnel */}
        <View style={styles.professionalTableHeader}>
          <Text style={styles.professionalHeaderMembers}>Membres</Text>
          <Text style={styles.professionalHeaderRole}>Responsable</Text>
          <Text style={styles.professionalHeaderRole}>Contrôleur</Text>
        </View>

        <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
          {members.map((member) => (
            <View key={`member-${member.id}`} style={styles.memberCard}>
              <View style={styles.memberMainInfo}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberInitials}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
              </View>
              
              <View style={styles.memberRoleColumn}>
                <TouchableOpacity 
                  style={[styles.roleCheckbox, member.isResponsible && styles.roleCheckboxActive]}
                  onPress={() => toggleMemberRole(member.id, 'isResponsible')}
                >
                  {member.isResponsible && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </TouchableOpacity>
              </View>
              
              <View style={styles.memberRoleColumn}>
                <TouchableOpacity 
                  style={[styles.roleCheckbox, member.isController && styles.roleCheckboxActive]}
                  onPress={() => toggleMemberRole(member.id, 'isController')}
                >
                  {member.isController && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Bouton Enregistrer pour les membres */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMembers}>
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="save-outline" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Rendu de l'onglet Documents
  const renderDocumentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.documentsCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Ionicons name="document-text" size={24} color="#3b82f6" />
            <Text style={styles.cardTitle}>Documents</Text>
          </View>
          <TouchableOpacity style={styles.addDocumentBtn} onPress={handleAddDocument}>
            <Ionicons name="add" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.documentsControls}>
          <View style={styles.itemsControl}>
            <Ionicons name="eye-outline" size={18} color="#6b7280" />
            <Text style={styles.itemsText}>{itemsPerPage}</Text>
          </View>
          
          <View style={styles.searchControl}>
            <Ionicons name="search-outline" size={18} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-outline" size={48} color="#e5e7eb" />
          </View>
          <Text style={styles.emptyTitle}>Aucun document</Text>
          <Text style={styles.emptySubtitle}>Aucune donnée disponible dans le tableau</Text>
        </View>

        <View style={styles.pagination}>
          <Text style={styles.paginationText}>0 à 0 sur 0 éléments</Text>
          <View style={styles.paginationControls}>
            <TouchableOpacity style={styles.paginationBtn}>
              <Ionicons name="chevron-back" size={18} color="#9ca3af" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.paginationBtn}>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        {/* Header élégant */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.headerTitle}>
              <Text style={styles.headerTitleText}>{projectName}</Text>
              <Text style={styles.headerSubtitle}>Détails du projet</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content avec design moderne */}
        <View style={styles.content}>
          {/* Onglets élégants */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <View style={[styles.tabIcon, activeTab === 'info' && styles.activeTabIcon]}>
                <Ionicons 
                  name="information-circle-outline" 
                  size={20} 
                  color={activeTab === 'info' ? '#ffffff' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
                Info
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'members' && styles.activeTab]}
              onPress={() => setActiveTab('members')}
            >
              <View style={[styles.tabIcon, activeTab === 'members' && styles.activeTabIcon]}>
                <Ionicons 
                  name="people-outline" 
                  size={20} 
                  color={activeTab === 'members' ? '#ffffff' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.tabText, activeTab === 'members' && styles.activeTabText]}>
                Membres
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tab, activeTab === 'documents' && styles.activeTab]}
              onPress={() => setActiveTab('documents')}
            >
              <View style={[styles.tabIcon, activeTab === 'documents' && styles.activeTabIcon]}>
                <Ionicons 
                  name="document-text-outline" 
                  size={20} 
                  color={activeTab === 'documents' ? '#ffffff' : '#6b7280'} 
                />
              </View>
              <Text style={[styles.tabText, activeTab === 'documents' && styles.activeTabText]}>
                Documents
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenu des onglets */}
          <ScrollView style={styles.tabContentContainer} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' && renderInfoTab()}
            {activeTab === 'members' && renderMembersTab()}
            {activeTab === 'documents' && renderDocumentsTab()}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Custom Alert */}
      <Modal
        transparent={true}
        visible={customAlert.visible}
        animationType="fade"
        onRequestClose={hideCustomAlert}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.alertHeader}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="information-circle" size={32} color="#3b82f6" />
              </View>
              <Text style={styles.alertTitle}>{customAlert.title}</Text>
            </LinearGradient>

            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{customAlert.message}</Text>
            </View>

            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={[styles.alertButton, styles.alertButtonSingle]}
                onPress={customAlert.onConfirm || hideCustomAlert}
              >
                <LinearGradient
                  colors={['#1e3a8a', '#3b82f6']}
                  style={styles.alertButtonGradient}
                >
                  <Text style={styles.alertButtonTextConfirm}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Document Modal */}
      <Modal
        transparent={true}
        visible={showAddDocumentModal}
        animationType="slide"
        onRequestClose={() => setShowAddDocumentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.documentModalContainer}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Nouveau document</Text>
              <TouchableOpacity onPress={() => setShowAddDocumentModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.documentModalContent}>
              <View style={styles.documentInputGroup}>
                <Text style={styles.documentInputLabel}>
                  Libellé <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={styles.documentInput}
                  value={newDocument.libelle}
                  onChangeText={(text) => setNewDocument({...newDocument, libelle: text})}
                  placeholder="Nom du document"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.documentInputGroup}>
                <Text style={styles.documentInputLabel}>
                  Type de document <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.documentTypeSelector}
                  onPress={() => setShowDocumentTypePicker(true)}
                >
                  <Text style={styles.documentTypeText}>{newDocument.type}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.documentInputGroup}>
                <Text style={styles.documentInputLabel}>
                  Fichier <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity style={styles.fileSelector}>
                  <View style={styles.fileSelectorContent}>
                    <View style={styles.fileSelectorButton}>
                      <Text style={styles.fileSelectorButtonText}>Choisir un fichier</Text>
                    </View>
                    <Text style={styles.fileSelectorInfo}>
                      {newDocument.fichier ? newDocument.fichier.name : 'Aucun fichier choisi'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.documentInputGroup}>
                <Text style={styles.documentInputLabel}>
                  Date du document <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.dateInputContainer}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateInputText}>{newDocument.date}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.documentSaveButton} onPress={handleSaveDocument}>
                <LinearGradient
                  colors={['#1e3a8a', '#3b82f6']}
                  style={styles.documentSaveGradient}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.documentSaveText}>Ajouter</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        transparent={true}
        visible={showAddMemberModal}
        animationType="slide"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addMemberModalContainer}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Ajouter un membre</Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.memberSelectionList}>
              {availableMembers.map((member) => (
                <TouchableOpacity 
                  key={`available-${member.id}`} 
                  style={styles.availableMemberCard}
                  onPress={() => handleAddSelectedMember(member)}
                >
                  <View style={styles.availableMemberInfo}>
                    <View style={styles.availableMemberAvatar}>
                      <Text style={styles.availableMemberInitials}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Text>
                    </View>
                    <View style={styles.availableMemberDetails}>
                      <Text style={styles.availableMemberName}>{member.name}</Text>
                      <Text style={styles.availableMemberEmail}>{member.email}</Text>
                    </View>
                  </View>
                  <View style={styles.addMemberCheckbox}>
                    <Ionicons name="add-circle" size={24} color="#3b82f6" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        transparent={true}
        visible={showInviteMemberModal}
        animationType="slide"
        onRequestClose={() => setShowInviteMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inviteMemberModalContainer}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Ajouter un membre</Text>
              <TouchableOpacity onPress={() => setShowInviteMemberModal(false)}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.inviteModalContent}>
              <View style={styles.inviteInputGroup}>
                <TextInput
                  style={styles.inviteEmailInput}
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                  placeholder="Entrez l'email du nouveau membre"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inviteCheckboxContainer}>
                <TouchableOpacity 
                  style={styles.inviteCheckboxRow}
                  onPress={() => setNewMemberIsResponsible(!newMemberIsResponsible)}
                >
                  <View style={[styles.inviteCheckbox, newMemberIsResponsible && styles.inviteCheckboxActive]}>
                    {newMemberIsResponsible && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                  </View>
                  <Text style={styles.inviteCheckboxLabel}>Responsable</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.inviteButton} onPress={handleInviteNewMember}>
                <LinearGradient
                  colors={['#1e3a8a', '#3b82f6']}
                  style={styles.inviteButtonGradient}
                >
                  <Text style={styles.inviteButtonText}>Ajouter</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Type Picker Modal */}
      <Modal
        transparent={true}
        visible={showDocumentTypePicker}
        animationType="fade"
        onRequestClose={() => setShowDocumentTypePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Type de document</Text>
              <TouchableOpacity onPress={() => setShowDocumentTypePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            {['PDF', 'Word', 'Excel', 'PowerPoint', 'Image'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  newDocument.type === type && styles.pickerOptionSelected
                ]}
                onPress={() => handleDocumentTypeSelect(type)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  newDocument.type === type && styles.pickerOptionTextSelected
                ]}>
                  {type}
                </Text>
                {newDocument.type === type && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Simple Date Display Modal */}
      <Modal
        transparent={true}
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.datePickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Date du document</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarPlaceholder}>
              <Ionicons name="calendar" size={48} color="#3b82f6" />
              <Text style={styles.calendarText}>Calendrier natif</Text>
              <Text style={styles.calendarSubtext}>
                Dans une vraie app, utilisez @react-native-community/datetimepicker
              </Text>
            </View>

            <View style={styles.dateActions}>
              <TouchableOpacity 
                style={styles.dateActionButton}
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setNewDocument({...newDocument, date: today});
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.dateActionText}>Aujourd'hui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabIcon: {
    marginRight: 6,
  },
  activeTabIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    padding: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContentContainer: {
    flex: 1,
    marginTop: 20,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Styles des cartes
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  membersCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  documentsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 10,
  },

  // Styles Info Tab
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  saveButton: {
    marginTop: 32,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Styles Membres Tab réorganisés
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  membersHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membersActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addButton: {
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  inviteButton: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  professionalTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  professionalHeaderMembers: {
    flex: 2,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'left',
  },
  professionalHeaderRole: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  membersList: {
    maxHeight: 400,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  memberMainInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#3b82f6',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  memberInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: '#64748b',
  },
  memberRoleColumn: {
    flex: 1,
    alignItems: 'center',
  },
  roleCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  roleCheckboxActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  // Styles Documents Tab
  addDocumentBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    padding: 8,
  },
  documentsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  itemsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 12,
  },
  itemsText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  searchControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  paginationText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  paginationControls: {
    flexDirection: 'row',
  },
  paginationBtn: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 350,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  alertHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  alertContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  alertMessage: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  alertButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  alertButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  alertButtonSingle: {
    marginHorizontal: 0,
  },
  alertButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  alertButtonTextConfirm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Styles des modaux
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  addMemberModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '60%',
  },
  inviteMemberModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '40%',
  },
  documentModalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  memberSelectionList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  availableMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  availableMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  availableMemberAvatar: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  availableMemberInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  availableMemberDetails: {
    flex: 1,
  },
  availableMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  availableMemberEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  addMemberCheckbox: {
    padding: 8,
  },
  inviteModalContent: {
    padding: 24,
  },
  inviteInputGroup: {
    marginBottom: 24,
  },
  inviteEmailInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  inviteCheckboxContainer: {
    marginBottom: 32,
  },
  inviteCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  inviteCheckboxActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  inviteCheckboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inviteButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inviteButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Styles du modal document
  documentModalContent: {
    padding: 24,
  },
  documentInputGroup: {
    marginBottom: 20,
  },
  documentInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#ef4444',
  },
  documentInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#374151',
  },
  documentTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  documentTypeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  fileSelector: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  fileSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSelectorButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  fileSelectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  fileSelectorInfo: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateInputText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  documentSaveButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  documentSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  documentSaveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },

  // Styles pour les pickers
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  pickerOptionSelected: {
    backgroundColor: '#eff6ff',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  calendarPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  calendarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  calendarSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  dateActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  dateActionButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectDetailScreen;