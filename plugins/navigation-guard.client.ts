export default defineNuxtPlugin(() => {
    const router = useRouter()
    const authStore = useAuthStore()

    // Guard untuk setiap navigasi
    router.beforeEach((to, from) => {
        // Skip untuk halaman yang tidak memerlukan auth
        const publicRoutes = ['/login', '/forgot-password']
        if (publicRoutes.includes(to.path)) {
            return true
        }

        // Check auth untuk halaman yang dilindungi
        const isAuthenticated = authStore.checkAuth()

        if (!isAuthenticated) {
            console.log('Navigation blocked: User not authenticated')
            authStore.clearAuth()
            return '/login'
        }

        // Optional: Validate token setiap navigasi (untuk keamanan maksimal)
        // Uncomment jika ingin validasi real-time
        /*
        if (authStore.token) {
            const lastCheck = localStorage.getItem('last_token_check')
            const now = Date.now()
            const checkInterval = 2 * 60 * 1000 // 2 menit
            
            if (!lastCheck || (now - parseInt(lastCheck)) > checkInterval) {
                // Validasi token async
                authStore.validateAuth().then(isValid => {
                    if (!isValid) {
                        router.push('/login')
                    } else {
                        localStorage.setItem('last_token_check', now.toString())
                    }
                })
            }
        }
        */

        return true
    })

    // Watch untuk perubahan authentication state
    watch(() => authStore.isAuthenticated, (newValue, oldValue) => {
        // Jika user logout dari store langsung
        if (oldValue && !newValue) {
            const currentPath = router.currentRoute.value.path
            const publicRoutes = ['/login', '/forgot-password']
            
            if (!publicRoutes.includes(currentPath)) {
                console.log('Auth state changed, redirecting to login')
                router.push('/login')
            }
        }
    })

    // Listen untuk perubahan localStorage dari tab lain
    if (process.client) {
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_token' || e.key === 'user_data') {
                // Jika token dihapus dari tab lain
                if (!e.newValue && authStore.isAuthenticated) {
                    console.log('Auth cleared from another tab')
                    authStore.clearAuth()
                    router.push('/login')
                }
            }
        })

        // Periodic check setiap 30 detik untuk memastikan konsistensi
        setInterval(() => {
            if (authStore.isAuthenticated) {
                const token = localStorage.getItem('auth_token')
                const userData = localStorage.getItem('user_data')
                
                if (!token || !userData) {
                    console.log('Auth data missing, logging out')
                    authStore.clearAuth()
                    const currentPath = router.currentRoute.value.path
                    const publicRoutes = ['/login', '/forgot-password']
                    
                    if (!publicRoutes.includes(currentPath)) {
                        router.push('/login')
                    }
                }
            }
        }, 30000) // 30 detik
    }
})