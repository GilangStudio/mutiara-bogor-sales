// composables/useFirebaseService.ts
import { getToken, deleteToken, type Messaging } from 'firebase/messaging';

export interface FirebaseServiceState {
  messaging: Messaging | null;
  fcmToken: string | null;
  isInitialized: boolean;
  error: string | null;
}

export const useFirebaseService = () => {
  const state = useState<FirebaseServiceState>('firebase-service', () => ({
    messaging: null,
    fcmToken: null,
    isInitialized: false,
    error: null
  }));

  // VAPID key untuk FCM (ganti dengan key Anda sendiri)
  const VAPID_KEY = 'BLZYHdw4v0QFiZvZcmTA9JnJ_ltyDyvRizsiSfiNsQjZvRJE9fPRS3SioAs47ytW8Poo0X7uTz--e42uObvIn5Y'; // Anda perlu generate VAPID key dari Firebase Console

  // Initialize Firebase Messaging
  const initialize = async (messaging: Messaging) => {
    try {
      state.value.messaging = messaging;
      
      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
      
      state.value.isInitialized = true;
      state.value.error = null;
      
      console.log('Firebase messaging initialized successfully');
    } catch (error: any) {
      console.error('Error initializing Firebase messaging:', error);
      state.value.error = error.message;
    }
  };

  // Generate FCM token
  const generateToken = async (): Promise<string | null> => {
    if (!state.value.messaging || !state.value.isInitialized) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Get FCM token
      const token = await getToken(state.value.messaging, {
        vapidKey: VAPID_KEY
      });

      if (token) {
        state.value.fcmToken = token;
        
        // Save token to localStorage
        localStorage.setItem('fcm_token', token);
        localStorage.setItem('fcm_token_generated_at', Date.now().toString());
        
        console.log('FCM token generated:', token);
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error: any) {
      console.error('Error generating FCM token:', error);
      state.value.error = error.message;
      return null;
    }
  };

  // Get stored token
  const getStoredToken = (): string | null => {
    if (process.client) {
      const token = localStorage.getItem('fcm_token');
      const generatedAt = localStorage.getItem('fcm_token_generated_at');
      
      // Check if token is not too old (refresh every 7 days)
      if (token && generatedAt) {
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (parseInt(generatedAt) > sevenDaysAgo) {
          state.value.fcmToken = token;
          return token;
        }
      }
    }
    return null;
  };

  // Refresh token
  const refreshToken = async (): Promise<string | null> => {
    // Clear old token
    await clearToken();
    
    // Generate new token
    return await generateToken();
  };

  // Clear token
  const clearToken = async () => {
    if (state.value.messaging && state.value.fcmToken) {
      try {
        await deleteToken(state.value.messaging);
        console.log('FCM token deleted');
      } catch (error) {
        console.error('Error deleting FCM token:', error);
      }
    }

    state.value.fcmToken = null;
    
    if (process.client) {
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('fcm_token_generated_at');
    }
  };

  // Get or generate token
  const getOrGenerateToken = async (): Promise<string | null> => {
    // Try to get stored token first
    const storedToken = getStoredToken();
    if (storedToken) {
      return storedToken;
    }

    // Generate new token if no valid stored token
    return await generateToken();
  };

  // Send token to backend
  const sendTokenToBackend = async (token: string): Promise<boolean> => {
    try {
      const { $api }: any = useNuxtApp();
      
      const response = await $api('/fcm_token', {
        method: 'POST',
        body: {
          fcm_token: token,
          device_type: 'web',
          browser_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        }
      });

      if (response.status === 'success') {
        console.log('FCM token sent to backend successfully');
        return true;
      } else {
        console.error('Failed to send FCM token to backend:', response.message);
        return false;
      }
    } catch (error: any) {
      console.error('Error sending FCM token to backend:', error);
      return false;
    }
  };

  // Setup complete FCM flow
  const setupFCM = async (): Promise<boolean> => {
    try {
      if (!state.value.isInitialized) {
        console.warn('Firebase messaging not initialized');
        return false;
      }

      // Get or generate token
      const token = await getOrGenerateToken();
      
      if (!token) {
        console.warn('Could not get FCM token');
        return false;
      }

      // Send token to backend
      const success = await sendTokenToBackend(token);
      
      if (success) {
        console.log('FCM setup completed successfully');
        return true;
      } else {
        console.error('FCM setup failed - could not send token to backend');
        return false;
      }
    } catch (error: any) {
      console.error('Error setting up FCM:', error);
      state.value.error = error.message;
      return false;
    }
  };

  // Check if FCM is available
  const isAvailable = computed(() => {
    return !!(
      process.client &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      state.value.isInitialized
    );
  });

  return {
    // State
    fcmToken: computed(() => state.value.fcmToken),
    isInitialized: computed(() => state.value.isInitialized),
    error: computed(() => state.value.error),
    isAvailable,
    
    // Methods
    initialize,
    generateToken,
    getStoredToken,
    refreshToken,
    clearToken,
    getOrGenerateToken,
    sendTokenToBackend,
    setupFCM
  };
};