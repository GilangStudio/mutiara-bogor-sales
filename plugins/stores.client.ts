import { useToastStore } from "~/stores/toast"

// plugins/stores.client.ts
export default defineNuxtPlugin(() => {
    // Auto-initialize stores on client side
    if (process.client) {
        // Initialize auth store and check authentication
        const authStore = useAuthStore()
        authStore.checkAuth()

        // Initialize toast store
        const toastStore = useToastStore()

        // Make stores globally available
        return {
            provide: {
                authStore,
                toastStore
            }
        }
    }
})