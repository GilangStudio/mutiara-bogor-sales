// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config
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
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'CRM Sales';
  const notificationOptions = {
    body: payload.notification?.body || 'Anda memiliki notifikasi baru',
    icon: payload.notification?.icon || '/pwa-192x192.png',
    badge: '/pwa-64x64.png',
    tag: payload.data?.tag || 'fcm-notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: {
      ...payload.data,
      click_action: payload.data?.click_action || '/',
      timestamp: Date.now()
    },
    actions: []
  };

  // Add actions based on notification type
  if (payload.data?.type === 'new_lead') {
    notificationOptions.actions = [
      { action: 'view', title: 'Lihat Lead' },
      { action: 'dismiss', title: 'Tutup' }
    ];
  } else if (payload.data?.type === 'status_change') {
    notificationOptions.actions = [
      { action: 'view', title: 'Lihat Detail' },
      { action: 'dismiss', title: 'OK' }
    ];
  } else if (payload.data?.type === 'follow_up') {
    notificationOptions.actions = [
      { action: 'call', title: 'Telepon' },
      { action: 'message', title: 'Pesan' },
      { action: 'later', title: 'Nanti' }
    ];
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  // Handle different actions
  if (action === 'dismiss' || action === 'later') {
    return; // Just close the notification
  }

  // Determine URL to open
  let urlToOpen = '/';

  if (data.click_action) {
    urlToOpen = data.click_action;
  } else if (data.type === 'new_lead' && data.lead_id) {
    urlToOpen = `/leads/${data.lead_id}`;
  } else if (data.type === 'status_change' && data.lead_id) {
    urlToOpen = `/leads/${data.lead_id}`;
  } else if (data.type === 'recontact' && data.lead_id) {
    // if (action === 'call') {
    //   // Handle call action
    //   urlToOpen = `/leads/${data.lead_id}?action=call`;
    // } else if (action === 'message') {
    //   // Handle message action
    //   urlToOpen = `/leads/${data.lead_id}?action=message`;
    // } else {
    //   urlToOpen = `/leads/${data.lead_id}`;
    // }
    urlToOpen = `/leads/${data.lead_id}`;
  }

  // Open or focus app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              if (client.navigate) {
                return client.navigate(urlToOpen);
              }
              return client.postMessage({
                type: 'NAVIGATE_TO',
                url: urlToOpen,
                notificationData: data
              });
            });
          }
        }
        
        // Open new window if app is not open
        return clients.openWindow(urlToOpen);
      })
  );
});

// Handle push event (untuk compatibility)
self.addEventListener('push', (event) => {
  if (event.data) {
    const payload = event.data.json();
    console.log('Push event received:', payload);
    
    // Handle jika messaging.onBackgroundMessage tidak bekerja
    if (payload.notification) {
      const notificationTitle = payload.notification.title || 'CRM Sales';
      const notificationOptions = {
        body: payload.notification.body || 'Anda memiliki notifikasi baru',
        icon: payload.notification.icon || '/pwa-192x192.png',
        badge: '/pwa-64x64.png',
        data: payload.data || {}
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    }
  }
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event);
  
  if (event.data?.type === 'NAVIGATE_TO') {
    // Handle navigation requests from main thread
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({
            type: 'NAVIGATE_TO',
            url: event.data.url
          });
          break;
        }
      }
    });
  }
});