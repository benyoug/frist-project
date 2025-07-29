import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = "https://task.dcs-sarl.com/api/";

export const getApiInstance = async () => {
  const token = await AsyncStorage.getItem('token');
  
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 15000,
  });
  
  return instance;
};

export const authAPi = {
  login: async (credentials) => {
    const api = await getApiInstance();
    return api.post('/tasks/login', credentials);
  },

  logout: async () => {
    const api = await getApiInstance();
    return api.post('/logout');
  },

  getProfile: async () => {
    const api = await getApiInstance();
    return api.get('/user');
  }
};
export const taskApi = {
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    const api = await getApiInstance();

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

  changeTaskRef: async (id, val, type) => {
    const api = await getApiInstance();
    return api.post('/tasks/tasks/change-ref', {
      id,
      val,
      type
    });
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
  }
};

export const dailyResumesAPI = {
  getDailyResumes: async () => {
    const api = await getApiInstance();
    return api.get(`/tasks/daily-resumes`);
  },

  addDailyResume: async (description) => {
    const api = await getApiInstance();
    return api.post('/tasks/daily-resumes-add', {
      description
    });
  },

  updateDailyResume: async (id, description) => {
    const api = await getApiInstance();
    return api.post('/tasks/daily-resumes-update', {
      id,
      description
    });
  },

  
  deleteDailyResume: async (id) => {
    const api = await getApiInstance();
    return api.get(`/tasks/daily-resumes/${id}`);
  }
}; 