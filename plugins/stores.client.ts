import { useToastStore } from "~/stores/toast"
import { useLeadsStore } from "~/stores/leads"

// plugins/stores.client.ts
export default defineNuxtPlugin(() => {
    // Auto-initialize stores on client side
    if (process.client) {
        // Initialize auth store and check authentication
        const authStore = useAuthStore()
        authStore.checkAuth()

        // Initialize toast store
        const toastStore = useToastStore()

        // Initialize leads store
        const leadsStore = useLeadsStore()

        // Make stores globally available
        return {
            provide: {
                authStore,
                toastStore,
                leadsStore
            }
        }
    }
})