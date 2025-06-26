// composables/useNotification.ts
export const useNotification = () => {
    const notificationStore = useNotificationStore()
    
    // Send notification helper
    const sendNotification = async (
        title: string, 
        options: {
            body?: string
            icon?: string
            badge?: string
            tag?: string
            requireInteraction?: boolean
            actions?: { action: string; title: string }[]
            data?: any
        } = {}
    ) => {
        if (!notificationStore.isAllowed) {
            console.warn('Notification permission not granted')
            return false
        }

        try {
            // Default options
            const defaultOptions = {
                icon: '/pwa-192x192.png',
                badge: '/pwa-64x64.png',
                requireInteraction: false,
                ...options
            }

            // Kirim via service worker jika tersedia
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready
                await registration.showNotification(title, defaultOptions)
                return true
            }
            
            // Fallback ke Notification API biasa
            new Notification(title, defaultOptions)
            return true
        } catch (error) {
            console.error('Error sending notification:', error)
            return false
        }
    }

    // Preset notifications untuk aplikasi CRM
    const notifications = {
        // Lead baru
        newLead: (leadName: string, platform?: string) => {
            return sendNotification('Lead Baru! 🎯', {
                body: `${leadName}${platform ? ` dari ${platform}` : ''} telah masuk`,
                tag: 'new-lead',
                requireInteraction: true,
                actions: [
                    { action: 'view', title: 'Lihat Lead' },
                    { action: 'dismiss', title: 'Tutup' }
                ],
                data: { type: 'new_lead', leadName, platform }
            })
        },

        // Status lead berubah
        leadStatusChanged: (leadName: string, newStatus: string) => {
            const statusText = {
                'new': 'Baru',
                'process': 'Proses',
                'closing': 'Closing'
            }
            
            return sendNotification('Status Lead Diperbarui', {
                body: `${leadName} -> ${statusText[newStatus] || newStatus}`,
                tag: 'status-update',
                actions: [
                    { action: 'view', title: 'Lihat Detail' },
                    { action: 'dismiss', title: 'OK' }
                ],
                data: { type: 'status_change', leadName, newStatus }
            })
        },

        // Reminder follow up
        followUpReminder: (leadName: string) => {
            return sendNotification('Reminder Follow Up ⏰', {
                body: `Saatnya follow up dengan ${leadName}`,
                tag: 'follow-up',
                requireInteraction: true,
                actions: [
                    { action: 'call', title: 'Telepon' },
                    { action: 'message', title: 'Pesan' },
                    { action: 'later', title: 'Nanti' }
                ],
                data: { type: 'follow_up', leadName }
            })
        },

        // Target tercapai
        targetAchieved: (percentage: number) => {
            return sendNotification('Target Tercapai! 🎉', {
                body: `Selamat! Anda telah mencapai ${percentage}% dari target leads`,
                tag: 'target-achieved',
                requireInteraction: true,
                data: { type: 'target_achieved', percentage }
            })
        },

        // Update aplikasi
        appUpdate: () => {
            return sendNotification('Update Tersedia', {
                body: 'Versi terbaru aplikasi CRM Sales sudah tersedia',
                tag: 'app-update',
                actions: [
                    { action: 'update', title: 'Update' },
                    { action: 'later', title: 'Nanti' }
                ],
                data: { type: 'app_update' }
            })
        }
    }

    return {
        // Store state
        isAllowed: computed(() => notificationStore.isAllowed),
        isDenied: computed(() => notificationStore.isDenied),
        isSupported: computed(() => notificationStore.isSupported),
        canUseApp: computed(() => notificationStore.canUseApp),
        needsPermission: computed(() => notificationStore.needsPermission),
        
        // Actions
        requestPermission: notificationStore.requestPermission,
        sendNotification,
        sendTestNotification: notificationStore.sendTestNotification,
        
        // Preset notifications
        notifications,
        
        // Utilities
        initialize: notificationStore.initialize,
        resetPermission: notificationStore.resetPermission
    }
}