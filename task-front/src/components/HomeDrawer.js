import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { homeStyles } from '../styles/homeStyles';

const HomeDrawer = ({
  drawerVisible,
  slideAnim,
  toggleDrawer,
  handleMenuPress,
  currentUser,
  handleLogout,
}) => {
  
  const DrawerMenuItem = ({ icon, title, onPress, isActive = false }) => (
    <TouchableOpacity 
      style={[homeStyles.drawerItem, isActive && homeStyles.drawerItemActive]} 
      onPress={onPress}
    >
      <View style={homeStyles.drawerItemContent}>
        <Ionicons 
          name={icon} 
          size={24} 
          color="#e0e7ff" 
          style={homeStyles.drawerItemIcon} 
        />
        <Text style={homeStyles.drawerItemText}>
          {title}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <Modal 
      transparent={true} 
      visible={drawerVisible} 
      onRequestClose={toggleDrawer} 
      animationType="none"
    >
      <View style={homeStyles.drawerOverlay}>
        <TouchableOpacity 
          style={homeStyles.drawerBackground} 
          onPress={toggleDrawer} 
          activeOpacity={1} 
        />
        <Animated.View 
          style={[
            homeStyles.drawerContainer, 
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <LinearGradient 
            colors={['#1e3a8a', '#2563eb', '#3b82f6']} 
            style={homeStyles.drawerGradient}
          >
            {/* Header */}
            <View style={homeStyles.drawerHeader}>
              <View style={homeStyles.logoContainer}>
                <Text style={homeStyles.logoText}>DCS</Text>
              </View>
              <Text style={homeStyles.drawerTitle}>Taches</Text>
              <TouchableOpacity style={homeStyles.closeButton} onPress={toggleDrawer}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={homeStyles.menuContainer}>
              <DrawerMenuItem 
                icon="home-outline" 
                title="Taches" 
                onPress={() => handleMenuPress('home')} 
                isActive={true} 
              />
              
              {/* <DrawerMenuItem 
                icon="folder-outline" 
                title="Projects" 
                onPress={() => handleMenuPress('projects')} 
              /> */}
              
              {/* <DrawerMenuItem 
                icon="list-outline" 
                title="Suivi des tâches" 
                onPress={() => handleMenuPress('taskTracking')} 
              /> */}
              
              <DrawerMenuItem 
                icon="calendar-outline" 
                title="Suivi journalier" 
                onPress={() => handleMenuPress('dailyTracking')} 
              />
              
              {/* <DrawerMenuItem 
                icon="document-text-outline" 
                title="Centre de documentation" 
                onPress={() => handleMenuPress('documentation')} 
              /> */}
            </View>

            {/* Footer with User Info */}
            <View style={homeStyles.drawerFooter}>
              <View style={homeStyles.userInfo}>
                <View style={homeStyles.userAvatar}>
                  <Text style={homeStyles.userInitials}>
                    {currentUser?.nom?.charAt(0)?.toUpperCase()}
                    {currentUser?.prenom?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
                <View style={homeStyles.userDetails}>
                  <Text style={homeStyles.userName}>
                    {currentUser?.nom} {currentUser?.prenom}
                  </Text>
                  <Text style={homeStyles.userEmail}>
                    {currentUser?.email}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={homeStyles.logoutButton} 
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={homeStyles.logoutText}>Déconnexion</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default HomeDrawer;