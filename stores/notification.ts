// stores/notification.ts (Updated dengan FCM integration)
export interface NotificationState {
    permission: NotificationPermission | null
    isSupported: boolean
    isRequired: boolean
    hasChecked: boolean
    fcmInitialized: boolean
}

export const useNotificationStore = defineStore('notification', {
    state: (): NotificationState => ({
        permission: null,
        isSupported: false,
        isRequired: true, // Notifikasi wajib untuk menggunakan aplikasi
        hasChecked: false,
        fcmInitialized: false
    }),

    getters: {
        // Notifikasi sudah diizinkan
        isAllowed: (state) => state.permission === 'granted',
        
        // Notifikasi ditolak
        isDenied: (state) => state.permission === 'denied',
        
        // Belum ada permission (default state)
        isDefault: (state) => state.permission === 'default',
        
        // Bisa request permission (belum ditolak)
        canRequest: (state) => state.permission !== 'denied' && state.isSupported,
        
        // Aplikasi bisa digunakan (notifikasi diizinkan atau tidak wajib)
        canUseApp: (state) => !state.isRequired || state.permission === 'granted',
        
        // Perlu permission untuk menggunakan aplikasi
        needsPermission: (state) => state.isRequired && state.permission !== 'granted'
    },

    actions: {
        // Cek dukungan notifikasi browser
        checkSupport() {
            if (process.client) {
                this.isSupported = 'Notification' in window && 'serviceWorker' in navigator
                if (this.isSupported) {
                    this.permission = Notification.permission
                }
                this.hasChecked = true
            }
        },

        // Request permission notifikasi dengan FCM
        async requestPermission(): Promise<boolean> {
            if (!this.isSupported) {
                console.warn('Notifikasi tidak didukung di browser ini')
                return false
            }

            try {
                // Request notification permission
                const permission = await Notification.requestPermission()
                this.permission = permission
                
                // Simpan status ke localStorage
                if (process.client) {
                    localStorage.setItem('notification_permission', permission)
                    localStorage.setItem('notification_requested_at', Date.now().toString())
                }

                // Setup FCM jika permission granted
                if (permission === 'granted') {
                    await this.setupFCM()
                }

                return permission === 'granted'
            } catch (error) {
                console.error('Error requesting notification permission:', error)
                return false
            }
        },

        // Setup FCM setelah permission granted
        async setupFCM(): Promise<boolean> {
            if (!this.isAllowed) {
                console.warn('Notification permission not granted, cannot setup FCM')
                return false
            }

            try {
                const firebaseService = useFirebaseService()
                
                if (!firebaseService.isAvailable.value) {
                    console.warn('Firebase service not available')
                    return false
                }

                const success = await firebaseService.setupFCM()
                this.fcmInitialized = success
                
                if (success) {
                    console.log('FCM setup completed successfully')
                    
                    // Save FCM status
                    if (process.client) {
                        localStorage.setItem('fcm_initialized', 'true')
                        localStorage.setItem('fcm_setup_at', Date.now().toString())
                    }
                } else {
                    console.error('FCM setup failed')
                }
                
                return success
            } catch (error: any) {
                console.error('Error setting up FCM:', error)
                this.fcmInitialized = false
                return false
            }
        },

        async sendTestNotification() {
            if (!this.isAllowed) {
                console.warn('Permission notifikasi belum diberikan')
                return false
            }

            try {
                const firebaseService = useFirebaseService()
                
                // Coba kirim via FCM dulu
                if (firebaseService.isAvailable.value && this.fcmInitialized) {
                    // Note: Test notification biasanya dikirim dari backend
                    // Di sini kita hanya bisa kirim local notification
                    console.log('FCM is ready, test notification should be sent from backend')
                }

                // Kirim local notification sebagai test
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready
                    
                    await registration.showNotification('CRM Sales', {
                        body: 'Notifikasi berhasil diaktifkan! 🎉',
                        icon: '/pwa-192x192.png',
                        badge: '/pwa-64x64.png',
                        tag: 'test-notification',
                        requireInteraction: false,
                        data: {
                            type: 'test',
                            timestamp: Date.now()
                        },
                        actions: [
                            {
                                action: 'ok',
                                title: 'OK'
                            }
                        ]
                    })
                    
                    return true
                }
                
                // Fallback ke Notification API biasa
                new Notification('CRM Sales', {
                    body: 'Notifikasi berhasil diaktifkan! 🎉',
                    icon: '/pwa-192x192.png'
                })
                
                return true
            } catch (error) {
                console.error('Error sending test notification:', error)
                return false
            }
        },

        // Reset permission dan FCM (untuk testing)
        resetPermission() {
            if (process.client) {
                localStorage.removeItem('notification_permission')
                localStorage.removeItem('notification_requested_at')
                localStorage.removeItem('fcm_initialized')
                localStorage.removeItem('fcm_setup_at')
                this.permission = 'default'
                this.fcmInitialized = false
            }
        },

        // Load saved permission dari localStorage
        loadSavedPermission() {
            if (process.client) {
                const savedPermission = localStorage.getItem('notification_permission')
                if (savedPermission) {
                    this.permission = savedPermission as NotificationPermission
                }
                
                const fcmInitialized = localStorage.getItem('fcm_initialized')
                if (fcmInitialized === 'true') {
                    this.fcmInitialized = true
                }
            }
        },

        // Set apakah notifikasi wajib atau tidak
        setRequired(required: boolean) {
            this.isRequired = required
            
            if (process.client) {
                localStorage.setItem('notification_required', required.toString())
            }
        },

        // Load setting required dari localStorage
        loadRequiredSetting() {
            if (process.client) {
                const required = localStorage.getItem('notification_required')
                if (required !== null) {
                    this.isRequired = required === 'true'
                }
            }
        },

        // Refresh FCM token berkala
        async refreshFCMToken() {
            if (!this.isAllowed || !this.fcmInitialized) {
                return false
            }

            try {
                const firebaseService = useFirebaseService()
                
                if (firebaseService.isAvailable.value) {
                    const newToken = await firebaseService.refreshToken()
                    
                    if (newToken) {
                        console.log('FCM token refreshed successfully')
                        return true
                    }
                }
                
                return false
            } catch (error) {
                console.error('Error refreshing FCM token:', error)
                return false
            }
        },

        // Initialize notification system dengan FCM
        async initialize() {
            this.checkSupport()
            this.loadSavedPermission()
            this.loadRequiredSetting()
            
            // Update permission jika sudah granted di browser
            if (this.isSupported && Notification.permission === 'granted') {
                this.permission = 'granted'
                
                // Setup FCM jika belum diinisialisasi
                if (!this.fcmInitialized) {
                    await this.setupFCM()
                }
            }
        },

        // Handle FCM token refresh berkala (dipanggil dari background)
        async handleTokenRefresh() {
            if (!this.isAllowed || !this.fcmInitialized) {
                return
            }

            // Cek apakah perlu refresh token (setiap 7 hari)
            const lastSetup = localStorage.getItem('fcm_setup_at')
            if (lastSetup) {
                const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
                if (parseInt(lastSetup) < sevenDaysAgo) {
                    console.log('FCM token needs refresh')
                    await this.refreshFCMToken()
                }
            }
        }
    }
})