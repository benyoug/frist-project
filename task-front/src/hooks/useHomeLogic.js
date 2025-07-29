import { useState, useEffect } from 'react';
import { Animated, Dimensions, Alert } from 'react-native';
import useAuthStore from '../stores/useAuthStore';
import useTasksStore from '../stores/useTasksStore';
import { taskApi } from '../config/axios';

const { width } = Dimensions.get('window');

const useHomeLogic = (navigation) => {
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width));
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerType, setDatePickerType] = useState('start');
  const [tempDate, setTempDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showSuiviModal, setShowSuiviModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tempComment, setTempComment] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  

  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    onCancel: null,
  });

  const { logout } = useAuthStore();
  const {
    tasks,
    members,
    projects,
    supportData,
    loading,
    error,
    filters,
    isOwner,
    fetchTasks,
    fetchSupportData,
    changeTaskReference,
    updateFilters,
    resetFilters,
    searchTasks,
    getTaskById,
    getStateById,
    getPriorityById,
    getTypeById,
    getStats,
    clearError,
  } = useTasksStore();

  useEffect(() => {
    // Charger les données initiales
    const loadInitialData = async () => {
      try {
        // Charger les données de support d'abord
        await fetchSupportData();
        // Puis charger les tâches
        await fetchTasks();
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showCustomAlert(
          'Erreur de chargement',
          'Impossible de charger les données. Vérifiez votre connexion.',
          'error'
        );
      }
    };

    loadInitialData();
  }, []);

  
  useEffect(() => {
    if (searchText.length > 0) {
      const timeoutId = setTimeout(() => {
        searchTasks(searchText);
      }, 500); 

      return () => clearTimeout(timeoutId);
    }
  }, [searchText]);

  
  useEffect(() => {
    const applyFilters = async () => {
      const apiFilters = {
        late_task: isLate,
        search: searchText,
      };

      
      if (selectedPriority) {
        const priority = supportData.priorities.find(p => p.name === selectedPriority);
        if (priority) apiFilters.priority_filter = priority.id;
      }

      if (selectedStatus) {
        const state = supportData.states.find(s => s.name === selectedStatus);
        if (state) apiFilters.state_filter = state.id;
      }

      if (selectedType) {
        const type = supportData.types.find(t => t.name === selectedType);
        if (type) apiFilters.type_filter = type.id;
      }

    
      if (dateRange.start && dateRange.end) {
        const startDate = formatDateForAPI(dateRange.start);
        const endDate = formatDateForAPI(dateRange.end);
        apiFilters.date_filter = `${startDate} - ${endDate}`;
      }

      try {
        await fetchTasks(apiFilters);
      } catch (error) {
        console.error('Erreur lors de l\'application des filtres:', error);
      }
    };

    if (supportData.priorities.length > 0) {
      applyFilters();
    }
  }, [isLate, selectedPriority, selectedStatus, selectedType, dateRange]);

 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPriorityColor = (priorityName) => {
    const priority = supportData.priorities.find(p => p.name === priorityName);
    return priority?.color || '#6b7280';
  };

  const getStatusColor = (statusName) => {
    const status = supportData.states.find(s => s.name === statusName);
    return status?.color || '#6b7280';
  };

  const getTaskStats = () => {
    const stats = getStats();
    return {
      total: stats.total,
      inProgress: stats.inProgress,
      completed: stats.completed,
      late: stats.late
    };
  };

  
  const getFilteredTasks = () => {
    return tasks;
  };


  const showCustomAlert = (title, message, type = 'info', onConfirm = null, onCancel = null) => {
    setCustomAlert({ 
      visible: true, 
      title, 
      message, 
      type, 
      onConfirm: onConfirm || hideCustomAlert, 
      onCancel 
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert({ 
      visible: false, 
      title: '', 
      message: '', 
      type: 'info', 
      onConfirm: null, 
      onCancel: null 
    });
  };

  
  const handleAddTask = async (taskData) => {

    showCustomAlert(
      'Fonctionnalité en développement',
      'L\'ajout de tâches sera bientôt disponible via l\'API.',
      'info'
    );
  };

  const openStatusModal = (task) => {
    console.log('Ouverture modal Status pour:', task.title);
    setSelectedTask(task);
    setTempComment('');
    
    
    const currentState = getStateById(task.state);
    setTempStatus(currentState?.name || '');
    
    setShowStatusModal(true);
  };

  const openPriorityModal = (task) => {
    setSelectedTask(task);
    setShowPriorityModal(true);
  };

  const openSuiviModal = (task) => {
    setSelectedTask(task);
    setShowSuiviModal(true);
  };

  const updateTaskStatus = async () => {

    if (!tempStatus || !selectedTask) {
      console.log('Données manquantes:', { tempStatus, selectedTask });
      return;
    }

    try {
      
      const selectedState = supportData.states.find(s => s.name === tempStatus);
      if (!selectedState) {
        showCustomAlert('Erreur', 'État sélectionné invalide.', 'error');
        return;
      }

      
      await taskApi.changeTaskRef(selectedTask.id, selectedState.id,1);
      
      
      showCustomAlert(
        'État mis à jour',
        `L'état de la tâche "${selectedTask.libelle_fr}" a été modifié vers "${tempStatus}".`,
        'success',
        () => {
          hideCustomAlert();
          setShowStatusModal(false);
          setSelectedTask(null);
          setTempComment('');
          setTempStatus('');
        }
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      showCustomAlert(
        'Erreur',
        'Impossible de mettre à jour l\'état de la tâche.',
        'error'
      );
    }
  };

  const updateTaskPriority = async (newPriority) => {
    if (!selectedTask) return;

    try {
      
      const selectedPriorityObj = supportData.priorities.find(p => p.name === newPriority);
      if (!selectedPriorityObj) {
        showCustomAlert('Erreur', 'Priorité sélectionnée invalide.', 'error');
        return;
      }

  
      await changeTaskReference(selectedTask.id, selectedPriorityObj.id, 2);
      
      setShowPriorityModal(false);
      
      
      showCustomAlert(
        'Priorité mise à jour',
        `La priorité de la tâche "${selectedTask.title}" a été changée vers "${newPriority}".`,
        newPriority === 'Urgente' ? 'warning' : 'success'
      );
      
      setSelectedTask(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité:', error);
      showCustomAlert(
        'Erreur',
        'Impossible de mettre à jour la priorité de la tâche.',
        'error'
      );
    }
  };

  const handleLogout = async () => {
    setDrawerVisible(false);
    showCustomAlert(
      'Confirmation de déconnexion', 
      'Êtes-vous sûr de vouloir vous déconnecter de votre session ?', 
      'confirm', 
      async () => {
        hideCustomAlert();
        try {
          await logout();
          showCustomAlert(
            'Déconnexion réussie',
            'Vous avez été déconnecté avec succès. À bientôt !',
            'success',
            () => {
              hideCustomAlert();
              navigation.replace('Login');
            }
          );
        } catch (error) {
          showCustomAlert(
            'Erreur de déconnexion',
            'Une erreur s\'est produite lors de la déconnexion. Veuillez réessayer.',
            'error'
          );
        }
      }, 
      hideCustomAlert
    );
  };

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  };

  const handleMenuPress = (menuItem) => {
    setDrawerVisible(false);
    Animated.timing(slideAnim, { toValue: -width, duration: 200, useNativeDriver: true }).start();

    setTimeout(() => {
      switch(menuItem) {
        case 'projects': 
          navigation.navigate('Projects'); 
          break;
        case 'taskTracking': 
          navigation.navigate('TaskTracking'); 
          break;
        case 'dailyTracking': 
          navigation.navigate('DailyTracking'); 
          break;
        case 'taskViews': 
          navigation.navigate('TaskViews'); 
          break;
        case 'listes': 
          showCustomAlert(
            'Gestion des listes', 
            'Cette fonctionnalité permet de gérer vos listes personnalisées et partagées.\n\nProchainement disponible !', 
            'info'
          ); 
          break;
        case 'documentation': 
          showCustomAlert(
            'Centre de documentation', 
            'Accédez à la documentation complète, aux guides d\'utilisation et aux FAQ.\n\nRedirection en cours...', 
            'success'
          ); 
          break;
        case 'suivi': 
          navigation.navigate('TaskTracking'); 
          break;
        default: 
          showCustomAlert(
            'Fonctionnalité en développement', 
            'Cette fonctionnalité est actuellement en cours de développement et sera bientôt disponible.\n\nMerci de votre patience !', 
            'info'
          );
      }
    }, 300);
  };

  const openDatePicker = (type) => {
    setDatePickerType(type);
    if (type === 'start' && dateRange.start) {
      setTempDate(new Date(dateRange.start));
    } else if (type === 'end' && dateRange.end) {
      setTempDate(new Date(dateRange.end));
    } else {
      setTempDate(new Date());
    }
    setShowDatePicker(true);
  };

  const applySelectedDate = () => {
    const formattedDate = formatDateToString(tempDate);
    if (datePickerType === 'start') {
      setDateRange(prev => ({ ...prev, start: formattedDate }));
    } else {
      setDateRange(prev => ({ ...prev, end: formattedDate }));
    }
    setShowDatePicker(false);
  };

  const deleteTask = (taskId) => {
    showCustomAlert(
      'Fonctionnalité en développement',
      'La suppression de tâches sera bientôt disponible via l\'API.',
      'info'
    );
  };

  // ===== REFRESH FUNCTIONS =====
  const refreshTasks = async () => {
    try {
      await fetchTasks(filters);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  };

  const clearFilters = () => {
    resetFilters();
    setIsLate(false);
    setSelectedPriority('');
    setSelectedStatus('');
    setSelectedType('');
    setDateRange({ start: '', end: '' });
    setSearchText('');
  };

  return {
    // States
    drawerVisible, setDrawerVisible,
    slideAnim,
    searchText, setSearchText,
    showFilters, setShowFilters,
    isLate, setIsLate,
    selectedPriority, setSelectedPriority,
    selectedStatus, setSelectedStatus,
    selectedType, setSelectedType,
    showDatePicker, setShowDatePicker,
    datePickerType, setDatePickerType,
    tempDate, setTempDate,
    dateRange, setDateRange,
    showAddTaskModal, setShowAddTaskModal,
    showStatusModal, setShowStatusModal,
    showPriorityModal, setShowPriorityModal,
    showSuiviModal, setShowSuiviModal,
    selectedTask, setSelectedTask,
    tempComment, setTempComment,
    tempStatus, setTempStatus,
    customAlert, setCustomAlert,
    
    // Data from stores
    tasks,
    members,
    projects,
    supportData,
    loading,
    error,
    isOwner,
    
    // Computed data
    priorities: supportData.priorities.map(p => p.name),
    statuses: supportData.states.map(s => ({ value: s.name, label: s.name, color: s.color })),
    types: supportData.types.map(t => t.name),
    
    // Functions
    formatDate,
    formatDateToString,
    getPriorityColor,
    getStatusColor,
    getStats: getTaskStats,
    getFilteredTasks,
    handleAddTask,
    openStatusModal,
    openPriorityModal,
    openSuiviModal,
    updateTaskStatus,
    updateTaskPriority,
    showCustomAlert,
    hideCustomAlert,
    handleLogout,
    toggleDrawer,
    handleMenuPress,
    openDatePicker,
    applySelectedDate,
    deleteTask,
    refreshTasks,
    clearFilters,
    clearError,
  };
};

export default useHomeLogic;