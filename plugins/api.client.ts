import { useAuthStore } from "../stores/auth"

export default defineNuxtPlugin(() => {
    // Hanya jalankan di client side
    if (process.server) return

    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    // HTTP interceptor untuk menambahkan authorization header
    const api = $fetch.create({
        baseURL: config.public.apiBase,
        onRequest({ request, options }) {
            // Add authorization header if token exists
            if (authStore.token) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${authStore.token}`
                }
            }
        },
        onResponseError({ response }) {
            // Handle 401 unauthorized responses
            if (response.status === 401) {
                // Clear auth and redirect to login
                authStore.clearAuth()
                navigateTo('/login')
            }
        }
    })

    // Provide the api instance
    return {
        provide: {
            api
        }
    }
})