import { create } from "zustand";
import { authAPI, storeToken, removeToken, getStoredToken } from "../config/api";
import { authAPi } from "../config/axios";
const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  auth_loading: false,
  auth_failed_message: null,
  
 
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: async (email, password) => {
    set({ auth_loading: true, auth_failed_message: null });
    
    try {
      const response = await authAPi.login({
        email,
        password,
      });
      
      console.log('Réponse de connexion:', response.data);
      
      const { user, token } = response.data;
      
    
      await storeToken(token);
      
      set({
        user: user,
        token: token,
        auth_loading: false,
        auth_failed_message: null
      });
      
      return true;
      
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Données invalides. Vérifiez vos informations.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === 'Network Error') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
      }
      
      set({
        auth_failed_message: errorMessage,
        auth_loading: false,
      });
      
      return false;
    }
  },
  
 
  logout: async () => {
    set({ auth_loading: true });
    
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Erreur lors de la déconnexion côté serveur:', error);
    }
    
    try {
      await removeToken();
      set({
        user: null,
        token: null,
        auth_loading: false,
        auth_failed_message: null
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
      set({
        user: null,
        token: null,
        auth_loading: false,
        auth_failed_message: null
      });
    }
  },
  
 
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user || response.data;
      
      set({ user });
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      
      if (error.response?.status === 401) {
        await removeToken();
        set({ user: null, token: null });
      }
      
      throw error;
    }
  },
  
 
  isAuthenticated: () => {
    const { token, user } = get();
    return !!(token && user);
  },
  
 
  loadStoredToken: async () => {
    try {
      const { getStoredToken } = await import('../config/api');
      const storedToken = await getStoredToken();
      
      if (storedToken) {
        set({ token: storedToken });
        
        try {
          
          const profile = await get().getProfile();
          console.log('Profil chargé:', profile);
        } catch (error) {
          console.log('Token expiré ou invalide');
          await removeToken();
          set({ token: null, user: null });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du token:', error);
    }
  },
  

  clear_auth_failed_message: () => set({ auth_failed_message: null }),
}));

export default useAuthStore;