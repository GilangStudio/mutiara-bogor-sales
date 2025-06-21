import { useToastStore } from "~/stores/toast"

// composables/useToast.ts
export const useToast = () => {
    const toastStore = useToastStore()

    return {
        // Basic toast methods
        success: (message: string, title?: string, options?: any) =>
            toastStore.success(message, title, options),

        error: (message: string, title?: string, options?: any) =>
            toastStore.error(message, title, options),

        warning: (message: string, title?: string, options?: any) =>
            toastStore.warning(message, title, options),

        info: (message: string, title?: string, options?: any) =>
            toastStore.info(message, title, options),

        // Specialized toast methods for common use cases
        loginSuccess: (userName?: string) => {
            const name = userName ? ` ${userName}` : ''
            toastStore.success(`Selamat datang${name}!`, 'Login Berhasil')
        },

        loginError: (message?: string) => {
            toastStore.error(
                message || 'Periksa kembali nomor hp dan password Anda',
                'Login Gagal'
            )
        },

        logoutSuccess: () => {
            toastStore.info('Anda berhasil keluar dari aplikasi', 'Logout Berhasil')
        },

        saveSuccess: (itemName?: string) => {
            const item = itemName ? ` ${itemName}` : ''
            toastStore.success(`Data${item} berhasil disimpan`, 'Berhasil Disimpan')
        },

        saveError: (itemName?: string) => {
            const item = itemName ? ` ${itemName}` : ''
            toastStore.error(`Gagal menyimpan data${item}`, 'Gagal Menyimpan')
        },

        deleteSuccess: (itemName?: string) => {
            const item = itemName ? ` ${itemName}` : ''
            toastStore.success(`Data${item} berhasil dihapus`, 'Berhasil Dihapus')
        },

        deleteError: (itemName?: string) => {
            const item = itemName ? ` ${itemName}` : ''
            toastStore.error(`Gagal menghapus data${item}`, 'Gagal Menghapus')
        },

        networkError: () => {
            toastStore.error(
                'Periksa koneksi internet Anda dan coba lagi',
                'Tidak Ada Koneksi',
                { persistent: true }
            )
        },

        comingSoon: (feature?: string) => {
            const featureName = feature ? ` ${feature}` : ''
            toastStore.info(`Fitur${featureName} akan segera tersedia`, 'Coming Soon')
        },

        // Action-specific toasts
        leadCreated: () => {
            toastStore.success('Lead baru berhasil ditambahkan', 'Lead Ditambahkan')
        },

        leadUpdated: () => {
            toastStore.success('Informasi lead berhasil diperbarui', 'Lead Diperbarui')
        },

        leadDeleted: () => {
            toastStore.warning('Lead telah dihapus dari sistem', 'Lead Dihapus')
        },

        profileUpdated: () => {
            toastStore.success('Profil Anda berhasil diperbarui', 'Profil Diperbarui')
        },

        passwordChanged: () => {
            toastStore.success('Password berhasil diubah', 'Password Diperbarui')
        },

        // Utility methods
        clearAll: () => toastStore.clearAllToasts(),

        remove: (id: string) => toastStore.removeToast(id)
    }
}