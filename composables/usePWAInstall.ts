// composables/usePWAInstall.ts
export const usePWAInstall = () => {
    const canInstall = ref(false)
    const isInstalled = ref(false)
    
    let deferredPrompt: any = null

    const checkIfInstalled = () => {
        if (process.client) {
            // Cek jika app sudah diinstall
            isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone === true
        }
    }

    const install = async () => {
        if (!deferredPrompt) {
            console.log('Install prompt tidak tersedia')
            return false
        }

        try {
            // Tampilkan install prompt
            deferredPrompt.prompt()
            
            // Tunggu user response
            const { outcome } = await deferredPrompt.userChoice
            
            if (outcome === 'accepted') {
                canInstall.value = false
                isInstalled.value = true
                deferredPrompt = null
                return true
            }
            
            return false
        } catch (error) {
            console.error('Error installing PWA:', error)
            return false
        }
    }

    // Setup event listeners hanya di client
    if (process.client) {
        // Event ketika browser mendeteksi PWA bisa diinstall
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA install prompt available')
            e.preventDefault() // Prevent default browser install prompt
            deferredPrompt = e
            canInstall.value = true
        })

        // Event ketika PWA berhasil diinstall
        window.addEventListener('appinstalled', () => {
            console.log('PWA successfully installed')
            canInstall.value = false
            isInstalled.value = true
            deferredPrompt = null
        })

        // Cek status install saat pertama load
        onMounted(() => {
            checkIfInstalled()
        })
    }

    return {
        canInstall: readonly(canInstall),
        isInstalled: readonly(isInstalled),
        install,
        checkIfInstalled
    }
}