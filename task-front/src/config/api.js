
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuthStore from '../stores/useAuthStore';
import  { getApiInstance } from './axios';

const API_BASE_URL = 'https://task.dcs-sarl.com'; 
   
const api =  getApiInstance(); 

export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
};

export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Erreur lors du stockage du token:', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Erreur lors de la suppression du token:', error);
  }
};

export const authAPI = {
  
  login: (credentials) => api.post('/login', credentials), 
  logout: () => api.post('/logout'),
  getProfile: () => api.get('/user'), 
};

export const tasksAPI = {
  
  getTasks: (filters = {})  =>  {
    const params = new URLSearchParams();
    if (filters.late_task !== undefined) params.append('late_task', filters.late_task);
    if (filters.state_filter) params.append('state_filter', filters.state_filter);
    if (filters.priority_filter) params.append('priority_filter', filters.priority_filter);
    if (filters.date_filter) params.append('date_filter', filters.date_filter);
    if (filters.type_filter) params.append('type_filter', filters.type_filter);
    if (filters.search) params.append('search', filters.search);
    if (filters.member_filter) params.append('member_filter', filters.member_filter);
    if (filters.project_filter) params.append('project_filter', filters.project_filter);
    
    return api.get('tasks');
     

  },
  
  changeTaskReference: (data) => {
    console.warn('changeTaskReference: Route non encore implémentée');
    return Promise.resolve({ data: { message: 'Simulation: Task reference changed' } });
  },
  
  getSupportData: () => {

    return Promise.resolve({
      data: {
        states: [
          { id: 1, name: 'Ouvert', color: '#6b7280' },
          { id: 2, name: 'En cours', color: '#3b82f6' },
          { id: 3, name: 'Terminé', color: '#10b981' }
        ],
        priorities: [
          { id: 1, name: 'Urgente', color: '#ef4444' },
          { id: 2, name: 'Haute', color: '#f59e0b' },
          { id: 3, name: 'Moyenne', color: '#3b82f6' },
          { id: 4, name: 'Basse', color: '#6b7280' }
        ],
        types: [
          { id: 1, name: 'Développement / Conception' },
          { id: 2, name: 'Test / Assurance qualité' },
          { id: 3, name: 'Formation / déploiement' },
          { id: 4, name: 'Administratif' },
          { id: 5, name: 'Documentation' }
        ]
      }
    });
  },
};


export const testConnection = async () => {
  try {
    const response = await api.get('/test'); 
    return response.data;
  } catch (error) {
    console.error('Erreur de connexion à l\'API:', error);
    throw error;
  }
};

export default api;