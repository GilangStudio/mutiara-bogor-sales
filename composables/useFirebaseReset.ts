// composables/useFirebaseReset.ts
export const useFirebaseReset = () => {
    const clearAllFirebaseData = () => {
        if (process.client) {
            console.log('🔄 Clearing all Firebase data...')

            // Clear FCM related localStorage
            localStorage.removeItem('fcm_token')
            localStorage.removeItem('fcm_token_generated_at')
            localStorage.removeItem('fcm_initialized')
            localStorage.removeItem('fcm_setup_at')
            localStorage.removeItem('notification_permission')
            localStorage.removeItem('notification_requested_at')

            // Clear service worker cache
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(registrations => {
                    console.log('🗑️ Unregistering service workers...')
                    registrations.forEach(registration => {
                        registration.unregister()
                    })
                })
            }

            // Clear all notifications
            if ('Notification' in window) {
                // Note: Tidak bisa clear existing notifications secara programatis
                console.log('📱 Current notification permission:', Notification.permission)
            }

            console.log('✅ Firebase data cleared. Please refresh the page.')
        }
    }

    const checkFirebaseHealth = async () => {
        console.log('🔍 === Firebase Health Check ===')

        const firebaseService = useFirebaseService()
        const notificationStore = useNotificationStore()

        // Check browser support
        console.log('Browser Support:')
        console.log('- Notification API:', 'Notification' in window)
        console.log('- Service Worker:', 'serviceWorker' in navigator)
        console.log('- Push API:', 'PushManager' in window)

        // Check permissions
        console.log('\nPermissions:')
        console.log('- Notification Permission:', Notification.permission)

        // Check Firebase service status
        console.log('\nFirebase Service:')
        console.log('- Initialized:', firebaseService.isInitialized.value)
        console.log('- Available:', firebaseService.isAvailable.value)
        console.log('- Has Token:', !!firebaseService.fcmToken.value)
        console.log('- Error:', firebaseService.error.value)

        // Check stored data
        console.log('\nStored Data:')
        console.log('- FCM Token:', localStorage.getItem('fcm_token')?.substring(0, 20) + '...')
        console.log('- Token Generated At:', localStorage.getItem('fcm_token_generated_at'))
        console.log('- FCM Initialized:', localStorage.getItem('fcm_initialized'))

        // Check service worker
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()
            console.log('\nService Workers:')
            console.log('- Registrations Count:', registrations.length)
            registrations.forEach((reg, index) => {
                console.log(`- SW ${index + 1}:`, reg.scope)
                console.log(`  - Active:`, !!reg.active)
                console.log(`  - Installing:`, !!reg.installing)
                console.log(`  - Waiting:`, !!reg.waiting)
            })
        }

        console.log('=========================')
    }

    const forceResetAndSetup = async () => {
        console.log('🔄 Force reset and setup Firebase...')

        try {
            // 1. Clear all data
            clearAllFirebaseData()

            // 2. Wait a bit
            await new Promise(resolve => setTimeout(resolve, 1000))

            // 3. Reset stores
            const notificationStore = useNotificationStore()
            notificationStore.resetPermission()

            // 4. Re-initialize
            await notificationStore.initialize()

            // 5. Request permission again
            if (notificationStore.canRequest) {
                const granted = await notificationStore.requestPermission()
                console.log('Permission granted:', granted)

                if (granted) {
                    // 6. Setup FCM
                    const setupSuccess = await notificationStore.setupFCM()
                    console.log('FCM Setup success:', setupSuccess)

                    if (setupSuccess) {
                        console.log('✅ Firebase reset and setup completed!')
                        return true
                    }
                }
            }

            console.log('❌ Firebase setup failed')
            return false

        } catch (error) {
            console.error('Error during reset and setup:', error)
            return false
        }
    }

    return {
        clearAllFirebaseData,
        checkFirebaseHealth,
        forceResetAndSetup
    }
}