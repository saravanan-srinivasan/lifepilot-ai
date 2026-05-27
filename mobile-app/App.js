import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { WebView } from 'react-native-webview';

// Enter your active Render deployment endpoint below
const LIVE_URL = "https://lifepilot-ai.onrender.com";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [webViewRef, setWebViewRef] = useState(null);

  const handleReload = () => {
    setError(false);
    setLoading(true);
    if (webViewRef) {
      webViewRef.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#06060A" />
      
      <View style={styles.content}>
        <WebView
          ref={(ref) => setWebViewRef(ref)}
          source={{ uri: LIVE_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          allowsBackForwardNavigationGestures={true}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          scalesPageToFit={true}
          startInLoadingState={true}
          renderLoading={() => null} // Handled by custom native loader below
        />

        {/* Dynamic Premium Dark Loader */}
        {loading && !error && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#5B6EF5" />
            <Text style={styles.loaderText}>Syncing LifePilot Protocols...</Text>
          </View>
        )}

        {/* Sleek Elegant Offline/Error Fallback Screen */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Connection Interrupted</Text>
            <Text style={styles.errorSubtitle}>
              Ensure you have active internet or that the LifePilot server is online.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleReload}>
              <Text style={styles.buttonText}>Retry Synchronize</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060A',
  },
  content: {
    flex: 1,
    position: 'relative',
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
    zIndex: 10,
  },
  loaderText: {
    color: '#71717A',
    fontFamily: 'System',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#06060A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 20,
  },
  errorTitle: {
    color: '#F0F0F5',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#71717A',
    fontFamily: 'System',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#06060A',
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
