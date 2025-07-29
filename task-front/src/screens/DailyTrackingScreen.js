import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  BackHandler,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { dailyResumesAPI } from '../config/axios';

const DailyTrackingScreen = ({ navigation }) => {
  
  const [dailyResumes, setDailyResumes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSummary, setNewSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  
  useEffect(() => {
    loadData();
  }, []);

  
  useEffect(() => {
    if (!showAddModal) return;
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleModalClose();
      return true;
    });

    return () => backHandler.remove();
  }, [showAddModal]);

  
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  
  const formatDate = (dateString) => {


    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  
  const formatShortDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  
  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  
  const getDateColor = (dateString) => {
    if (isToday(dateString)) return '#007AFF';
    
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return '#34C759'; 
    if (diffDays <= 7) return '#FF9500'; 
    return '#8E8E93'; 
  };

  
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisWeekStartString = thisWeekStart.toISOString().split('T')[0];
    
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthStartString = thisMonthStart.toISOString().split('T')[0];

    return {
      total: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    };
  };

  
  const getFilteredSummaries = () => {
    return dailyResumes.filter(summary => {
      const matchesSearch = searchText === '' || 
        summary.description.toLowerCase().includes(searchText.toLowerCase()) ||
        summary.member.toLowerCase().includes(searchText.toLowerCase());
      
      return matchesSearch;
    });
  };

  const loadData = async () => {
    setLoading(true);
    try {

      const data = await dailyResumesAPI.getDailyResumes();
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // const mockData = [
      //   {
      //     id: 1,
      //     description: "Réunion d'équipe pour planifier le sprint. Développement de nouvelles fonctionnalités pour l'interface utilisateur. Correction de bugs critiques signalés par les utilisateurs.",
      //     date: new Date().toISOString().split('T')[0],
      //     member: "John Doe",
      //     createdAt: new Date().toISOString()
      //   },
      //   {
      //     id: 2,
      //     description: "Révision du code et tests unitaires. Mise à jour de la documentation technique. Réunion avec l'équipe QA pour discuter des procédures de test.",
      //     date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      //     member: "Jane Smith",
      //     createdAt: new Date(Date.now() - 86400000).toISOString()
      //   },
      //   {
      //     id: 3,
      //     description: "Analyse des performances de l'application. Optimisation des requêtes base de données. Formation sur les nouvelles technologies React Native.",
      //     date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      //     member: "Mike Johnson",
      //     createdAt: new Date(Date.now() - 172800000).toISOString()
      //   },
      //   {
      //     id: 4,
      //     description: "Résolution des tickets support client. Mise en place d'un système de monitoring des erreurs. Déploiement de la version 2.1 en production.",
      //     date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
      //     member: "Sarah Wilson",
      //     createdAt: new Date(Date.now() - 259200000).toISOString()
      //   }
      // ];
      setDailyResumes(data.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  
  const openAddModal = () => {
    setNewSummary('');
    setEditingId(null);
    setShowAddModal(true);
  };

  // Ouvrir le modal d'édition
  const openEditModal = (resume) => {
    setNewSummary(resume.description);
    setEditingId(resume.id);
    setShowAddModal(true);
  };

  // Fermer le modal avec vérification
  const handleModalClose = () => {
    const hasChanges = newSummary.trim() !== '';
    const originalText = editingId ? 
      dailyResumes.find(r => r.id === editingId)?.description || '' : '';
    const hasModifications = editingId && newSummary.trim() !== originalText.trim();
    
    if (hasChanges || hasModifications) {
      Alert.alert(
        'Modifications non sauvegardées',
        'Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Fermer', style: 'destructive', onPress: closeModal }
        ]
      );
    } else {
      closeModal();
    }
  };

  // Fermer le modal
  const closeModal = () => {
    setShowAddModal(false);
    setNewSummary('');
    setEditingId(null);
  };

  
  const saveSummary = async () => {
    // Validation
    if (!newSummary.trim()) {
        Alert.alert('Erreur', 'Veuillez saisir un résumé');
        return;
    }

    if (newSummary.trim().length < 10) {
        Alert.alert('Erreur', 'Le résumé doit contenir au moins 10 caractères');
        return;
    }

    setSubmitting(true);
    
    try {
        if (editingId) {
            // ✅ MODIFIER un résumé existant (CORRIGÉ)
            const description = newSummary.trim();
            const response = await dailyResumesAPI.updateDailyResume(editingId, description);
            
            // Mettre à jour le state local après succès
            setDailyResumes(prev => 
                prev.map(resume => 
                    resume.id === editingId 
                        ? { ...resume, description: description }
                        : resume
                )
            );
            
            Alert.alert('Succès', 'Résumé modifié avec succès');
        } else {
            // ✅ AJOUTER un nouveau résumé (déjà correct)
            const description = newSummary.trim();
            const response = await dailyResumesAPI.addDailyResume(description);
            
            // Recharger les données ou ajouter au state local
            await loadData(); // ou bien ajouter directement au state
            
            Alert.alert('Succès', 'Résumé ajouté avec succès');
        }

        closeModal();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        Alert.alert('Erreur', 'Impossible de sauvegarder le résumé');
    } finally {
        setSubmitting(false);
    }
};

  // Supprimer un résumé
 const deleteSummary = (id) => {
    const resume = dailyResumes.find(r => r.id === id);
    if (!resume) return;

    Alert.alert(
        'Confirmation',
        `Êtes-vous sûr de vouloir supprimer le résumé du ${formatShortDate(resume.day)} ?`,
        [
            { text: 'Annuler', style: 'cancel' },
            { 
                text: 'Supprimer', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        // ✅ Utiliser UPDATE pour marquer comme supprimé
                        await dailyResumesAPI.deleteDailyResume(id);
                        
                        // Supprimer de la vue locale
                        setDailyResumes(prev => prev.filter(resume => resume.id !== id));
                        
                        Alert.alert('Succès', 'Résumé supprimé avec succès');
                    } catch (error) {
                        console.error('Erreur lors de la suppression:', error);
                        Alert.alert('Erreur', 'Impossible de supprimer le résumé');
                    }
                }
            }
        ]
    );
};

  // ===============================
  // COMPOSANTS
  // ===============================
  
  // Composant statistique
  const StatCard = ({ number, label, color }) => (
    <View style={styles.statCard}>
      <Text style={[styles.statNumber, { color }]}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Composant carte de résumé
  const SummaryCard = ({ resume }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <View style={[styles.dateIndicator, { backgroundColor: getDateColor(resume.day) }]} />
          <View>
            <Text style={styles.dateText}>{formatDate(resume.day)}</Text>
            <Text style={styles.timeText}>
              {isToday(resume.date) ? 'Aujourd\'hui' : formatShortDate(resume.day)}
            </Text>
          </View>
        </View>
        <View style={styles.memberContainer}>
          <Text style={styles.memberText}>{resume.member}</Text>
        </View>
      </View>
      
      <Text style={styles.summaryText} numberOfLines={3}>
        {resume.description}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.characterCount}>
          {resume.description.length} caractères
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openEditModal(resume)}
          >
            <Text style={styles.editButtonText}>✏️ Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteSummary(resume.id)}
          >
            <Text style={styles.deleteButtonText}>🗑️ Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Composant d'état vide
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>
        {searchText ? 'Aucun résultat trouvé' : 'Aucun résumé pour le moment'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText 
          ? 'Essayez avec d\'autres mots-clés' 
          : 'Commencez par ajouter votre premier résumé journalier'
        }
      </Text>
      {!searchText && (
        <TouchableOpacity style={styles.firstAddButton} onPress={openAddModal}>
          <Text style={styles.firstAddButtonText}>➕ Ajouter le premier</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Composant d'état de chargement
  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Chargement des résumés...</Text>
    </View>
  );

  // ===============================
  // VARIABLES CALCULÉES
  // ===============================
  const stats = getStats();
  const filteredSummaries = getFilteredSummaries();

  // ===============================
  // RENDER PRINCIPAL
  // ===============================
  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.innerContainer}>
          {/* EN-TÊTE */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Suivi Journalier</Text>
            <TouchableOpacity onPress={openAddModal}>
              <Text style={styles.addButton}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {/* BARRE DE RECHERCHE */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Rechercher dans les résumés..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#666"
            />
            {searchText !== '' && (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* STATISTIQUES */}
          {/* <View style={styles.statsContainer}>
            <StatCard number={stats.total} label="Total" color="#007AFF" />
            <StatCard number={stats.today} label="Aujourd'hui" color="#34C759" />
            <StatCard number={stats.thisWeek} label="Cette semaine" color="#FF9500" />
            <StatCard number={stats.thisMonth} label="Ce mois" color="#AF52DE" />
          </View> */}

          {/* LISTE DES RÉSUMÉS */}
          <ScrollView 
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
          >
            {loading ? (
              <LoadingState />
            ) : filteredSummaries.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsText}>
                    {filteredSummaries.length} résumé{filteredSummaries.length > 1 ? 's' : ''} trouvé{filteredSummaries.length > 1 ? 's' : ''}
                  </Text>
                </View>
                {filteredSummaries.map(resume => (
                  <SummaryCard key={resume.id} resume={resume} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      {/* MODAL D'AJOUT/MODIFICATION */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleModalClose}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContainer}>
                {/* En-tête du modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingId ? '✏️ Modifier le résumé' : '➕ Nouveau résumé'}
                  </Text>
                  <TouchableOpacity onPress={handleModalClose}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Contenu du modal */}
                <TouchableWithoutFeedback onPress={dismissKeyboard}>
                  <View style={styles.modalContent}>
                    <Text style={styles.inputLabel}>Résumé de la journée *</Text>
                    <TextInput
                      style={styles.textArea}
                      value={newSummary}
                      onChangeText={setNewSummary}
                      placeholder="Décrivez votre journée de travail, les tâches accomplies, les défis rencontrés..."
                      multiline={true}
                      numberOfLines={8}
                      textAlignVertical="top"
                      maxLength={1000}
                    />
                    
                    <View style={styles.inputFooter}>
                      <Text style={styles.inputCharacterCount}>
                        {newSummary.length}/1000 caractères
                      </Text>
                      {newSummary.length < 10 && newSummary.length > 0 && (
                        <Text style={styles.warningText}>
                          Minimum 10 caractères requis
                        </Text>
                      )}
                    </View>
                    
                    {/* Actions du modal */}
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={handleModalClose}
                      >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.saveButton, submitting && styles.saveButtonDisabled]} 
                        onPress={saveSummary}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.saveButtonText}>
                            {editingId ? 'Modifier' : 'Enregistrer'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

// ===============================
// STYLES
// ===============================
const styles = StyleSheet.create({
  // LAYOUT PRINCIPAL
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  innerContainer: {
    flex: 1,
  },

  // EN-TÊTE
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#007AFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
  },

  // RECHERCHE
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 12,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 18,
  },

  // STATISTIQUES
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // LISTE
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },

  // CARTES DE RÉSUMÉ
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  memberContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  memberText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  characterCount: {
    fontSize: 11,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // ÉTATS
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  firstAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  firstAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  inputCharacterCount: {
    fontSize: 12,
    color: '#666',
  },
  warningText: {
    fontSize: 12,
    color: '#FF3B30',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DailyTrackingScreen;

