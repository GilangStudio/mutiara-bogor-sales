// plugins/firebase.client.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCy9fh2KbL9cnvJwa-yeSitgBk7p-6_NQM",
  authDomain: "mutiara-bogor-2f50b.firebaseapp.com",
  projectId: "mutiara-bogor-2f50b",
  storageBucket: "mutiara-bogor-2f50b.firebasestorage.app",
  messagingSenderId: "100226485232",
  appId: "1:100226485232:web:3ceba0f91bbe11a8746b35",
  measurementId: "G-F0MTNLG99B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default defineNuxtPlugin(async () => {
  if (process.client) {
    try {
      // Initialize messaging
      const messaging = getMessaging(app);
      
      // Create firebase service instance
      const firebaseService = useFirebaseService();
      await firebaseService.initialize(messaging);
      
      // Setup message listener untuk foreground messages
      onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        const toast = useToast();
        const notificationTitle = payload.notification?.title || 'Notifikasi Baru';
        const notificationBody = payload.notification?.body || '';
        
        // Tampilkan toast notification
        toast.info(notificationBody, notificationTitle, {
          duration: 8000,
          persistent: false
        });
        
        // Tampilkan browser notification jika permission tersedia
        if (Notification.permission === 'granted') {
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: payload.notification?.icon || '/pwa-192x192.png',
            tag: 'fcm-notification',
            requireInteraction: true
          });
        }
      });
      
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }
});