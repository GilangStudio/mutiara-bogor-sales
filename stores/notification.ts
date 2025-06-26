// stores/notification.ts
export interface NotificationState {
    permission: NotificationPermission | null
    isSupported: boolean
    isRequired: boolean
    hasChecked: boolean
}

export const useNotificationStore = defineStore('notification', {
    state: (): NotificationState => ({
        permission: null,
        isSupported: false,
        isRequired: true, // Notifikasi wajib untuk menggunakan aplikasi
        hasChecked: false
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

        // Request permission notifikasi
        async requestPermission(): Promise<boolean> {
            if (!this.isSupported) {
                console.warn('Notifikasi tidak didukung di browser ini')
                return false
            }

            try {
                // Request permission
                const permission = await Notification.requestPermission()
                this.permission = permission
                
                // Simpan status ke localStorage
                if (process.client) {
                    localStorage.setItem('notification_permission', permission)
                    localStorage.setItem('notification_requested_at', Date.now().toString())
                }

                return permission === 'granted'
            } catch (error) {
                console.error('Error requesting notification permission:', error)
                return false
            }
        },

        // Kirim test notification
        async sendTestNotification() {
            if (!this.isAllowed) {
                console.warn('Permission notifikasi belum diberikan')
                return false
            }

            try {
                // Daftar service worker dulu
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready
                    
                    // Kirim notification lewat service worker
                    await registration.showNotification('CRM Sales', {
                        body: 'Notifikasi berhasil diaktifkan! 🎉',
                        icon: '/pwa-192x192.png',
                        badge: '/pwa-64x64.png',
                        tag: 'test-notification',
                        requireInteraction: false,
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

        // Reset permission (untuk testing)
        resetPermission() {
            if (process.client) {
                localStorage.removeItem('notification_permission')
                localStorage.removeItem('notification_requested_at')
                this.permission = 'default'
            }
        },

        // Load saved permission dari localStorage
        loadSavedPermission() {
            if (process.client) {
                const savedPermission = localStorage.getItem('notification_permission')
                if (savedPermission) {
                    this.permission = savedPermission as NotificationPermission
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

        // Initialize notification system
        async initialize() {
            this.checkSupport()
            this.loadSavedPermission()
            this.loadRequiredSetting()
            
            // Update permission jika sudah granted di browser
            if (this.isSupported && Notification.permission === 'granted') {
                this.permission = 'granted'
            }
        }
    }
})