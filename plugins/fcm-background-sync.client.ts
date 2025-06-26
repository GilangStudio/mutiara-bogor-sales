// plugins/fcm-background-sync.client.ts
export default defineNuxtPlugin(() => {
    if (process.client) {
        const notificationStore = useNotificationStore()
        const authStore = useAuthStore()

        // Setup periodic FCM token refresh
        const setupTokenRefresh = () => {
            // Refresh FCM token setiap 6 jam
            const refreshInterval = 6 * 60 * 60 * 1000 // 6 jam

            setInterval(async () => {
                if (authStore.isAuthenticated && notificationStore.isAllowed) {
                    console.log('Periodic FCM token refresh started')
                    await notificationStore.handleTokenRefresh()
                }
            }, refreshInterval)
        }

        // Setup service worker message listener
        const setupServiceWorkerListener = () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('Received message from service worker:', event.data)

                    if (event.data?.type === 'NAVIGATE_TO') {
                        // Handle navigation dari service worker
                        const router = useRouter()
                        router.push(event.data.url)
                    }
                })
            }
        }

        // Setup visibility change listener untuk sync FCM saat app kembali focus
        const setupVisibilityListener = () => {
            document.addEventListener('visibilitychange', async () => {
                if (!document.hidden && authStore.isAuthenticated) {
                    // App kembali visible, check dan sync FCM token jika perlu
                    const firebaseService = useFirebaseService()

                    if (firebaseService.isAvailable.value && notificationStore.isAllowed) {
                        // Cek apakah FCM token masih valid
                        const storedToken = firebaseService.getStoredToken()

                        if (!storedToken) {
                            console.log('No FCM token found, regenerating...')
                            await firebaseService.setupFCM()
                        }
                    }
                }
            })
        }

        // Setup network change listener untuk re-sync FCM saat online
        const setupNetworkListener = () => {
            window.addEventListener('online', async () => {
                if (authStore.isAuthenticated && notificationStore.isAllowed) {
                    console.log('Back online, syncing FCM token...')
                    await authStore.updateFCMToken()
                }
            })
        }

        // Initialize semua listeners
        onMounted(() => {
            setupTokenRefresh()
            setupServiceWorkerListener()
            setupVisibilityListener()
            setupNetworkListener()
        })

        // Cleanup on unmount
        onUnmounted(() => {
            // Clear intervals dan listeners jika perlu
            window.removeEventListener('online', () => { })
            document.removeEventListener('visibilitychange', () => { })
        })

        return {
            provide: {
                fcmBackgroundSync: {
                    setupTokenRefresh,
                    setupServiceWorkerListener,
                    setupVisibilityListener,
                    setupNetworkListener
                }
            }
        }
    }
})