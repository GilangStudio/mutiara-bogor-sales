<template>
    <!-- Notification Permission Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-card border border-border rounded-lg w-full max-w-sm shadow-xl">
            <!-- Header -->
            <div class="p-6 border-b border-border">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Bell class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-foreground">Aktifkan Notifikasi</h3>
                        <p class="text-sm text-muted-foreground">Diperlukan untuk menggunakan aplikasi</p>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-6">
                <!-- Permission Denied Warning -->
                <div v-if="notificationStore.isDenied" class="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div class="flex items-start gap-3">
                        <AlertTriangle class="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 class="font-medium text-red-800 dark:text-red-200 mb-1">Notifikasi Diblokir</h4>
                            <p class="text-sm text-red-700 dark:text-red-300 mb-3">
                                Notifikasi telah diblokir di browser. Untuk menggunakan aplikasi, silakan:
                            </p>
                            <ol class="text-sm text-red-700 dark:text-red-300 list-decimal list-inside space-y-1">
                                <li>Klik ikon kunci/info di address bar</li>
                                <li>Ubah setting "Notifications" ke "Allow"</li>
                                <li>Refresh halaman ini</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <!-- Permission Request Content -->
                <div v-else>
                    <div class="mb-6">
                        <h4 class="font-medium text-foreground mb-3">Mengapa notifikasi diperlukan?</h4>
                        <ul class="space-y-2 text-sm text-muted-foreground">
                            <li class="flex items-start gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Mendapat info leads baru secara real-time</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Notifikasi perubahan status leads penting</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Reminder follow-up dengan customer</span>
                            </li>
                            <li class="flex items-start gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Update sistem dan fitur terbaru</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Test Notification Success -->
                    <div v-if="testSent" class="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span class="text-sm text-green-700 dark:text-green-300">
                                Notifikasi test berhasil dikirim! 🎉
                            </span>
                        </div>
                    </div>

                    <!-- Privacy Notice -->
                    <div class="mb-6 p-3 bg-muted/30 rounded-lg">
                        <div class="flex items-start gap-2">
                            <Shield class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p class="text-xs text-muted-foreground">
                                <strong>Privasi Terjamin:</strong> Notifikasi hanya untuk fitur aplikasi. 
                                Kami tidak akan mengirim spam atau iklan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="p-6 border-t border-border">
                <div v-if="notificationStore.isDenied" class="space-y-3">
                    <button 
                        @click="refreshPage"
                        class="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Refresh Halaman
                    </button>
                    <button 
                        @click="openBrowserSettings"
                        class="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Buka Pengaturan Browser
                    </button>
                </div>
                
                <div v-else class="flex gap-3">
                    <button 
                        @click="handleAllow"
                        :disabled="isLoading"
                        class="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                        <Bell v-else class="h-4 w-4" />
                        {{ isLoading ? 'Memproses...' : 'Izinkan Notifikasi' }}
                    </button>
                    
                    <!-- Hide exit button - force user to enable notifications -->
                    <!-- <button 
                        @click="handleExit"
                        class="px-4 py-3 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                    >
                        Keluar
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    Bell, CheckCircle, AlertTriangle, Shield, Loader2, 
    ExternalLink, RefreshCw 
} from 'lucide-vue-next'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()

const isLoading = ref(false)
const testSent = ref(false)

// Show modal ketika notifikasi diperlukan tapi belum diizinkan
const showModal = computed(() => {
    return notificationStore.hasChecked && 
           notificationStore.needsPermission &&
           notificationStore.isSupported
})

// Handle allow notification
const handleAllow = async () => {
    isLoading.value = true
    
    try {
        const granted = await notificationStore.requestPermission()
        
        if (granted) {
            // Kirim test notification
            const testSuccess = await notificationStore.sendTestNotification()
            if (testSuccess) {
                testSent.value = true
            }
            
            toast.success('Notifikasi berhasil diaktifkan!', 'Berhasil')
            
            // Auto close modal after success
            setTimeout(() => {
                testSent.value = false
            }, 3000)
        } else {
            // Jika ditolak, tampilkan pesan
            if (notificationStore.isDenied) {
                toast.error('Notifikasi diblokir. Silakan aktifkan dari pengaturan browser.', 'Akses Ditolak')
            } else {
                toast.warning('Notifikasi diperlukan untuk menggunakan aplikasi', 'Akses Diperlukan')
            }
        }
    } catch (error) {
        console.error('Error enabling notifications:', error)
        toast.error('Gagal mengaktifkan notifikasi', 'Error')
    } finally {
        isLoading.value = false
    }
}

// Handle exit - logout user
const handleExit = async () => {
    toast.info('Notifikasi diperlukan untuk menggunakan aplikasi', 'Akses Diperlukan')
    await authStore.logout()
}

// Refresh page
const refreshPage = () => {
    if (process.client) {
        window.location.reload()
    }
}

// Open browser settings (limited browser support)
const openBrowserSettings = () => {
    toast.info('Silakan buka pengaturan browser secara manual', 'Info')
}

// Initialize notification store
onMounted(() => {
    notificationStore.initialize()
})
</script>