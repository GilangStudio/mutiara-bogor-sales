<template>
    <div class="mobile-container">
        <div
            class="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden">
            <div class="w-full max-w-sm space-y-6">
                <!-- Logo/Header -->
                <div class="text-center space-y-2">
                    <div class="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users class="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 class="text-2xl font-bold text-foreground">Selamat Datang</h1>
                    <p class="text-muted-foreground">Masuk ke akun Anda untuk melanjutkan</p>
                </div>

                <!-- Login Form -->
                <form @submit.prevent="handleLogin" class="space-y-4">
                    <div class="space-y-4">
                        <!-- Phone Input -->
                        <div class="space-y-2">
                            <label for="phone" class="text-sm font-medium text-foreground">
                                Nomor Telepon
                            </label>
                            <div class="relative">
                                <Phone
                                    class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input id="phone" v-model="form.phone" type="tel" placeholder="08123456789"
                                    class="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.phone,
                                        'border-border': !errors.phone
                                    }" required />
                            </div>
                            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
                        </div>

                        <!-- Password Input -->
                        <div class="space-y-2">
                            <label for="password" class="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div class="relative">
                                <Lock
                                    class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="Masukkan password"
                                    class="w-full pl-10 pr-12 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    :class="{
                                        'border-destructive focus:ring-destructive': errors.password,
                                        'border-border': !errors.password
                                    }" required />
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                    <EyeOff v-if="showPassword" class="h-4 w-4" />
                                    <Eye v-else class="h-4 w-4" />
                                </button>
                            </div>
                            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
                        </div>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div class="flex items-center gap-2">
                            <AlertCircle class="h-4 w-4 text-destructive" />
                            <p class="text-sm text-destructive">{{ errorMessage }}</p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="authStore.isLoading || !isFormValid"
                        class="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90">
                        <Loader2 v-if="authStore.isLoading" class="h-4 w-4 animate-spin" />
                        <LogIn v-else class="h-4 w-4" />
                        {{ authStore.isLoading ? 'Memproses...' : 'Masuk' }}
                    </button>
                </form>

                <!-- Footer -->
                <div class="text-center space-y-2">
                    <p class="text-sm text-muted-foreground">
                        Lupa password?
                        <NuxtLink to="/forgot-password" class="text-primary hover:underline font-medium">
                            Reset di sini
                        </NuxtLink>
                    </p>
                    <div class="text-xs text-muted-foreground">
                        Dengan masuk, Anda menyetujui
                        <button class="text-primary hover:underline">Syarat & Ketentuan</button>
                        dan
                        <button class="text-primary hover:underline">Kebijakan Privasi</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Users, Phone, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-vue-next'

// Middleware untuk guest
definePageMeta({
    middleware: 'guest',
    layout: false
})

// Store
const authStore = useAuthStore()

// Form state
const form = reactive({
    phone: '',
    password: ''
})

const showPassword = ref(false)
const errorMessage = ref('')
const errors = reactive({
    phone: '',
    password: ''
})

// Computed
const isFormValid = computed(() => {
    return form.phone.trim() !== '' && form.password.trim() !== ''
})

// Methods
const validateForm = () => {
    errors.phone = ''
    errors.password = ''
    errorMessage.value = ''

    let isValid = true

    if (!form.phone.trim()) {
        errors.phone = 'Nomor telepon wajib diisi'
        isValid = false
    } else if (!/^08\d{8,13}$/.test(form.phone)) {
        errors.phone = 'Format nomor telepon tidak valid'
        isValid = false
    }

    if (!form.password.trim()) {
        errors.password = 'Password wajib diisi'
        isValid = false
    } 
    // else if (form.password.length < 6) {
    //     errors.password = 'Password minimal 6 karakter'
    //     isValid = false
    // }

    return isValid
}

const handleLogin = async () => {
    if (!validateForm()) return

    const result = await authStore.login({
        phone: form.phone,
        password: form.password
    })

    if (result.success) {
        await navigateTo('/')
    } else {
        errorMessage.value = result.message || 'Login gagal'
    }
}

// SEO
useHead({
    title: 'Login - CRM Sales',
    meta: [
        { name: 'description', content: 'Masuk ke aplikasi CRM Sales' }
    ]
})
</script>