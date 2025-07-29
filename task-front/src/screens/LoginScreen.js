import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../stores/useAuthStore';

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  // État pour l'alerte personnalisée intégrée
  const [alert, setAlert] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
  });

  const { 
    login, 
    auth_loading, 
    auth_failed_message, 
    clear_auth_failed_message,
    isAuthenticated 
  } = useAuthStore();

  useEffect(() => {
    if (auth_failed_message) {
      clear_auth_failed_message();
    }
  }, [formData.email, formData.password]);

  useEffect(() => {
    if (isAuthenticated()) {
      navigation?.navigate('Home');
    }
  }, [isAuthenticated()]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonctions pour gérer les alertes
  const showAlert = (type, title, message, onConfirm = null, onCancel = null) => {
    setAlert({
      visible: true,
      type,
      title,
      message,
      onConfirm: onConfirm || hideAlert,
      onCancel,
    });
  };

  const hideAlert = () => {
    setAlert({
      visible: false,
      type: 'info',
      title: '',
      message: '',
      onConfirm: null,
      onCancel: null,
    });
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showAlert(
        'error',
        'Erreur de validation',
        'Veuillez corriger les erreurs dans le formulaire.',
        hideAlert
      );
      return;
    }
    
    const result = await login(formData.email, formData.password);
    
    if (result) {
      showAlert(
        'success',
        'Connexion réussie !',
        'Vous allez être redirigé vers l\'accueil.',
        () => {
          hideAlert();
          navigation?.navigate('Home');
        }
      );
    } else {
      showAlert(
        'error',
        'Échec de connexion',
        auth_failed_message || 'Identifiants incorrects. Veuillez réessayer.',
        hideAlert
      );
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleForgotPassword = () => {
    showAlert(
      'info',
      'Mot de passe oublié',
      'Veuillez contacter l\'administrateur pour réinitialiser votre mot de passe.\n\nEmail: admin@dcs.com\nTél: +222 XX XX XX XX',
      hideAlert
    );
  };

  const handleContactUs = () => {
    showAlert(
      'info',
      'Créer un compte',
      'Pour créer un nouveau compte, veuillez contacter l\'administrateur système.\n\nEmail: admin@dcs.com\nTél: +222 XX XX XX XX',
      hideAlert
    );
  };

  // ===== COMPOSANT CUSTOM ALERT INTÉGRÉ =====
const CustomAlert = () => {
  const getAlertConfig = () => {
    switch (alert.type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          iconColor: '#ffffff',
          bgColor: '#3b82f6',
          borderColor: '#3b82f6',
          gradient: ['#3b82f6', '#2563eb']
        };
      case 'warning':
        return {
          icon: 'warning',
          iconColor: '#ffffff',
          bgColor: '#3b82f6',
          borderColor: '#3b82f6',
          gradient: ['#3b82f6', '#2563eb']
        };
      case 'error':
        return {
          icon: 'alert-circle',
          iconColor: '#ffffff',
          bgColor: '#3b82f6',
          borderColor: '#3b82f6',
          gradient: ['#3b82f6', '#2563eb']
        };
      case 'confirm':
        return {
          icon: 'help-circle',
          iconColor: '#ffffff',
          bgColor: '#3b82f6',
          borderColor: '#3b82f6',
          gradient: ['#3b82f6', '#2563eb']
        };
      default:
        return {
          icon: 'information-circle',
          iconColor: '#ffffff',
          bgColor: '#3b82f6',
          borderColor: '#3b82f6',
          gradient: ['#3b82f6', '#2563eb']
        };
    }
  };

  if (!alert.visible) return null;

  const config = getAlertConfig();

  return (
    <Modal
      transparent={true}
      visible={alert.visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={alertStyles.overlay}>
        <View style={alertStyles.container}>
          {/* Header avec gradient */}
          <LinearGradient
            colors={config.gradient}
            style={alertStyles.header}
          >
            <View style={alertStyles.iconTitleContainer}>
              <Ionicons name={config.icon} size={24} color={config.iconColor} />
              <Text style={alertStyles.title}>{alert.title}</Text>
            </View>
          </LinearGradient>

          {/* Contenu */}
          <View style={alertStyles.content}>
            <Text style={alertStyles.message}>{alert.message}</Text>
          </View>

          {/* Boutons */}
          <View style={alertStyles.buttonContainer}>
            {alert.type === 'confirm' ? (
              <>
                <TouchableOpacity
                  style={[alertStyles.button, alertStyles.cancelButton]}
                  onPress={alert.onCancel || hideAlert}
                >
                  <Text style={alertStyles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[alertStyles.button, alertStyles.confirmButton]}
                  onPress={alert.onConfirm}
                >
                  <LinearGradient
                    colors={config.gradient}
                    style={alertStyles.buttonGradient}
                  >
                    <Text style={alertStyles.confirmButtonText}>Confirmer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[alertStyles.button, alertStyles.singleButton]}
                onPress={alert.onConfirm}
              >
                <LinearGradient
                  colors={config.gradient}
                  style={alertStyles.buttonGradient}
                >
                  <Text style={alertStyles.confirmButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#60a5fa']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#ffffff', '#f8fafc']}
                  style={styles.logoGradient}
                >
                  <Text style={styles.logoText}>DCS</Text>
                </LinearGradient>
              </View>
              <Text style={styles.welcomeText}>Bon retour !</Text>
              <Text style={styles.subtitleText}>
                Connectez-vous à votre compte
              </Text>
            </View>

            {/* Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Connexion</Text>
              
              {/* Message d'erreur global */}
              {auth_failed_message && (
                <View style={styles.errorContainer}>
                  <LinearGradient
                    colors={['#fef2f2', '#fee2e2']}
                    style={styles.errorGradient}
                  >
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text style={styles.errorMessage}>{auth_failed_message}</Text>
                  </LinearGradient>
                </View>
              )}

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="votre@email.com"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                  {formData.email.length > 0 && (
                    <Ionicons 
                      name={errors.email ? "close-circle" : "checkmark-circle"} 
                      size={20} 
                      color={errors.email ? "#ef4444" : "#10b981"} 
                    />
                  )}
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Mot de passe */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe *</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => updateField('password', text)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="#6b7280"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Mot de passe oublié */}
              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>

              {/* Button de connexion */}
              <TouchableOpacity
                style={[styles.loginButton, auth_loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={auth_loading}
              >
                <LinearGradient
                  colors={auth_loading ? ['#9ca3af', '#6b7280'] : ['#1e3a8a', '#3b82f6']}
                  style={styles.buttonGradient}
                >
                  {auth_loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.loadingText}>Connexion...</Text>
                    </View>
                  ) : (
                    <>
                      <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Se connecter</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Lien vers inscription */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Besoin d'un compte ? </Text>
                <TouchableOpacity onPress={handleContactUs}>
                  <Text style={styles.signupLink}>Contactez-nous</Text>
                </TouchableOpacity>
              </View>

              {/* Footer avec informations */}
              {/* <View style={styles.infoFooter}>
                <View style={styles.infoItem}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#10b981" />
                  <Text style={styles.infoText}>Connexion sécurisée</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={16} color="#3b82f6" />
                  <Text style={styles.infoText}>Disponible 24h/24</Text>
                </View>
              </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      {/* Alerte personnalisée intégrée */}
      <CustomAlert />
    </SafeAreaView>
  );
};

// Styles pour le LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    marginBottom: 30,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 0.5,
  },
  errorContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  errorMessage: {
    flex: 1,
    marginLeft: 12,
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 20,
    height: 64,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 8,
    marginLeft: 8,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  loginButton: {
    marginBottom: 25,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});

// Styles pour l'alerte personnalisée
const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '85%',
    maxWidth: 320,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  iconTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 10,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  singleButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default LoginScreen;