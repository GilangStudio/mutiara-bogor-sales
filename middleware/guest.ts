// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    // Check if user is already authenticated
    const isAuthenticated = authStore.isAuthenticated || authStore.checkAuth()

    if (isAuthenticated) {
        // Redirect to home if already authenticated
        return navigateTo('/')
    }
})