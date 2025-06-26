<template>
    <div v-if="showInstallButton" class="fixed bottom-20 left-4 right-4 z-40 md:bottom-4 md:left-auto md:right-4 md:w-auto">
        <div class="bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm mx-auto md:max-w-none">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download class="h-5 w-5 text-primary-foreground" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-foreground">Install Aplikasi</div>
                    <div class="text-sm text-muted-foreground">Akses lebih cepat dari home screen</div>
                </div>
                <div class="flex items-center gap-2">
                    <button 
                        @click="handleInstall"
                        :disabled="isInstalling"
                        class="px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        <Loader2 v-if="isInstalling" class="h-3 w-3 animate-spin" />
                        <span v-else>Install</span>
                    </button>
                    <button 
                        @click="dismissInstall"
                        class="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        title="Tutup"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Download, X, Loader2 } from 'lucide-vue-next'

const pwaInstall = usePWAInstall()
const toast = useToast()

const isInstalling = ref(false)
const isDismissed = ref(false)

// Show button ketika bisa install dan belum dismiss
const showInstallButton = computed(() => {
    return pwaInstall.canInstall.value && 
           !pwaInstall.isInstalled.value && 
           !isDismissed.value
})

const handleInstall = async () => {
    isInstalling.value = true
    
    try {
        const success = await pwaInstall.install()
        
        if (success) {
            toast.success('Aplikasi berhasil diinstall!', 'Berhasil')
        } else {
            toast.info('Install dibatalkan', 'Info')
        }
    } catch (error) {
        toast.error('Gagal menginstall aplikasi', 'Error')
    } finally {
        isInstalling.value = false
    }
}

const dismissInstall = () => {
    isDismissed.value = true
    
    // Simpan ke localStorage agar tidak muncul lagi
    if (process.client) {
        localStorage.setItem('pwa_install_dismissed', Date.now().toString())
    }
}

// Cek apakah sudah pernah dismiss (dalam 7 hari terakhir)
onMounted(() => {
    if (process.client) {
        const dismissedTime = localStorage.getItem('pwa_install_dismissed')
        if (dismissedTime) {
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
            if (parseInt(dismissedTime) > sevenDaysAgo) {
                isDismissed.value = true
            }
        }
    }
})
</script>