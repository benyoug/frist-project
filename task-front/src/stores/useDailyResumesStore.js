import { create } from "zustand";
import { dailyResumesAPI } from "../config/axios";

const useDailyResumesStore = create((set, get) => ({

  dailyResumes: [],
  
  loading: false,
  submitting: false,

  error: null,

  filters: {
    date: null,
    member_id: null,
  },
  

  setDailyResumes: (dailyResumes) => set({ dailyResumes }),
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  

  fetchDailyResumes: async (filters = {}) => {
    set({ loading: true, error: null });
    
    try {
      const response = await dailyResumesAPI.getDailyResumes();
      const data = Array.isArray(response.data) ? response.data : [];
      
      set({
        dailyResumes: data,
        loading: false,
        filters: { ...get().filters, ...filters },
      });
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des résumés:', error);
      
      let errorMessage = 'Erreur lors de la récupération des résumés.';
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
  
  
  addDailyResume: async (description) => {
    set({ submitting: true, error: null });
    
    try {
    
        const response = await dailyResumesAPI.addDailyResume(description.trim());
      
      
      await get().fetchDailyResumes(get().filters);
      
      set({ submitting: false });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du résumé:', error);
      
      let errorMessage = 'Erreur lors de l\'ajout du résumé.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 422) {
        errorMessage = 'Données invalides. Vérifiez votre saisie.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
      }
      
      set({
        error: errorMessage,
        submitting: false,
      });
      
      throw error;
    }
  },
  
  updateDailyResume: async (id, description) => {
    set({ submitting: true, error: null });
    
    try {
        
        const response = await dailyResumesAPI.updateDailyResume(id, description.trim());
        
        const updatedResumes = get().dailyResumes.map(resume => {
            if (resume.id === id) {
                return { ...resume, description: description.trim() };
            }
            return resume;
        });
        
        set({ 
            dailyResumes: updatedResumes,
            submitting: false 
        });
        
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la modification du résumé:', error);
        
        let errorMessage = 'Erreur lors de la modification du résumé.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 422) {
            errorMessage = 'Données invalides. Vérifiez votre saisie.';
        } else if (error.response?.status === 404) {
            errorMessage = 'Résumé non trouvé.';
        } else if (error.message === 'Network Error') {
            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
        }
        
        set({
            error: errorMessage,
            submitting: false,
        });
        
        throw error;
    }
},

  deleteDailyResume: async (id) => {
    set({ submitting: true, error: null });
    
    try {
     
        await dailyResumesAPI.deleteDailyResume(id);
        
    
        const updatedResumes = get().dailyResumes.filter(resume => resume.id !== id);
        
        set({ 
            dailyResumes: updatedResumes,
            submitting: false 
        });
        
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du résumé:', error);
        
        let errorMessage = 'Erreur lors de la suppression du résumé.';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
            errorMessage = 'Résumé non trouvé.';
        } else if (error.message === 'Network Error') {
            errorMessage = 'Erreur réseau. Vérifiez votre connexion.';
        }
        
        set({
            error: errorMessage,
            submitting: false,
        });
        
        throw error;
    }
},


  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
  

  resetFilters: () => {
    set({
      filters: {
        date: null,
        member_id: null,
      }
    });
  },
  

  fetchTodayResumes: async () => {
    const today = new Date().toISOString().split('T')[0]; 
    return await get().fetchDailyResumes({ date: today });
  },
  
  
  fetchResumesByDate: async (date) => {
    return await get().fetchDailyResumes({ date });
  },
  

  fetchResumesByMember: async (memberId) => {
    return await get().fetchDailyResumes({ member_id: memberId });
  },
  

  getResumeById: (id) => {
    return get().dailyResumes.find(resume => resume.id === id);
  },
  
  canEditOrDelete: (resume) => {
    return resume.canEditOrDelete === true;
  },
  

  getStats: () => {
    const resumes = get().dailyResumes;
    const today = new Date().toISOString().split('T')[0];
    
    return {
      total: resumes.length,
      today: resumes.filter(r => r.day === today).length,
      thisWeek: resumes.filter(r => {
        const resumeDate = new Date(r.day);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        return resumeDate >= weekStart;
      }).length,
      thisMonth: resumes.filter(r => {
        const resumeDate = new Date(r.day);
        const now = new Date();
        return resumeDate.getMonth() === now.getMonth() && 
               resumeDate.getFullYear() === now.getFullYear();
      }).length,
    };
  },
  
  // Nettoyer l'état
  clearError: () => set({ error: null }),
  clearResumes: () => set({ dailyResumes: [] }),
}));

export default useDailyResumesStore;