<!-- pages/debug-firebase.vue -->
<template>
    <div class="min-h-screen p-4">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Firebase Debug Console</h1>
        
        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button 
            @click="checkHealth"
            class="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔍 Health Check
          </button>
          <button 
            @click="forceReset"
            class="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 Force Reset
          </button>
          <button 
            @click="generateNewToken"
            class="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔑 Generate Token
          </button>
          <button 
            @click="testNotification"
            class="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🔔 Test Notification
          </button>
        </div>
  
        <!-- Firebase Config Display -->
        <div class="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 class="font-semibold mb-3">Current Firebase Config</h3>
          <pre class="text-xs bg-muted p-3 rounded overflow-x-auto">{{ firebaseConfig }}</pre>
        </div>
  
        <!-- Status Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Browser Support -->
          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Browser Support</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Notification API:</span>
                <span :class="browserSupport.notification ? 'text-green-600' : 'text-red-600'">
                  {{ browserSupport.notification ? '✅' : '❌' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Service Worker:</span>
                <span :class="browserSupport.serviceWorker ? 'text-green-600' : 'text-red-600'">
                  {{ browserSupport.serviceWorker ? '✅' : '❌' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Push API:</span>
                <span :class="browserSupport.pushApi ? 'text-green-600' : 'text-red-600'">
                  {{ browserSupport.pushApi ? '✅' : '❌' }}
                </span>
              </div>
            </div>
          </div>
  
          <!-- Permissions -->
          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Permissions</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Notification:</span>
                <span :class="getPermissionColor(notificationPermission)">
                  {{ notificationPermission }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Can Request:</span>
                <span :class="notificationStore.canRequest ? 'text-green-600' : 'text-red-600'">
                  {{ notificationStore.canRequest ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>
  
          <!-- Firebase Status -->
          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Firebase Status</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Initialized:</span>
                <span :class="firebaseService.isInitialized.value ? 'text-green-600' : 'text-red-600'">
                  {{ firebaseService.isInitialized.value ? '✅' : '❌' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Available:</span>
                <span :class="firebaseService.isAvailable.value ? 'text-green-600' : 'text-red-600'">
                  {{ firebaseService.isAvailable.value ? '✅' : '❌' }}
                </span>
              </div>
              <div class="flex justify-between">
                <span>Has Token:</span>
                <span :class="!!firebaseService.fcmToken.value ? 'text-green-600' : 'text-red-600'">
                  {{ !!firebaseService.fcmToken.value ? '✅' : '❌' }}
                </span>
              </div>
            </div>
          </div>
  
          <!-- Service Workers -->
          <div class="bg-card border border-border rounded-lg p-4">
            <h3 class="font-semibold mb-3">Service Workers</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>Count:</span>
                <span>{{ serviceWorkers.length }}</span>
              </div>
              <div v-for="(sw, index) in serviceWorkers" :key="index" class="text-xs">
                <div class="font-medium">SW {{ index + 1 }}:</div>
                <div class="ml-2 text-muted-foreground">{{ sw.scope }}</div>
                <div class="ml-2">
                  Active: <span :class="sw.active ? 'text-green-600' : 'text-red-600'">{{ sw.active ? 'Yes' : 'No' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- FCM Token Display -->
        <div v-if="firebaseService.fcmToken.value" class="bg-card border border-border rounded-lg p-4 mb-6">
          <h3 class="font-semibold mb-3">FCM Token</h3>
          <div class="bg-muted p-3 rounded text-xs break-all">
            {{ firebaseService.fcmToken.value }}
          </div>
          <div class="mt-2 text-xs text-muted-foreground">
            Generated: {{ tokenGeneratedAt }}
          </div>
        </div>
  
        <!-- Error Display -->
        <div v-if="firebaseService.error.value" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-red-800 mb-2">Error</h3>
          <div class="text-red-700 text-sm">{{ firebaseService.error.value }}</div>
        </div>
  
        <!-- Console Log -->
        <div class="bg-card border border-border rounded-lg p-4">
          <h3 class="font-semibold mb-3">Console Log</h3>
          <div class="bg-black text-green-400 p-3 rounded text-xs max-h-64 overflow-y-auto font-mono">
            <div v-for="(log, index) in consoleLogs" :key="index" class="mb-1">
              <span class="text-gray-500">[{{ log.timestamp }}]</span> {{ log.message }}
            </div>
          </div>
          <button 
            @click="consoleLogs = []"
            class="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  const firebaseService = useFirebaseService()
  const notificationStore = useNotificationStore()
  const firebaseReset = useFirebaseReset()
  const toast = useToast()
  
  // Reactive data
  const consoleLogs = ref<Array<{timestamp: string, message: string}>>([])
  const serviceWorkers = ref<Array<{scope: string, active: boolean}>>([])
  const notificationPermission = ref<NotificationPermission>('default')
  
  // Firebase config untuk display
  const firebaseConfig = {
    apiKey: "AIzaSyCy9fh2KbL9cnvJwa-yeSitgBk7p-6_NQM",
    authDomain: "mutiara-bogor-2f50b.firebaseapp.com",
    projectId: "mutiara-bogor-2f50b",
    storageBucket: "mutiara-bogor-2f50b.firebasestorage.app",
    messagingSenderId: "100226485232",
    appId: "1:100226485232:web:a98a60d3b881c384746b35",
    measurementId: "G-XVGME904YZ"
  }
  
  // Browser support check
  const browserSupport = computed(() => ({
    notification: process.client && 'Notification' in window,
    serviceWorker: process.client && 'serviceWorker' in navigator,
    pushApi: process.client && 'PushManager' in window
  }))
  
  // Token generated time
  const tokenGeneratedAt = computed(() => {
    if (process.client) {
      const timestamp = localStorage.getItem('fcm_token_generated_at')
      if (timestamp) {
        return new Date(parseInt(timestamp)).toLocaleString()
      }
    }
    return 'Unknown'
  })
  
  // Methods
  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    consoleLogs.value.push({ timestamp, message })
    console.log(message)
  }
  
  const checkHealth = async () => {
    log('🔍 Starting health check...')
    await firebaseReset.checkFirebaseHealth()
    await updateStatus()
    log('✅ Health check completed')
  }
  
  const forceReset = async () => {
    log('🔄 Starting force reset...')
    const success = await firebaseReset.forceResetAndSetup()
    await updateStatus()
    
    if (success) {
      log('✅ Force reset completed successfully')
      toast.success('Firebase berhasil di-reset dan di-setup ulang')
    } else {
      log('❌ Force reset failed')
      toast.error('Gagal melakukan reset Firebase')
    }
  }
  
  const generateNewToken = async () => {
    log('🔑 Generating new FCM token...')
    
    try {
      const token = await firebaseService.refreshToken()
      
      if (token) {
        log(`✅ New token generated: ${token.substring(0, 20)}...`)
        toast.success('FCM token baru berhasil di-generate')
      } else {
        log('❌ Failed to generate new token')
        toast.error('Gagal generate FCM token baru')
      }
    } catch (error: any) {
      log(`❌ Error generating token: ${error.message}`)
      toast.error('Error saat generate token')
    }
    
    await updateStatus()
  }
  
  const testNotification = async () => {
    log('🔔 Testing notification...')
    
    try {
      const success = await notificationStore.sendTestNotification()
      
      if (success) {
        log('✅ Test notification sent successfully')
        toast.success('Test notification berhasil dikirim')
      } else {
        log('❌ Failed to send test notification')
        toast.error('Gagal mengirim test notification')
      }
    } catch (error: any) {
      log(`❌ Error sending test notification: ${error.message}`)
      toast.error('Error saat mengirim test notification')
    }
  }
  
  const updateStatus = async () => {
    // Update notification permission
    if (process.client) {
      notificationPermission.value = Notification.permission
      
      // Update service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        serviceWorkers.value = registrations.map(reg => ({
          scope: reg.scope,
          active: !!reg.active
        }))
      }
    }
  }
  
  const getPermissionColor = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return 'text-green-600'
      case 'denied': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }
  
  // Initialize
  onMounted(async () => {
    log('🚀 Debug page loaded')
    await updateStatus()
  })
  
  // Page meta
  definePageMeta({
    middleware: 'auth'
  })
  
  useHead({
    title: 'Firebase Debug - CRM Sales'
  })
  </script>