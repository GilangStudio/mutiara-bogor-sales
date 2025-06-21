// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
    // Skip middleware di server side untuk mencegah hydration mismatch
    if (process.server) {
        return
    }

    const authStore = useAuthStore()

    // Check if user is already authenticated
    const isAuthenticated = authStore.isAuthenticated || authStore.checkAuth()

    if (isAuthenticated) {
        // Redirect to home if already authenticated
        return navigateTo('/')
    }
})