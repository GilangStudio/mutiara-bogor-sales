// plugins/pwa-install.client.ts
export default defineNuxtPlugin(() => {
    if (process.client) {
        let deferredPrompt: any = null;

        // Store untuk PWA install
        const usePWAInstall = () => {
            const canInstall = ref(false);
            const isInstalled = ref(false);

            // Check jika sudah installed
            const checkIfInstalled = () => {
                if (window.matchMedia('(display-mode: standalone)').matches) {
                    isInstalled.value = true;
                } else if (window.navigator && 'standalone' in window.navigator) {
                    isInstalled.value = (window.navigator as any).standalone;
                }
            };

            // Install function
            const install = async () => {
                if (!deferredPrompt) {
                    console.log('Install prompt tidak tersedia');
                    return false;
                }

                try {
                    // Show install prompt
                    deferredPrompt.prompt();
                    
                    // Wait for user response
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        console.log('User menerima install prompt');
                        canInstall.value = false;
                        isInstalled.value = true;
                        return true;
                    } else {
                        console.log('User menolak install prompt');
                        return false;
                    }
                } catch (error) {
                    console.error('Error saat install PWA:', error);
                    return false;
                } finally {
                    deferredPrompt = null;
                }
            };

            return {
                canInstall: readonly(canInstall),
                isInstalled: readonly(isInstalled),
                install,
                checkIfInstalled
            };
        };

        // Global PWA install state
        const pwaInstall = usePWAInstall();

        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event triggered');
            
            // Prevent default browser install prompt
            e.preventDefault();
            
            // Store the event
            deferredPrompt = e;
            
            // Show custom install button
            pwaInstall.canInstall.value = true;
        });

        // Listen for appinstalled event
        window.addEventListener('appinstalled', () => {
            console.log('PWA berhasil diinstall');
            pwaInstall.canInstall.value = false;
            pwaInstall.isInstalled.value = true;
            deferredPrompt = null;
        });

        // Check install status on mount
        pwaInstall.checkIfInstalled();

        // Initialize notification store
        const notificationStore = useNotificationStore();
        notificationStore.initialize();

        // Provide globally
        return {
            provide: {
                pwaInstall,
                notificationStore
            }
        };
    }
});