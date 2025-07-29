import React, { useState, useRef } from 'react';
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
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';

const { width } = Dimensions.get('window');

const ProjectsScreen = ({ navigation }) => {
  const { user, logout, auth_loading } = useAuthStore();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [searchText, setSearchText] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showItemsModal, setShowItemsModal] = useState(false);
  
  // États pour les alertes personnalisées
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  });

  // Données des projets (basées sur l'image 1)
  const [projects] = useState([
    { id: 1, name: 'TEKWINE' },
    { id: 2, name: 'Techghil' },
    { id: 3, name: 'Packages' },
    { id: 4, name: 'Diwane' },
    { id: 5, name: 'SMTD' },
    { id: 6, name: 'SIMEDD' },
    { id: 7, name: 'MCC' },
  ]);

  // Filtrer les projets selon la recherche
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase())
  );

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

  const handleLogout = async () => {
    setDrawerVisible(false);
    showCustomAlert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      'confirm',
      async () => {
        hideCustomAlert();
        await logout();
        navigation.navigate('Login');
      },
      hideCustomAlert
    );
  };

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuPress = (menuItem) => {
    setDrawerVisible(false);
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      switch(menuItem) {
        case 'home':
          navigation.navigate('Home');
          break;
        case 'projects':
          // Déjà sur la page projets
          break;
        case 'listes':
          showCustomAlert(
            'Listes',
            'Redirection vers la gestion des listes...',
            'info',
            hideCustomAlert
          );
          break;
        case 'documentation':
          showCustomAlert(
            'Centre de documentation',
            'Ouverture du centre de documentation...',
            'success',
            hideCustomAlert
          );
          break;
        case 'suivi':
          showCustomAlert(
            'Suivi journalier',
            'Accès au suivi quotidien des activités...',
            'warning',
            hideCustomAlert
          );
          break;
        default:
          showCustomAlert(
            'Information',
            'Cette fonctionnalité sera bientôt disponible.',
            'info',
            hideCustomAlert
          );
      }
    }, 300);
  };

  const handleProjectAction = (projectName, action) => {
    if (action === 'delete') {
      showCustomAlert(
        'Supprimer le projet',
        `Êtes-vous sûr de vouloir supprimer le projet ${projectName} ?`,
        'confirm',
        () => {
          hideCustomAlert();
          showCustomAlert(
            'Projet supprimé',
            `Le projet ${projectName} a été supprimé avec succès.`,
            'success',
            hideCustomAlert
          );
        },
        hideCustomAlert
      );
    }
  };

  const handleCardPress = (projectName) => {
  // Navigation vers la page de détail du projet
  navigation.navigate('ProjectDetail', { projectName });
};

  // Composant SwipeableCard pour chaque projet
  const SwipeableCard = ({ project }) => {
    const translateX = useRef(new Animated.Value(0)).current;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Mouvement complètement libre vers la gauche
        if (gestureState.dx <= 0) {
          translateX.setValue(gestureState.dx);
        }
        // Permettre aussi le retour vers la droite mais limité à 0
        else if (gestureState.dx > 0) {
          const currentTranslate = translateX._value;
          if (currentTranslate < 0) {
            const newValue = Math.min(currentTranslate + gestureState.dx, 0);
            translateX.setValue(newValue);
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const finalPosition = translateX._value;
        
        if (finalPosition < -80) {
          // Snap à la position ouverte
          Animated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap à la position fermée
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    const resetPosition = () => {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    };

    return (
      <View style={styles.cardContainer}>
        {/* Bouton de suppression (derrière) */}
        <View style={styles.deleteBackground}>
          <TouchableOpacity 
            style={styles.deleteAction}
            onPress={() => {
              resetPosition();
              handleProjectAction(project.name, 'delete');
            }}
          >
            <Ionicons name="trash" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Carte principale (swipeable) */}
        <Animated.View 
          style={[
            styles.projectCard,
            { transform: [{ translateX }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity 
            style={styles.cardTouchable}
            onPress={() => handleCardPress(project.name)}
            activeOpacity={0.95}
          >
            <View style={styles.projectContent}>
              <View style={styles.projectHeader}>
                <View style={styles.projectIconContainer}>
                  <View style={styles.projectIcon}>
                    <Ionicons name="folder-outline" size={24} color="#1e3a8a" />
                  </View>
                </View>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <View style={styles.projectMeta}>
                    <View style={styles.statusIndicator} />
                    <Text style={styles.projectStatus}>En cours</Text>
                  </View>
                </View>
                <View style={styles.projectBadge}>
                  <Text style={styles.badgeText}>Projet</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Composant Alerte Personnalisée (même que HomeScreen)
  const CustomAlert = () => {
    const getAlertIcon = () => {
      switch (customAlert.type) {
        case 'success':
          return { name: 'checkmark-circle', color: '#10b981' };
        case 'warning':
          return { name: 'warning', color: '#f59e0b' };
        case 'error':
          return { name: 'alert-circle', color: '#ef4444' };
        case 'confirm':
          return { name: 'help-circle', color: '#3b82f6' };
        default:
          return { name: 'information-circle', color: '#3b82f6' };
      }
    };

    const getAlertColors = () => {
      switch (customAlert.type) {
        case 'success':
          return { border: '#10b981', bg: '#ecfdf5' };
        case 'warning':
          return { border: '#f59e0b', bg: '#fffbeb' };
        case 'error':
          return { border: '#ef4444', bg: '#fef2f2' };
        case 'confirm':
          return { border: '#3b82f6', bg: '#eff6ff' };
        default:
          return { border: '#3b82f6', bg: '#eff6ff' };
      }
    };

    const icon = getAlertIcon();
    const colors = getAlertColors();

    return (
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
              <View style={[styles.alertIconContainer, { backgroundColor: colors.bg }]}>
                <Ionicons name={icon.name} size={32} color={icon.color} />
              </View>
              <Text style={styles.alertTitle}>{customAlert.title}</Text>
            </LinearGradient>

            <View style={styles.alertContent}>
              <Text style={styles.alertMessage}>{customAlert.message}</Text>
            </View>

            <View style={styles.alertButtons}>
              {customAlert.type === 'confirm' ? (
                <>
                  <TouchableOpacity
                    style={[styles.alertButton, styles.alertButtonCancel]}
                    onPress={customAlert.onCancel}
                  >
                    <Text style={styles.alertButtonTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.alertButton, styles.alertButtonConfirm]}
                    onPress={customAlert.onConfirm}
                  >
                    <LinearGradient
                      colors={['#dc2626', '#ef4444']}
                      style={styles.alertButtonGradient}
                    >
                      <Text style={styles.alertButtonTextConfirm}>Confirmer</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
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
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDrawer = () => (
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
            <View style={styles.drawerHeader}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>DCS</Text>
              </View>
              <Text style={styles.drawerTitle}>Taches</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={toggleDrawer}
              >
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuContainer}>
              <DrawerMenuItem
                icon="home-outline"
                title="Accueil"
                onPress={() => handleMenuPress('home')}
              />
              
              <DrawerMenuItem
                icon="folder-outline"
                title="Projects"
                onPress={() => handleMenuPress('projects')}
                isActive={true}
              />
              
              <DrawerMenuItem
                icon="list-outline"
                title="Listes"
                onPress={() => handleMenuPress('listes')}
              />
              
              <DrawerMenuItem
                icon="document-text-outline"
                title="Center de documentation"
                onPress={() => handleMenuPress('documentation')}
              />
              
              <DrawerMenuItem
                icon="calendar-outline"
                title="Suivi journalier"
                onPress={() => handleMenuPress('suivi')}
              />
            </View>

            <View style={styles.drawerFooter}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userInitials}>
                    {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{user?.nom} {user?.prenom}</Text>
                  <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={auth_loading}
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

  const ItemsPerPageModal = () => (
    <Modal
      transparent={true}
      visible={showItemsModal}
      animationType="fade"
      onRequestClose={() => setShowItemsModal(false)}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.itemsModalContainer}>
          <LinearGradient
            colors={['#1e3a8a', '#3b82f6']}
            style={styles.itemsModalHeader}
          >
            <Text style={styles.itemsModalTitle}>Éléments par page</Text>
            <TouchableOpacity onPress={() => setShowItemsModal(false)}>
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>
          
          <View style={styles.itemsModalContent}>
            {[5, 10, 15, 20, 25].map((number) => (
              <TouchableOpacity
                key={number}
                style={[
                  styles.itemsModalOption,
                  itemsPerPage === number && styles.itemsModalOptionSelected
                ]}
                onPress={() => {
                  setItemsPerPage(number);
                  setShowItemsModal(false);
                }}
              >
                <Text style={[
                  styles.itemsModalOptionText,
                  itemsPerPage === number && styles.itemsModalOptionTextSelected
                ]}>
                  {number}
                </Text>
                {itemsPerPage === number && (
                  <Ionicons name="checkmark" size={20} color="#3b82f6" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.menuButton} 
                onPress={toggleDrawer}
              >
                <Ionicons name="menu" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>List Projects</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Controls Section */}
          <View style={styles.controlsSection}>
            <View style={styles.controlsRow}>
              <View style={styles.itemsPerPageContainer}>
                <Ionicons name="eye-outline" size={20} color="#6b7280" />
                <TouchableOpacity 
                  style={styles.itemsButton}
                  onPress={() => setShowItemsModal(true)}
                >
                  <Text style={styles.itemsButtonText}>{itemsPerPage}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#6b7280" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher un projet..."
                  placeholderTextColor="#9ca3af"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            </View>
          </View>

          {/* Add Project Button */}
          <TouchableOpacity 
            style={styles.addProjectButton}
            onPress={() => showCustomAlert(
              'Ajouter un Projet',
              'Fonctionnalité d\'ajout de projet en cours de développement.',
              'info',
              hideCustomAlert
            )}
          >
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.addProjectGradient}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addProjectText}>Ajouter un Projet</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Projects List */}
          <ScrollView style={styles.projectsList} showsVerticalScrollIndicator={false}>
            {filteredProjects.slice(0, itemsPerPage).map((project, index) => (
              <SwipeableCard key={project.id} project={project} />
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Drawer Menu */}
      {renderDrawer()}

      {/* Custom Alert */}
      <CustomAlert />

      {/* Items Per Page Modal */}
      <ItemsPerPageModal />
    </SafeAreaView>
  );
};

// Composant DrawerMenuItem
const DrawerMenuItem = ({ icon, title, onPress, isActive = false }) => (
  <TouchableOpacity 
    style={[
      styles.drawerItem,
      isActive && styles.drawerItemActive
    ]} 
    onPress={onPress}
  >
    <View style={styles.drawerItemContent}>
      <Ionicons name={icon} size={24} color="#e0e7ff" style={styles.drawerItemIcon} />
      <Text style={styles.drawerItemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
  </TouchableOpacity>
);

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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  controlsSection: {
    marginBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemsButton: {
    marginLeft: 8,
    minWidth: 30,
  },
  itemsButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  addProjectButton: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addProjectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  addProjectText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  projectsList: {
    flex: 1,
  },
  cardContainer: {
    position: 'relative',
    marginBottom: 16,
    height: 100,
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteAction: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  projectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  projectContent: {
    padding: 20,
    height: '100%',
    justifyContent: 'center',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIconContainer: {
    marginRight: 16,
  },
  projectIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0f2fe',
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  projectStatus: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  projectBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Drawer Styles (même que HomeScreen)
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerBackground: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 320,
  },
  drawerGradient: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    letterSpacing: 3,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginLeft: 15,
  },
  closeButton: {
    padding: 8,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  drawerItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawerItemIcon: {
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#e0e7ff',
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
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '500',
  },

  // Alert Styles (même que HomeScreen)
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
  alertButtonCancel: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  alertButtonConfirm: {
    overflow: 'hidden',
  },
  alertButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  alertButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  alertButtonTextConfirm: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // Items Per Page Modal Styles
  itemsModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 300,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  itemsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  itemsModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  itemsModalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemsModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  itemsModalOptionSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  itemsModalOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  itemsModalOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default ProjectsScreen;