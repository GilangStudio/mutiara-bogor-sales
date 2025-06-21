// stores/toast.ts
export interface Toast {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title?: string
    message: string
    duration?: number
    persistent?: boolean
}

export const useToastStore = defineStore('toast', {
    state: () => ({
        toasts: [] as Toast[]
    }),

    getters: {
        getToasts: (state) => state.toasts
    },

    actions: {
        addToast(toast: Omit<Toast, 'id'>) {
            const id = Math.random().toString(36).substr(2, 9)
            const newToast: Toast = {
                id,
                duration: 5000, // default 5 seconds
                persistent: false,
                ...toast
            }

            this.toasts.push(newToast)

            // Auto remove toast after duration (unless persistent)
            if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
                setTimeout(() => {
                    this.removeToast(id)
                }, newToast.duration)
            }

            return id
        },

        removeToast(id: string) {
            const index = this.toasts.findIndex(toast => toast.id === id)
            if (index > -1) {
                this.toasts.splice(index, 1)
            }
        },

        clearAllToasts() {
            this.toasts = []
        },

        // Helper methods for different toast types
        success(message: string, title?: string, options?: Partial<Toast>) {
            return this.addToast({
                type: 'success',
                message,
                title,
                ...options
            })
        },

        error(message: string, title?: string, options?: Partial<Toast>) {
            return this.addToast({
                type: 'error',
                message,
                title,
                duration: 7000, // Error toast longer duration
                ...options
            })
        },

        warning(message: string, title?: string, options?: Partial<Toast>) {
            return this.addToast({
                type: 'warning',
                message,
                title,
                ...options
            })
        },

        info(message: string, title?: string, options?: Partial<Toast>) {
            return this.addToast({
                type: 'info',
                message,
                title,
                ...options
            })
        }
    }
})