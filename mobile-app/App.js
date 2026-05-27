import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_URL = 'https://lifepilot-ai-64au.onrender.com';
const STORAGE_KEY = '@lifepilot_server_url';

export default function App() {
  const [serverUrl, setServerUrl] = useState(DEFAULT_URL);
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const webViewRef = useRef(null);

  // Load saved URL on startup
  useEffect(() => {
    async function loadServerUrl() {
      try {
        const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedUrl) {
          setServerUrl(savedUrl);
          setTempUrl(savedUrl);
        } else {
          setTempUrl(DEFAULT_URL);
        }
      } catch (e) {
        console.error('Failed to load server URL', e);
      } finally {
        setIsUrlLoaded(true);
      }
    }
    loadServerUrl();
  }, []);

  const handleReload = () => {
    setError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleSaveUrl = async () => {
    let formattedUrl = tempUrl.trim();
    if (!formattedUrl) {
      formattedUrl = DEFAULT_URL;
    }
    
    // Add protocol if missing
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'http://' + formattedUrl;
    }

    try {
      await AsyncStorage.setItem(STORAGE_KEY, formattedUrl);
      setServerUrl(formattedUrl);
      setTempUrl(formattedUrl);
      setShowSettings(false);
      setError(false);
      setLoading(true);
    } catch (e) {
      console.error('Failed to save server URL', e);
    }
  };

  const handleResetUrl = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setServerUrl(DEFAULT_URL);
      setTempUrl(DEFAULT_URL);
      setShowSettings(false);
      setError(false);
      setLoading(true);
    } catch (e) {
      console.error('Failed to reset server URL', e);
    }
  };

  if (!isUrlLoaded) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#06060A" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5B6EF5" />
          <Text style={styles.loaderText}>Initializing LifePilot...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06060A" />



      <WebView
        ref={webViewRef}
        source={{ uri: serverUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        originWhitelist={['*']}
        domStorageEnabled={true}
        javaScriptEnabled={true}
        startInLoadingState={false}
        renderLoading={() => null}
      />

      {loading && !error && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#5B6EF5" />
          <Text style={styles.loaderTitle}>Loading LifePilot AI</Text>
          <Text style={styles.loaderSubtitle}>Connecting to server...</Text>
          <Text style={styles.urlIndicator} numberOfLines={1}>{serverUrl}</Text>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => setShowSettings(true)}
          >
            <Text style={styles.secondaryButtonText}>Configure Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Connection Interrupted</Text>
          <Text style={styles.errorSubtitle}>
            Failed to connect to the LifePilot server. Please make sure the server is online and running.
          </Text>
          <Text style={styles.urlIndicatorError} numberOfLines={2}>{serverUrl}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={handleReload}>
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.buttonConfig]} 
              onPress={() => {
                setTempUrl(serverUrl);
                setShowSettings(true);
              }}
            >
              <Text style={styles.buttonText}>Configure</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettings(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Connection Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>SERVER URL</Text>
              <TextInput
                style={styles.input}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="https://your-server.onrender.com"
                placeholderTextColor="#4B4B54"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <View style={styles.presetsRow}>
                <TouchableOpacity 
                  style={styles.presetBadge} 
                  onPress={() => setTempUrl('https://lifepilot-ai-64au.onrender.com')}
                >
                  <Text style={styles.presetBadgeText}>Render Production</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.presetBadge} 
                  onPress={() => setTempUrl('192.168.1.')}
                >
                  <Text style={styles.presetBadgeText}>Local IP Template</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionHeader}>How to connect locally:</Text>
                <Text style={styles.instructionStep}>
                  1. Run <Text style={styles.codeText}>npm run dev</Text> in your PC's project folder.
                </Text>
                <Text style={styles.instructionStep}>
                  2. Find your PC's IP address (e.g. 192.168.1.50).
                </Text>
                <Text style={styles.instructionStep}>
                  3. Connect your phone to the same WiFi network.
                </Text>
                <Text style={styles.instructionStep}>
                  4. Enter <Text style={styles.codeText}>http://YOUR-PC-IP:3000</Text> above.
                </Text>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveUrl}>
                <Text style={styles.saveButtonText}>Save & Reconnect</Text>
              </TouchableOpacity>

              {serverUrl !== DEFAULT_URL && (
                <TouchableOpacity style={styles.resetButton} onPress={handleResetUrl}>
                  <Text style={styles.resetButtonText}>Reset to Default</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  webview: {
    flex: 1,
    backgroundColor: '#06060A',
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06060A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loaderTitle: {
    color: '#F0F0F5',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  loaderSubtitle: {
    color: '#71717A',
    fontSize: 14,
    marginTop: 6,
  },
  urlIndicator: {
    color: '#5B6EF5',
    fontSize: 12,
    marginTop: 20,
    opacity: 0.75,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  urlIndicatorError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 10,
    opacity: 0.85,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  loaderText: {
    color: '#71717A',
    fontSize: 13,
    marginTop: 14,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06060A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#F0F0F5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#5B6EF5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  buttonConfig: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  secondaryButtonText: {
    color: '#71717A',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 3, 5, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F0F15',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#18181B',
  },
  modalTitle: {
    color: '#F0F0F5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#71717A',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: '#F0F0F5',
    fontSize: 15,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  presetBadge: {
    backgroundColor: '#1E1E24',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  presetBadgeText: {
    color: '#A1A1AA',
    fontSize: 11,
  },
  instructionsContainer: {
    backgroundColor: '#14141A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E1E24',
  },
  instructionHeader: {
    color: '#F0F0F5',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionStep: {
    color: '#A1A1AA',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#5B6EF5',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#5B6EF5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#5B6EF5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});
