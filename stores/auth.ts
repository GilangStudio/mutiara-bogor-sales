// stores/auth.ts
export interface User {
    id: number
    user_id: number
    name: string
    phone: string
    email: string
    api_token: string
}

export interface LoginCredentials {
    phone: string
    password: string
    token?: string
}

export interface LoginResponse {
    status: string
    data?: User
    message?: string
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as User | null,
        token: null as string | null,
        isAuthenticated: false,
        isLoading: false
    }),

    getters: {
        getUser: (state) => state.user,
        getToken: (state) => state.token,
        isLoggedIn: (state) => state.isAuthenticated
    },

    actions: {
        async login(credentials: LoginCredentials) {
            this.isLoading = true

            try {
                const config = useRuntimeConfig()

                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: credentials
                })

                if (response.status === 'success' && response.data) {
                    this.user = response.data
                    this.token = response.data.api_token
                    this.isAuthenticated = true

                    // Simpan token di localStorage
                    if (process.client) {
                        localStorage.setItem('auth_token', response.data.api_token)
                        localStorage.setItem('user_data', JSON.stringify(response.data))
                    }

                    return { success: true, data: response.data }
                } else {
                    throw new Error(response.message || 'Login gagal')
                }
            } catch (error: any) {
                console.error('Login error:', error)
                return {
                    success: false,
                    message: error.data?.message || error.message || 'Terjadi kesalahan saat login'
                }
            } finally {
                this.isLoading = false
            }
        },

        async logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false

            if (process.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_data')
            }

            await navigateTo('/login')
        },

        checkAuth() {
            if (process.client) {
                const token = localStorage.getItem('auth_token')
                const userData = localStorage.getItem('user_data')

                if (token && userData) {
                    try {
                        this.token = token
                        this.user = JSON.parse(userData)
                        this.isAuthenticated = true
                        return true
                    } catch (error) {
                        console.error('Error parsing user data:', error)
                        this.clearAuth()
                        return false
                    }
                }
            }
            return false
        },

        clearAuth() {
            this.user = null
            this.token = null
            this.isAuthenticated = false

            if (process.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_data')
            }
        },

        async refreshUser() {
            if (!this.token) return false

            try {
                const config = useRuntimeConfig()

                const response = await $fetch<{ data: User }>(`${config.public.apiBase}/user`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                if (response.data) {
                    this.user = response.data
                    if (process.client) {
                        localStorage.setItem('user_data', JSON.stringify(response.data))
                    }
                    return true
                }
                return false
            } catch (error) {
                console.error('Refresh user error:', error)
                this.clearAuth()
                return false
            }
        }
    }
})