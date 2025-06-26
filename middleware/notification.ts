// middleware/notification.ts
export default defineNuxtRouteMiddleware((to, from) => {
    // Skip di server side
    if (process.server) {
        return
    }

    const notificationStore = useNotificationStore()
    
    // Initialize notification store jika belum
    if (!notificationStore.hasChecked) {
        notificationStore.initialize()
    }

    // Cek apakah notifikasi diperlukan dan belum diizinkan
    if (notificationStore.needsPermission && notificationStore.isSupported) {
        // Izinkan akses ke halaman tapi NotificationGuard akan handle
        // Modal akan muncul dan memblokir interaksi sampai permission diberikan
        console.log('Notification permission required')
    }
    
    // Jika browser tidak support notifikasi, biarkan akses normal
    if (!notificationStore.isSupported) {
        console.warn('Browser tidak mendukung notifikasi, melanjutkan tanpa notifikasi')
    }
})