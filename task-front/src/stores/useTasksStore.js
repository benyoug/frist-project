import { create } from "zustand";
import { tasksAPI } from "../config/api";
import { taskApi } from "../config/axios";

const useTasksStore = create((set, get) => ({
  // État
  tasks: [],
  members: [],
  projects: [],
  supportData: {
    states: [],
    types: [],
    types_horaires: [],
    priorities: [],
  },
  

  loading: false,
  supportDataLoading: false,
  

  error: null,

  filters: {
    late_task: false,
    state_filter: null,
    priority_filter: null,
    date_filter: null,
    type_filter: null,
    search: '',
    member_filter: null,
    project_filter: null,
  },
  

  isOwner: false,
  
 
  setTasks: (tasks) => set({ tasks }),
  setMembers: (members) => set({ members }),
  setProjects: (projects) => set({ projects }),
  setSupportData: (supportData) => set({ supportData }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  

  fetchTasks: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const response = await taskApi.getTasks(filters);
      const data = response.data;
      
      set({
        tasks: data.tasks || [],
        members: data.members || [],
        projects: data.projects || [],
        isOwner: data.is_owner || false,
        loading: false,
        filters: { ...get().filters, ...filters },
      });
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      
      let errorMessage = 'Erreur lors de la récupération des tâches.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
      }
      
      set({
        error: errorMessage,
        loading: false,
      });
      
      throw error;
    }
  },
  
 
  fetchSupportData: async () => {
    set({ supportDataLoading: true });
    
    try {
      const response = await taskApi.getSupportData();
      const data = response.data;
      
      set({
        supportData: {
          states: data.states || [],
          types: data.types || [],
          types_horaires: data.types_horaires || [],
          priorities: data.priorities || [],
        },
        supportDataLoading: false,
      });
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de support:', error);
      set({ supportDataLoading: false });
      throw error;
    }
  },
  
  
  changeTaskReference: async (id, val, type) => {
    try {
      const response = await taskApi.changeTaskRef(
        {
            id,val,type
        }
      );
      
  
      const updatedTasks = get().tasks.map(task => {
        if (task.id === taskId) {
          if (type === 1) {
       
            return { ...task, state: newValue };
          } else if (type === 2) {
         
            return { ...task, priority: newValue };
          }
        }
        return task;
      });
      
      set({ tasks: updatedTasks });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      
      let errorMessage = 'Erreur lors de la mise à jour de la tâche.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      set({ error: errorMessage });
      throw error;
    }
  },
  

  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  
 
  resetFilters: () => {
    set({
      filters: {
        late_task: false,
        state_filter: null,
        priority_filter: null,
        date_filter: null,
        type_filter: null,
        search: '',
        member_filter: null,
        project_filter: null,
      }
    });
  },
  

  searchTasks: async (searchTerm) => {
    const filters = { ...get().filters, search: searchTerm };
    return await get().fetchTasks(filters);
  },
  

  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },
  
  getStateById: (id) => {
    return get().supportData.states.find(state => state.id === id);
  },
  
  getPriorityById: (id) => {
    return get().supportData.priorities.find(priority => priority.id === id);
  },
  
  getTypeById: (id) => {
    return get().supportData.types.find(type => type.id === id);
  },
  

  getStats: () => {
    const tasks = get().tasks;
    const states = get().supportData.states;
    

    const openState = states.find(s => s.name === 'Ouvert' || s.name === 'Open');
    const inProgressState = states.find(s => s.name === 'En cours' || s.name === 'In Progress');
    const completedState = states.find(s => s.name === 'Terminé' || s.name === 'Completed');
    
    return {
      total: tasks.length,
      open: tasks.filter(t => t.state === openState?.id).length,
      inProgress: tasks.filter(t => t.state === inProgressState?.id).length,
      completed: tasks.filter(t => t.state === completedState?.id).length,
      late: tasks.filter(t => t.late_task === true || t.late_task === 1).length,
    };
  },
  

  clearError: () => set({ error: null }),
  clearTasks: () => set({ tasks: [], members: [], projects: [] }),
}));

export default useTasksStore;