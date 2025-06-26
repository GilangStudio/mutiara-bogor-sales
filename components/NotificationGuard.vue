<template>
    <!-- Notification Permission Modal dengan FCM -->
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
                        <p class="text-sm text-muted-foreground">Diperlukan untuk fitur real-time</p>
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
                        <h4 class="font-medium text-foreground mb-3">Manfaat notifikasi untuk Anda:</h4>
                        <ul class="space-y-2 text-sm text-muted-foreground">
                            <li class="flex items-start gap-2">
                                <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span>Alert leads baru secara real-time</span>
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
                                <span>Update fitur dan sistem terbaru</span>
                            </li>
                        </ul>
                    </div>

                    <!-- FCM Setup Progress -->
                    <div v-if="isLoading" class="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div class="flex items-center gap-3">
                            <Loader2 class="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                            <div>
                                <div class="text-sm font-medium text-blue-800 dark:text-blue-200">{{ setupProgress }}</div>
                                <div class="text-xs text-blue-600 dark:text-blue-400">Mohon tunggu sebentar...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Setup Success -->
                    <div v-if="setupComplete" class="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <CheckCircle class="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span class="text-sm text-green-700 dark:text-green-300">
                                Notifikasi berhasil diaktifkan! 🎉
                            </span>
                        </div>
                    </div>

                    <!-- FCM Technology Info -->
                    <div class="mb-6 p-3 bg-muted/30 rounded-lg">
                        <div class="flex items-start gap-2">
                            <Shield class="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <p class="text-xs text-muted-foreground">
                                    <strong>Teknologi Firebase:</strong> Menggunakan Firebase Cloud Messaging untuk notifikasi yang andal dan aman. 
                                    Data Anda terlindungi dan tidak akan disalahgunakan.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div class="flex items-center gap-2">
                            <AlertTriangle class="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span class="text-sm text-red-700 dark:text-red-300">{{ errorMessage }}</span>
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
                        Panduan Pengaturan Browser
                    </button>
                </div>
                
                <div v-else-if="!setupComplete" class="flex gap-3">
                    <button 
                        @click="handleAllow"
                        :disabled="isLoading"
                        class="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                        <Bell v-else class="h-4 w-4" />
                        {{ isLoading ? setupProgress : 'Aktifkan Notifikasi' }}
                    </button>
                </div>

                <div v-else class="space-y-3">
                    <button 
                        @click="sendTestNotification"
                        :disabled="isTestingSend"
                        class="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Loader2 v-if="isTestingSend" class="h-4 w-4 animate-spin" />
                        <Send v-else class="h-4 w-4" />
                        {{ isTestingSend ? 'Mengirim...' : 'Test Notifikasi' }}
                    </button>
                    <button 
                        @click="completeSetup"
                        class="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                        Lanjutkan ke Aplikasi
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    Bell, CheckCircle, AlertTriangle, Shield, Loader2, 
    Send
} from 'lucide-vue-next'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const toast = useToast()
const firebaseService = useFirebaseService()

const isLoading = ref(false)
const setupComplete = ref(false)
const isTestingSend = ref(false)
const errorMessage = ref('')
const setupProgress = ref('Mempersiapkan...')

// Show modal ketika notifikasi diperlukan tapi belum diizinkan
const showModal = computed(() => {
    return notificationStore.hasChecked && 
           notificationStore.needsPermission &&
           notificationStore.isSupported &&
           !setupComplete.value
})

// Handle allow notification dengan FCM setup
const handleAllow = async () => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
        setupProgress.value = 'Meminta izin notifikasi...'
        
        // Request notification permission
        const granted = await notificationStore.requestPermission()
        
        if (!granted) {
            if (notificationStore.isDenied) {
                errorMessage.value = 'Notifikasi diblokir. Silakan aktifkan dari pengaturan browser.'
            } else {
                errorMessage.value = 'Izin notifikasi diperlukan untuk menggunakan aplikasi'
            }
            return
        }

        setupProgress.value = 'Menyiapkan Firebase Cloud Messaging...'
        
        // Setup FCM
        const fcmSuccess = await notificationStore.setupFCM()
        
        if (!fcmSuccess) {
            errorMessage.value = 'Gagal menyiapkan sistem notifikasi. Silakan coba lagi.'
            return
        }

        setupProgress.value = 'Menyelesaikan setup...'
        
        // Update FCM token ke backend jika user sudah login
        if (authStore.isAuthenticated) {
            await authStore.updateFCMToken()
        }

        setupComplete.value = true
        toast.success('Notifikasi berhasil diaktifkan!', 'Berhasil')
        
    } catch (error: any) {
        console.error('Error enabling notifications:', error)
        errorMessage.value = 'Terjadi kesalahan saat mengaktifkan notifikasi'
    } finally {
        isLoading.value = false
    }
}

// Send test notification
const sendTestNotification = async () => {
    isTestingSend.value = true
    
    try {
        const success = await notificationStore.sendTestNotification()
        
        if (success) {
            toast.success('Test notifikasi berhasil dikirim!', 'Berhasil')
        } else {
            toast.error('Gagal mengirim test notifikasi', 'Error')
        }
    } catch (error) {
        console.error('Error sending test notification:', error)
        toast.error('Gagal mengirim test notifikasi', 'Error')
    } finally {
        isTestingSend.value = false
    }
}

// Complete setup and close modal
const completeSetup = () => {
    setupComplete.value = false // This will close the modal
    toast.info('Setup notifikasi selesai. Selamat menggunakan aplikasi!', 'Siap Digunakan')
}

// Refresh page
const refreshPage = () => {
    if (process.client) {
        window.location.reload()
    }
}

// Open browser settings guide
const openBrowserSettings = () => {
    toast.info('Silakan buka pengaturan browser dan cari menu "Site Settings" atau "Permissions" untuk mengaktifkan notifikasi', 'Panduan Pengaturan')
}

// Initialize notification store
onMounted(() => {
    notificationStore.initialize()
})
</script>