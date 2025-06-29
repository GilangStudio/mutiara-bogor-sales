// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
    // Skip middleware di server side untuk mencegah hydration mismatch
    if (process.server) {
        return
    }

    const authStore = useAuthStore()

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
        // Try to restore auth from localStorage
        const isAuthenticated = authStore.checkAuth()

        if (!isAuthenticated) {
            // Redirect to login if not authenticated
            return navigateTo('/login')
        }
    }
})