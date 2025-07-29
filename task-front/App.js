import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TaskTrackingScreen from './src/screens/TaskTrackingScreen';
import DailyTrackingScreen from './src/screens/DailyTrackingScreen'; 
// import TasksScreen from './src/screens/TasksScreen';

import useAuthStore from './src/stores/useAuthStore';
import api from './src/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Stack = createStackNavigator();

export default function App() {
  const { loadStoredToken, isAuthenticated } = useAuthStore();
   const token = useAuthStore((state) => state.token);

  console.log(token);
  axios.defaults.headers.common['Authorisation'] = `Bearer ${token}`;


  // Charger le token stocké au démarrage
  useEffect(() => {
    loadStoredToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated() ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' }
        }}
      >
        <Stack.Screen 
          name="Login"
          component={LoginScreen}
          options={{ title: 'Connexion' }}
        />
        <Stack.Screen 
          name="Home"
          component={HomeScreen}
          options={{ title: 'Accueil DCS' }}
        />
        {/* 
        <Stack.Screen 
          name="Tasks"
          component={TasksScreen}
          options={{ title: 'Gestion des Tâches' }}
        />
        */}
        {/* 
        <Stack.Screen 
          name="Projects"
          component={ProjectsScreen}
          options={{ title: 'Liste des Projets' }}
        />
        */}
        {/* 
        <Stack.Screen 
          name="ProjectDetail"
          component={ProjectDetailScreen}
          options={{ title: 'Détail du Projet' }}
        />
        */}
        <Stack.Screen 
          name="TaskTracking"
          component={TaskTrackingScreen}
          options={{ title: 'Suivi des Tâches' }}
        />
        
        {/* ← NOUVEAU SCREEN AJOUTÉ */}
        <Stack.Screen 
          name="DailyTracking" 
          component={DailyTrackingScreen} 
          options={{ title: 'Suivi Journalier' }} 
        />
        
        {/* Futures pages à ajouter :
        <Stack.Screen name="Listes" component={ListesScreen} />
        <Stack.Screen name="Documentation" component={DocumentationScreen} />
        <Stack.Screen name="Suivi" component={SuiviScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}