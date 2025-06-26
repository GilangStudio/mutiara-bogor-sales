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
    fcm_token?: string
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
        isLoading: false,
        initialized: false
    }),

    getters: {
        getUser: (state) => state.user,
        getToken: (state) => state.token,
        isLoggedIn: (state) => state.isAuthenticated && state.initialized
    },

    actions: {
        async login(credentials: LoginCredentials) {
            this.isLoading = true

            try {
                const config = useRuntimeConfig()

                // Setup Firebase FCM sebelum login
                let fcmToken = null;
                if (process.client) {
                    const firebaseService = useFirebaseService();
                    if (firebaseService.isAvailable.value) {
                        fcmToken = await firebaseService.getOrGenerateToken();
                        console.log('FCM token for login:', fcmToken);
                    }
                }

                const response = await $fetch<LoginResponse>(`${config.public.apiBase}/login`, {
                    method: 'POST',
                    body: {
                        ...credentials,
                        fcm_token: fcmToken
                    }
                })

                if (response.status === 'success' && response.data) {
                    this.setAuthData(response.data)

                    if (process.client && fcmToken) {
                        const firebaseService = useFirebaseService();
                        await firebaseService.sendTokenToBackend(fcmToken);
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
            this.isLoading = true

            try {
                const config = useRuntimeConfig()

                if (process.client) {
                    const firebaseService = useFirebaseService();
                    if (firebaseService.isAvailable.value) {
                        await firebaseService.clearToken();
                    }
                }

                if (this.token) {
                    try {
                        await $fetch(`${config.public.apiBase}/logout`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${this.token}`,
                                'Content-Type': 'application/json'
                            }
                        })
                    } catch (apiError) {
                        console.warn('Logout API error:', apiError)
                        // Lanjutkan logout meskipun API error
                    }
                }

                // Selalu bersihkan data lokal
                this.clearAuth()

                // Redirect ke login
                await navigateTo('/login')

            } catch (error: any) {
                console.error('Logout error:', error)
                // Tetap clear auth meskipun error
                this.clearAuth()
                await navigateTo('/login')
            } finally {
                this.isLoading = false
            }
        },

        // Method untuk update FCM token (bisa dipanggil kapan saja)
        async updateFCMToken() {
            if (!this.isAuthenticated || !process.client) {
                return false;
            }

            try {
                const firebaseService = useFirebaseService();
                
                if (!firebaseService.isAvailable.value) {
                    console.warn('Firebase not available for FCM token update');
                    return false;
                }

                // Generate atau ambil token yang ada
                const token = await firebaseService.getOrGenerateToken();
                
                if (!token) {
                    console.warn('Could not get FCM token for update');
                    return false;
                }

                // Kirim token ke backend
                const success = await firebaseService.sendTokenToBackend(token);
                
                if (success) {
                    console.log('FCM token updated successfully');
                    return true;
                } else {
                    console.error('Failed to update FCM token');
                    return false;
                }
            } catch (error) {
                console.error('Error updating FCM token:', error);
                return false;
            }
        },

        // Method untuk refresh FCM token secara berkala
        async refreshFCMToken() {
            if (!this.isAuthenticated || !process.client) {
                return false;
            }

            try {
                const firebaseService = useFirebaseService();
                
                if (!firebaseService.isAvailable.value) {
                    return false;
                }

                // Refresh token (hapus yang lama, buat yang baru)
                const newToken = await firebaseService.refreshToken();
                
                if (newToken) {
                    // Kirim token baru ke backend
                    const success = await firebaseService.sendTokenToBackend(newToken);
                    
                    if (success) {
                        console.log('FCM token refreshed successfully');
                        return true;
                    }
                }
                
                return false;
            } catch (error) {
                console.error('Error refreshing FCM token:', error);
                return false;
            }
        },

        // Method untuk set auth data
        setAuthData(userData: User) {
            this.user = userData
            this.token = userData.api_token
            this.isAuthenticated = true
            this.initialized = true

            // Simpan ke localStorage
            if (process.client) {
                localStorage.setItem('auth_token', userData.api_token)
                localStorage.setItem('user_data', JSON.stringify(userData))

                // Set timestamp untuk tracking
                localStorage.setItem('auth_timestamp', Date.now().toString())
            }
        },

        checkAuth() {
            // Hanya jalankan di client side
            if (!process.client) {
                return false
            }

            try {
                const token = localStorage.getItem('auth_token')
                const userData = localStorage.getItem('user_data')
                const authTimestamp = localStorage.getItem('auth_timestamp')

                if (!token || !userData) {
                    this.initialized = true
                    return false
                }

                // Optional: Check if auth data is too old (e.g., 30 days)
                if (authTimestamp) {
                    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 hari
                    const age = Date.now() - parseInt(authTimestamp)

                    if (age > maxAge) {
                        console.log('Auth data expired, clearing...')
                        this.clearAuth()
                        return false
                    }
                }

                // Validasi format user data
                const parsedUser = JSON.parse(userData)

                // Validasi struktur data user
                if (!parsedUser.id || !parsedUser.api_token || !parsedUser.name || !parsedUser.phone) {
                    console.error('Invalid user data structure')
                    this.clearAuth()
                    return false
                }

                // Set data ke store
                this.user = parsedUser
                this.token = token
                this.isAuthenticated = true
                this.initialized = true

                return true

            } catch (error) {
                console.error('Error parsing auth data:', error)
                this.clearAuth()
                return false
            }
        },

        clearAuth() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            this.initialized = true

            if (process.client) {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_data')
                localStorage.removeItem('auth_timestamp')
                localStorage.removeItem('last_token_check')
            }
        },

        // Method untuk validasi auth secara real-time
        async validateAuth() {
            if (!this.token || !process.client) {
                return false
            }

            try {
                const config = useRuntimeConfig()

                const response: any = await $fetch(`${config.public.apiBase}/user`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                if (response.data) {
                    // Update user data jika berubah
                    this.user = response.data
                    if (process.client) {
                        localStorage.setItem('user_data', JSON.stringify(response.data))
                    }
                    return true
                }

                return false
            } catch (error) {
                console.error('Auth validation failed:', error)
                this.clearAuth()
                return false
            }
        },

        async refreshUser() {
            return await this.validateAuth()
        }
    }
})